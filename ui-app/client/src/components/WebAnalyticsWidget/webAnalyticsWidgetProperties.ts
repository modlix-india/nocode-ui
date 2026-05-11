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
import { WIDGET_TEMPLATES } from './webAnalyticsTemplates';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
	{
		name: 'widgetType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Widget Type',
		description: 'Which built-in web analytics widget to render.',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'topPages',
		enumValues: Object.entries(WIDGET_TEMPLATES).map(([name, t]) => ({
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
		description: 'How far back in time to query. Default 7.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 7,
	},
	{
		name: 'limit',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Row Limit',
		description: 'Maximum rows to fetch. Falls back to a sensible default per widget type if blank.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'refreshIntervalSeconds',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Refresh Interval (seconds)',
		description: '0 disables auto-refresh. The query also runs on mount.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
	},
	{
		name: 'showBars',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Inline Bars',
		description: 'Render an inline bar in each row sized by the value (table widgets only).',
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
		description: 'Event to run after a successful query.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to run after a failed query.',
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
	table: [COMPONENT_STYLE_GROUP_PROPERTIES.border.type],
	row: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	bar: [COMPONENT_STYLE_GROUP_PROPERTIES.background.type],
	error: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
