/**
 * Page routing: turning the page name that appears in a URL into the page that
 * actually renders.
 *
 * Two features share this one mechanism, because with whole-page variants a
 * "variant" is just another page name:
 *
 *   PERSONALIZATION  same URL, different page depending on the request
 *                    (campaign, referrer, country, device, signed-in state)
 *   SPLIT            same URL, one of N pages, chosen once per visitor
 *
 * Rules live on the application definition at `properties.pageRouting`, keyed by
 * the *requested* page name. Routing outranks the page name: if a route exists
 * for `pricing`, it decides, whether or not a page called `pricing` also exists.
 * That is what lets a route name be a pure landing URL with no page of its own.
 *
 * Resolution is a single hop. The page a rule selects is never itself re-routed,
 * so no chain can loop and no ordering of the table can change an answer.
 *
 * ---------------------------------------------------------------------------
 * THIS FILE IS COPIED VERBATIM INTO THE SSR BUILD by ui-app/ssr's `prebuild`
 * step, landing at ssr/src/shared/pageRouting.ts. The SSR service and the
 * browser must reach the same answer for the same request: if they disagree,
 * SSR bootstraps one page and the browser fetches another, and nothing errors.
 *
 * So it must compile unchanged under both tsconfigs, which means:
 *
 *   - NO imports of any kind. SSR is `module: NodeNext` and needs explicit
 *     `.js` extensions on relative imports; the client is
 *     `moduleResolution: bundler` and does not. A file with no relative
 *     imports sidesteps the disagreement entirely. Inline what you need.
 *   - NO `window`, `document`, `localStorage`, `process` or any other host
 *     global. Every signal arrives as an argument.
 *   - NO side effects. Randomness is injected so a test can pin it, and a new
 *     split assignment is *returned* for the caller to persist rather than
 *     written here.
 * ---------------------------------------------------------------------------
 */

export type PageRouteConditionSource =
	| 'QUERY'
	| 'HEADER'
	| 'COOKIE'
	| 'DEVICE'
	| 'AUTH'
	| 'GEO';

export type PageRouteConditionOperator =
	| 'EQUALS'
	| 'NOT_EQUALS'
	| 'CONTAINS'
	| 'NOT_CONTAINS'
	| 'STARTS_WITH'
	| 'ENDS_WITH'
	| 'MATCHES'
	| 'IN'
	| 'NOT_IN'
	| 'EXISTS'
	| 'NOT_EXISTS';

export interface PageRouteCondition {
	source: PageRouteConditionSource;
	/**
	 * Only for stable display and iteration. ALL and ANY are both
	 * order-independent, so this never changes an answer.
	 */
	order?: number;
	/** Required for QUERY, HEADER and COOKIE; ignored for the rest. */
	field?: string;
	operator: PageRouteConditionOperator;
	value?: string;
	/** For IN / NOT_IN. A comma-separated `value` is accepted as a shorthand. */
	values?: Array<string>;
	/** Comparison folds case unless this is explicitly true. */
	caseSensitive?: boolean;
}

export interface PageRouteVariant {
	page: string;
	/** Relative share. Missing means 1. Zero or negative removes it from the draw. */
	weight?: number;
	order?: number;
	name?: string;
}

export interface PageRouteRule {
	order?: number;
	name?: string;
	type: 'PERSONALIZATION' | 'SPLIT';
	/** Only an explicit false disables; missing means enabled. */
	enabled?: boolean;

	/** PERSONALIZATION: the page to serve when the conditions match. */
	page?: string;

	/** Defaults to ALL. */
	conditionMatch?: 'ALL' | 'ANY';
	conditions?: { [key: string]: PageRouteCondition };

	/** SPLIT: the arms, keyed by a stable id that a stored assignment names. */
	variants?: { [key: string]: PageRouteVariant };
}

export interface PageRoute {
	/** Only an explicit false disables; missing means enabled. */
	enabled?: boolean;
	rules?: { [key: string]: PageRouteRule };
}

export interface PageRouting {
	[requestedPageName: string]: PageRoute;
}

