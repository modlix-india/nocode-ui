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
		description: 'Event property name to break down by (e.g. $current_url, plan, country). Used by Breakdown.',
		group: ComponentPropertyGroup.DATA,
		defaultValue: '$current_url',
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
		name: 'retentionTargetEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Retention Target Event',
		description: 'The action that defines the cohort (e.g. signup_completed).',
		group: ComponentPropertyGroup.DATA,
		defaultValue: '$pageview',
	},
	{
		name: 'retentionReturningEvent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Retention Returning Event',
		description: 'The action that defines retention. Defaults to the target event when blank.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'retentionPeriod',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Retention Period',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'Week',
		enumValues: [
			{ name: 'Day', displayName: 'Day' },
			{ name: 'Week', displayName: 'Week' },
			{ name: 'Month', displayName: 'Month' },
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
