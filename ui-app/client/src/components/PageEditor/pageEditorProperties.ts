import { SCHEMA_ANY_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'theme',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Theme',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		description: 'Editor color schemes',
		defaultValue: '_light',
		enumValues: [
			{
				name: '_light',
				displayName: 'Light Theme',
				description: 'Light colors look and feel',
			},
			{
				name: '_dark',
				displayName: 'Dark Theme',
				description: 'Dark colors look and feel',
			},
		],
	},

	{
		name: 'logo',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'SVG logo',
		group: ComponentPropertyGroup.BASIC,
		description: 'SVG Logo with no fill to match the theme',
	},

	{
		name: 'onSave',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Save',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on page save.',
	},

	{
		name: 'onPublish',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Publish',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on page publish.',
	},

	{
		name: 'pagesData',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Pages Data',
		group: ComponentPropertyGroup.DATA,
		description: 'Data of pages list.',
	},

	{
		name: 'currentPageId',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Current Page ID',
		group: ComponentPropertyGroup.DATA,
		description: 'Current Page ID.',
	},

	{
		name: 'dashboardPageName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Name of dashboard page',
		group: ComponentPropertyGroup.DATA,
		description: 'Name of dashboard page.',
	},

	{
		name: 'settingsPageName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Name of site settings page',
		group: ComponentPropertyGroup.DATA,
		description: 'Name of site settings page.',
	},

	{
		name: 'addnewPageName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Name of add new page page',
		group: ComponentPropertyGroup.DATA,
		description: 'Name of add new page page.',
	},

	{
		name: 'onVersions',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Versions',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on page versions request.',
	},

	{
		name: 'onChangePersonalization',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Personalization Change',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on personalization changed.',
	},

	{
		name: 'onDeletePersonalization',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Personalization Delete',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on personalization cleared.',
	},

	{
		name: 'editorType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Editor Type',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		description: 'Editor type',
		defaultValue: 'PAGE',
		enumValues: [
			{
				name: 'PAGE',
				displayName: 'Page Editor',
				description: 'Page Editor',
			},
			{
				name: 'SECTION',
				displayName: 'Section Editor',
				description: 'Section Editor',
			},
		],
	},

	{
		name: 'sectionsCategoryList',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Sections Category List',
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'sectionsListConnectionName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Section Items Connection Name',
		group: ComponentPropertyGroup.DATA,
	},
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
