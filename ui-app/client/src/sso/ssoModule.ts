import { processLocation } from '../util/locationProcessor';

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
// outlast. A mark that lingers strands anyone who opens this app before signing in anywhere,
// goes and signs in on another app, and comes back: no bounce, still anonymous.
//
// That second journey is the common one, and it is why this is SHORT. Ten seconds is an age
// next to a redirect round trip and an instant next to a human signing in somewhere else. It
// was 60s and that was long enough to break exactly the case it exists to serve.
//
// Note this only gates FULL page loads: in-app routing never re-runs the bootstrap, so an
// anonymous visitor clicking around a site is not affected by it either way.
const SSO_CHECKED_KEY = 'ssoCheckedAt';
const SSO_RECHECK_AFTER_MS = 10 * 1000;

// What the beacon hands back on the URL.
const PARAM_TOKEN = 'ott';
const PARAM_NONE = 'sso';

// What the social-login callback hands back on the URL. `sessionId` is the integration state
// and doubles as the marker for "this is a social arrival"; the rest is the profile the
// provider verified, echoed back so a signup needs no second trip to the provider. The last
// four are the evoke call's own query params, which the callback echoes wholesale.
const PARAM_SOCIAL_STATE = 'sessionId';
const PARAM_SOCIAL_ERROR = 'error';
const SOCIAL_ARRIVAL_PARAMS = [
	PARAM_SOCIAL_STATE,
	PARAM_SOCIAL_ERROR,
	'userName',
	'emailId',
	'phoneNumber',
	'firstName',
	'lastName',
	'middleName',
	'localeCode',
	'platform',
	'appCode',
	'clientCode',
	'redirectUrl',
];

// The state this tab has already spent. Server-side it is single use, so a retry cannot
// succeed and must not be attempted: the failure path here leaves the browser on a page that
// may then bounce to the beacon and come straight back with the state still on the URL, and
// without this mark that is a loop. Per tab rather than per browser, because two tabs mid-flow
// are two different journeys.
const SOCIAL_TRIED_KEY = 'socialStateTried';

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

