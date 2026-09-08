declare global {
	var __SSO_BEACON_HOST__: string | undefined;
	var __SOCIAL_LOGIN_HOST__: string | undefined;
}

// Records WHEN this origin last asked the beacon. Written BEFORE the bounce leaves, never
// after: a beacon that answers "no session" sends the browser straight back here, and without
// the mark already set that is an infinite redirect.
//
// It is a timestamp rather than a flag because the two failure modes pull in opposite
// directions. A redirect loop happens in under a second, so that is all the guard has to
// outlast. But a permanent mark strands anyone who opens this app before signing in anywhere,
// signs in on another app, and comes back: no bounce, anonymous forever. Re-asking after a
// minute costs at most one extra hop and fixes that.
const SSO_CHECKED_KEY = 'ssoCheckedAt';
const SSO_RECHECK_AFTER_MS = 60 * 1000;

// What the beacon hands back on the URL.
const PARAM_TOKEN = 'ott';
const PARAM_NONE = 'sso';

// NOTE: ssoModule loads before React mounts. Anything here must avoid touching
// the path-reactive store (StoreContext / getDataFromPath / setData), since
// reading a not-yet-initialised path corrupts the store and triggers spurious
// re-fetches of application/page definitions. Callers pass in any app data
// they have; this module only reads runtime globals and direct localStorage.
export function isSsoEnabled(application?: { properties?: { sso3?: boolean } } | null): boolean {
	if (globalThis.isDesignMode) return false;
	if (!globalThis.__SSO_BEACON_HOST__) return false;
	if (application && application.properties?.sso3 !== true) return false;
	return true;
}

function keyFor(base: string): string {
	return globalThis.isDesignMode ? `designMode_${base}` : base;
}

/** Every storage access is wrapped: a private window or blocked site data must not throw. */
function readLocal(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeLocal(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		/* nothing to do; the worst case is one extra bounce */
	}
}

function removeLocal(key: string): void {
	try {
		localStorage.removeItem(key);
	} catch {
		/* as above */
	}
}

export function hasAskedBeacon(): boolean {
	const askedAt = Number.parseInt(readLocal(keyFor(SSO_CHECKED_KEY)) ?? '', 10);
	if (!Number.isFinite(askedAt)) return false;

	// A clock that moved backwards would otherwise pin this shut indefinitely.
	const age = Date.now() - askedAt;
	return age >= 0 && age < SSO_RECHECK_AFTER_MS;
}

function markAskedBeacon(): void {
	writeLocal(keyFor(SSO_CHECKED_KEY), String(Date.now()));
}

/**
 * Called on sign-out. Without this, a user who signs out here and back in on another app is
 * told "already asked, do not bounce" and never picks the new session up.
 */
export function clearBeaconMark(): void {
	removeLocal(keyFor(SSO_CHECKED_KEY));
}

export function getBeaconURL(): string | null {
	const host = globalThis.__SSO_BEACON_HOST__;
	if (!host) return null;
	return `https://${host}`;
}

/**
 * Build the URL a customer-app's "Sign in with Google/Meta" button should navigate to. Lands
 * on authzump, then the OAuth consent screen, then authzump's callback redirects the user
 * back to `redirectUrl` with the social profile as query params.
 *
 * Uses `window.__SOCIAL_LOGIN_HOST__` (always injected by IndexHTMLService / htmlRenderer),
 * independent of the `sso3` flag. An app can offer social login without participating in
 * cross-app SSO. Returns null only if the social-login host isn't injected at all.
 */
export function buildSocialLoginURL(
	platform: 'GOOGLE' | 'META',
	application: { appCode?: string; clientCode?: string } | null,
	redirectUrl?: string,
): string | null {
	const host = globalThis.__SOCIAL_LOGIN_HOST__;
	if (!host || !application?.appCode) return null;
	const back = redirectUrl ?? window.location.href;
	// Query param names match the platform convention so the existing SocialLogin KIRun
	// function (which reads Store.urlDetails.queryParameters.appCode etc.) keeps working.
	return (
		`https://${host}/api/security/clients/socialRegister/evoke` +
		`?platform=${platform}` +
		`&appCode=${encodeURIComponent(application.appCode)}` +
		`&clientCode=${encodeURIComponent(application.clientCode ?? 'SYSTEM')}` +
		`&redirectUrl=${encodeURIComponent(back)}`
	);
}

/**
 * Strip the beacon's answer off the address bar. It has been consumed by the time this runs,
 * and leaving a one-time token in history, in a bookmark or in a shared link is exactly the
 * kind of leak the token exists to avoid.
 */
function scrubArrivalParams(): void {
	try {
		const url = new URL(window.location.href);
		if (!url.searchParams.has(PARAM_TOKEN) && !url.searchParams.has(PARAM_NONE)) return;
		url.searchParams.delete(PARAM_TOKEN);
		url.searchParams.delete(PARAM_NONE);
		window.history.replaceState(null, '', url.toString());
	} catch {
		/* a URL we cannot parse is one we should not rewrite */
	}
}

