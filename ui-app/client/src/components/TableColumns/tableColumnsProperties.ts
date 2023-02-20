import { Schema } from '@fincity/kirun-js';
import { SCHEMA_REF_BOOL_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'showEmptyRows',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Empty Rows',
		description: 'Show Empty Rows when there is no data',
		defaultValue: false,
	},
	{
		name: 'showHeaders',
		schema: Schema.ofRef(SCHEMA_REF_BOOL_COMP_PROP),
		displayName: 'Show Headers',
		description: 'Show Headers',
		defaultValue: true,
	},
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.container,
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
	row: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
			name: 'rowBackdropFilter',
			displayName: 'Row Backdrop Filter',
			description: 'Row Backdrop Filter',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'rowBackground',
			displayName: 'Row Background',
			description: 'Row Background',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'rowBorder',
			displayName: 'Row Border',
			description: 'Row Border',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'rowBoxShadow',
			displayName: 'Row Box Shadow',
			description: 'Row Box Shadow',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			name: 'rowContainer',
			displayName: 'Row Container',
			description: 'Row Container',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'rowFlex',
			displayName: 'Row Flex',
			description: 'Row Flex',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'rowMargin',
			displayName: 'Row Margin',
			description: 'Row Margin',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			name: 'rowOpacity',
			displayName: 'Row Opacity',
			description: 'Row Opacity',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'rowPadding',
			displayName: 'Row Padding',
			description: 'Row Padding',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.position,
			name: 'rowPosition',
			displayName: 'Row Position',
			description: 'Row Position',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
			name: 'rowRotate',
			displayName: 'Row Rotate',
			description: 'Row Rotate',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'rowSize',
			displayName: 'Row Size',
			description: 'Row Size',
			prefix: 'row',
			target: ['row'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
			name: 'rowTransform',
			displayName: 'Row Transform',
			description: 'Row Transform',
			prefix: 'row',
			target: ['row'],
		},
	},
	header: {
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			name: 'headerColor',
			displayName: 'Header Color',
			description: 'Header Color',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			name: 'headerFont',
			displayName: 'Header Font',
			description: 'Header Font',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
			name: 'headerBackdropFilter',
			displayName: 'Header Backdrop Filter',
			description: 'Header Backdrop Filter',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.background,
			name: 'headerBackground',
			displayName: 'Header Background',
			description: 'Header Background',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
			name: 'headerBorder',
			displayName: 'Header Border',
			description: 'Header Border',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
			name: 'headerBoxShadow',
			displayName: 'Header Box Shadow',
			description: 'Header Box Shadow',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.container,
			name: 'headerContainer',
			displayName: 'Header Container',
			description: 'Header Container',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
			name: 'headerFlex',
			displayName: 'Header Flex',
			description: 'Header Flex',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
			name: 'headerMargin',
			displayName: 'Header Margin',
			description: 'Header Margin',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
			name: 'headerOpacity',
			displayName: 'Header Opacity',
			description: 'Header Opacity',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
			name: 'headerPadding',
			displayName: 'Header Padding',
			description: 'Header Padding',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.position,
			name: 'headerPosition',
			displayName: 'Header Position',
			description: 'Header Position',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
			name: 'headerRotate',
			displayName: 'Header Rotate',
			description: 'Header Rotate',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			name: 'headerSize',
			displayName: 'Header Size',
			description: 'Header Size',
			prefix: 'header',
			target: ['header'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
			name: 'headerTransform',
			displayName: 'Header Transform',
			description: 'Header Transform',
			prefix: 'header',
			target: ['header'],
		},
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
