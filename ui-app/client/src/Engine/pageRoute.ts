import { getConsentState } from '../App/analyticsConsent';
import { STORE_PREFIX } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { URLDetails } from '../util/locationProcessor';
import {
	PAGE_ROUTE_ASSIGNMENT_COOKIE,
	PAGE_ROUTE_ASSIGNMENT_MAX_AGE_SECONDS,
	PAGE_ROUTE_QUERY_COOKIE,
	classifyDevice,
	parseCookieHeader,
	parseRouteAssignments,
	parseStringMap,
	resolvePageRoute,
	routeQueryFields,
	serializeRouteAssignments,
	type PageRouteRequest,
	type PageRouting,
} from '../util/pageRouting';

/**
 * The browser side of page routing.
 *
 * The decision itself is made by ../util/pageRouting, the same module the SSR
 * service runs. This file supplies the arguments from what a browser can see,
 * and stores an arm the browser drew.
 *
 * The two sides never resolve the same request. The SSR service decides the
 * document it serves; the browser decides only where an in-app navigation goes,
 * which never reaches a server at all. What matters is that they agree about
 * the *rules*, and that is what sharing the evaluator buys.
 *
 * What a browser cannot see is request headers. HEADER and GEO conditions
 * therefore never match here, which means a rule keyed on the referrer or the
 * visitor's country applies when someone arrives on a URL and not when they
 * navigate to it from inside the app. That is a real difference in behaviour
 * and the rules UI should say so rather than let an author discover it.
 */

/**
 * The bootstrap describes the document the SSR service served, and that document
 * was served for one URL. Once the app navigates anywhere the answer inside it
 * is stale, so it is read exactly once.
 */
let bootstrapResolutionUsed = false;

/** Only for tests, which need each case to start from a fresh page load. */
export function resetBootstrapResolution() {
	bootstrapResolutionUsed = false;
}

/**
 * Whether this visitor has permitted anything to be stored on their device.
 *
 * Read for the campaign carry-forward cookie only. Split assignments are NOT
 * gated on it any more — see the note in `drawVariant` — because a split that
 * waits for consent never runs on a site without a working banner, and the
 * second page is never rendered at all.
 */
function consentGranted(): boolean | undefined {
	const state = getConsentState();
	// Nothing to withhold when the app asks for nothing.
	if (!state.required) return undefined;
	// Before a decision exists `categories` is what a preferences panel should
	// show, not what has been agreed to — reading it here would treat silence as
	// a yes.
	if (!state.decided) return false;
	return state.categories.analytics;
}

/**
 * The query parameters of the whole visit, not just the URL showing now.
 *
 * A campaign belongs to the visit rather than to one address. Someone arriving
 * on `/landing?utm_campaign=dentists` and clicking through to `/pricing` is
 * still a dentist, but `/pricing` carries no query of its own, so reading only
 * the current URL meant every rule keyed on a campaign stopped matching the
 * moment they navigated.
 *
 * `Store.urlData` keeps an entry per page visited, so the earlier page's
 * parameters are still there to be read. Entries are merged in visit order and
 * the URL showing now is laid over the top, so a parameter set on this page
 * always beats one carried from an earlier one.
 *
 * Only in-app navigation gets this. A direct arrival that SSR renders has no
 * such history -- nothing is stored on the device -- so its rules see that
 * request's own query and nothing more.
 */
function queryAcrossVisit(
	details: URLDetails,
	carried: { [key: string]: string },
): { [key: string]: string } {
	const merged: { [key: string]: string } = { ...carried };

	const visited = getDataFromPath(`${STORE_PREFIX}.urlData`, []);
	if (visited && typeof visited === 'object')
		for (const entry of Object.values(visited as { [k: string]: any })) {
			const query = entry?.queryParameters;
			if (query && typeof query === 'object') Object.assign(merged, query);
		}

	// Lowest to highest: what an earlier visit left on the device, then the pages
	// of this visit in the order they were seen, then the URL showing now.
	return { ...merged, ...(details.queryParameters ?? {}) };
}

