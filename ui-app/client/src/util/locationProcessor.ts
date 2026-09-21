import { Location as ReactLocation } from 'react-router-dom';

export interface URLDetails {
	queryParameters: any;
	pathParts?: Array<string> | undefined;
	pageName?: string | undefined;
	appName?: string | undefined;
	clientCode?: string | undefined;
	/** `app.example.com` — host and port, no scheme. */
	host?: string | undefined;
	/** `https://app.example.com` — what another origin has to name to allow this one. */
	origin?: string | undefined;
};

export function processLocation(location: ReactLocation | Location) {
	const details: URLDetails = { queryParameters: {} };

	// Where the page is being served from, which `Url.` could not say before.
	// A page that has to tell a DIFFERENT app to trust this one -- a CSP
	// `frame-ancestors` entry, say -- cannot derive it: the environments do not
	// agree on what a host looks like, and the server endpoints that answer for
	// an app answer about that app, not about whoever is asking.
	//
	// A react-router Location carries neither, so this is undefined on the
	// in-app navigation path and read from `window` instead. The SSR seeds its
	// own minimal urlDetails and has no business guessing a browser's origin.
	const anyLoc = location as Partial<Location>;
	details.host = anyLoc.host ?? (typeof window === 'undefined' ? undefined : window.location.host);
	details.origin =
		anyLoc.origin ?? (typeof window === 'undefined' ? undefined : window.location.origin);

	if (location.search) {
		details.queryParameters = location.search
			.split('&')
			.map(e => {
				if (e.startsWith('?')) e = e.substring(1);
				const two = e.split('=');
				if (two.length === 0) return undefined;
				if (two.length === 1) return { key: decodeURIComponent(two[0]), value: '' };
				return { key: decodeURIComponent(two[0]), value: decodeURIComponent(two[1]) };
			})
			.reduce((a: any, c) => {
				if (!c) return a;

				a[c.key] = c.value;
				return a;
			}, {});
	}

	if (location.pathname) {
		const pathParts = location.pathname
			.split('/')
			.filter(e => e !== '')
			.map(e => decodeURIComponent(e));

		const ind = pathParts.indexOf('page');
		if (ind === -1) {
			details.pathParts = pathParts;
			details.pageName = pathParts[0];
		} else {
			if (ind > 0) details.appName = pathParts[0];
			if (ind > 1) details.clientCode = pathParts[1];
			details.pageName = pathParts[ind + 1];
			details.pathParts = pathParts.slice(ind + 1);
		}
	}
	return details;
}
