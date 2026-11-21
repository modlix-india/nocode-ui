import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../constants';
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
		name: 'group',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Report Group',
		description:
			'The report group new widgets go into first; the user can pick another group, or make a new one, in Save to group. Empty: the Dashboard Name, else dashboard.',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'dashboardName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Dashboard Name',
		description:
			'Older name of Report Group (used when Report Group is empty): the saved dashboard (reports_<name>) new widgets go into; use the same name as the Dashboard component that shows them.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'dashboard',
	},
	{
		name: 'addToDashboard',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Add To Dashboard By Default',
		description:
			'Whether "Add to my dashboard" starts ticked. Off: new widgets go to the library only.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'allowDataImport',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Data Import',
		description:
			"Adds Import data from CSV and Manage your data to the Data picker: the user's own datasets, saved through <namespace>.reportDatasetSave, reportDatasetList and reportDatasetDelete. Off by default.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'readSpecFromUrl',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Open A Spec From The Address',
		description:
			'Opens the editor prefilled from ?spec=<base64url JSON> in the page address (the assistant links to the Reports page that way). Nothing is saved until the user saves. Off by default.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'aiEndpoint',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'AI Endpoint',
		description:
			'The AI report builder the Ask AI box streams from, with {app} for the app code. Empty: /api/ai/reports/{app}/build. The box shows only when the catalog says ai: true.',
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
	{
		name: 'onSave',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Save',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description:
			'Runs after a widget is saved; the binding path (when set) holds {id, name, spec} of it.',
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
