import { Schema } from '@fincity/kirun-js';
import {
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
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
		name: 'stringFormat',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'String Format',
		description: 'String format with dates, numbers and strings',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: 'STRING',
		enumValues: [
			{
				name: 'STRING',
				displayName: 'Plain String',
				description: 'Plain String',
			},
			{
				name: 'UTC_TO_MM/DD/YYYY',
				displayName: 'UTC to MM/DD/YYYY',
				description: 'UTC to MM/DD/YYYY',
			},
			{
				name: 'UTC_TO_MM/DD/YYYY_HH:MM',
				displayName: 'UTC to MM/DD/YYYY HH:MM',
				description: 'UTC to MM/DD/YYYY HH:MM',
			},
			{
				name: 'UTC_TO_MM/DD/YYYY_HH:MM:SS',
				displayName: 'UTC to MM/DD/YYYY HH:MM:SS',
				description: 'UTC to MM/DD/YYYY HH:MM:SS',
			},
			{
				name: 'UTC_TO_MM/DD/YYYY_HH:MM:SS.SSS',
				displayName: 'UTC to MM/DD/YYYY HH:MM:SS.SSS',
				description: 'UTC to MM/DD/YYYY HH:MM:SS.SSS',
			},
			{
				name: 'UTC_TO_YYYY-MM-DD',
				displayName: 'UTC to YYYY-MM-DD',
				description: 'UTC to YYYY-MM-DD',
			},
			{
				name: 'UTC_TO_YYYY-MM-DD_HH:MM',
				displayName: 'UTC to YYYY-MM-DD HH:MM',
				description: 'UTC to YYYY-MM-DD HH:MM',
			},
			{
				name: 'UTC_TO_YYYY-MM-DD_HH:MM:SS',
				displayName: 'UTC to YYYY-MM-DD HH:MM:SS',
				description: 'UTC to YYYY-MM-DD HH:MM:SS',
			},
			{
				name: 'UTC_TO_YYYY-MM-DD_HH:MM:SS.SSS',
				displayName: 'UTC to YYYY-MM-DD HH:MM:SS.SSS',
				description: 'UTC to YYYY-MM-DD HH:MM:SS.SSS',
			},
			{
				name: 'UTC_TO_MONTH_DD,YYYY',
				displayName: 'UTC to Month DD, YYYY',
				description: 'UTC to Month DD, YYYY',
			},
			{
				name: 'UTC_TO_MONTH_DD,YYYY_HH:MM',
				displayName: 'UTC to Month DD, YYYY HH:MM',
				description: 'UTC to Month DD, YYYY HH:MM',
			},
			{
				name: 'UTC_TO_MONTH_DD,YYYY_HH:MM:SS',
				displayName: 'UTC to Month DD, YYYY HH:MM:SS',
				description: 'UTC to Month DD, YYYY HH:MM:SS',
			},
			{
				name: 'UTC_TO_MONTH_DD,YYYY_HH:MM:SS.SSS',
				displayName: 'UTC to Month DD, YYYY HH:MM:SS.SSS',
				description: 'UTC to Month DD, YYYY HH:MM:SS.SSS',
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

	{
		name: 'textLength',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Max Text Length',
		description: 'Max text length',
		group: ComponentPropertyGroup.ADVANCED,
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
	text: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
