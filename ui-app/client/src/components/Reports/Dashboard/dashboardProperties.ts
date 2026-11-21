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
		name: 'group',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Report Group',
		description:
			"The report group this dashboard opens on: an app group from the catalog (default dashboard) or one of the user's own groups (u_ ids). Each group keeps its own widgets in the personalization document reports_<group>. Empty: the Dashboard Name, else dashboard.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'name',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dashboard Name',
		description:
			"Older name of Report Group (used when Report Group is empty): the user's saved dashboard, personalization document reports_<name>. Pages that show the same dashboard or its library use the same name.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'dashboard',
	},
	{
		name: 'groups',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Group Tabs',
		description:
			'Tabs to switch report groups in place: none (no tabs), all (the app groups, then the user groups), or group ids separated by commas.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'none',
	},
	{
		name: 'showGroupManager',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Group Manager',
		description:
			"New group, Rename and Delete (with a confirm) for the user's own report groups, at most 10 per app. Deleting a group deletes its widgets.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'groupPagePath',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Group Page Path',
		description:
			"The app's report group page, with {id} for the group id, e.g. /reportGroup/{id}. Set: New group opens the new group's page, and deleting the open group opens the user's first remaining group (else the dashboard group). Empty: the dashboard switches groups in place.",
		group: ComponentPropertyGroup.BASIC,
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
		description:
			'Shown above the dashboard. Empty: no title, except with Group Tabs or Show Group Manager on, where the group label is the title.',
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
