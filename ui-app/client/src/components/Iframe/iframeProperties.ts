import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_REF_ANY_COMP_PROP,
	SCHEMA_REF_BOOL_COMP_PROP,
	SCHEMA_REF_DATA_LOCATION,
	SCHEMA_REF_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentPropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'source',
		description: 'source of the iframe',
	},
	{
		name: 'width',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'width',
		description: 'width of the iframe',
		defaultValue: '650',
	},
	{
		name: 'height',
		schema: Schema.ofRef(SCHEMA_REF_ANY_COMP_PROP),
		displayName: 'height',
		description: 'height of the iframe',
		defaultValue: '420',
	},
	{
		name: 'name',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'name',
		description: 'name of the iframe',
	},
	{
		name: 'srcdoc',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'srcdoc',
		description: 'srcdoc of the iframe',
	},
	{
		name: 'sandbox',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'sandbox',
		description: 'sandbox of the iframe',
	},
	{
		name: 'referrerpolicy',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'referrerpolicy',
		description: 'referrerpolicy of the iframe',
		defaultValue: 'no-referrer-when-downgrade',
	},
	{
		name: 'loading',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'loading',
		description: 'loading type of the iframe',
		defaultValue: 'lazy',
	},
	{
		name: 'allowfullscreen',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'allowfullscreen',
		description: 'It allows i frame to be of fullscreen',
		defaultValue: true,
	},
	{
		name: 'allow',
		schema: Schema.ofRef(SCHEMA_REF_STRING_COMP_PROP),
		displayName: 'allow',
		description: 'allow of the iframe',
	},
	COMMON_COMPONENT_PROPERTIES.onClick,
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
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.shape.type]: COMPONENT_STYLE_GROUP_PROPERTIES.shape,
		[COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar,
	},
	iframe: {
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
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
		[COMPONENT_STYLE_GROUP_PROPERTIES.shape.type]: COMPONENT_STYLE_GROUP_PROPERTIES.shape,
		[COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.scrollbar,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
