/**
 * The built-in web analytics widgets, as requests to the analytics engine.
 *
 * These used to be HogQL strings. They are now descriptors: the engine answers a closed set
 * of widgets and has no query language, so the widget name IS the query and there is nothing
 * to build a string out of. That is also the read security model — with no caller-supplied
 * expression there is nothing to sanitise, and no request can widen its own scope.
 *
 * The site is not named here and must not be. The backend proxy computes it from the appCode
 * and clientCode headers and overwrites whatever arrives, so a widget cannot point itself at
 * another tenant.
 *
 * Timezone is left unset on purpose. The proxy fills it from the client's own
 * `security_client.TIME_ZONE`, which is the zone the customer's own day boundaries are in.
 * Sending the browser's zone here would make two people looking at the same dashboard from
 * two countries see different numbers.
 */

export type WidgetType =
	| 'pageviewsOverTime'
	| 'topPages'
	| 'topReferrers'
	| 'channelBreakdown'
	| 'deviceBreakdown'
	| 'browserBreakdown'
	| 'osBreakdown'
	| 'geoBreakdown'
	| 'platformBreakdown'
	| 'appVersionBreakdown';

interface BuildArgs {
	dateRangeDays: number;
	limit: number;
	/** An explicit interval, which overrides the day count when both ends are set. */
	dateFrom?: unknown;
	dateTo?: unknown;
}

interface Template {
	displayName: string;
	defaultLimit: number;
	build: (args: BuildArgs) => Record<string, unknown>;
	renderHint: 'table' | 'timeSeries';
	/** What one row counts, for the column header. */
	valueLabel: string;
}

/**
 * The interval the engine is actually asked about.
 *
 * The engine takes absolute instants, never "last N days" — a day is only
 * meaningful in a timezone, and the request is not the place that knows which
 * one. `dateRangeDays` is the convenience on top; an explicit from/to overrides
 * it, which is what a custom range on a dashboard sets.
 *
 * Both ends are used EXACTLY as given — two instants, not two days. Deciding
 * that a `to` of midnight probably meant the end of that day would read
 * correctly right up until somebody picks a time, so that decision belongs to
 * whoever chose the dates: the pane computes the start of the first day and the
 * end of the last with the platform's own date functions, and passes instants.
 *
 * They arrive as whatever the caller stores: epoch seconds, epoch millis, or a
 * parseable string. All three are accepted, because the alternative is a
 * silently empty chart whenever the two ends of a page disagree about a format.
 */
export function rangeOf(
	dateRangeDays: number,
	dateFrom?: unknown,
	dateTo?: unknown,
): { from: string; to: string } {
	const start = asDate(dateFrom);
	const end = asDate(dateTo);
	if (start && end && end.getTime() > start.getTime())
		return { from: start.toISOString(), to: end.toISOString() };

	const to = new Date();
	const from = new Date(to.getTime() - Math.max(1, dateRangeDays) * 24 * 60 * 60 * 1000);
	return { from: from.toISOString(), to: to.toISOString() };
}

function asDate(v: unknown): Date | undefined {
	if (v === undefined || v === null || v === '') return undefined;

	const n = typeof v === 'number' ? v : Number(v);
	if (!Number.isNaN(n) && n > 0) {
		// Seconds or milliseconds. Anything below this threshold as millis would
		// be 1970, which no dashboard means.
		return new Date(n < 1e11 ? n * 1000 : n);
	}

	const d = new Date(String(v));
	return Number.isNaN(d.getTime()) ? undefined : d;
}

function widget(
	name: WidgetType,
	{ dateRangeDays, limit, dateFrom, dateTo }: BuildArgs,
): Record<string, unknown> {
	return { widget: name, ...rangeOf(dateRangeDays, dateFrom, dateTo), limit };
}

export const WIDGET_TEMPLATES: Record<WidgetType, Template> = {
	pageviewsOverTime: {
		displayName: 'Pageviews Over Time',
		defaultLimit: 30,
		renderHint: 'timeSeries',
		valueLabel: 'Views',
		build: args => widget('pageviewsOverTime', args),
	},
	topPages: {
		displayName: 'Top Pages',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('topPages', args),
	},
	topReferrers: {
		displayName: 'Top Referrers',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('topReferrers', args),
	},
	channelBreakdown: {
		displayName: 'Channel Breakdown',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('channelBreakdown', args),
	},
	deviceBreakdown: {
		displayName: 'Device Breakdown',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('deviceBreakdown', args),
	},
	browserBreakdown: {
		displayName: 'Browser Breakdown',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('browserBreakdown', args),
	},
	osBreakdown: {
		displayName: 'Operating System Breakdown',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('osBreakdown', args),
	},
	geoBreakdown: {
		displayName: 'Country Breakdown',
		defaultLimit: 20,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('geoBreakdown', args),
	},
	// Web and mobile app, told apart by the wrapper's own user-agent tag rather than guessed
	// from the operating system — which is why this is a dimension at all and not a filter.
	platformBreakdown: {
		displayName: 'Platform Breakdown',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('platformBreakdown', args),
	},
	appVersionBreakdown: {
		displayName: 'App Version Breakdown',
		defaultLimit: 10,
		renderHint: 'table',
		valueLabel: 'Views',
		build: args => widget('appVersionBreakdown', args),
	},
};
