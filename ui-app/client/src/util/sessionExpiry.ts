import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Back to sign in when the session dies under an open tab (CXZ-1754). OPT-IN per app:
 * `application.properties.signInOnSessionExpiry: true`. Without it nothing here is installed
 * and an app behaves exactly as before.
 *
 * Why it is needed: the server does not answer an expired or revoked token with "your session
 * is over". Security treats an unusable credential as no credential at all, so the call runs
 * ANONYMOUS and comes back as an ordinary refusal (core answers 403 "needs a permission your
 * account does not have", the same as a signed-in user without that permission) or, for a call
 * open to anyone, as a 200 with the anonymous answer. The page's event function then carries on
 * with null data and shows "Error while executing the function ...". The 60 s tick in index.tsx
 * reloads once the token's clock expiry has passed, but a tab that slept or was frozen in the
 * background, or a session revoked elsewhere, is used before the tick notices.
 *
 * What this does, only for requests that carried the stored token:
 * - before the request: the token's clock expiry has passed, so the session is over;
 * - after a 401 or 403: asks `api/security/verifyToken` with that same token. A 401 there means
 *   the session is gone. Anything else (200: a genuine permission refusal; a 5xx or a network
 *   blip) leaves the error to the page as before, so nobody is signed out over a flaky link.
 *
 * Either way the stored token is dropped and the SAME URL is reloaded, which is what a manual
 * refresh does: a page that needs a session is answered with the app's sign-in page under that
 * URL, and `UIEngine.Login` then re-renders the page the user was on (the URL is the return
 * path). On an SSO app the reload asks the beacon first, so a live SSO session signs the user
 * back in without a sign-in screen at all. The call that found the dead session never settles,
 * so the page does not flash its error while the reload starts.
 *
 * No loop: after the token is dropped requests carry none, and requests without a token
 * (anonymous pages, the sign-in page itself) are never looked at.
 *
 * Must not import StoreContext: this runs before React mounts (see bootImportGraph.test.ts).
 */

export const SESSION_EXPIRY_PROPERTY = 'signInOnSessionExpiry';

const TOKEN = 'AuthToken';
const TOKEN_EXPIRY = 'AuthTokenExpiry';

/** A token verified as alive is not asked about again for this long. */
const ALIVE_FOR_MS = 30 * 1000;

/** Marks this module's own verifyToken call, so the interceptors leave it alone. */
const CHECK_FLAG = '__sessionExpiryCheck';

let installed = false;
let leaving = false;
let checking: { token: string; result: Promise<boolean> } | undefined;
let alive: { token: string; at: number } | undefined;
let interceptorIds: { request: number; response: number } | undefined;
let onVisible: (() => void) | undefined;
let reload: () => void = () => window.location.reload();

function readLocal(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function removeLocal(key: string) {
	try {
		localStorage.removeItem(key);
	} catch {
		/* a reload without the token is still the right thing */
	}
}

/** The stored token as it goes on the wire (localStorage holds it JSON encoded). */
function storedToken(): string | undefined {
	const raw = readLocal(TOKEN);
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw);
		return typeof parsed === 'string' && parsed ? parsed : undefined;
	} catch {
		return raw;
	}
}

function clockExpired(): boolean {
	const expiry = Number.parseInt(readLocal(TOKEN_EXPIRY) ?? '', 10);
	if (!Number.isFinite(expiry)) return false;
	return expiry * 1000 < Date.now();
}

function sentToken(config: any): string | undefined {
	const headers = config?.headers;
	if (!headers) return undefined;
	const value =
		typeof headers.get === 'function'
			? (headers.get('Authorization') ?? headers.get('authorization'))
			: (headers.Authorization ?? headers.authorization);
	return value ? String(value) : undefined;
}

/** The request carried the session this tab holds (not some other credential). */
function carriesSession(config: any): string | undefined {
	if (!config || config[CHECK_FLAG]) return undefined;
	const sent = sentToken(config);
	if (!sent) return undefined;
	const stored = storedToken();
	return stored && stored === sent ? sent : undefined;
}

function never<T>(): Promise<T> {
	return new Promise<T>(() => {});
}

/** Drops the dead session and reloads this URL, once. */
export function leaveForSignIn() {
	if (leaving) return;
	leaving = true;
	removeLocal(TOKEN);
	removeLocal(TOKEN_EXPIRY);
	reload();
}

/** True only when the server says this token is no longer a session (verifyToken 401). */
function isDead(token: string): Promise<boolean> {
	if (clockExpired()) return Promise.resolve(true);
	if (alive && alive.token === token && Date.now() - alive.at < ALIVE_FOR_MS)
		return Promise.resolve(false);
	if (checking?.token === token) return checking.result;

	const result = axios
		.get('api/security/verifyToken', {
			headers: { Authorization: token },
			[CHECK_FLAG]: true,
		} as any)
		.then(() => {
			alive = { token, at: Date.now() };
			return false;
		})
		.catch((e: any) => e?.response?.status === 401)
		.finally(() => {
			if (checking?.token === token) checking = undefined;
		});
	checking = { token, result };
	return result;
}

export function isSessionExpiryEnabled(application: any): boolean {
	if (globalThis.isDesignMode) return false;
	return application?.properties?.[SESSION_EXPIRY_PROPERTY] === true;
}

/** Installs the watch when the app opted in. Safe to call more than once. */
export function installSessionExpiryWatch(application: any): boolean {
	if (installed || !isSessionExpiryEnabled(application)) return false;
	installed = true;

	const request = axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		if (carriesSession(config) && clockExpired()) {
			leaveForSignIn();
			return never();
		}
		return config;
	});

	const response = axios.interceptors.response.use(undefined, async (error: AxiosError) => {
		const status = error?.response?.status;
		if (status !== 401 && status !== 403) throw error;
		const token = carriesSession(error.config);
		if (!token) throw error;
		if (leaving || (await isDead(token))) {
			leaveForSignIn();
			return never();
		}
		throw error;
	});

	interceptorIds = { request, response };

	// Coming back to a tab (or a laptop waking) is the moment a stale session is about to be
	// used, and the tick in index.tsx can be up to a minute away.
	onVisible = () => {
		if (document.visibilityState !== 'visible') return;
		if (storedToken() && clockExpired()) leaveForSignIn();
	};
	document.addEventListener('visibilitychange', onVisible);
	window.addEventListener('pageshow', onVisible);
	return true;
}

/** For tests: jsdom cannot reload. */
export function setReloadForTests(fn: () => void) {
	reload = fn;
}

/** For tests. */
export function uninstallSessionExpiryWatch() {
	if (interceptorIds) {
		axios.interceptors.request.eject(interceptorIds.request);
		axios.interceptors.response.eject(interceptorIds.response);
	}
	if (onVisible) {
		document.removeEventListener('visibilitychange', onVisible);
		window.removeEventListener('pageshow', onVisible);
	}
	interceptorIds = undefined;
	onVisible = undefined;
	installed = false;
	leaving = false;
	checking = undefined;
	alive = undefined;
}
