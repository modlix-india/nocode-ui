import { SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'onSave',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Save',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on page save.',
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
		name: 'onReset',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Reset',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
		description: 'Event to be triggered on page reset.',
	},
	{
		name: 'logo',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'SVG logo',
		group: ComponentPropertyGroup.BASIC,
		description: 'SVG Logo with no fill to match the theme',
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
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
