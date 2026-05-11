import {
	SCHEMA_ANY_COMP_PROP,
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

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
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
		name: 'query',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Query',
		description:
			'PostHog query envelope. Example: { kind: "HogQLQuery", query: "SELECT count() FROM events WHERE event = \'$pageview\'" }',
		group: ComponentPropertyGroup.DATA,
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
		name: 'renderAs',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Render As',
		description:
			'Inline render mode. Use "none" if you only want the result written to the binding path (drives a separate Chart/Table).',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'none',
		enumValues: [
			{ name: 'none', displayName: 'None (data only)' },
			{ name: 'counter', displayName: 'Counter' },
			{ name: 'table', displayName: 'Table' },
		],
	},
	{
		name: 'counterValuePrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Counter Prefix',
		description: 'Prepended to the counter value, e.g. "$".',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '',
	},
	{
		name: 'counterValueSuffix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Counter Suffix',
		description: 'Appended to the counter value, e.g. " users".',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '',
	},
	{
		name: 'counterLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Counter Label',
		description: 'Caption shown under the counter value.',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
		defaultValue: '',
	},
	{
		name: 'tableMaxRows',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Table Max Rows',
		description: 'Maximum rows to render when renderAs = table.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 100,
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
	counter: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	counterLabel: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	table: [COMPONENT_STYLE_GROUP_PROPERTIES.border.type],
	thead: [COMPONENT_STYLE_GROUP_PROPERTIES.background.type],
	td: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	error: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
