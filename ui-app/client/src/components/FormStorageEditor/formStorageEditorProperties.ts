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