/**
 * Carry the campaign forward for a visitor who allowed it.
 *
 * Without this the visit only survives as long as the tab: a reload, or a direct
 * arrival on a deeper page, and the campaign is gone -- and SSR, which renders
 * those, has no in-memory history to read at all. The cookie is the one thing
 * both sides can see.
 *
 * Gated on consent, unlike the split assignment, and that difference is the
 * point: a campaign parameter says where someone came from and is closer to
 * tracking than an arm index, whose whole content is which of two pages they are
 * looking at. Only an explicit refusal withholds it -- an app that requires no
 * consent stores it, one whose visitor has not answered yet does not.
 */
function carryQueryForward(
	routing: PageRouting | undefined,
	query: { [key: string]: string },
	existing: { [key: string]: string },
) {
	if (consentGranted() === false) return;

	const keep: { [key: string]: string } = {};
	for (const field of routeQueryFields(routing)) if (query[field]) keep[field] = query[field];

	if (!Object.keys(keep).length) return;
	// Rewriting an identical cookie on every navigation is pointless churn, and
	// it would push the expiry out on a visitor who is only browsing.
	if (Object.keys(keep).every(k => existing[k] === keep[k])) return;

	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie =
		`${PAGE_ROUTE_QUERY_COOKIE}=${encodeURIComponent(JSON.stringify({ ...existing, ...keep }))}` +
		`; path=/; max-age=${PAGE_ROUTE_ASSIGNMENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function writeAssignments(assignments: { [ruleKey: string]: string }) {
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie =
		`${PAGE_ROUTE_ASSIGNMENT_COOKIE}=${encodeURIComponent(serializeRouteAssignments(assignments))}` +
		`; path=/; max-age=${PAGE_ROUTE_ASSIGNMENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

/**
 * The page this location should render.
 *
 * On the first call it takes the SSR service's answer, so that the definition
 * already in the bootstrap is the one asked for — deriving the name from the URL
 * instead would miss the bootstrap on every routed page and fetch the control
 * over the network.
 */
export function resolvePageForLocation(details: URLDetails): string | undefined {
	const bootstrapped = globalThis.__APP_BOOTSTRAP__?.resolvedPageName;
	if (!bootstrapResolutionUsed) {
		bootstrapResolutionUsed = true;
		if (bootstrapped) return bootstrapped;
	}

	const properties = getDataFromPath(`${STORE_PREFIX}.application.properties`, []);

	// No definition yet means no rules to apply. Falling back to the URL's own
	// name, and then to the default page, is exactly what this did before routing
	// existed.
	if (!properties)
		return details.pageName || getDataFromPath(`${STORE_PREFIX}.application.properties.defaultPage`, []);

	const cookies = parseCookieHeader(document.cookie);
	const carried = parseStringMap(cookies[PAGE_ROUTE_QUERY_COOKIE]);
	const query = queryAcrossVisit(details, carried);
	carryQueryForward(properties.pageRouting, query, carried);

	const request: PageRouteRequest = {
		pageName: details.pageName,
		query,
		// Headers are not readable from a browser. Left empty rather than
		// approximated: `document.referrer` on an in-app navigation is the previous
		// page of this same site, which is not what an author writing a referrer
		// rule means.
		headers: {},
		cookies,
		device: classifyDevice(navigator.userAgent),
		authenticated: !!getDataFromPath(`${STORE_PREFIX}.auth.user`, []),
		assignments: parseRouteAssignments(cookies[PAGE_ROUTE_ASSIGNMENT_COOKIE]),
	};

	const resolution = resolvePageRoute(properties.pageRouting, properties.defaultPage, request);

	if (resolution.newAssignment)
		writeAssignments({
			...request.assignments,
			[resolution.newAssignment.ruleKey]: resolution.newAssignment.variantKey,
		});

	return resolution.pageName || undefined;
}
