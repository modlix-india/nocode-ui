import { useEffect, useState } from 'react';
import { STORE_PREFIX } from '../constants';
import { addListenerAndCallImmediately } from '../context/StoreContext';

const DEFAULT_COOKIE_NAME = 'modlix_analytics_consent';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type ConsentState = 'granted' | 'denied';

interface AnalyticsBootstrap {
	consentRequired?: boolean;
	consentCookieName?: string;
	enabled?: boolean;
}

declare global {
	interface Window {
		posthog?: {
			opt_in_capturing?: () => void;
			opt_out_capturing?: () => void;
			startSessionRecording?: () => void;
			stopSessionRecording?: () => void;
			register?: (props: Record<string, unknown>) => void;
			identify?: (id: string, props?: Record<string, unknown>) => void;
			group?: (groupType: string, groupKey: string, groupProps?: Record<string, unknown>) => void;
			reset?: () => void;
		};
		__APP_BOOTSTRAP__?: {
			application?: { properties?: { analytics?: AnalyticsBootstrap } };
		};
		__MODLIX_CONSENT__?: { mounted?: boolean };
		__MODLIX_FORCE_CONSENT__?: boolean;
	}
}

function readConsent(cookieName: string): ConsentState | null {
	try {
		const ls = window.localStorage.getItem(cookieName);
		if (ls === 'granted' || ls === 'denied') return ls;
	} catch {
		// localStorage unavailable, fall back to cookie
	}
	const match = document.cookie
		.split('; ')
		.find((row) => row.startsWith(`${cookieName}=`));
	if (!match) return null;
	const value = decodeURIComponent(match.split('=')[1] || '');
	return value === 'granted' || value === 'denied' ? value : null;
}

function persistConsent(cookieName: string, state: ConsentState) {
	try {
		window.localStorage.setItem(cookieName, state);
	} catch {
		// ignore
	}
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${cookieName}=${state}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function applyConsent(state: ConsentState) {
	const ph = window.posthog;
	if (!ph) return;
	if (state === 'granted') {
		ph.opt_in_capturing?.();
		ph.startSessionRecording?.();
	} else {
		ph.opt_out_capturing?.();
		ph.stopSessionRecording?.();
	}
}

export function AnalyticsConsentBanner() {
	const [visible, setVisible] = useState(false);
	const [cookieName, setCookieName] = useState(DEFAULT_COOKIE_NAME);

	useEffect(() => {
		const analytics = window.__APP_BOOTSTRAP__?.application?.properties?.analytics;
		if (!analytics?.enabled) return;

		const removeApp = addListenerAndCallImmediately(
			undefined,
			(_, app) => {
				if (!window.posthog?.register || !app) return;
				window.posthog.register({
					app_code: app.appCode,
					url_client_code: app.urlClientCode,
				});
			},
			`${STORE_PREFIX}.application`,
		);

		const removeUser = addListenerAndCallImmediately(
			undefined,
			(_, user) => {
				if (!window.posthog) return;
				if (user?.id) {
					window.posthog.identify?.(String(user.id), { email: user.emailId });
				} else {
					window.posthog.reset?.();
				}
			},
			`${STORE_PREFIX}.auth.user`,
		);

		const removeClient = addListenerAndCallImmediately(
			undefined,
			(_, client) => {
				if (!window.posthog || !client?.code) return;
				window.posthog.register?.({ client_code: client.code });
				window.posthog.group?.('tenant', client.code);
			},
			`${STORE_PREFIX}.auth.client`,
		);

		const removeUrlDetails = addListenerAndCallImmediately(
			undefined,
			(_, details) => {
				if (!window.posthog?.register || !details?.pageName) return;
				window.posthog.register({ page_name: details.pageName });
			},
			`${STORE_PREFIX}.urlDetails`,
		);

		const cleanups: Array<() => void> = [removeApp, removeUser, removeClient, removeUrlDetails];

		if (analytics.consentRequired) {
			const name = analytics.consentCookieName || DEFAULT_COOKIE_NAME;
			setCookieName(name);

			const stored = readConsent(name);
			if (stored) {
				applyConsent(stored);
			} else {
				window.__MODLIX_CONSENT__ = { mounted: true };
				if (window.__MODLIX_FORCE_CONSENT__) setVisible(true);

				const onForce = () => setVisible(true);
				window.addEventListener('modlix:force-consent', onForce);
				cleanups.push(() => window.removeEventListener('modlix:force-consent', onForce));
			}
		}

		return () => cleanups.forEach((fn) => fn());
	}, []);

	if (!visible) return null;

	const accept = () => {
		persistConsent(cookieName, 'granted');
		applyConsent('granted');
		setVisible(false);
	};

	const reject = () => {
		persistConsent(cookieName, 'denied');
		applyConsent('denied');
		setVisible(false);
	};

	return (
		<div
			role="dialog"
			aria-live="polite"
			aria-label="Cookies and analytics consent"
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				background: '#1f2937',
				color: '#f9fafb',
				padding: '16px 24px',
				display: 'flex',
				flexWrap: 'wrap',
				gap: 16,
				alignItems: 'center',
				justifyContent: 'space-between',
				zIndex: 2147483647,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif',
				fontSize: 14,
				lineHeight: 1.5,
				boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
			}}
		>
			<div style={{ flex: '1 1 320px', minWidth: 0 }}>
				We use analytics to understand how this site is used and improve it. This may include
				page views, clicks, and (if enabled) anonymized session recordings. Data is stored on
				our own infrastructure.
			</div>
			<div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
				<button
					type="button"
					onClick={reject}
					style={{
						padding: '8px 16px',
						borderRadius: 6,
						border: '1px solid #4b5563',
						background: 'transparent',
						color: '#f9fafb',
						cursor: 'pointer',
						fontSize: 14,
					}}
				>
					Reject
				</button>
				<button
					type="button"
					onClick={accept}
					style={{
						padding: '8px 16px',
						borderRadius: 6,
						border: '1px solid transparent',
						background: '#3b82f6',
						color: '#ffffff',
						cursor: 'pointer',
						fontSize: 14,
						fontWeight: 600,
					}}
				>
					Accept
				</button>
			</div>
		</div>
	);
}
