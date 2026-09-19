import { useEffect } from 'react';
import { STORE_PREFIX } from '../constants';
import { addListenerAndCallImmediately } from '../context/StoreContext';
import {
	applyConsentToPostHog,
	getConsentCookieName,
	publishConsentState,
	readConsentRecord,
} from './analyticsConsent';

/**
 * Renders nothing. It binds the running app to the PostHog client: super
 * properties for per-app filtering, identify/reset around sign in, and the
 * replay of a consent decision this browser made on an earlier visit.
 *
 * The consent UI itself is no longer here. An app points
 * `properties.consentPage` at one of its own pages and builds the box with
 * components, driving it with `UIEngine.GetAnalyticsConsent` and
 * `UIEngine.SetAnalyticsConsent`.
 */
export function AnalyticsBinder() {
	useEffect(() => {
		const cleanups: Array<() => void> = [];

		// `Store.application` arrives after boot, and every field below is read
		// from it, so everything hangs off this listener rather than a one-shot
		// read at mount.
		cleanups.push(
			addListenerAndCallImmediately(
				undefined,
				(_, app) => {
					if (!app) return;

					const state = publishConsentState();
					if (!state.enabled) return;

					const ph = (globalThis as any).posthog;
					ph?.register?.({
						app_code: app.appCode,
						url_client_code: app.urlClientCode,
					});

					// A visitor who already answered on a previous visit must not be
					// asked again, and must not spend this page load opted out: the
					// snippet starts PostHog opted out whenever consent is required.
					const record = readConsentRecord(getConsentCookieName(app.properties?.analytics));
					if (record) applyConsentToPostHog(record);
				},
				`${STORE_PREFIX}.application`,
			),
		);

		cleanups.push(
			addListenerAndCallImmediately(
				undefined,
				(_, user) => {
					const ph = (globalThis as any).posthog;
					if (!ph) return;
					if (user?.id) ph.identify?.(String(user.id), { email: user.emailId });
					else ph.reset?.();
				},
				`${STORE_PREFIX}.auth.user`,
			),
		);

		cleanups.push(
			addListenerAndCallImmediately(
				undefined,
				(_, client) => {
					const ph = (globalThis as any).posthog;
					if (!ph || !client?.code) return;
					ph.register?.({ client_code: client.code });
					ph.group?.('tenant', client.code);
				},
				`${STORE_PREFIX}.auth.client`,
			),
		);

		cleanups.push(
			addListenerAndCallImmediately(
				undefined,
				(_, details) => {
					if (!details?.pageName) return;
					(globalThis as any).posthog?.register?.({ page_name: details.pageName });
				},
				`${STORE_PREFIX}.urlDetails`,
			),
		);

		return () => cleanups.forEach(fn => fn());
	}, []);

	return null;
}
