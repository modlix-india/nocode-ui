/**
 * How the user keeps the call bar: expanded or collapsed to its pill. One choice per user in this
 * browser, so every tab shows the bar the same way and a tab opened later starts the same. The
 * session carries it in the call state (`collapsed`), which the tab holding the call shares.
 */
import { localStore, userKey } from './sounds';

/** localStorage key prefix; the user id follows. Holds 'collapsed' while the bar is collapsed. */
export const VIEW_KEY = 'modlix.call.view';

export function isCollapsed(): boolean {
	try {
		return localStore()?.getItem(userKey(VIEW_KEY)) === 'collapsed';
	} catch {
		return false;
	}
}

export function setCollapsed(on: boolean) {
	try {
		if (on) localStore()?.setItem(userKey(VIEW_KEY), 'collapsed');
		else localStore()?.removeItem(userKey(VIEW_KEY));
	} catch {
		// Storage blocked: the choice lasts for this page only, through the call state.
	}
}
