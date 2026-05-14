/**
 * HogQL templates for built-in web analytics widgets.
 *
 * Each template returns a HogQL query envelope with the user-chosen date
 * range and limit substituted in. The backend proxy injects the tenant
 * filter (app_code + url_client_code) before forwarding to PostHog, so
 * these queries don't need to mention either.
 */

export type WidgetType =
	| 'pageviewsOverTime'
	| 'topPages'
	| 'topReferrers'
	| 'channelBreakdown'
	| 'deviceBreakdown'
	| 'browserBreakdown'
	| 'osBreakdown'
	| 'geoBreakdown';

interface BuildArgs {
	dateRangeDays: number;
	limit: number;
}

interface Template {
	displayName: string;
	defaultLimit: number;
	build: (args: BuildArgs) => Record<string, unknown>;
	labelColumn: string;
	valueColumn: string;
	renderHint: 'table' | 'timeSeries';
}

function hogql(query: string): Record<string, unknown> {
	return { kind: 'HogQLQuery', query };
}

export const WIDGET_TEMPLATES: Record<WidgetType, Template> = {
	pageviewsOverTime: {
		displayName: 'Pageviews Over Time',
		defaultLimit: 30,
		labelColumn: 'day',
		valueColumn: 'views',
		renderHint: 'timeSeries',
		build: ({ dateRangeDays }) =>
			hogql(
				`SELECT toDate(timestamp) AS day, count() AS views
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY day
				ORDER BY day ASC`,
			),
	},
	topPages: {
		displayName: 'Top Pages',
		defaultLimit: 10,
		labelColumn: 'page',
		valueColumn: 'views',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT properties.$current_url AS page, count() AS views
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY page
				ORDER BY views DESC
				LIMIT ${limit}`,
			),
	},
	topReferrers: {
		displayName: 'Top Referrers',
		defaultLimit: 10,
		labelColumn: 'referrer',
		valueColumn: 'sessions',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT properties.$referrer_host AS referrer, count(DISTINCT properties.$session_id) AS sessions
				FROM events
				WHERE event = '$pageview'
				  AND properties.$referrer_host != ''
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY referrer
				ORDER BY sessions DESC
				LIMIT ${limit}`,
			),
	},
	channelBreakdown: {
		displayName: 'Channel Breakdown',
		defaultLimit: 10,
		labelColumn: 'channel',
		valueColumn: 'sessions',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT coalesce(properties.$channel_type, 'unknown') AS channel,
				        count(DISTINCT properties.$session_id) AS sessions
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY channel
				ORDER BY sessions DESC
				LIMIT ${limit}`,
			),
	},
	deviceBreakdown: {
		displayName: 'Device Breakdown',
		defaultLimit: 10,
		labelColumn: 'device',
		valueColumn: 'sessions',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT coalesce(properties.$device_type, 'unknown') AS device,
				        count(DISTINCT properties.$session_id) AS sessions
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY device
				ORDER BY sessions DESC
				LIMIT ${limit}`,
			),
	},
	browserBreakdown: {
		displayName: 'Browser Breakdown',
		defaultLimit: 10,
		labelColumn: 'browser',
		valueColumn: 'sessions',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT coalesce(properties.$browser, 'unknown') AS browser,
				        count(DISTINCT properties.$session_id) AS sessions
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY browser
				ORDER BY sessions DESC
				LIMIT ${limit}`,
			),
	},
	osBreakdown: {
		displayName: 'Operating System Breakdown',
		defaultLimit: 10,
		labelColumn: 'os',
		valueColumn: 'sessions',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT coalesce(properties.$os, 'unknown') AS os,
				        count(DISTINCT properties.$session_id) AS sessions
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY os
				ORDER BY sessions DESC
				LIMIT ${limit}`,
			),
	},
	geoBreakdown: {
		displayName: 'Country Breakdown',
		defaultLimit: 20,
		labelColumn: 'country',
		valueColumn: 'sessions',
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT coalesce(properties.$geoip_country_code, 'unknown') AS country,
				        count(DISTINCT properties.$session_id) AS sessions
				FROM events
				WHERE event = '$pageview'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY country
				ORDER BY sessions DESC
				LIMIT ${limit}`,
			),
	},
};
