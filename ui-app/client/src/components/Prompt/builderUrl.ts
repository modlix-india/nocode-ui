/**
 * A link to another page of the app hosting this chat.
 *
 * The prefix is read off the current path rather than the store: the path
 * `/<appCode>/<clientCode>/page/...` is the one thing that is true whichever app
 * the conversation happens to be about, and the app being drafted is NOT the app
 * hosting this chat. `Store.url` holds a single pair of codes for the host, and
 * reaching for it here has already been the wrong answer once.
 */

/**
 * The pure half, so the path handling can be tested without a location: jsdom's
 * `window.location` is neither writable nor configurable, so a test that wants
 * to stand somewhere else has nowhere to stand.
 *
 * The prefix is taken from the `page` pivot, which is what the platform's own URL
 * parser uses. Anything before it is the prefix and anything after belongs to
 * some other page. A domain-mapped host serves pages at `/page/<name>` with no
 * codes at all, so taking the first two segments blindly would build a link back
 * through whatever page the user happened to be on.
 */
export function pagePathFrom(
	pathname: string | undefined,
	pageName: string,
	...segments: Array<string | undefined>
): string {
	const parts = pathname?.split('/').filter(Boolean) ?? [];
	const pivot = parts.indexOf('page');
	const prefix = pivot > 0 ? `/${parts.slice(0, pivot).join('/')}` : '';
	// Encoded because these become path segments: a session id or app code
	// carrying a slash or a space would otherwise silently change the route.
	const tail = segments
		.filter((s): s is string => s !== undefined && s !== null && s !== '')
		.map(s => encodeURIComponent(s))
		.join('/');
	const suffix = tail ? `/${tail}` : '';
	return `${prefix}/page/${encodeURIComponent(pageName)}${suffix}`;
}

export function builderPageUrl(
	pageName: string,
	...segments: Array<string | undefined>
): string {
	return pagePathFrom(globalThis.window?.location?.pathname, pageName, ...segments);
}
