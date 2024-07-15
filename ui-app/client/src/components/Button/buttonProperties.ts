import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
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
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [
			...COMMON_COMPONENT_PROPERTIES.designType.enumValues!,
			{
				name: '_outlined',
				displayName: 'Outline Button',
				description: 'Outline Button type',
			},
			{ name: '_text', displayName: 'Text Button', description: 'Outline Button type' },
			{ name: '_iconButton', displayName: 'Icon Button', description: 'Icon Button type' },
			{
				name: '_iconPrimaryButton',
				displayName: 'Primary Icon Button',
				description: 'Primary Icon Button type',
			},
			{
				name: '_fabButton',
				displayName: 'Floating Action Button',
				description: 'Floating Action Button type',
			},
			{
				name: '_fabButtonMini',
				displayName: 'Floating Action Mini Button',
				description: 'Floating Action Mini Button type',
			},
			{
				name: '_decorative',
				displayName: 'Decorative Button',
				description: 'Decorative Button type',
			},
			{ name: '_bigDesign1', displayName: 'Big Design 1', description: 'Big Design 1 type' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
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

	{
		name: 'leftImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Button's left image",
		description: "Button's image to be displayed on left of label.",
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'rightImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Button's right image",
		description: "Button's image to be displayed on right of label.",
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'activeLeftImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Button's active left image",
		description: "Button's active image to be displayed on left of label.",
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'activeRightImage',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: "Button's active right image",
		description: "Button's active image to be displayed on right of label.",
		editor: ComponentPropertyEditor.IMAGE,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		name: 'stopPropagation',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Stop propagation of click event',
		description:
			'Stop propagation of click event which will not trigger the container click event.',
		defaultValue: false,
	},
	{
		name: 'preventDefault',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Prevent default of click event',
		description: 'Prevent default of click event.',
		defaultValue: false,
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
	],
	rightIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	leftIcon: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	rightImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	leftImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	activeRightImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
	activeLeftImage: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