/** As above, for the per-tab marks. Same reasons, same swallowing. */
function readSession(key: string): string | null {
	try {
		return sessionStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeSession(key: string, value: string): void {
	try {
		sessionStorage.setItem(key, value);
	} catch {
		/* nothing to do; the worst case is one wasted redeem attempt */
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

// Set the instant we commit to leaving for the beacon.
//
// `UIEngine.Navigate` is routinely a SIBLING of `UIEngine.Login` in a page's function rather
// than downstream of it, so the two run concurrently. Navigate does
// `pushState -> back() -> setTimeout(forward(), 100)`, and that deferred forward cancels an
// in-flight `location.replace`, which nginx logs as a 499 with zero bytes sent. The user is
// signed in locally and lands on the page, so it looks like it worked, but the beacon was
// never seeded and the next app gets no SSO. Silent, and intermittent because it is a race.
//
// Fixing the page definitions would work too, but only for the ones anybody remembers to fix.
// This holds for every page, including ones not written yet.
let leavingForBeacon = false;

/** True once a beacon hop has been committed to. Navigation after that point is moot. */
export function isLeavingForBeacon(): boolean {
	return leavingForBeacon;
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
	// `redirectUrl` must already be absolute: the platform's callback refuses a scheme-less
	// destination and falls back to the broker's own login page. `InitiateSocialLogin` resolves
	// it; this only defaults it.
	const back = redirectUrl ?? window.location.href;
	// The callback echoes these back on the return leg, where `consumeSocialArrival` reads them.
	return (
		`https://${host}/api/security/clients/socialRegister/evoke` +
		`?platform=${platform}` +
		`&appCode=${encodeURIComponent(application.appCode)}` +
		`&clientCode=${encodeURIComponent(application.clientCode ?? 'SYSTEM')}` +
		`&redirectUrl=${encodeURIComponent(back)}`
	);
}

/**
 * Strip named params off the address bar. Used for whatever an auth arrival carried: it has
 * been consumed by the time this runs, and leaving a one-time token, a single-use social state
 * or somebody's email address in history, in a bookmark or in a shared link is exactly the kind
 * of leak these params exist to avoid.
 *
 * Rewrites nothing when none of them are present, so it is free on an ordinary page load.
 */
function scrubParams(names: string[]): void {
	try {
		const url = new URL(window.location.href);
		if (!names.some(name => url.searchParams.has(name))) return;
		names.forEach(name => url.searchParams.delete(name));
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
 * Store an `AuthenticationResponse` the way the bootstrap expects to find it: the token
 * JSON-encoded, the expiry in epoch seconds. Both formats are dictated by existing readers
 * (`makeVerifyTokenCall` does `JSON.parse`, index.tsx does `parseInt(...) * 1000`), not chosen
 * here.
 */
function bankSession(auth: any): boolean {
	if (!auth?.accessToken) return false;

	const expirySeconds = expiryInSeconds(auth.accessTokenExpiryAt);
	if (expirySeconds === null) return false;

	writeLocal(keyFor('AuthToken'), JSON.stringify(auth.accessToken));
	writeLocal(keyFor('AuthTokenExpiry'), String(expirySeconds));
	return true;
}

/** Take the session the beacon just handed back and bank it. */
async function redeemOneTimeToken(token: string): Promise<boolean> {
	try {
		const response = await fetch(
			`/api/security/authenticateWithOneTimeToken/${encodeURIComponent(token)}`,
			{ method: 'GET', headers: { 'Content-Type': 'application/json' } },
		);
		if (!response.ok) return false;

		return bankSession(await response.json());
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
	scrubParams([PARAM_TOKEN, PARAM_NONE]);
	return redeemed;
}

/**
 * Where this app's API lives from wherever the page is. On a domain-mapped host the app is the
 * host and the root is right; on a `/{app}/{client}/page/{name}` URL the app is the path, and a
 * call to the root would be answered by whatever app owns the host instead. Every other API
 * call in the client carries this prefix; these have to as well, and cannot use
 * `RemoteRepository`'s version of it because that reads the store.
 */
function apiPrefix(): string {
	const { appName, clientCode } = processLocation(window.location);
	return appName && clientCode ? `/${appName}/${clientCode}/page/` : '/';
}

async function postJSON(path: string, body: unknown): Promise<{ status: number; body: any }> {
	try {
		const response = await fetch(`${apiPrefix()}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			credentials: 'include',
		});

		let parsed: any = undefined;
		try {
			parsed = await response.json();
		} catch {
			/* an empty or non-JSON body is answer enough; the status carries the meaning */
		}
		return { status: response.status, body: parsed };
	} catch {
		return { status: 0, body: undefined };
	}
}

function isOk(status: number): boolean {
	return status >= 200 && status < 300;
}

/**
 * Turn the provider's verified profile into a session on THIS app.
 *
 * Sign in first, register only if the app says it does not know this user. Both calls go to the
 * current origin with no `appCode`/`clientCode` headers, which is the whole point of doing this
 * here: the platform reads the app off the host, so the account is created in, and the session
 * issued for, the app the user actually clicked from. The broker that holds the OAuth keys never
 * has to be trusted to say which app it was acting for.
 */
async function redeemSocialState(
	state: string,
	userName: string,
	params: URLSearchParams,
): Promise<boolean> {
	// An sso3 app wants the cookie set, so a later cold start on another domain has something
	// to find. `isSsoEnabled` needs the application object, which does not exist this early, so
	// this keys off the beacon host, which is injected only for sso3 apps.
	const cookie = !!globalThis.__SSO_BEACON_HOST__;

	const login = await postJSON('api/security/authenticate/social', {
		userName,
		socialRegisterState: state,
		identifierType: 'EMAIL_ID',
		rememberMe: true,
		cookie,
	});

	if (isOk(login.status)) return bankSession(login.body);

	// 403 is the platform's answer for both "no such user anywhere"
	// (USER_CREDENTIALS_MISMATCHED) and "this client has no registration on this app"
	// (NO_REGISTRATION_AVAILABLE). The texts are localised, so the status is all there is to go
	// on, and signing them up is the right next step either way. Anything else is a real
	// failure and must not be retried as a registration.
	if (login.status !== 403) return false;

	const firstName = params.get('firstName') ?? '';
	const lastName = params.get('lastName') ?? '';

	const register = await postJSON('api/security/clients/socialRegister', {
		userName,
		emailId: params.get('emailId') ?? userName,
		firstName,
		lastName,
		middleName: params.get('middleName') ?? undefined,
		phoneNumber: params.get('phoneNumber') ?? undefined,
		localeCode: params.get('localeCode') ?? undefined,
		clientName: [firstName, lastName].filter(Boolean).join(' ') || userName,
		businessClient: false,
		socialRegisterState: state,
		// The browser is the only thing that knows the zone, and an offset cannot survive a
		// daylight-saving boundary, so the platform asks for it by name.
		timeZone: resolvedTimeZone(),
		// `register` refuses a request with no `passType`, while the social branch of
		// `getClientAuthenticationResponse` only runs when no password is supplied. PASSWORD
		// with no password is the one combination that satisfies both: the platform generates
		// the password itself and hands back a session inline.
		passType: 'PASSWORD',
	});

	if (!isOk(register.status)) return false;

	// A registration that could not authenticate answers with `authentication: null` rather
	// than an error, which is a registered user and no session: worth failing on, so the caller
	// falls through to the app's own sign-in rather than looking signed in and not being.
	return bankSession(register.body?.authentication);
}

function resolvedTimeZone(): string | undefined {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
	} catch {
		return undefined;
	}
}

// One redeem per page load, shared by every caller. `consumeSsoArrival` is called twice on
// purpose and gets away with it because the first pass scrubs the params; that is not enough
// for a single-use server-side state, because the second caller can arrive while the POST is
// still in flight and would spend it again. Same reasoning as
// `RemoteRepository`'s promise cache.
let socialArrival: Promise<boolean> | undefined;

/**
 * Handle an arrival back from a social-login callback, before the bootstrap reads localStorage.
 *
 * The callback lands here with the provider-verified profile and a single-use `sessionId`, and
 * this is what turns that into a session on this app. Nothing else does: page definitions are
 * not involved, so social login works the same on every app whether or not anyone wired it up.
 *
 * Returns true when a session was established, so the caller knows the app definition call
 * that follows can be made authenticated rather than anonymous.
 */
export async function consumeSocialArrival(): Promise<boolean> {
	if (socialArrival) return socialArrival;

	let params: URLSearchParams;
	try {
		params = new URL(window.location.href).searchParams;
	} catch {
		return false;
	}

	const state = params.get(PARAM_SOCIAL_STATE);
	if (!state) {
		// A cancelled consent screen comes back with `error` and no state. There is nothing to
		// redeem, and the app should render as if nothing happened, so just tidy the address bar.
		if (params.get(PARAM_SOCIAL_ERROR)) scrubParams(SOCIAL_ARRIVAL_PARAMS);
		return false;
	}

	// `emailId` is what the provider verified; `userName` is the same value on every platform
	// the callback supports today, and is the fallback only so a provider that stops sending
	// one does not take the whole flow down.
	const userName = params.get('emailId') ?? params.get('userName');
	if (!userName) {
		scrubParams(SOCIAL_ARRIVAL_PARAMS);
		return false;
	}

	if (readSession(keyFor(SOCIAL_TRIED_KEY)) === state) {
		scrubParams(SOCIAL_ARRIVAL_PARAMS);
		return false;
	}
	// Before the call, not after: a reload mid-flight must not spend the state twice.
	writeSession(keyFor(SOCIAL_TRIED_KEY), state);

	// The user has just come back from an interactive identity flow, so the beacon has nothing
	// better to say than what is on this URL. Settling it here matters on the FAILURE path: the
	// cold-start bounce fires on `!auth` further down the boot, and it would take the browser
	// off to the beacon and back for an answer nobody needs.
	markAskedBeacon();

	// Everything needed is read off the URL before it is cleaned, and the cleaning is
	// unconditional. `params` is a snapshot, so it survives the rewrite; what must not survive
	// is a spent state and somebody's email address sitting in history, in a bookmark, in a
	// shared link, or on the `returnUrl` of some later redirect.
	const redirectUrl = params.get('redirectUrl');
	scrubParams(SOCIAL_ARRIVAL_PARAMS);

	socialArrival = redeemSocialState(state, userName, params).then(async established => {
		if (established) await continueFromSocial(redirectUrl);
		return established;
	});

	return socialArrival;
}

/**
 * Leave the arrival, now that there is a session.
 *
 * On an sso3 app this goes through the beacon, exactly as `UIEngine.Login` does after a
 * password sign-in: it seeds the shared session and lands on the destination in the same hop,
 * at no extra cost. Skipping it would make a social sign-in a second-class session, one that
 * works here and leaves every other app still asking. `isSsoEnabled()` with no argument is a
 * valid test this early, because the beacon host is injected only for sso3 apps.
 *
 * Seeding is best-effort, the way Login treats it: if the token cannot be minted, the user is
 * signed in here regardless and just continues to the destination.
 */
async function continueFromSocial(redirectUrl: string | null): Promise<void> {
	if (isSsoEnabled()) {
		const seeded = await seedBeaconFromSession(redirectUrl);
		if (seeded) return;
	}

	continueToRedirect(redirectUrl);
}

async function seedBeaconFromSession(redirectUrl: string | null): Promise<boolean> {
	const accessToken = readLocal(keyFor('AuthToken'));
	if (!accessToken) return false;

	try {
		const response = await fetch(`${apiPrefix()}api/security/makeOneTimeToken`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// Stored JSON-encoded, and the header wants the bare token.
				Authorization: JSON.parse(accessToken),
			},
			body: JSON.stringify({ targetAppCode: 'authzump', targetClientCode: 'SYSTEM' }),
			credentials: 'include',
		});
		if (!response.ok) return false;

		const token = (await response.json())?.token;
		if (!token) return false;

		const target = beginSsoSeed(token, sameOriginTarget(redirectUrl) ?? undefined);
		if (!target) return false;

		window.location.replace(target);
		return true;
	} catch {
		return false;
	}
}

/**
 * Follow the app's own `redirectUrl` when the callback could not land on it directly.
 *
 * Same origin only, and only when it names a different page. The value is a query param, so
 * honouring an off-origin one would be an open redirect on top of a fresh session; and since
 * the outbound leg now sends an absolute URL, the browser is normally already exactly where the
 * app asked to come back to, and this does nothing.
 */
function continueToRedirect(redirectUrl: string | null): void {
	const target = sameOriginTarget(redirectUrl);
	if (!target) return;
	if (new URL(target).pathname === window.location.pathname) return;

	window.location.replace(target);
}

/**
 * The redirect as an absolute URL, or null if it is not this app's to follow. Same origin only:
 * the value is a query param, so honouring an off-origin one would be an open redirect on top
 * of a session that has just been created.
 */
function sameOriginTarget(redirectUrl: string | null): string | null {
	if (!redirectUrl) return null;

	try {
		const target = new URL(redirectUrl, window.location.href);
		return target.origin === window.location.origin ? target.toString() : null;
	} catch {
		/* a redirect we cannot parse is one we should not follow */
		return null;
	}
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
	leavingForBeacon = true;

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

/**
 * Forget the session on the beacon origin as part of signing out.
 *
 * Without this, logout is theatre: the app clears its own storage, the next cold load bounces
 * to the beacon, and the beacon still holds a session and hands back a fresh token. The user is
 * signed straight back in, which reads as "logout does not clear the token".
 *
 * Navigates, so nothing after the call runs.
 */
export function ssoLogoutBeacon(appCode: string, returnUrl?: string): void {
	const target = beginSsoLogout(appCode, returnUrl);
	if (target) window.location.replace(target);
}

/** As {@link beginSsoBounce}, the address without the navigation, so it can be tested. */
export function beginSsoLogout(appCode: string, returnUrl?: string): string | null {
	const beaconURL = getBeaconURL();
	if (!beaconURL) return null;

	// Signing out must not leave this origin thinking it already asked and need not again.
	clearBeaconMark();
	leavingForBeacon = true;

	const back = returnUrl ?? window.location.href;
	return (
		`${beaconURL}/hassso?mode=logout` +
		`&targetAppCode=${encodeURIComponent(appCode)}` +
		`&returnUrl=${encodeURIComponent(back)}`
	);
}

/** As {@link beginSsoBounce}, the address without the navigation, so it can be tested. */
export function beginSsoSeed(token: string, redirectUrl?: string): string | null {
	const beaconURL = getBeaconURL();
	if (!beaconURL) return null;

	// A fresh session is worth asking about again wherever the old answer was "none".
	clearBeaconMark();
	leavingForBeacon = true;

	const back = redirectUrl ?? window.location.href;
	return `${beaconURL}/sso/${encodeURIComponent(token)}?redirectUrl=${encodeURIComponent(back)}`;
}
