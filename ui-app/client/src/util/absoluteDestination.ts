import { getHref } from '../components/util/getHref';

/**
 * Resolve whatever a page passed as a destination into an absolute URL.
 *
 * Relative paths go through `getHref` first, so a link written the way every other link in a
 * page is written resolves the same way: on a `/{app}/{client}/page/{name}` URL it keeps that
 * prefix, and elsewhere it is left alone.
 *
 * Its own module, not a helper exported from `Login.ts`: `functions/all.ts` re-exports every
 * name in that directory and `functions/index.ts` calls `new` on each one, so a plain function
 * exported from a KIRun function file breaks the whole registry at startup.
 *
 * Not in `ssoModule` either. `getHref` imports the store and assigns
 * `globalThis.domainAppCode` at import time, and `ssoModule` is loaded before React mounts.
 */
export function absoluteDestination(redirectUrl: string): string {
	const href = getHref(redirectUrl, window.location) ?? redirectUrl;
	try {
		return new URL(href, window.location.href).toString();
	} catch {
		return window.location.href;
	}
}
