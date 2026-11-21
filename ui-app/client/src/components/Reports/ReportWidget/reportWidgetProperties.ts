import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../../types/common';
import {
	COMMON_COMPONENT_PROPERTIES,
	COMPONENT_STYLE_GROUP_PROPERTIES,
} from '../../util/properties';

// Every definition is written out here (no shared helpers): scripts/generate-component-catalog.ts
// reads this file statically, and only literal objects reach the MCP component catalog.

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'appNamespace',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'App Namespace',
		description:
			"The namespace of the app's report functions, e.g. CxZump: the component calls <namespace>.reportCatalog and <namespace>.reportRun.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'spec',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Report Spec',
		description:
			'The report to show: {"v":1,"source":...,"measures":[...],"groupBy":[...],"filters":[...],"view":{"type":"BAR"}} (CXZ-1780 spec v1). Ignored when the Spec binding path holds one.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'name',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Name',
		description: "Title shown on the widget. Empty: the spec's view title.",
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'refreshMin',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Auto Refresh',
		description:
			'Minutes between automatic runs: 0 (off), 5, 15, 30 or 60. Paused while the tab is hidden.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 0,
	},
	{
		name: 'editable',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Editable',
		description:
			'Let the user keep changes (chart type, style, layout, widgets). Off: changes last for the visit only.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'runFunction',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Run Function',
		description: 'Server function that runs a report spec. Empty: <namespace>.reportRun.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'catalogFunction',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Catalog Function',
		description:
			'Server function that returns the report catalog. Empty: <namespace>.reportCatalog.',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'useFixtures',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Preview With Sample Data',
		description:
			"Use built in sample data instead of calling the app's functions (for designing a page). Nothing is read from or saved to the server.",
		group: ComponentPropertyGroup.ADVANCED,
		defaultValue: false,
	},
	{
		name: 'onEdit',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Edit',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Shows "Edit" in the widget menu; runs when it is picked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onDuplicate',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Duplicate',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Shows "Duplicate" in the widget menu; runs when it is picked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onRemove',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Remove',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Shows "Remove from dashboard" in the widget menu; runs when it is picked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onDelete',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Delete',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Shows "Delete" in the widget menu; runs when it is picked.',
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
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
