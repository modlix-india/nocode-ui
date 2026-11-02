/**
 * Analytics consent: the single source of truth for whether this browser has
 * agreed to be measured, and the only place that flips the beacon on or off.
 *
 * Consent is a property of the BROWSER, not of the user. It lives in
 * localStorage with a cookie fallback, so signing in neither grants nor
 * revokes it. A login is consent to the terms, not to measurement, and the two
 * can be withdrawn independently — so a signed-in visitor who declines is a
 * state this has to be able to hold.
 *
 * **Consent is required, always, and there is no application setting that turns
 * that off.** There used to be one, `analytics.consentRequired`, defaulting to
 * required. It is now ignored. A per-app switch only has to be set wrong once,
 * by anyone, for a site to measure people who were never asked — and the
 * symptom is silence: everything works, nothing is shown, and it is found
 * months later by someone reading a document. Documents may still carry the
 * key; nothing reads it.
 *
 * The page-authoring surface on top of this is two KIRun functions,
 * `UIEngine.GetAnalyticsConsent` and `UIEngine.SetAnalyticsConsent`, plus the
 * mirror at `Store.analyticsConsent` that components bind their visibility to.
 */

import { STORE_PREFIX } from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';

export const DEFAULT_CONSENT_COOKIE_NAME = 'modlix_analytics_consent';
export const CONSENT_STORE_PATH = `${STORE_PREFIX}.analyticsConsent`;

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const RECORD_VERSION = 1;

export type ConsentStatus = 'granted' | 'denied';

/**
 * `necessary` is never a real choice — it is listed so a preferences panel can
 * show it switched on and disabled. `analytics` gates the beacon: until it is
 * granted the beacon is not even requested. `marketing` gates any script held
 * back as `data-mlx-consent="marketing"` and the ad click ids lead forms keep in
 * first-party cookies (`UIEngine.BuildLeadAdData`).
 */
export interface ConsentCategories {
	necessary: boolean;
	analytics: boolean;
	marketing: boolean;
}

export interface ConsentRecord {
	status: ConsentStatus;
	categories: ConsentCategories;
	at: string;
	v: number;
}

export interface ConsentState {
	/** 'granted', 'denied', or null when nothing has been decided yet. */
	status: ConsentStatus | null;
	/** false while the visitor has not answered — what a consent page keys on. */
	decided: boolean;
	/**
	 * Always true. Kept in the shape rather than removed, because pages bind to
	 * it and a field that vanishes breaks them silently, where a field that is
	 * constant simply stops being interesting.
	 */
	required: boolean;
	/** app-level `analytics.enabled`. */
	enabled: boolean;
	/**
	 * The stored choice once `decided` is true. Before that, the defaults a
	 * preferences panel should show — every category on. Never read this as
	 * "what has been consented to" without checking `decided` first.
	 */
	categories: ConsentCategories;
}

export interface AnalyticsAppProperties {
	enabled?: boolean;
	consentCookieName?: string;
}

const ALL_GRANTED: ConsentCategories = { necessary: true, analytics: true, marketing: true };
const ONLY_NECESSARY: ConsentCategories = { necessary: true, analytics: false, marketing: false };

export function getAnalyticsProperties(): AnalyticsAppProperties | undefined {
	// Read through the store rather than `__APP_BOOTSTRAP__`: only the Node SSR
	// renderer emits that global, so anything served by the Java ui service
	// would otherwise look like an app with analytics switched off.
	return getDataFromPath(`${STORE_PREFIX}.application.properties.analytics`, []);
}

export function getConsentCookieName(analytics?: AnalyticsAppProperties): string {
	return (
		(analytics ?? getAnalyticsProperties())?.consentCookieName || DEFAULT_CONSENT_COOKIE_NAME
	);
}