export interface PageRouteRequest {
	/** The page name taken from the URL. Empty or `index` means the default page. */
	pageName?: string;
	query?: { [key: string]: string };
	/** Header names must already be lower-cased. */
	headers?: { [key: string]: string };
	cookies?: { [key: string]: string };
	/** Caller-derived, e.g. MOBILE / TABLET / DESKTOP. Compared as a plain string. */
	device?: string;
	/** Caller-derived country code, e.g. from a CDN header. */
	country?: string;
	authenticated?: boolean;
	/** Split assignments this visitor already carries: rule key -> variant key. */
	assignments?: { [ruleKey: string]: string };
}

export interface PageRouteResolution {
	/** The page to render. */
	pageName: string;
	/** The `pageRouting` key that decided, when one did. */
	routeKey?: string;
	ruleKey?: string;
	variantKey?: string;
	/**
	 * Set only when a split arm was drawn for the first time. The caller persists
	 * it; this function never writes. Absent when an existing assignment was
	 * reused, so a re-render costs no cookie write.
	 */
	newAssignment?: { ruleKey: string; variantKey: string };
}

export interface PageRouteOptions {
	/** Injected so tests can pin the draw. Defaults to Math.random. */
	random?: () => number;
}

/**
 * The cookie holding this visitor's split assignments.
 *
 * It deliberately holds no visitor id. A random per-visitor identifier would be
 * a pseudonymous online identifier and therefore personal data; the assignment
 * alone ("this browser is in arm B of pricing-q4") distinguishes nobody beyond
 * their bucket and builds no profile. Storing the assignment also removes the
 * need to bucket deterministically from an id, which in turn means editing a
 * rule's weights no longer re-buckets visitors who are already in the test.
 */
export const PAGE_ROUTE_ASSIGNMENT_COOKIE = 'modlix_page_variant';

/**
 * How long an assignment is kept, when nothing overrides it.
 *
 * Shared so that the SSR service and the browser write the same cookie: both
 * draw arms, and a visitor whose cookie is rewritten with a different lifetime
 * on every other navigation is a bug nobody would enjoy finding. The SSR
 * service may override this from configuration, in which case cookies it sets
 * use the configured value and cookies the browser sets use this one — a
 * difference in expiry only, never in which arm the visitor is in.
 */
export const PAGE_ROUTE_ASSIGNMENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** A ceiling on what will be read back out of the cookie, so a junk or hostile
 * value cannot turn into unbounded work. */
const MAX_ASSIGNMENTS = 50;

/** Author-supplied regular expressions run on every request. Length is not a
 * real defence against catastrophic backtracking, but it removes the cheapest
 * way to write one. */
const MAX_PATTERN_LENGTH = 512;

/**
 * A weight or an order as a number, whatever the document actually holds.
 *
 * These numbers reach the document from several writers — a form field, the raw
 * JSON editor, the AI tool — and a text input writes a string. In a weight that
 * is not a typo anybody can see: `0 + '2'` is `'02'`, so a two-arm split at
 * weights `'2'` and `'1'` drew a point from a total of twenty-one and sent
 * almost every visitor to the first arm, with both arms looking correct on
 * screen. Coercing on the way in is the only place that covers every writer.
 */
function numeric(value: unknown, fallback: number): number {
	if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return fallback;
}

/**
 * Entries of an `order`-carrying map, lowest first.
 *
 * Missing `order` counts as 0 and Array.prototype.sort is stable, so a map whose
 * entries were never given an order keeps the order they were written in. This
 * matches how the rest of the platform reads its keyed maps.
 */
function orderedEntries<T extends { order?: number }>(map: { [key: string]: T } | undefined) {
	if (!map) return [] as Array<[string, T]>;
	return Object.entries(map)
		.filter((e): e is [string, T] => !!e[1])
		.sort((a, b) => numeric(a[1].order, 0) - numeric(b[1].order, 0));
}

function fold(value: string, caseSensitive?: boolean) {
	return caseSensitive === true ? value : value.toLowerCase();
}

