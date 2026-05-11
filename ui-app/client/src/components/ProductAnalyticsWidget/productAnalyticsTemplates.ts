/**
 * Templates for built-in product analytics widgets.
 *
 * `eventTimeline`, `topEvents`, `breakdownByProperty` use HogQL.
 * `funnel` and `retention` use PostHog's native query kinds — easier than
 * rolling either by hand in HogQL, and the response shape is well-defined.
 *
 * Backend rewriter injects tenant filter (app_code + url_client_code) into
 * filters.properties on every envelope, regardless of kind. Templates here
 * never mention the tenant — they assume it's added in flight.
 */

export type ProductWidgetType =
	| 'eventTimeline'
	| 'topEvents'
	| 'breakdownByProperty'
	| 'funnel'
	| 'retention';

export type RenderHint = 'table' | 'timeSeries' | 'funnel' | 'retention';

export interface BuildArgs {
	dateRangeDays: number;
	limit: number;
	eventName?: string;
	breakdownProperty?: string;
	funnelSteps?: Array<string>;
	retentionTargetEvent?: string;
	retentionReturningEvent?: string;
	retentionPeriod?: 'Day' | 'Week' | 'Month';
}

interface Template {
	displayName: string;
	defaultLimit: number;
	build: (args: BuildArgs) => Record<string, unknown>;
	renderHint: RenderHint;
}

function hogql(query: string): Record<string, unknown> {
	return { kind: 'HogQLQuery', query };
}

export const PRODUCT_TEMPLATES: Record<ProductWidgetType, Template> = {
	eventTimeline: {
		displayName: 'Event Over Time',
		defaultLimit: 30,
		renderHint: 'timeSeries',
		build: ({ dateRangeDays, eventName }) =>
			hogql(
				`SELECT toDate(timestamp) AS day, count() AS occurrences
				FROM events
				WHERE event = '${escapeForHogQL(eventName ?? '$pageview')}'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY day
				ORDER BY day ASC`,
			),
	},

	topEvents: {
		displayName: 'Top Events',
		defaultLimit: 10,
		renderHint: 'table',
		build: ({ dateRangeDays, limit }) =>
			hogql(
				`SELECT event AS event_name, count() AS occurrences
				FROM events
				WHERE timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY event_name
				ORDER BY occurrences DESC
				LIMIT ${limit}`,
			),
	},

	breakdownByProperty: {
		displayName: 'Event Breakdown by Property',
		defaultLimit: 10,
		renderHint: 'table',
		build: ({ dateRangeDays, limit, eventName, breakdownProperty }) => {
			const ev = escapeForHogQL(eventName ?? '$pageview');
			const prop = escapePropertyName(breakdownProperty ?? '$current_url');
			return hogql(
				`SELECT coalesce(properties.${prop}, 'unknown') AS value, count() AS occurrences
				FROM events
				WHERE event = '${ev}'
				  AND timestamp > now() - INTERVAL ${dateRangeDays} DAY
				GROUP BY value
				ORDER BY occurrences DESC
				LIMIT ${limit}`,
			);
		},
	},

	funnel: {
		displayName: 'Conversion Funnel',
		defaultLimit: 0,
		renderHint: 'funnel',
		build: ({ dateRangeDays, funnelSteps }) => ({
			kind: 'FunnelsQuery',
			series: (funnelSteps && funnelSteps.length ? funnelSteps : ['$pageview']).map(name => ({
				event: name,
				kind: 'EventsNode',
			})),
			dateRange: { date_from: `-${dateRangeDays}d` },
		}),
	},

	retention: {
		displayName: 'Retention',
		defaultLimit: 0,
		renderHint: 'retention',
		build: ({
			dateRangeDays,
			retentionTargetEvent,
			retentionReturningEvent,
			retentionPeriod,
		}) => ({
			kind: 'RetentionQuery',
			retentionFilter: {
				targetEntity: { id: retentionTargetEvent ?? '$pageview', type: 'events' },
				returningEntity: {
					id: retentionReturningEvent ?? retentionTargetEvent ?? '$pageview',
					type: 'events',
				},
				period: retentionPeriod ?? 'Week',
			},
			dateRange: { date_from: `-${dateRangeDays}d` },
		}),
	},
};

function escapeForHogQL(s: string): string {
	return s.replace(/'/g, "''");
}

// PostHog property names are alphanumeric / $ / _ in practice. Strip anything
// else to avoid HogQL injection from a misconfigured prop value.
function escapePropertyName(s: string): string {
	return s.replace(/[^A-Za-z0-9_$]/g, '');
}
