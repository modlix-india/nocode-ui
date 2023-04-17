import { SCHEMA_ANY_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'source',
		group: ComponentPropertyGroup.IMPORTANT,
		description: 'The URL of the page to embed.',
	},
	{
		name: 'width',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'width',
		group: ComponentPropertyGroup.IMPORTANT,
		description: 'The width of the frame in CSS pixels, dont add px.',
		defaultValue: '650',
	},
	{
		name: 'height',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'height',
		group: ComponentPropertyGroup.IMPORTANT,
		description: 'The height of the frame in CSS pixels, dont add px.',
		defaultValue: '420',
	},
	{
		name: 'name',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'name',
		group: ComponentPropertyGroup.IMPORTANT,
		description: 'A targetable name for the embedded browsing context.',
	},
	{
		name: 'srcdoc',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'srcdoc',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'Inline HTML to embed, overriding the src attribute.',
	},
	{
		name: 'sandbox',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'sandbox',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'Applies extra restrictions to the content in the frame. ',
	},
	{
		name: 'referrerpolicy',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'referrerpolicy',
		group: ComponentPropertyGroup.ADVANCED,
		description: "Indicates which referrer to send when fetching the frame's resource:",
		defaultValue: 'no-referrer-when-downgrade',
	},
	{
		name: 'loading',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'loading',
		description: 'loading type of the iframe',
		defaultValue: 'lazy',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'allowfullscreen',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'allowfullscreen',
		description: 'To activate fullscreen mode by',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'allow',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'allow',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'allow of the iframe',
	},
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