/** The request-side value a condition tests, or undefined when absent. */
function conditionValue(
	condition: PageRouteCondition,
	request: PageRouteRequest,
): string | undefined {
	switch (condition.source) {
		case 'QUERY':
			return condition.field ? request.query?.[condition.field] : undefined;
		case 'HEADER':
			// Header names are case-insensitive on the wire; callers hand us a
			// lower-cased map, so the field is lower-cased to match rather than
			// relying on whoever authored the rule to have done it.
			return condition.field ? request.headers?.[condition.field.toLowerCase()] : undefined;
		case 'COOKIE':
			return condition.field ? request.cookies?.[condition.field] : undefined;
		case 'DEVICE':
			return request.device;
		case 'GEO':
			return request.country;
		case 'AUTH':
			// Undefined rather than 'false' when the caller did not say, so that
			// EXISTS can tell "anonymous" from "not determined".
			return request.authenticated === undefined ? undefined : String(request.authenticated);
		default:
			return undefined;
	}
}

function candidateValues(condition: PageRouteCondition): Array<string> {
	if (condition.values?.length) return condition.values;
	if (condition.value === undefined) return [];
	return condition.value.split(',').map(e => e.trim());
}

function matchesPattern(actual: string, condition: PageRouteCondition): boolean {
	const pattern = condition.value;
	if (!pattern || pattern.length > MAX_PATTERN_LENGTH) return false;
	try {
		return new RegExp(pattern, condition.caseSensitive === true ? '' : 'i').test(actual);
	} catch {
		// An unparseable pattern is an authoring mistake. It must not take the
		// page down: this runs on the SSR request path for every visitor.
		return false;
	}
}

function matchCondition(condition: PageRouteCondition, request: PageRouteRequest): boolean {
	const actual = conditionValue(condition, request);
	const present = actual !== undefined && actual !== '';

	switch (condition.operator) {
		case 'EXISTS':
			return present;
		case 'NOT_EXISTS':
			return !present;
		default:
			break;
	}

	if (!present) {
		// A missing value satisfies the negative operators and nothing else.
		// "utm_campaign is not dentists" is true of a visitor who arrived with no
		// campaign at all, which is the reading an author expects, but it is a
		// judgement call rather than an obvious one.
		return (
			condition.operator === 'NOT_EQUALS' ||
			condition.operator === 'NOT_CONTAINS' ||
			condition.operator === 'NOT_IN'
		);
	}

	const value = fold(actual as string, condition.caseSensitive);
	const expected = condition.value === undefined ? undefined : fold(condition.value, condition.caseSensitive);
	const list = new Set(candidateValues(condition).map(e => fold(e, condition.caseSensitive)));

	switch (condition.operator) {
		case 'EQUALS':
			return expected !== undefined && value === expected;
		case 'NOT_EQUALS':
			return expected === undefined || value !== expected;
		case 'CONTAINS':
			return expected !== undefined && value.includes(expected);
		case 'NOT_CONTAINS':
			return expected === undefined || !value.includes(expected);
		case 'STARTS_WITH':
			return expected !== undefined && value.startsWith(expected);
		case 'ENDS_WITH':
			return expected !== undefined && value.endsWith(expected);
		case 'MATCHES':
			return matchesPattern(actual as string, condition);
		case 'IN':
			return list.has(value);
		case 'NOT_IN':
			return !list.has(value);
		default:
			return false;
	}
}

function conditionsMatch(rule: PageRouteRule, request: PageRouteRequest): boolean {
	const conditions = orderedEntries(rule.conditions);

	if (!conditions.length) {
		// A rule with no conditions. Under ALL semantics this is vacuously true,
		// which would make a half-written personalization rule silently hijack the
		// page the moment it is saved. A split is different: it is allowed to
		// apply to everyone, and conditions merely narrow it.
		return rule.type === 'SPLIT';
	}

	if (rule.conditionMatch === 'ANY')
		return conditions.some(([, condition]) => matchCondition(condition, request));

	return conditions.every(([, condition]) => matchCondition(condition, request));
}

interface VariantChoice {
	variantKey: string;
	page: string;
	newAssignment?: { ruleKey: string; variantKey: string };
}

