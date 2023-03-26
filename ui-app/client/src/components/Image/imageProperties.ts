import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentStylePropertyDefinition } from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'source',
		description: 'source of the image',
	},
	{
		name: 'alt',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Alt Text',
		description: 'Text describing the image.',
		defaultValue: '',
	},

	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'zoom',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Toggle zoom',
		description: 'Magnification functionality switch',
		defaultValue: false,
		notImplemented: true,
	},
	{
		name: 'zoomedImg',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Zoom Image',
		description: 'High quality image for zoom functionality.',
		notImplemented: true,
	},
	{
		name: 'fallBackImg',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Fallback image',
		description: 'FallBack image will be dispalyed when main image is broken.',
	},
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.border,
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.outline,
			target: ['image'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.image.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.image,
			target: ['image', 'comp'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.size,
			target: ['image', 'comp'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,

		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.transform,
			target: ['image'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
			target: ['image'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
