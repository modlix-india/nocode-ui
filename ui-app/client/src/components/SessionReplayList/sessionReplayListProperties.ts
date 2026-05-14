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

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'App Code',
		description: 'Application to scope the list to. Required.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'clientCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'URL Client Code',
		description: 'URL client code (tenant) to scope the list to. Required.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'dateFrom',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Date From',
		description: 'PostHog date_from filter (e.g. -7d, 2026-05-01).',
		group: ComponentPropertyGroup.DATA,
		defaultValue: '-7d',
	},
	{
		name: 'dateTo',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Date To',
		description: 'PostHog date_to filter (optional).',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'limit',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Limit',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 50,
	},
	{
		name: 'refreshIntervalSeconds',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Refresh Interval (seconds)',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
	},
	{
		name: 'title',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Title',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
		defaultValue: 'Session Replays',
	},
	{
		name: 'onSelect',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Select',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to run after a session is clicked. The selected session id is written to the binding path.',
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
	rowSelected: [COMPONENT_STYLE_GROUP_PROPERTIES.background.type],
	error: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