/**
 * `accessTokenExpiryAt` comes back from the platform as **epoch seconds**, as a number, which
 * is also exactly what the bootstrap reads back with `parseInt(...) * 1000`. Passing that
 * number to `new Date()` would read it as milliseconds and land in 1970, and the session
 * would be deleted as expired the instant it was stored.
 *
 * A string is still accepted, because a date string is what the field looks like it should
 * hold and one appearing later should not silently expire everybody.
 */
function expiryInSeconds(value: unknown): number | null {
	if (typeof value === 'number') return Number.isFinite(value) ? Math.floor(value) : null;

	if (typeof value === 'string') {
		const asNumber = Number(value);
		if (Number.isFinite(asNumber) && value.trim() !== '') return Math.floor(asNumber);

		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : Math.floor(parsed / 1000);
	}

	return null;
}

/**
 * Take the session the beacon just handed back and store it the way the bootstrap expects to
 * find it: the token JSON-encoded, the expiry in epoch seconds. Both formats are dictated by
 * existing readers (`makeVerifyTokenCall` does `JSON.parse`, index.tsx does
 * `parseInt(...) * 1000`), not chosen here.
 */
async function redeemOneTimeToken(token: string): Promise<boolean> {
	try {
		const response = await fetch(
			`/api/security/authenticateWithOneTimeToken/${encodeURIComponent(token)}`,
			{ method: 'GET', headers: { 'Content-Type': 'application/json' } },
		);
		if (!response.ok) return false;

		const auth = await response.json();
		if (!auth?.accessToken) return false;

		const expirySeconds = expiryInSeconds(auth.accessTokenExpiryAt);
		if (expirySeconds === null) return false;

		writeLocal(keyFor('AuthToken'), JSON.stringify(auth.accessToken));
		writeLocal(keyFor('AuthTokenExpiry'), String(expirySeconds));
		return true;
	} catch {
		return false;
	}
}

/**
 * Handle an arrival back from the beacon, before the bootstrap reads localStorage.
 *
 * Returns true when a session was established, so the caller knows the app definition call
 * that follows can be made authenticated rather than anonymous.
 */
export async function consumeSsoArrival(): Promise<boolean> {
	let params: URLSearchParams;
	try {
		params = new URL(window.location.href).searchParams;
	} catch {
		return false;
	}

	const token = params.get(PARAM_TOKEN);
	const none = params.get(PARAM_NONE);

	if (!token && none !== 'none') return false;

	// Either answer settles the question for this origin: do not ask again.
	markAskedBeacon();

	const redeemed = token ? await redeemOneTimeToken(token) : false;
	scrubArrivalParams();
	return redeemed;
}

/**
 * The cold-start path: a TOP-LEVEL navigation to the beacon, which reads its own first-party
 * storage and sends the browser straight back with a token or with `sso=none`.
 *
 * It has to be top-level. An iframe cannot work across registrable domains, because storage
 * reached from a third-party context is partitioned by top-level site, so the beacon origin's
 * real session is invisible from inside an app's page in every current browser. The whole
 * iframe/postMessage beacon that used to live in this file was removed for that reason.
 *
 * Navigates, so nothing after the call runs.
 */
export function ssoBounce(args: { appCode: string; clientCode: string }): void {
	const target = beginSsoBounce(args);
	if (target) window.location.replace(target);
}

/**
 * The decision and the address, without the navigation. Split out so the loop guard can be
 * tested: marking this origin BEFORE the browser leaves is the only thing standing between a
 * beacon that answers "no session" and an infinite redirect.
 *
 * Returns null when there is nothing to ask.
 */
export function beginSsoBounce(args: { appCode: string; clientCode: string }): string | null {
	const beaconURL = getBeaconURL();
	if (!beaconURL) return null;

	markAskedBeacon();

	return (
		`${beaconURL}/hassso?mode=bounce` +
		`&targetAppCode=${encodeURIComponent(args.appCode)}` +
		`&targetClientCode=${encodeURIComponent(args.clientCode)}` +
		`&returnUrl=${encodeURIComponent(window.location.href)}`
	);
}

/**
 * Give the beacon origin a first-party session, so later cold starts on other domains have
 * something to find. Top-level for the same reason as {@link ssoBounce}: an iframe would only
 * ever write a partitioned copy no other app can read.
 *
 * Deliberately NOT called from `UIEngine.Login`. Login runs inside a page's own function,
 * which usually navigates on success, and leaving the page from underneath it would silently
 * drop that. The page asks explicitly, via `UIEngine.SsoSeed`, and says where to come back to.
 *
 * Navigates, so nothing after the call runs.
 */
export function ssoSeedBeacon(token: string, redirectUrl?: string): void {
	const target = beginSsoSeed(token, redirectUrl);
	if (target) window.location.replace(target);
}

/** As {@link beginSsoBounce}, the address without the navigation, so it can be tested. */
export function beginSsoSeed(token: string, redirectUrl?: string): string | null {
	const beaconURL = getBeaconURL();
	if (!beaconURL) return null;

	// A fresh session is worth asking about again wherever the old answer was "none".
	clearBeaconMark();

	const back = redirectUrl ?? window.location.href;
	return `${beaconURL}/sso/${encodeURIComponent(token)}?redirectUrl=${encodeURIComponent(back)}`;
}
