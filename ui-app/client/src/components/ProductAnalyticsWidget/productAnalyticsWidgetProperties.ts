import {
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';
import { PRODUCT_TEMPLATES } from './productAnalyticsTemplates';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
	{
		name: 'widgetType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Widget Type',
		description: 'Which built-in product analytics widget to render.',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'topEvents',
		enumValues: Object.entries(PRODUCT_TEMPLATES).map(([name, t]) => ({
			name,
			displayName: t.displayName,
		})),
	},
	{
		name: 'dateFrom',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'From',
		description:
			'Start of an explicit range. Set both From and To to override the day count — ' +
			'that is what a custom range on a dashboard sets. Accepts an epoch (seconds or ' +
			'millis, as a Calendar stores it) or any parseable date string.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'dateTo',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'To',
		description: 'End of an explicit range. Ignored unless From is set too.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'App Code',
		description: 'Application to scope the query to. Required.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'clientCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'URL Client Code',
		description: 'URL client code (tenant) to scope the query to. Required.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'subtitle',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Subtitle',
		description:
			'One line under the heading saying what the number means. Worth setting on anything ' +
			'whose name is not self-explanatory — a reader who has to guess what a widget counts ' +
			'will guess wrong.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'title',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Title',
		description: 'Heading shown above the widget. Defaults to the widget type name.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'dateRangeDays',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Date Range (days)',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 30,
	},
	{
		name: 'limit',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Row Limit',
		description: 'Used for top-N / breakdown widgets. Ignored for funnel and retention.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'eventName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Event Name',
		description: 'Event to query (e.g. $pageview, signup_completed). Used by Event Over Time and Breakdown.',
		group: ComponentPropertyGroup.DATA,
		defaultValue: '$pageview',
	},
	{
		name: 'breakdownProperty',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Breakdown Property',
		description:
			'Dimension to break down by. One of the engine\'s allow-list: path, page, label, ' +
			'referrer_host, channel, utm_source, utm_medium, utm_campaign, device, browser, os, ' +
			'platform, app_version, country, variant. Anything else is refused.',
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'path',
	},
	{
		name: 'funnelSteps',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Funnel Steps',
		description: 'Ordered list of event names defining the funnel.',
		group: ComponentPropertyGroup.DATA,
		multiValued: true,
		defaultValue: [],
	},
	{
		name: 'funnelWindowHours',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Funnel Window (hours)',
		description:
			'How long after the first step a visitor may still convert. Steps completed later ' +
			'are two separate visits, not one conversion.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 24,
	},
	{
		name: 'retentionPeriod',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Period',
		description: 'Cohort period for retention, stickiness and lifecycle.',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'week',
		// Day and week only. A monthly cohort is not simply a longer week — it needs calendar
		// month arithmetic the engine does not do — and offering an option that silently
		// answers something else is worse than not offering it.
		enumValues: [
			{ name: 'day', displayName: 'Day' },
			{ name: 'week', displayName: 'Week' },
		],
	},
	{
		name: 'refreshIntervalSeconds',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Refresh Interval (seconds)',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
	},
	{
		name: 'showBars',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Inline Bars',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'true',
		enumValues: [
			{ name: 'true', displayName: 'Show' },
			{ name: 'false', displayName: 'Hide' },
		],
	},
	{
		name: 'onSuccess',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Success',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	title: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	subtitle: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	row: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	bar: [COMPONENT_STYLE_GROUP_PROPERTIES.background.type],
	stepBar: [COMPONENT_STYLE_GROUP_PROPERTIES.background.type],
	cohortCell: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	error: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
