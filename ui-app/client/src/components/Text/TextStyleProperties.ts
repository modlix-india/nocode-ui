import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{ displayName: 'Text Font', name: 'textFont', defaultValue: '<primaryFont>' },

	{
		groupName: 'SPAN',
		displayName: 'SPAN Font',
		name: 'spanTextFont',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.span',
		noPrefix: true,
	},
	{
		groupName: 'H1',
		displayName: 'H1 Font',
		name: 'h1TextFont',
		defaultValue: 'bold <quinaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.h1',
		noPrefix: true,
	},
	{
		groupName: 'H2',
		displayName: 'H2 Font',
		name: 'h2TextFont',
		defaultValue: '<quinaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.h2',
		noPrefix: true,
	},
	{
		groupName: 'H3',
		displayName: 'H3 Font',
		name: 'h3TextFont',
		defaultValue: 'bold <secondaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.h3',
		noPrefix: true,
	},
	{
		groupName: 'H4',
		displayName: 'H4 Font',
		name: 'h4TextFont',
		defaultValue: '<secondaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.h4',
		noPrefix: true,
	},
	{
		groupName: 'H5',
		displayName: 'H5 Font',
		name: 'h5TextFont',
		defaultValue: 'bold <tertiaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.h5',
		noPrefix: true,
	},
	{
		groupName: 'H6',
		displayName: 'H6 Font',
		name: 'h6TextFont',
		defaultValue: '<tertiaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.h6',
		noPrefix: true,
	},
	{
		groupName: 'I',
		displayName: 'I Font',
		name: 'iTextFont',
		defaultValue: 'italic <primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.i',
		noPrefix: true,
	},
	{
		groupName: 'P',
		displayName: 'P Font',
		name: 'pTextFont',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.p',
		noPrefix: true,
	},
	{
		groupName: 'B',
		displayName: 'B Font',
		name: 'bTextFont',
		defaultValue: 'bold <primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.b',
		noPrefix: true,
	},
	{
		groupName: 'PRE',
		displayName: 'PRE Font',
		name: 'preTextFont',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText.pre',
		noPrefix: true,
	},

	{
		groupName: 'SPAN',
		displayName: 'SPAN Padding',
		name: 'spanTextPadding',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: 'span',
	},
	{
		groupName: 'H1',
		displayName: 'H1 Padding',
		name: 'h1TextPadding',
		defaultValue: '5px 0px',
		cssProperty: 'padding',
		selector: 'h1',
	},
	{
		groupName: 'H2',
		displayName: 'H2 Padding',
		name: 'h2TextPadding',
		defaultValue: '4px 0px',
		cssProperty: 'padding',
		selector: 'h2',
	},
	{
		groupName: 'H3',
		displayName: 'H3 Padding',
		name: 'h3TextPadding',
		defaultValue: '3px 0px',
		cssProperty: 'padding',
		selector: 'h3',
	},
	{
		groupName: 'H4',
		displayName: 'H4 Padding',
		name: 'h4TextPadding',
		defaultValue: '2px 0px',
		cssProperty: 'padding',
		selector: 'h4',
	},
	{
		groupName: 'H5',
		displayName: 'H5 Padding',
		name: 'h5TextPadding',
		defaultValue: '1px 0px',
		cssProperty: 'padding',
		selector: 'h5',
	},
	{
		groupName: 'H6',
		displayName: 'H6 Padding',
		name: 'h6TextPadding',
		defaultValue: '1px 0px',
		cssProperty: 'padding',
		selector: 'h6',
	},
	{
		groupName: 'I',
		displayName: 'I Padding',
		name: 'iTextPadding',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: 'i',
	},
	{
		groupName: 'P',
		displayName: 'P Padding',
		name: 'pTextPadding',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: 'p',
	},
	{
		groupName: 'B',
		displayName: 'B Padding',
		name: 'bTextPadding',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: 'p',
	},
	{
		groupName: 'PRE',
		displayName: 'PRE Padding',
		name: 'preTextPadding',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: 'pre',
	},

	{
		groupName: 'SPAN',
		displayName: 'SPAN Margin',
		name: 'spanTextMargin',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: 'span',
	},
	{
		groupName: 'H1',
		displayName: 'H1 Margin',
		name: 'h1TextMargin',
		defaultValue: '5px 0px',
		cssProperty: 'margin',
		selector: 'h1',
	},
	{
		groupName: 'H2',
		displayName: 'H2 Margin',
		name: 'h2TextMargin',
		defaultValue: '4px 0px',
		cssProperty: 'margin',
		selector: 'h2',
	},
	{
		groupName: 'H3',
		displayName: 'H3 Margin',
		name: 'h3TextMargin',
		defaultValue: '3px 0px',
		cssProperty: 'margin',
		selector: 'h3',
	},
	{
		groupName: 'H4',
		displayName: 'H4 Margin',
		name: 'h4TextMargin',
		defaultValue: '2px 0px',
		cssProperty: 'margin',
		selector: 'h4',
	},
	{
		groupName: 'H5',
		displayName: 'H5 Margin',
		name: 'h5TextMargin',
		defaultValue: '1px 0px',
		cssProperty: 'margin',
		selector: 'h5',
	},
	{
		groupName: 'H6',
		displayName: 'H6 Margin',
		name: 'h6TextMargin',
		defaultValue: '1px 0px',
		cssProperty: 'margin',
		selector: 'h6',
	},
	{
		groupName: 'I',
		displayName: 'I Margin',
		name: 'iTextMargin',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: 'i',
	},
	{
		groupName: 'P',
		displayName: 'P Margin',
		name: 'pTextMargin',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: 'p',
	},
	{
		groupName: 'B',
		displayName: 'B Margin',
		name: 'bTextMargin',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: 'p',
	},
	{
		groupName: 'PRE',
		displayName: 'PRE Margin',
		name: 'preTextMargin',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: 'pre',
	},

	{
		groupName: 'SPAN',
		displayName: 'SPAN Text Decoration',
		name: 'spanTextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.span',
		noPrefix: true,
	},
	{
		groupName: 'H1',
		displayName: 'H1 Text Decoration',
		name: 'h1TextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.h1',
		noPrefix: true,
	},
	{
		groupName: 'H2',
		displayName: 'H2 Text Decoration',
		name: 'h2TextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.h2',
		noPrefix: true,
	},
	{
		groupName: 'H3',
		displayName: 'H3 Text Decoration',
		name: 'h3TextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.h3',
		noPrefix: true,
	},
	{
		groupName: 'H4',
		displayName: 'H4 Text Decoration',
		name: 'h4TextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.h4',
		noPrefix: true,
	},
	{
		groupName: 'H5',
		displayName: 'H5 Text Decoration',
		name: 'h5TextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.h5',
		noPrefix: true,
	},
	{
		groupName: 'H6',
		displayName: 'H6 Text Decoration',
		name: 'h6TextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.h6',
		noPrefix: true,
	},
	{
		groupName: 'I',
		displayName: 'I Text Decoration',
		name: 'iTextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.i',
		noPrefix: true,
	},
	{
		groupName: 'P',
		displayName: 'P Text Decoration',
		name: 'pTextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.p',
		noPrefix: true,
	},
	{
		groupName: 'B',
		displayName: 'B Text Decoration',
		name: 'bTextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.p',
		noPrefix: true,
	},
	{
		groupName: 'PRE',
		displayName: 'PRE Text Decoration',
		name: 'preTextDecoration',
		cssProperty: 'text-decoration',
		selector: '.comp.compText.pre',
		noPrefix: true,
	},

	{
		groupName: 'Text Component Color',
		displayName: 'primaryText',
		name: 'textComponentprimaryTextcolor',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._primaryText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'subText',
		name: 'textComponentsubTextcolor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector: '.comp.compText._subText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'labelText',
		name: 'textComponentlabelTextcolor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector: '.comp.compText._labelText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'paragraphText',
		name: 'textComponentparagraphTextcolor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector: '.comp.compText._paragraphText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'lightPrimaryText',
		name: 'textComponentlightPrimaryTextcolor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector: '.comp.compText._lightPrimaryText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'lightSubText',
		name: 'textComponentlightSubTextcolor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'color',
		selector: '.comp.compText._lightSubText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'lightLabelText',
		name: 'textComponentlightLabelTextcolor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector: '.comp.compText._lightLabelText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'lightParagraphText',
		name: 'textComponentlightParagraphTextcolor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector: '.comp.compText._lightParagraphText',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'coloredText1',
		name: 'textComponentcoloredText1color',
		defaultValue: '<colorFifteen>',
		cssProperty: 'color',
		selector: '.comp.compText._coloredText1',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'coloredText2',
		name: 'textComponentcoloredText2color',
		defaultValue: '<colorTen>',
		cssProperty: 'color',
		selector: '.comp.compText._coloredText2',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'coloredText3',
		name: 'textComponentcoloredText3color',
		defaultValue: '<colorEleven>',
		cssProperty: 'color',
		selector: '.comp.compText._coloredText3',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'coloredText4',
		name: 'textComponentcoloredText4color',
		defaultValue: '<colorFourteen>',
		cssProperty: 'color',
		selector: '.comp.compText._coloredText4',
		noPrefix: true,
	},
	{
		groupName: 'Text Component Color',
		displayName: 'coloredText5',
		name: 'textComponentcoloredText5',
		defaultValue: '<colorTwelve>',
		cssProperty: 'color',
		selector: '.comp.compText._coloredText5',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
