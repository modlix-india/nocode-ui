/*
 * Same-tab navigation for a link a component has taken over.
 *
 * The SPA routes by pushing the url and nudging the history so react-router sees it. That only
 * works for this origin: the browser refuses `pushState` for another one with a SecurityError, so
 * a plain footer link to linkedin.com crashed the page instead of leaving it. Anything that
 * resolves to a different origin is a real page load.
 */
export function navigateInApp(href: string | undefined) {
	if (!href) return;

	let url: URL | undefined;
	try {
		url = new URL(href, window.location.href);
	} catch {
		url = undefined;
	}

	if (url && url.origin !== window.location.origin) {
		window.location.assign(url.href);
		return;
	}

	window.history.pushState(undefined, '', href);
	window.history.back();
	setTimeout(() => window.history.forward(), 100);
}
