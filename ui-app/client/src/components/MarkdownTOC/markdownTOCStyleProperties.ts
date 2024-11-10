import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		displayName: 'Markdown TOC Font',
		name: 'markdownTOCFont',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: ' ',
	},

	{
		groupName: 'MarkdownTOC Margin Left',
		displayName: 'MarkdownTOC Margin Left H1',
		name: 'markdowntocmarginleftH1',
		defaultValue: '5px',
		cssProperty: 'margin-left',
		selector: 'a._heading1',
	},
	{
		groupName: 'MarkdownTOC Margin Left',
		displayName: 'MarkdownTOC Margin Left H2',
		name: 'markdowntocmarginleftH2',
		defaultValue: '10px',
		cssProperty: 'margin-left',
		selector: 'a._heading2',
	},
	{
		groupName: 'MarkdownTOC Margin Left',
		displayName: 'MarkdownTOC Margin Left H3',
		name: 'markdowntocmarginleftH3',
		defaultValue: '15px',
		cssProperty: 'margin-left',
		selector: 'a._heading3',
	},
	{
		groupName: 'MarkdownTOC Margin Left',
		displayName: 'MarkdownTOC Margin Left H4',
		name: 'markdowntocmarginleftH4',
		defaultValue: '20px',
		cssProperty: 'margin-left',
		selector: 'a._heading4',
	},
	{
		groupName: 'MarkdownTOC Margin Left',
		displayName: 'MarkdownTOC Margin Left H5',
		name: 'markdowntocmarginleftH5',
		defaultValue: '25px',
		cssProperty: 'margin-left',
		selector: 'a._heading5',
	},
	{
		groupName: 'MarkdownTOC Margin Left',
		displayName: 'MarkdownTOC Margin Left H6',
		name: 'markdowntocmarginleftH6',
		defaultValue: '30px',
		cssProperty: 'margin-left',
		selector: 'a._heading6',
	},

	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration H1',
		name: 'markdowntoctextdecorationH1',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._heading1',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration H2',
		name: 'markdowntoctextdecorationH2',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._heading2',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration H3',
		name: 'markdowntoctextdecorationH3',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._heading3',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration H4',
		name: 'markdowntoctextdecorationH4',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._heading4',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration H5',
		name: 'markdowntoctextdecorationH5',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._heading5',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration H6',
		name: 'markdowntoctextdecorationH6',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._heading6',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration Top Label',
		name: 'markdowntoctextdecorationTopLabel',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._topLabel',
	},
	{
		groupName: 'MarkdownTOC Text decoration',
		displayName: 'MarkdownTOC Text decoration Bottom Label',
		name: 'markdowntoctextdecorationBottomLabel',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: 'a._bottomLabel',
	},

	{
		groupName: 'MarkdownTOC Gap',
		displayName: 'MarkdownTOC Gap Container',
		name: 'markdowntocgapContainer',
		defaultValue: '5px',
		cssProperty: 'gap',
		selector: ' ',
	},

	{
		groupName: 'MarkdownTOC Inline',
		displayName: 'MarkdownTOC Inline Gap',
		name: 'markdowntocinlineGap',
		defaultValue: '5px',
		cssProperty: 'gap',
		selector: 'a',
	},
	{
		groupName: 'MarkdownTOC Inline',
		displayName: 'MarkdownTOC Inline Align',
		name: 'markdowntocinlineAlign',
		defaultValue: 'center',
		cssProperty: 'align-items',
		selector: 'a',
	},

	{
		groupName: 'MarkdownTOC Color',
		displayName: 'MarkdownTOC Color Primary',
		name: 'markdowntoccolorprimary',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector: '.comp.compMarkdownTOC._primary a',
		noPrefix: true,
	},
	{
		groupName: 'MarkdownTOC Color',
		displayName: 'MarkdownTOC Color Secondary',
		name: 'markdowntoccolorsecondary',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector: '.comp.compMarkdownTOC._secondary a',
		noPrefix: true,
	},
	{
		groupName: 'MarkdownTOC Color',
		displayName: 'MarkdownTOC Color Tertiary',
		name: 'markdowntoccolortertiary',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector: '.comp.compMarkdownTOC._tertiary a',
		noPrefix: true,
	},
	{
		groupName: 'MarkdownTOC Color',
		displayName: 'MarkdownTOC Color Quaternary',
		name: 'markdowntoccolorquaternary',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector: '.comp.compMarkdownTOC._quaternary a',
		noPrefix: true,
	},
	{
		groupName: 'MarkdownTOC Color',
		displayName: 'MarkdownTOC Color Quinary',
		name: 'markdowntoccolorquinary',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector: '.comp.compMarkdownTOC._quinary a',
		noPrefix: true,
	},

	{
		groupName: 'Collapsible Icon',
		displayName: 'Collapsible Icon Width',
		name: 'collapsibleiconWidth',
		defaultValue: '15px',
		cssProperty: 'width',
		selector: 'i._collapsibleIcon ',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);