import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.onClick,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
	{
		name: 'label',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Button Bar Label',
		group: ComponentPropertyGroup.BASIC,
		description: "Label that's shown on top of button bar input.",
	},

	{
		name: 'isMultiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Multiple Selection Allowed ?',
		description: 'Allows the users to select multiple buttons.',
		defaultValue: false,
	},
	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		group: ComponentPropertyGroup.DATA,
		displayName: 'ButtonBar data',
		description:
			'Data that is used to render ButtonBar, you can either give a value or expression, please read documentation for more information on Expressions.',
	},

	COMMON_COMPONENT_PROPERTIES.datatype,
	COMMON_COMPONENT_PROPERTIES.uniqueKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionType,
	COMMON_COMPONENT_PROPERTIES.labelKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionKey,
	COMMON_COMPONENT_PROPERTIES.uniqueKey,
	COMMON_COMPONENT_PROPERTIES.labelKey,
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	// '': {
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
	// 		COMPONENT_STYLE_GROUP_PROPERTIES.container,
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.font,
	// 		target: ['label'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.color,
	// 		target: ['label'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.position,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.background,
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.size,
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
	// 		target: ['button'],
	// 	},
	// },
	// container: {
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
	// 		name: 'containerFlex',
	// 		description: 'Flex properties for container.',
	// 		prefix: 'container',
	// 		displayName: 'Container Flex',
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.container,
	// 		name: 'buttonContainerProps',
	// 		description: 'Container properties for button container.',
	// 		prefix: 'container',
	// 		displayName: 'Button Container container props',
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.size,
	// 		name: 'buttonSizeProps',
	// 		description: 'Size properties for button container.',
	// 		prefix: 'container',
	// 		displayName: 'Button Container size props',
	// 		target: ['container'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.border,
	// 		name: 'buttonBorderProps',
	// 		description: 'Container properties for button border.',
	// 		prefix: 'container',
	// 		displayName: 'Button Container border props',
	// 		target: ['container'],
	// 	},
	// },
	// button: {
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.color,
	// 		name: 'buttonColorProps',
	// 		description: 'Properties for button color.',
	// 		prefix: 'button',
	// 		displayName: 'Button color props',
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
	// 		name: 'buttonPaddingProps',
	// 		description: 'Properties for button padding.',
	// 		prefix: 'button',
	// 		displayName: 'Button padding props',
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
	// 		name: 'buttonmarginProps',
	// 		description: 'Properties for button margin.',
	// 		prefix: 'button',
	// 		displayName: 'Button margin props',
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.border,
	// 		name: 'buttonborderProps',
	// 		description: 'Properties for button border.',
	// 		prefix: 'button',
	// 		displayName: 'Button border props',
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
	// 		name: 'buttonboxShadowProps',
	// 		description: 'Properties for button boxShadow.',
	// 		prefix: 'button',
	// 		displayName: 'Button boxShadow props',
	// 		target: ['button'],
	// 	},
	// 	[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
	// 		...COMPONENT_STYLE_GROUP_PROPERTIES.font,
	// 		name: 'buttonfontProps',
	// 		description: 'Properties for button font.',
	// 		prefix: 'button',
	// 		displayName: 'Button font props',
	// 		target: ['button'],
	// 	},
	// },
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	label: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	container: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	button: [
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
