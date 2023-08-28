import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'icon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Icon',
		description: 'Icon',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ICON,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline',
				description: 'Outline',
			},
			{ name: '_filled', displayName: 'Filled', description: 'Filled' },
			{
				name: '_rounded',
				displayName: 'Rounded',
				description: 'Rounded',
			},
		],
	},
	{
		...COMMON_COMPONENT_PROPERTIES.colorScheme,
		enumValues: [
			{
				name: '_defaultIcon',
				displayName: 'Default',
				description: 'Default',
			},
			{
				name: '_lightIcon',
				displayName: 'Light',
				description: 'Light',
			},
			...COMMON_COMPONENT_PROPERTIES.colorScheme.enumValues!,
		],
	},
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
