import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_DATA_LOCATION,
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
	{
		name: 'showEmptyGrids',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Empty Grids',
		description: 'Show Empty Grids when there is no data',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},
	COMMON_COMPONENT_PROPERTIES.layout,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
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
		// [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
		// 	COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		// [COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
	eachGrid: {
		// [COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		// 	name: 'eachGridBackdropFilter',
		// 	displayName: 'Each Grid Backdrop Filter',
		// 	description: 'Each Grid Backdrop Filter',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.background.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.background,
		// 	name: 'eachGridBackground',
		// 	displayName: 'Each Grid Background',
		// 	description: 'Each Grid Background',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.border,
		// 	name: 'eachGridBorder',
		// 	displayName: 'Each Grid Border',
		// 	description: 'Each Grid Border',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		// 	name: 'eachGridBoxShadow',
		// 	displayName: 'Each Grid Box Shadow',
		// 	description: 'Each Grid Box Shadow',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.container.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.container,
		// 	name: 'eachGridContainer',
		// 	displayName: 'Each Grid Container',
		// 	description: 'Each Grid Container',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.flex.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.flex,
		// 	name: 'eachGridFlex',
		// 	displayName: 'Each Grid Flex',
		// 	description: 'Each Grid Flex',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		// 	name: 'eachGridMargin',
		// 	displayName: 'Each Grid Margin',
		// 	description: 'Each Grid Margin',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		// 	name: 'eachGridOpacity',
		// 	displayName: 'Each Grid Opacity',
		// 	description: 'Each Grid Opacity',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		// 	name: 'eachGridPadding',
		// 	displayName: 'Each Grid Padding',
		// 	description: 'Each Grid Padding',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.position,
		// 	name: 'eachGridPosition',
		// 	displayName: 'Each Grid Position',
		// 	description: 'Each Grid Position',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		// 	name: 'eachGridRotate',
		// 	displayName: 'Each Grid Rotate',
		// 	description: 'Each Grid Rotate',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.size,
		// 	name: 'eachGridSize',
		// 	displayName: 'Each Grid Size',
		// 	description: 'Each Grid Size',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		// 	name: 'eachGridTransform',
		// 	displayName: 'Each Grid Transform',
		// 	description: 'Each Grid Transform',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
		// [COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: {
		// 	...COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		// 	name: 'eachGridZIndex',
		// 	displayName: 'Each Grid ZIndex',
		// 	description: 'Each Grid ZIndex',
		// 	prefix: 'eachGrid',
		// 	target: ['eachGrid'],
		// },
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
