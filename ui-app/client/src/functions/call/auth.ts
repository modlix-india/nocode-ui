import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import * as StoreContext from '../../context/StoreContext';

/**
 * Who is signed in, for the call session (LZT-2163). A browser phone must never stay registered
 * for an agent who signed out, and the page's own logout buttons are not the only way out: a
 * sign out in another tab of the site, an expired or revoked token, or a different user signing
 * in all leave the phone up unless the session watches for them itself.
 *
 * Two sources:
 * - `Store.auth` in this tab (UIEngine.Logout deletes it, UIEngine.Login replaces it);
 * - the auth token in localStorage, shared by every tab of the site: when another tab removes it
 *   (its Logout, its expiry tick) this tab hears a `storage` event, while its own `Store.auth`
 *   still looks signed in.
 */
export interface AuthWatch {
	/** The signed in user's id, '' when nobody is signed in here. */
	user(): string;
	/**
	 * Calls back on each change: `elsewhere` true when another tab of the site removed the shared
	 * token (a sign out there is a sign out here). Returns a stop.
	 */
	watch(onChange: (elsewhere: boolean) => void): () => void;
}

function browserAuthWatch(): AuthWatch | undefined {
	const { addListener, getDataFromPath } = StoreContext as any;
	if (typeof addListener !== 'function' || typeof getDataFromPath !== 'function')
		return undefined;
	return {
		user() {
			try {
				const auth = getDataFromPath(`${STORE_PREFIX}.auth`, []);
				if (!auth) return '';
				const id = auth?.user?.id;
				return id === undefined || id === null || id === '' ? 'signed-in' : String(id);
			} catch {
				return '';
			}
		},
		watch(onChange) {
			const stop = addListener(
				undefined,
				() => onChange(false),
				`${STORE_PREFIX}.auth`,
			) as () => void;
			const onStorage = (e: StorageEvent) => {
				if (e.newValue !== null || e.oldValue === null) return;
				const key = e.key ?? '';
				if (key === 'AuthToken' || key === 'designMode_AuthToken') onChange(true);
			};
			const win = typeof window === 'undefined' ? undefined : window;
			win?.addEventListener?.('storage', onStorage);
			return () => {
				stop?.();
				win?.removeEventListener?.('storage', onStorage);
			};
		},
	};
}

let override: AuthWatch | null | undefined;
let detected: AuthWatch | null | undefined;

export function getAuthWatch(): AuthWatch | undefined {
	if (override !== undefined) return override ?? undefined;
	if (detected === undefined) detected = browserAuthWatch() ?? null;
	return detected ?? undefined;
}

/** For tests: a fake, or null for none. undefined goes back to the browser's. */
export function setAuthWatch(watch: AuthWatch | null | undefined) {
	override = watch;
}

/** The auth headers every app request carries (see UIEngine.SendData's defaults). */
export function authHeaders(): Record<string, string> {
	const { getDataFromPath } = StoreContext as any;
	const read = (path: string) => {
		try {
			return typeof getDataFromPath === 'function' ? getDataFromPath(path, []) : undefined;
		} catch {
			return undefined;
		}
	};
	const headers: Record<string, string> = {};
	const token = read(`${LOCAL_STORE_PREFIX}.AuthToken`);
	const clientCode = read(`${STORE_PREFIX}.auth.loggedInClientCode`);
	if (token) headers.Authorization = String(token);
	if (clientCode) headers.clientCode = String(clientCode);
	return headers;
}

/**
 * The AppBuilder editor canvas (LZT-2164). Both globals: `isDesignMode` is set at boot,
 * `designMode` only when the editor posts its editor type. Checking only the latter lets the
 * canvas briefly register a real phone.
 */
export function inDesigner(): boolean {
	const g = globalThis as any;
	return !!g.isDesignMode || !!g.designMode;
}
