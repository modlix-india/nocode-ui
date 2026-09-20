/**
 * The built-in product analytics widgets, as requests to the analytics engine.
 *
 * These used to be a mix of HogQL strings and vendor query kinds, with hand-written escaping
 * because an event name or a property name went into SQL. None of that survives: the engine
 * takes a widget name and its arguments, so there is no expression to escape and no way for
 * a badly-chosen property name to mean anything but a property name.
 *
 * `breakdownByProperty` now names a dimension from the engine's allow-list rather than an
 * arbitrary property path — that list is what keeps this a fixed widget API instead of an
 * open query surface, and `visitor`, `session` and raw props are deliberately not on it.
 *
 * Funnel, retention, stickiness and lifecycle read raw events rather than rollups, because
 * they depend on the order and spacing of one visitor's events. Their counts are exact.
 */

export type ProductWidgetType =
	| 'eventTimeline'
	| 'topEvents'
	| 'breakdownByProperty'
	| 'funnel'
	| 'retention'
	| 'stickiness'
	| 'lifecycle';

export type RenderHint = 'table' | 'timeSeries' | 'funnel' | 'retention';

export interface BuildArgs {
	dateRangeDays: number;
	limit: number;
	/** An explicit interval, which overrides the day count when both ends are set. */
	dateFrom?: unknown;
	dateTo?: unknown;
	eventName?: string;
	breakdownProperty?: string;
	funnelSteps?: Array<string>;
	funnelWindowHours?: number;
	retentionPeriod?: 'day' | 'week';
}

interface Template {
	displayName: string;
	defaultLimit: number;
	build: (args: BuildArgs) => Record<string, unknown>;
	renderHint: RenderHint;
}

// One definition of the interval, shared with the web widget: two copies of this
// would eventually disagree about what a custom range means.
import { rangeOf } from '../WebAnalyticsWidget/webAnalyticsTemplates';

export const PRODUCT_TEMPLATES: Record<ProductWidgetType, Template> = {
	eventTimeline: {
		displayName: 'Event Over Time',
		defaultLimit: 30,
		renderHint: 'timeSeries',
		build: ({ dateRangeDays, eventName, dateFrom, dateTo }) => ({
			widget: 'eventTimeline',
			event: eventName || '$pageview',
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},

	topEvents: {
		displayName: 'Top Events',
		defaultLimit: 10,
		renderHint: 'table',
		build: ({ dateRangeDays, limit, dateFrom, dateTo }) => ({
			widget: 'topEvents',
			limit,
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},

	breakdownByProperty: {
		displayName: 'Event Breakdown by Property',
		defaultLimit: 10,
		renderHint: 'table',
		build: ({ dateRangeDays, limit, eventName, breakdownProperty, dateFrom, dateTo }) => ({
			widget: 'breakdownByProperty',
			// One of the engine's allow-listed dimensions: path, page, label, referrer_host,
			// channel, utm_source, utm_medium, utm_campaign, device, browser, os, platform,
			// app_version, country, variant. Anything else is refused by the engine rather
			// than quietly returning nothing.
			property: breakdownProperty || 'path',
			event: eventName || '$pageview',
			limit,
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},

	funnel: {
		displayName: 'Conversion Funnel',
		defaultLimit: 0,
		renderHint: 'funnel',
		build: ({ dateRangeDays, funnelSteps, funnelWindowHours, dateFrom, dateTo }) => ({
			widget: 'funnel',
			steps: funnelSteps && funnelSteps.length ? funnelSteps : ['$pageview'],
			// A conversion has to happen within some window of the first step or it is not
			// one. A day by default, stated rather than implied.
			windowHours: funnelWindowHours && funnelWindowHours > 0 ? funnelWindowHours : 24,
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},

	retention: {
		displayName: 'Retention',
		defaultLimit: 0,
		renderHint: 'retention',
		build: ({ dateRangeDays, retentionPeriod, dateFrom, dateTo }) => ({
			widget: 'retention',
			period: retentionPeriod || 'week',
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},

	stickiness: {
		displayName: 'Stickiness',
		defaultLimit: 0,
		renderHint: 'table',
		build: ({ dateRangeDays, retentionPeriod, dateFrom, dateTo }) => ({
			widget: 'stickiness',
			period: retentionPeriod || 'day',
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},

	lifecycle: {
		displayName: 'Lifecycle',
		defaultLimit: 0,
		renderHint: 'timeSeries',
		build: ({ dateRangeDays, retentionPeriod, dateFrom, dateTo }) => ({
			widget: 'lifecycle',
			period: retentionPeriod || 'day',
			...rangeOf(dateRangeDays, dateFrom, dateTo),
		}),
	},
};