function drawVariant(
	ruleKey: string,
	rule: PageRouteRule,
	request: PageRouteRequest,
	random: () => number,
): VariantChoice | undefined {
	const variants = orderedEntries(rule.variants);
	if (!variants.length) return undefined;

	const existing = request.assignments?.[ruleKey];
	if (existing) {
		const held = variants.find(([key]) => key === existing);
		// A stored assignment is honoured as it stands, and honouring it writes
		// nothing. If the arm it names has since been deleted the assignment is
		// stale, and the visitor is redrawn rather than sent to a page that no
		// longer exists.
		if (held?.[1].page) return { variantKey: existing, page: held[1].page };
	}

	// Every visitor is drawn, whatever they answered about cookies.
	//
	// This used to be gated: consent withheld meant no draw, and the arm the
	// author had flagged was served instead. The reasoning was that drawing means
	// storing the assignment, and storing is what consent governs. The effect was
	// that a site with no working consent banner -- which is most of them -- ran
	// no test at all: every visitor got one arm, for ever, in silence, and the
	// second page was never once rendered.
	//
	// Kiran's call, 2026-09-20: the split runs for everyone. `modlix_page_variant`
	// is first-party, carries no identifier -- its whole content is rule key to
	// arm key -- and exists only so the page does not change under someone between
	// clicks. Measurement is a separate question and stays gated on consent, so an
	// unconsenting visitor is still never counted; they are simply no longer
	// pinned to one arm.
	//
	// The campaign carry-forward cookie is NOT covered by this and is still
	// withheld, because a campaign parameter is closer to tracking than an arm
	// index is. See `carryQueryForward` in Engine/pageRoute.ts.
	const eligible = variants.filter(
		([, variant]) => !!variant.page && numeric(variant.weight, 1) > 0,
	);
	if (!eligible.length) return undefined;

	const total = eligible.reduce((sum, [, variant]) => sum + numeric(variant.weight, 1), 0);
	let point = random() * total;
	for (const [key, variant] of eligible) {
		point -= numeric(variant.weight, 1);
		if (point < 0) return { variantKey: key, page: variant.page, newAssignment: { ruleKey, variantKey: key } };
	}

	// Only reachable if `random` returns exactly 1, or through floating point
	// drift in the subtraction. Falling back to the last arm keeps the function
	// total rather than leaving the split silently inapplicable.
	const [lastKey, lastVariant] = eligible.at(-1) as [string, PageRouteVariant];
	return {
		variantKey: lastKey,
		page: lastVariant.page,
		newAssignment: { ruleKey, variantKey: lastKey },
	};
}

/** The first rule of one route that both matches and yields a page, if any. */
function applyRoute(
	routing: PageRouting | undefined,
	routeKey: string,
	request: PageRouteRequest,
	random: () => number,
): PageRouteResolution | undefined {
	if (!routeKey) return undefined;

	const route = routing?.[routeKey];
	if (!route || route.enabled === false) return undefined;

	for (const [ruleKey, rule] of orderedEntries(route.rules)) {
		if (rule.enabled === false) continue;
		if (!conditionsMatch(rule, request)) continue;

		if (rule.type === 'SPLIT') {
			const choice = drawVariant(ruleKey, rule, request, random);
			// A split that cannot produce an arm falls through to the next rule
			// rather than ending resolution, so an empty split does not shadow a
			// personalization rule beneath it.
			if (!choice) continue;
			return {
				pageName: choice.page,
				routeKey,
				ruleKey,
				variantKey: choice.variantKey,
				newAssignment: choice.newAssignment,
			};
		}

		if (rule.page) return { pageName: rule.page, routeKey, ruleKey };
	}

	return undefined;
}

/**
 * Resolve the page to render.
 *
 * Routing is consulted before the requested name is taken at face value, and
 * before the default page substitutes for an empty one — but a route keyed by
 * the default page's own name still applies, so a personalized home page works.
 *
 * Returns the requested name unchanged when nothing matches, which is exactly
 * today's behaviour.
 */
export function resolvePageRoute(
	routing: PageRouting | undefined,
	defaultPage: string | undefined,
	request: PageRouteRequest,
	options?: PageRouteOptions,
): PageRouteResolution {
	const random = options?.random ?? Math.random;
	const requested = (request.pageName ?? '').trim();

	const direct = applyRoute(routing, requested, request, random);
	if (direct) return direct;

	if ((!requested || requested === 'index') && defaultPage) {
		const viaDefault = applyRoute(routing, defaultPage, request, random);
		if (viaDefault) return viaDefault;
		return { pageName: defaultPage };
	}

	return { pageName: requested };
}

