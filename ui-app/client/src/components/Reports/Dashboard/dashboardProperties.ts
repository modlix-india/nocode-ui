import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	ComponentPropertyDefinition,
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
		name: 'name',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dashboard Name',
		description:
			"Names the user's saved dashboard (personalization document reports_<name>). Pages that show the same dashboard or its library use the same name.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'dashboard',
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
		name: 'mode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Show',
		description:
			'Dashboard: the tile grid. Library: every saved widget with edit, duplicate, delete and add to dashboard (the same saved document).',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'dashboard',
		enumValues: [
			{ name: 'dashboard', displayName: 'Dashboard' },
			{ name: 'library', displayName: 'Widget library' },
		],
	},
	{
		name: 'title',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Title',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},
	{
		name: 'showFilters',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Filter Bar',
		description:
			'Period and quick filters (from the catalog) applied to every widget for the visit.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
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
		name: 'runFunction',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Run Function',
		description: 'Server function that runs a report spec. Empty: <namespace>.reportRun.',
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
