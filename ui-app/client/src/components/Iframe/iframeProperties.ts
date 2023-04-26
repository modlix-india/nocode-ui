import { SCHEMA_ANY_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import { ComponentPropertyDefinition, ComponentPropertyGroup } from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'source',
		group: ComponentPropertyGroup.BASIC,
		description: 'The URL of the page to embed.',
	},
	{
		name: 'width',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'width',
		group: ComponentPropertyGroup.BASIC,
		description: 'The width of the frame in CSS pixels, dont add px.',
		defaultValue: '650',
	},
	{
		name: 'height',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'height',
		group: ComponentPropertyGroup.BASIC,
		description: 'The height of the frame in CSS pixels, dont add px.',
		defaultValue: '420',
	},
	{
		name: 'name',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'name',
		group: ComponentPropertyGroup.BASIC,
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
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	iframe: [
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
