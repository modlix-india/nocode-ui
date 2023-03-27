import { Schema } from '@fincity/kirun-js';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'text',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text',
		description: 'Text to display',
		translatable: true,
	},

	{
		name: 'textType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text Type',
		description: 'Text type',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'TEXT',
		enumValues: [
			{
				name: 'TEXT',
				displayName: 'Plain Text',
				description: 'Plain Text',
			},
			{
				name: 'MD',
				displayName: 'Markdown',
				description: 'Markdown Format',
			},
		],
	},

	{
		name: 'processNewLine',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Text with line breaks',
		description: 'Process text to show new line characters',
		defaultValue: false,
	},

	{
		name: 'textContainer',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text Container Type (SEO)',
		description: 'Text container type for seo optimization',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'SPAN',
		enumValues: [
			{
				name: 'SPAN',
				displayName: 'SPAN',
				description: 'Span tag',
			},
			{
				name: 'H1',
				displayName: 'H1',
				description: 'H1 tag',
			},
			{
				name: 'H2',
				displayName: 'H2',
				description: 'H2 tag',
			},
			{
				name: 'H3',
				displayName: 'H3',
				description: 'H3 tag',
			},
			{
				name: 'H4',
				displayName: 'H4',
				description: 'H4 tag',
			},
			{
				name: 'H5',
				displayName: 'H5',
				description: 'H5 tag',
			},
			{
				name: 'H6',
				displayName: 'H6',
				description: 'H6 tag',
			},
			{
				name: 'I',
				displayName: 'I',
				description: 'I tag',
			},
			{
				name: 'P',
				displayName: 'P',
				description: 'P tag',
			},
			{
				name: 'PRE',
				displayName: 'PRE',
				description: 'Pre tag',
			},
		],
	},

	{
		name: 'visibility',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': {
		[COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.backdropFilter,
		[COMPONENT_STYLE_GROUP_PROPERTIES.background.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.background,
		[COMPONENT_STYLE_GROUP_PROPERTIES.border.type]: COMPONENT_STYLE_GROUP_PROPERTIES.border,
		[COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.boxShadow,
		[COMPONENT_STYLE_GROUP_PROPERTIES.color.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.color,
			target: ['text'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.font.type]: {
			...COMPONENT_STYLE_GROUP_PROPERTIES.font,
			target: ['text'],
		},
		[COMPONENT_STYLE_GROUP_PROPERTIES.margin.type]: COMPONENT_STYLE_GROUP_PROPERTIES.margin,
		[COMPONENT_STYLE_GROUP_PROPERTIES.shape.type]: COMPONENT_STYLE_GROUP_PROPERTIES.shape,
		[COMPONENT_STYLE_GROUP_PROPERTIES.opacity.type]: COMPONENT_STYLE_GROUP_PROPERTIES.opacity,
		[COMPONENT_STYLE_GROUP_PROPERTIES.outline.type]: COMPONENT_STYLE_GROUP_PROPERTIES.outline,
		[COMPONENT_STYLE_GROUP_PROPERTIES.padding.type]: COMPONENT_STYLE_GROUP_PROPERTIES.padding,
		[COMPONENT_STYLE_GROUP_PROPERTIES.position.type]: COMPONENT_STYLE_GROUP_PROPERTIES.position,
		[COMPONENT_STYLE_GROUP_PROPERTIES.rotate.type]: COMPONENT_STYLE_GROUP_PROPERTIES.rotate,
		[COMPONENT_STYLE_GROUP_PROPERTIES.size.type]: COMPONENT_STYLE_GROUP_PROPERTIES.size,
		[COMPONENT_STYLE_GROUP_PROPERTIES.transform.type]:
			COMPONENT_STYLE_GROUP_PROPERTIES.transform,
		[COMPONENT_STYLE_GROUP_PROPERTIES.zIndex.type]: COMPONENT_STYLE_GROUP_PROPERTIES.zIndex,
	},
};

export { propertiesDefinition, stylePropertiesDefinition };
