import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	COMMON_COMPONENT_PROPERTIES.analyticsLabel,
	COMMON_COMPONENT_PROPERTIES.onClick,
	{
		name: 'svgContent',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'SVG Markup',
		description:
			'Raw SVG markup to render inline. When provided, this takes precedence over the source URL. Unsafe tags/attributes are stripped before rendering. Use the editor button to edit elements and animations visually.',
		editor: ComponentPropertyEditor.SVG,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'src',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'SVG source',
		description: 'SVG file source. Fetched, sanitized, and rendered inline.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'alt',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Alt Text',
		description: 'Accessible label describing the SVG.',
		defaultValue: '',
		group: ComponentPropertyGroup.BASIC,
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
	],
	svg: [
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
