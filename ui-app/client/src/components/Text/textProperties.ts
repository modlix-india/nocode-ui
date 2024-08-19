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
		editor: ComponentPropertyEditor.TEXT_EDITOR,
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
		...COMMON_COMPONENT_PROPERTIES.designType,
		enumValues: [...COMMON_COMPONENT_PROPERTIES.designType.enumValues!],
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
		name: 'removeToolTip',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Remove Tooltip',
		group: ComponentPropertyGroup.ADVANCED,
		description: 'Process text to remove tooltip.',
		defaultValue: false,
	},
	{
		name: 'textColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Text Color Scheme',
		description: 'Text Color Scheme',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '_primaryText',
		enumValues: [
			{
				name: '_primaryText',
				displayName: 'Primary Text Color',
				description: 'Primary Text Color.',
			},
			{ name: '_subText', displayName: 'SubText Color', description: 'SubText Color.' },
			{
				name: '_labelText',
				displayName: 'Label Text Color',
				description: 'Label Text color.',
			},
			{
				name: '_paragraphText',
				displayName: 'Paragraph Text Color',
				description: 'Paragraph Text Color.',
			},
			{
				name: '_lightPrimaryText',
				displayName: 'Light Primary Text Color',
				description: 'Light Primary Text Color',
			},
			{
				name: '_lightSubText',
				displayName: 'Light SubText Color',
				description: 'Light SubText Color',
			},
			{
				name: '_lightLabelText',
				displayName: 'Light Label Text Color',
				description: 'Light Label Text Color',
			},
			{
				name: '_lightParagraphText',
				displayName: 'Light Paragraph Text Color',
				description: 'Light Paragraph Text Color',
			},
			{
				name: '_coloredText1',
				displayName: 'Coloured Text Color 1',
				description: 'Coloured Text Color 1',
			},
			{
				name: '_coloredText2',
				displayName: 'Coloured Text Color 2',
				description: 'Coloured Text Color 2',
			},
			{
				name: '_coloredText3',
				displayName: 'Coloured Text Color 3',
				description: 'Coloured Text Color 3',
			},
			{
				name: '_coloredText4',
				displayName: 'Coloured Text Color 4',
				description: 'Coloured Text Color 4',
			},
			{
				name: '_coloredText5',
				displayName: 'Coloured Text Color 5',
				description: 'Coloured Text Color 5',
			},
		],
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
				name: 'B',
				displayName: 'B',
				description: 'B tag',
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
	markdownContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	h1: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	h2: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	h3: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	h4: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	h5: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	h6: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	em: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	b: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	p: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	mark: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	s: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	sup: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	sub: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	br: [COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type],
	ol: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	oli: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	ul: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	ulli: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	tlli: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	tlcheckbox: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	links: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	linksHover: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	images: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	icBlock: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	codeBlock: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	codeBlockKeywords: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	codeBlockVariables: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	table: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	th: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	tr: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	td: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	blockQuotes: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	hr: [
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
	],
	video: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	footNoteLink: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
	footNote: [
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };
