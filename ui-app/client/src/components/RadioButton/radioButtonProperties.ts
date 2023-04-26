import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'isMultiSelect',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Is MultiSelect',
		description:
			'Allows the users to select multiple options, also turns the radios to checkboxes.',
		defaultValue: false,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'data',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Data',
		description: 'Data that is used to render radio buttons.',
	},
	{
		name: 'orientation',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'orientation',
		description: 'Label and input orientation.',
		defaultValue: 'HORIZONATAL',
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'HORIZONATAL',
				displayName: 'Horizonatal Orientation',
				description: "CheckBox's display orientation.",
			},
			{
				name: 'VERTICAL',
				displayName: 'Vertical Orientation',
				description: "CheckBox's display orientation.",
			},
		],
	},
	COMMON_COMPONENT_PROPERTIES.label,
	COMMON_COMPONENT_PROPERTIES.layout,
	COMMON_COMPONENT_PROPERTIES.onClick,
	COMMON_COMPONENT_PROPERTIES.datatype,
	COMMON_COMPONENT_PROPERTIES.uniqueKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionType,
	COMMON_COMPONENT_PROPERTIES.labelKeyType,
	COMMON_COMPONENT_PROPERTIES.selectionKey,
	COMMON_COMPONENT_PROPERTIES.uniqueKey,
	COMMON_COMPONENT_PROPERTIES.labelKey,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		// [COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
		// 	COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
		// 	COMPONENT_STYLE_GROUP_PROPERTIES.background,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
		// 	COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
		// 	COMPONENT_STYLE_GROUP_PROPERTIES.container,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
		// 	COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
	label: {
		// [COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		// 	name: 'labelBackdropFilter',
		// 	displayName: 'Label Backdrop Filter',
		// 	description: 'Label Backdrop Filter',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.background,
		// 	name: 'labelBackground',
		// 	displayame: 'Label Background',
		// 	description: 'Label Background',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.border,
		// 	name: 'labelBorder',
		// 	displayName: 'Label Border',
		// 	description: 'Label Border',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		// 	name: 'labelBoxShadow',
		// 	displayName: 'Label Box Shadow',
		// 	description: 'Label Box Shadow',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.container,
		// 	name: 'labelContainer',
		// 	displayName: 'Label Container',
		// 	description: 'Label Container',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		// 	name: 'labelFlex',
		// 	displayName: 'Label Flex',
		// 	description: 'Label Flex',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		// 	name: 'labelMargin',
		// 	displayName: 'Label Margin',
		// 	description: 'Label Margin',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		// 	name: 'labelOpacity',
		// 	displayName: 'Label Opacity',
		// 	description: 'Label Opacity',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		// 	name: 'labelPadding',
		// 	displayName: 'Label Padding',
		// 	description: 'Label Padding',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.position,
		// 	name: 'labelPosition',
		// 	displayName: 'Label Position',
		// 	description: 'Label Position',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		// 	name: 'labelRotate',
		// 	displayName: 'Label Rotate',
		// 	description: 'Label Rotate',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.size,
		// 	name: 'labelSize',
		// 	displayName: 'Label Size',
		// 	description: 'Label Size',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		// 	name: 'labelTransform',
		// 	displayName: 'Label Transform',
		// 	description: 'Label Transform',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.font,
		// 	name: 'labelFont',
		// 	displayName: 'Label Font',
		// 	description: 'Label Font',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.color,
		// 	name: 'labelColor',
		// 	displayName: 'Label Color',
		// 	description: 'Label Color',
		// 	prefix: 'label',
		// 	target: ['label'],
		// },
	},
	radio: {
		// [COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		// 	name: 'inputMargin',
		// 	displayName: 'Radio Box Margin',
		// 	description: 'Radio Box Margin',
		// 	prefix: 'radio',
		// 	target: ['radio'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		// 	name: 'inputPadding',
		// 	displayName: 'Radio Box Padding',
		// 	description: 'Radio Box Padding',
		// 	prefix: 'radio',
		// 	target: ['radio'],
		// },
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
