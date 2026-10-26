import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
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
	{
		name: 'editorType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Editor Type',
		description: 'Editor Type UI or Backend',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'core',
		enumValues: [
			{ name: 'core', displayName: 'Core', description: 'Backend only' },
			{ name: 'ui', displayName: 'UI', description: 'UI only' },
			{ name: 'page', displayName: 'Page', description: 'Both Backend & Page' },
		],
	},
	{
		name: 'onChangePersonalization',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Personalization Change',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered on personalization changed.',
	},
	{
		name: 'onDeletePersonalization',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Personalization Delete',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered on personalization cleared.',
	},
	{
		name: 'appCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Application Code',
		description: 'Application Code for Remote Repositories',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'clientCode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Client Code',
		description: 'Client Code for Remote Repositories',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'debugViewMode',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Trace',
		description:
			'Read-only trace view: each step shows what it received and returned in the run bound to Execution Log (for example the log from UIEngine.RunKIRun).',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'defaultTheme',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Default Theme',
		description:
			"Theme the editor starts with: light, dark, high-contrast, easy-on-eyes or flared-up. Any other name (for example 'app') uses the app theme's Editor Palette instead.",
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'showThemeSelector',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Theme Selector',
		description:
			"Show the theme picker in the editor header. When off, the user's saved theme is ignored and Default Theme always applies.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'showExpressions',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Expressions',
		description:
			"Show each step's parameter values and expressions on the graph until the user changes it with the toolbar toggle.",
		group: ComponentPropertyGroup.BASIC,
		defaultValue: true,
	},
	{
		name: 'showStores',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Stores',
		description:
			'Show the store nodes (Page, Store, LocalStore, Theme) and their lines on the graph until the user changes it with the toolbar toggle.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	{
		name: 'allowLightbox',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Allow Lightbox',
		description:
			'Show an expand icon in the editor header that opens it large over a dimmed page; Esc or a click outside closes it.',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