/**
 * Read the assignment cookie. Anything unrecognised yields no assignments, so a
 * corrupted or hand-edited value costs the visitor a fresh draw and nothing
 * worse.
 *
 * The caller passes the already URI-decoded value.
 */
export function parseRouteAssignments(raw: string | undefined | null): { [ruleKey: string]: string } {
	return parseStringMap(raw);
}

/**
 * The query parameters carried forward for a visitor who permitted storage.
 *
 * Separate from the assignment cookie because it answers a different question
 * and may be dropped independently: one records which arm of a test someone is
 * in, this one records the campaign they arrived on.
 */
export const PAGE_ROUTE_QUERY_COOKIE = 'modlix_route_query';

/**
 * The query parameter names the routing rules actually test.
 *
 * Only these are ever persisted. Writing the whole query string to a cookie
 * would put whatever happened to be in the URL on the visitor's device --
 * emails, tokens, order numbers, anything an app appends -- to answer a question
 * about campaigns. Keeping it to the fields some condition names bounds both the
 * size and what is stored at all.
 */
export function routeQueryFields(routing: PageRouting | undefined): Array<string> {
	const fields = new Set<string>();
	for (const route of Object.values(routing ?? {})) {
		for (const rule of Object.values(route?.rules ?? {})) {
			for (const condition of Object.values(rule?.conditions ?? {})) {
				if (condition?.source === 'QUERY' && condition.field) fields.add(condition.field);
			}
		}
	}
	return [...fields];
}

/** A `{string: string}` cookie value, tolerant of anything unrecognised. */
export function parseStringMap(raw: string | undefined | null): { [key: string]: string } {
	if (!raw) return {};

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {};
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

	const assignments: { [ruleKey: string]: string } = {};
	let count = 0;
	for (const [key, value] of Object.entries(parsed as { [key: string]: unknown })) {
		if (typeof value !== 'string' || !value) continue;
		assignments[key] = value;
		if (++count >= MAX_ASSIGNMENTS) break;
	}
	return assignments;
}

/** The cookie value for a set of assignments. The caller URI-encodes it. */
export function serializeRouteAssignments(assignments: { [ruleKey: string]: string }): string {
	return JSON.stringify(assignments ?? {});
}

/**
 * Cookies as a map, from a `Cookie:` header or from `document.cookie` — the two
 * have the same shape. Both the SSR service and the browser need this, and they
 * must agree, so it lives here rather than once on each side.
 *
 * The first occurrence of a name wins, which is the order a browser sends the
 * most specific cookie in.
 */
export function parseCookieHeader(header: string | undefined | null): { [key: string]: string } {
	const cookies: { [key: string]: string } = {};
	if (!header) return cookies;

	for (const part of header.split(';')) {
		const trimmed = part.trim();
		if (!trimmed) continue;

		const eq = trimmed.indexOf('=');
		// A valueless cookie is not a name we can test against, and a leading '='
		// is not a name at all.
		if (eq <= 0) continue;

		const name = trimmed.slice(0, eq).trim();
		if (name in cookies) continue;

		try {
			cookies[name] = decodeURIComponent(trimmed.slice(eq + 1).trim());
		} catch {
			// A malformed escape is not worth losing the whole header over.
			cookies[name] = trimmed.slice(eq + 1).trim();
		}
	}
	return cookies;
}

/**
 * A coarse device class for the DEVICE condition source.
 *
 * Deliberately crude: this decides which of an author's pages to show, not
 * anything about layout, and a user-agent string cannot support more precision
 * than this honestly. Tablets are tested first because every tablet string also
 * matches the phone patterns.
 */
export function classifyDevice(userAgent: string | undefined | null): string | undefined {
	if (!userAgent) return undefined;

	// Android tablets are Android without "Mobile"; the rest name themselves.
	if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobile))/i.test(userAgent)) return 'TABLET';
	if (/mobi|iphone|ipod|android|blackberry|windows phone|iemobile|opera mini/i.test(userAgent))
		return 'MOBILE';
	return 'DESKTOP';
}
