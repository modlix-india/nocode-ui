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
	{
		name: 'text',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text',
		description: 'Text to display',
		group: ComponentPropertyGroup.BASIC,
		translatable: true,
	},

	{
		name: 'textType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text Type',
		description: 'Text type',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
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
		group: ComponentPropertyGroup.ADVANCED,
		description: 'Process text to show new line characters',
		defaultValue: false,
	},

	{
		name: 'textContainer',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text Container Type (SEO)',
		description: 'Text container type for seo optimization',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.ADVANCED,
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
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
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
};

export { propertiesDefinition, stylePropertiesDefinition };
