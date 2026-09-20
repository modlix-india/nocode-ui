/**
 * The SSR side of page routing.
 *
 * The decision itself lives in ../shared/pageRouting.js, which is copied from
 * the client so both sides answer identically. This file only turns an inbound
 * HTTP request into the arguments that function takes, and turns a new split
 * assignment back into a Set-Cookie.
 */
import type { IncomingHttpHeaders } from 'node:http';
import {
	PAGE_ROUTE_ASSIGNMENT_COOKIE,
	PAGE_ROUTE_QUERY_COOKIE,
	classifyDevice,
	parseCookieHeader,
	parseRouteAssignments,
	parseStringMap,
	resolvePageRoute,
	serializeRouteAssignments,
	type PageRouteRequest,
	type PageRouteResolution,
	type PageRouting,
} from '../shared/pageRouting.js';

export type { PageRouteResolution } from '../shared/pageRouting.js';

/**
 * Headers a CDN or proxy may use to report the visitor's country, most specific
 * first.
 *
 * None of these is known to arrive in this deployment — the GEO condition
 * source is inert until one does, and silently so, because a condition whose
 * value is absent simply does not match. Confirm what the edge actually sends
 * before offering GEO in the rules UI.
 */
const COUNTRY_HEADERS = [
	'cf-ipcountry',
	'x-geo-country',
	'x-country-code',
	'x-appengine-country',
];

interface ApplicationLike {
	properties?: {
		pageRouting?: PageRouting;
		defaultPage?: string;
	};
}


function headerValue(headers: IncomingHttpHeaders, name: string): string | undefined {
	const raw = headers[name];
	if (Array.isArray(raw)) return raw[0];
	return raw;
}

/** Headers as a lower-cased single-value map, which is what conditions expect. */
function flattenHeaders(headers: IncomingHttpHeaders): { [key: string]: string } {
	const flat: { [key: string]: string } = {};
	for (const [key, value] of Object.entries(headers)) {
		if (value === undefined) continue;
		// Node already lower-cases inbound header names; doing it again costs
		// nothing and stops a hand-built headers object from breaking lookups.
		flat[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value);
	}
	return flat;
}

function queryParameters(url: URL): { [key: string]: string } {
	const query: { [key: string]: string } = {};
	// First value wins, matching how the client reads the same query string.
	for (const [key, value] of url.searchParams.entries()) if (!(key in query)) query[key] = value;
	return query;
}

export interface RouteContext {
	resolution: PageRouteResolution;
	/** The page to render: the resolution, with empties folded back to `index`. */
	pageName: string;
	/** Every assignment this visitor should now hold, if one was drawn. */
	assignments?: { [ruleKey: string]: string };
}

/**
 * Decide which page this request renders.
 *
 * `application` may be null — when the definition could not be fetched, this
 * degrades to exactly today's behaviour and returns the requested name.
 */
export function resolveRoute(
	application: ApplicationLike | null | undefined,
	url: URL,
	headers: IncomingHttpHeaders,
	requestedPageName: string,
	isAuthenticated: boolean,
): RouteContext {
	const properties = application?.properties;
	const cookies = parseCookieHeader(headerValue(headers, 'cookie'));
	const assignments = parseRouteAssignments(cookies[PAGE_ROUTE_ASSIGNMENT_COOKIE]);

	let country: string | undefined;
	for (const header of COUNTRY_HEADERS) {
		const value = headerValue(headers, header);
		// Cloudflare sends XX for "could not determine", which is worse than
		// nothing: it would satisfy an EXISTS condition while meaning the opposite.
		if (value && value !== 'XX') {
			country = value;
			break;
		}
	}

	const request: PageRouteRequest = {
		pageName: requestedPageName,
		// The URL's own query laid over whatever an earlier visit carried
		// forward. Only the browser writes that cookie, and only for a visitor
		// who permitted it -- writing it here would put a Set-Cookie on every
		// campaign arrival and force those responses out of the shared HTML
		// cache. Reading one the browser already sent costs nothing.
		query: { ...parseStringMap(cookies[PAGE_ROUTE_QUERY_COOKIE]), ...queryParameters(url) },
		headers: flattenHeaders(headers),
		cookies,
		device: classifyDevice(headerValue(headers, 'user-agent')),
		country,
		authenticated: isAuthenticated,
		assignments,
	};

	const resolution = resolvePageRoute(
		properties?.pageRouting,
		properties?.defaultPage,
		request,
	);

	// `index` is what the rest of the renderer calls "no page named", and
	// fetchAllPageData still substitutes the default page for it. Resolution
	// producing nothing must land back on that word rather than on an empty
	// string, which would key a cache entry nobody could ever invalidate by name.
	const pageName = resolution.pageName || 'index';

	if (!resolution.newAssignment) return { resolution, pageName };

	return {
		resolution,
		pageName,
		assignments: {
			...assignments,
			[resolution.newAssignment.ruleKey]: resolution.newAssignment.variantKey,
		},
	};
}

/**
 * The Set-Cookie for a visitor who has just been drawn into a split.
 *
 * Deliberately NOT HttpOnly. In-app navigation never reaches this server, so
 * the browser resolves those itself — and it can only keep a visitor in the arm
 * they were already drawn into if it can read the cookie, and only keep them
 * there after a fresh draw if it can write one. HttpOnly would make every
 * client-side navigation redraw and flip visitors between arms.
 *
 * Readable-by-script is affordable here precisely because of what this cookie
 * does not contain. It holds no visitor id — only which arm of which rule — so
 * a script that reads it learns a bucket, not a person.
 */
export function assignmentSetCookie(
	assignments: { [ruleKey: string]: string },
	maxAgeSeconds: number,
	secure: boolean,
): string {
	const value = encodeURIComponent(serializeRouteAssignments(assignments));
	return (
		`${PAGE_ROUTE_ASSIGNMENT_COOKIE}=${value}; Path=/; Max-Age=${maxAgeSeconds}; ` +
		`SameSite=Lax${secure ? '; Secure' : ''}`
	);
}