function readRaw(cookieName: string): string | null {
	try {
		const ls = window.localStorage.getItem(cookieName);
		if (ls) return ls;
	} catch {
		// localStorage unavailable (private mode, blocked site data) — fall through
	}
	const match = document.cookie.split('; ').find(row => row.startsWith(`${cookieName}=`));
	if (!match) return null;
	return decodeURIComponent(match.slice(cookieName.length + 1)) || null;
}

function writeRaw(cookieName: string, raw: string) {
	try {
		window.localStorage.setItem(cookieName, raw);
	} catch {
		// ignore — the cookie below is the fallback
	}
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${cookieName}=${encodeURIComponent(
		raw,
	)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function readConsentRecord(cookieName?: string): ConsentRecord | null {
	const raw = readRaw(cookieName ?? getConsentCookieName());
	if (!raw) return null;

	// Pre-categories releases stored the bare word. Keep reading those so a
	// returning visitor is not asked a second time.
	if (raw === 'granted' || raw === 'denied')
		return {
			status: raw,
			categories: raw === 'granted' ? { ...ALL_GRANTED } : { ...ONLY_NECESSARY },
			at: '',
			v: 0,
		};

	try {
		const parsed = JSON.parse(raw);
		if (parsed?.status !== 'granted' && parsed?.status !== 'denied') return null;
		return {
			status: parsed.status,
			categories: { ...ONLY_NECESSARY, ...(parsed.categories ?? {}), necessary: true },
			at: parsed.at ?? '',
			v: parsed.v ?? 0,
		};
	} catch {
		return null;
	}
}

/**
 * The categories a script can be held back for. `necessary` is not one: a necessary script
 * is written as an ordinary tag and runs without asking.
 */
export type ConsentGatedCategory = 'analytics' | 'marketing';

/** The attribute that names the category a held-back script waits for. */
export const CONSENT_CATEGORY_ATTRIBUTE = 'data-mlx-consent';

/**
 * Scripts that must not even be REQUESTED before the visitor agrees.
 *
 * The page carries them as `<script type="text/plain" data-mlx-consent="analytics"
 * data-src="https://host/x.js" ...>`. A browser neither fetches nor runs a script whose type
 * is not JavaScript, so until this swaps the tag for a live one there is no request, no
 * cookie and nothing the visitor has to take on trust. The renderers write the analytics
 * beacon this way, and an app's own code parts can hold a marketing pixel the same way
 * (`data-mlx-consent="marketing"`, inline body or `data-src`).
 *
 * The live tag keeps every other attribute, so a beacon that reads its settings from its
 * own tag (`document.currentScript`) still finds them. Returns how many were started.
 */
export function activateConsentedScripts(
	category: ConsentGatedCategory,
	onlyBeacon = false,
): number {
	if (typeof document === 'undefined') return 0;

	const held = Array.from(
		document.querySelectorAll<HTMLScriptElement>(
			`script[type="text/plain"][${CONSENT_CATEGORY_ATTRIBUTE}="${category}"]` +
				(onlyBeacon ? '[data-mlx-beacon]' : ''),
		),
	);

	for (const tag of held) {
		const live = document.createElement('script');
		for (const a of Array.from(tag.attributes)) {
			if (a.name === 'type' || a.name === 'src' || a.name === 'data-src') continue;
			live.setAttribute(a.name, a.value);
		}
		// A nonce is hidden from getAttribute once the document has parsed it.
		if (tag.nonce) live.nonce = tag.nonce;

		if (tag.hasAttribute('data-mlx-beacon')) ensureBeaconQueue();

		const src = tag.getAttribute('data-src') || tag.getAttribute('src');
		if (src) live.src = src;
		else live.text = tag.text;

		tag.replaceWith(live);
	}
	return held.length;
}

/**
 * The queue the stamped snippet installs, so whatever is said to the beacon before its
 * script arrives is replayed on arrival. Kept when one exists: replacing it would throw
 * away what it already holds.
 */
function ensureBeaconQueue() {
	if (typeof (globalThis as any).mlx === 'function') return;
	const q: unknown[] = [];
	const stub: any = function () {
		q.push(arguments);
	};
	stub.q = q;
	(globalThis as any).mlx = stub;
}

/**
 * Whether the heatmap viewer is framing this page to draw its clicks over it. The viewer
 * is the site's owner reading their own numbers, the beacon records nothing in that mode
 * (`modlixDesign`), and it is the beacon that tells the viewer how tall the page is, so it
 * is the one case where the beacon loads without a visitor's consent.
 */
export function isFramedForDesign(): boolean {
	try {
		if (window.parent === window) return false;
		return /[?&]modlixDesign=(?!false|0)/.test(window.location.search);
	} catch {
		return false;
	}
}

/**
 * Act on a consent decision: start the scripts each granted category was holding back,
 * then tell the beacon. Safe to call before the beacon has loaded: the snippet installs a
 * queue that replays these on arrival.
 *
 * Nothing is loaded for a category that is not granted, so a visitor who chose only the
 * necessary cookies causes no request to the analytics host at all. Granting is also what
 * makes the arrival itself countable: the beacon holds back the page view it would otherwise
 * have sent, and emits it when consent is given. Revoking stops everything and discards
 * whatever had been batched but not yet sent; a script already running for this page view
 * stays, and on the next visit it is not loaded.
 */
export function applyConsentToBeacon(record: ConsentRecord) {
	if (record.categories.analytics) activateConsentedScripts('analytics');
	if (record.categories.marketing) activateConsentedScripts('marketing');

	const mlx = (globalThis as any).mlx;
	if (typeof mlx !== 'function') return;

	mlx('consent', !!record.categories.analytics);
}

export function publishConsentState(): ConsentState {
	const analytics = getAnalyticsProperties();
	const record = readConsentRecord(getConsentCookieName(analytics));
	const state: ConsentState = {
		status: record?.status ?? null,
		decided: !!record,
		// Not a setting. Every app asks, so an app that ships no consent page
		// captures nothing at all — which is the right way round: a missing
		// consent page is a visible gap, where a missing consent REQUIREMENT is
		// an invisible one.
		required: true,
		enabled: !!analytics?.enabled,
		// Once a decision exists this is that decision. Before one exists it is
		// what a preferences panel should show, not what has been consented to:
		// everything on, for the visitor to switch off what they do not want.
		// Nothing is captured on the strength of it — `decided` is still false
		// and the beacon stays opted out until `setConsent` is called.
		categories: record?.categories ?? { ...ALL_GRANTED },
	};
	setData(CONSENT_STORE_PATH, state);
	return state;
}

export function getConsentState(): ConsentState {
	return getDataFromPath(CONSENT_STORE_PATH, []) ?? publishConsentState();
}

/**
 * Record a decision and act on it. `granted` is the headline answer;
 * `categories` refines it. Granting with every category off is a denial, and
 * is stored as one.
 */
export function setConsent(
	granted: boolean,
	categories?: Partial<ConsentCategories>,
): ConsentState {
	const merged: ConsentCategories = {
		...(granted ? ALL_GRANTED : ONLY_NECESSARY),
		...(categories ?? {}),
		necessary: true,
	};
	const status: ConsentStatus = merged.analytics || merged.marketing ? 'granted' : 'denied';

	const record: ConsentRecord = {
		status,
		categories: merged,
		at: new Date().toISOString(),
		v: RECORD_VERSION,
	};

	writeRaw(getConsentCookieName(), JSON.stringify(record));
	applyConsentToBeacon(record);
	return publishConsentState();
}

/**
 * Forget the decision so the consent page is shown again, and stop capturing
 * until it is answered. Used by a "change your preferences" link.
 */
export function resetConsent(): ConsentState {
	const cookieName = getConsentCookieName();
	try {
		window.localStorage.removeItem(cookieName);
	} catch {
		// ignore
	}
	document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax`;

	const mlx = (globalThis as any).mlx;
	if (typeof mlx === 'function') mlx('consent', false);

	return publishConsentState();
}
