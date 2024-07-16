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
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Default image source.',
		description: 'Default image source.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'src2',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Image source for Tablet landscape screen',
		description: 'source of the image for Tablet landscape screen.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'sr3',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Image source for Tablet portrait screen',
		description: 'source of the image for Tablet portrait screen.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'src4',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Image source for Mobile landscape screen',
		description: 'source of the image for Mobile landscape screen.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'src5',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Image source for Mobile portrait screen',
		description: 'source of the image for Mobile portrait screen.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'alt',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Alt Text',
		description: 'Text describing the image.',
		defaultValue: '',
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'zoom',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Toggle zoom',
		description: 'Magnification functionality switch',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
		notImplemented: true,
	},
	{
		name: 'zoomedImg',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Zoom Image',
		description: 'High quality image for zoom functionality.',
		notImplemented: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'fallBackImg',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Fallback image',
		description: 'FallBack image will be dispalyed when main image is broken.',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.IMAGE,
	},
	{
		name: 'imgLazyLoading',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Image lazy loading',
		description: 'Image lazy loading',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},

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
	COMMON_COMPONENT_PROPERTIES.visibility,
];
const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.image.type,
	],
	image: [
		COMPONENT_STYLE_GROUP_PROPERTIES.image.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
