import { Schema } from '@fincity/kirun-js';
import { SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyDefinition,
	ComponentStylePropertyGroupDefinition,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.label,
	{
		name: 'type',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Button label',
		description: `Button's display label.`,
		defaultValue: 'default',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'default', displayName: 'Default Button', description: 'Default Button type' },
			{ name: 'outlined', displayName: 'Outline Button', description: 'Outline Button type' },
			{ name: 'text', displayName: 'Outline Button', description: 'Outline Button type' },
			{ name: 'fabButton', displayName: 'Fab Button', description: 'Fab Button type' },
			{
				name: 'fabButtonMini',
				displayName: 'Fab Button Mini',
				description: 'Mini Fab Button type',
			},
		],
	},
	{
		name: 'target',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Link target',
		description: `Link's target.`,
	},
	{
		name: 'linkPath',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Link path',
		description: `Path that page needs to be redirected on click.`,
		translatable: false,
	},
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'leftIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Button's left icon",
		description: `Button's icon to be displayed on left of label.`,
		editor: ComponentPropertyEditor.ICON,
	},
	{
		name: 'rightIcon',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Button's right icon",
		description: `Button's icon to be displayed on right of label.`,
		editor: ComponentPropertyEditor.ICON,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,

		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['button'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},

	icon: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'iconColor',
			displayName: 'Icon Color',
			description: 'Icon Color',
			prefix: 'icon',
			target: ['icon'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
