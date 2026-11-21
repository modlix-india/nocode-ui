import { getHref } from '../components/util/getHref';
import { isLeavingForBeacon } from '../sso/ssoModule';

export interface NavigateOptions {
	target?: string;
	force?: boolean;
	removeThisPageFromHistory?: boolean;
	addressOnly?: boolean;
}

/**
 * The Navigate step's navigation, for components that link inside the app the same way (the
 * report widgets' row and tile links, CXZ-1780). An app relative path goes through `getHref`
 * and the History API dance the page router listens to; anything else opens with `window.open`.
 */
export function navigateTo(linkPath: string, options: NavigateOptions = {}): void {
	const {
		target = '_self',
		force = false,
		removeThisPageFromHistory = false,
		addressOnly = false,
	} = options;
	const url = getHref(linkPath, window.location);

	// A beacon hop is already committed and this page is on its way out. Navigate's
	// history dance (pushState, back, then a forward 100ms later) would cancel that
	// hop, and because it is a race the failure is intermittent and silent: signed in
	// here, no session shared with anything else. Pages routinely place Navigate beside
	// Login rather than after it, so the two run at once.
	if (isLeavingForBeacon()) return;

	if (addressOnly && target === '_self' && !force && !url?.startsWith('http')) {
		if (
			url &&
			url !== `${window.location.pathname}${window.location.search}${window.location.hash}`
		)
			window.history.replaceState(window.history.state, '', url);
	} else if (target === '_self' && !force && !url?.startsWith('http')) {
		if (removeThisPageFromHistory) {
			window.history.replaceState(undefined, '', url);
			window.history.back();
			setTimeout(() => window.history.forward(), 100);
		} else {
			window.history.pushState(undefined, '', url);
			window.history.back();
			setTimeout(() => window.history.forward(), 100);
		}
	} else window.open(url, target);
}
