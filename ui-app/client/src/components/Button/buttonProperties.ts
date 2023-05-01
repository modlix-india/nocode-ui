import { Schema } from '@fincity/kirun-js';
import { SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyDefinition,
	ComponentStylePropertyGroupDefinition,
	ComponentStylePropertyDefinition,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.label,
	{
		name: 'type',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Button Type',
		description: 'Select different types of buttons',
		defaultValue: 'default',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'default', displayName: 'Default Button', description: 'Default Button type' },
			{ name: 'outlined', displayName: 'Outline Button', description: 'Outline Button type' },
			{ name: 'text', displayName: 'Text Button', description: 'Outline Button type' },
			{ name: 'fabButton', displayName: 'Fab Button', description: 'Fab Button type' },
			{
				name: 'fabButtonMini',
				displayName: 'Fab Button Mini',
				description: 'Mini Fab Button type',
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.linkPath,
	COMMON_COMPONENT_PROPERTIES.linkTargetType,
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'leftIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Button's left icon",
		description: "Button's icon to be displayed on left of label.",
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'rightIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Button's right icon",
		description: "Button's icon to be displayed on right of label.",
		editor: ComponentPropertyEditor.ICON,
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
	],
	rightIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	leftIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
