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

	{
		groupName: 'MD Heading1 Font',
		displayName: 'MD Heading1 Font Default Design',
		name: 'mDHeading1FontDefaultDesign',
		defaultValue: '600 <senaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown h1, ._markDownContent h1',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading2 Font',
		displayName: 'MD Heading2 Font Default Design',
		name: 'mDHeading2FontDefaultDesign',
		defaultValue: '<quinaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown h2, ._markDownContent h2',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading3 Font',
		displayName: 'MD Heading3 Font Default Design',
		name: 'mDHeading3FontDefaultDesign',
		defaultValue: 'bold <secondaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown h3, ._markDownContent h3',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading4 Font',
		displayName: 'MD Heading4 Font Default Design',
		name: 'mDHeading4FontDefaultDesign',
		defaultValue: '<secondaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown h4, ._markDownContent h4',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading5 Font',
		displayName: 'MD Heading5 Font Default Design',
		name: 'mDHeading5FontDefaultDesign',
		defaultValue: 'bold <tertiaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown h5, ._markDownContent h5',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading6 Font',
		displayName: 'MD Heading6 Font Default Design',
		name: 'mDHeading6FontDefaultDesign',
		defaultValue: '<tertiaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown h6, ._markDownContent h6',
		noPrefix: true,
	},
	{
		groupName: 'MD Paragraph Font',
		displayName: 'MD Paragraph Font Default Design',
		name: 'mDParagraphFontDefaultDesign',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown p, ._markDownContent p',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Font',
		displayName: 'MD Link Font Default Design',
		name: 'mDLinkFontDefaultDesign',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},

	{
		groupName: 'MD Heading1 Padding',
		displayName: 'MD Heading1 Padding Default Design',
		name: 'mDHeading1PaddingDefaultDesign',
		defaultValue: '5px 0px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown h1, ._markDownContent h1',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading2 Padding',
		displayName: 'MD Heading2 Padding Default Design',
		name: 'mDHeading2PaddingDefaultDesign',
		defaultValue: '4px 0px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown h2, ._markDownContent h2',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading3 Padding',
		displayName: 'MD Heading3 Padding Default Design',
		name: 'mDHeading3PaddingDefaultDesign',
		defaultValue: '3px 0px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown h3, ._markDownContent h3',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading4 Padding',
		displayName: 'MD Heading4 Padding Default Design',
		name: 'mDHeading4PaddingDefaultDesign',
		defaultValue: '2px 0px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown h4, ._markDownContent h4',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading5 Padding',
		displayName: 'MD Heading5 Padding Default Design',
		name: 'mDHeading5PaddingDefaultDesign',
		defaultValue: '1px 0px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown h5, ._markDownContent h5',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading6 Padding',
		displayName: 'MD Heading6 Padding Default Design',
		name: 'mDHeading6PaddingDefaultDesign',
		defaultValue: '1px 0px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown h6, ._markDownContent h6',
		noPrefix: true,
	},
	{
		groupName: 'MD Paragraph Padding',
		displayName: 'MD Paragraph Padding Default Design',
		name: 'mDParagraphPaddingDefaultDesign',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown p, ._markDownContent p',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Padding',
		displayName: 'MD Link Padding Default Design',
		name: 'mDLinkPaddingDefaultDesign',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},

	{
		groupName: 'MD Heading1 Margin',
		displayName: 'MD Heading1 Margin Default Design',
		name: 'mDHeading1MarginDefaultDesign',
		defaultValue: '5px 0px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown h1, ._markDownContent h1',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading2 Margin',
		displayName: 'MD Heading2 Margin Default Design',
		name: 'mDHeading2MarginDefaultDesign',
		defaultValue: '4px 0px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown h2, ._markDownContent h2',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading3 Margin',
		displayName: 'MD Heading3 Margin Default Design',
		name: 'mDHeading3MarginDefaultDesign',
		defaultValue: '3px 0px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown h3, ._markDownContent h3',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading4 Margin',
		displayName: 'MD Heading4 Margin Default Design',
		name: 'mDHeading4MarginDefaultDesign',
		defaultValue: '2px 0px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown h4, ._markDownContent h4',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading5 Margin',
		displayName: 'MD Heading5 Margin Default Design',
		name: 'mDHeading5MarginDefaultDesign',
		defaultValue: '1px 0px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown h5, ._markDownContent h5',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading6 Margin',
		displayName: 'MD Heading6 Margin Default Design',
		name: 'mDHeading6MarginDefaultDesign',
		defaultValue: '1px 0px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown h6, ._markDownContent h6',
		noPrefix: true,
	},
	{
		groupName: 'MD Paragraph Margin',
		displayName: 'MD Paragraph Margin Default Design',
		name: 'mDParagraphMarginDefaultDesign',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown p, ._markDownContent p',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Margin',
		displayName: 'MD Link Margin Default Design',
		name: 'mDLinkMarginDefaultDesign',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},

	{
		groupName: 'MD Heading1 Text Decoration',
		displayName: 'MD Heading1 Text Decoration Default Design',
		name: 'mDHeading1TextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown h1, ._markDownContent h1',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading2 Text Decoration',
		displayName: 'MD Heading2 Text Decoration Default Design',
		name: 'mDHeading2TextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown h2, ._markDownContent h2',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading3 Text Decoration',
		displayName: 'MD Heading3 Text Decoration Default Design',
		name: 'mDHeading3TextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown h3, ._markDownContent h3',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading4 Text Decoration',
		displayName: 'MD Heading4 Text Decoration Default Design',
		name: 'mDHeading4TextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown h4, ._markDownContent h4',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading5 Text Decoration',
		displayName: 'MD Heading5 Text Decoration Default Design',
		name: 'mDHeading5TextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown h5, ._markDownContent h5',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading6 Text Decoration',
		displayName: 'MD Heading6 Text Decoration Default Design',
		name: 'mDHeading6TextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown h6, ._markDownContent h6',
		noPrefix: true,
	},
	{
		groupName: 'MD Paragraph Text Decoration',
		displayName: 'MD Paragraph Text Decoration Default Design',
		name: 'mDParagraphTextDecorationDefaultDesign',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown p, ._markDownContent p',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Text Decoration',
		displayName: 'MD Link Text Decoration Default Design',
		name: 'mDLinkTextDecorationDefaultDesign',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},

	{
		groupName: 'MD Heading1 Color',
		displayName: 'MD Heading1 Color Default Design',
		name: 'mDHeading1ColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown h1, ._markDownContent h1',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading2 Color',
		displayName: 'MD Heading2 Color Default Design',
		name: 'mDHeading2ColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown h2, ._markDownContent h2',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading3 Color',
		displayName: 'MD Heading3 Color Default Design',
		name: 'mDHeading3ColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown h3, ._markDownContent h3',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading4 Color',
		displayName: 'MD Heading4 Color Default Design',
		name: 'mDHeading4ColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown h4, ._markDownContent h4',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading5 Color',
		displayName: 'MD Heading5 Color Default Design',
		name: 'mDHeading5ColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown h5, ._markDownContent h5',
		noPrefix: true,
	},
	{
		groupName: 'MD Heading6 Color',
		displayName: 'MD Heading6 Color Default Design',
		name: 'mDHeading6ColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown h6, ._markDownContent h6',
		noPrefix: true,
	},
	{
		groupName: 'MD Paragraph Color',
		displayName: 'MD Paragraph Color Default Design',
		name: 'mDParagraphColorDefaultDesign',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown p, ._markDownContent p',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Color',
		displayName: 'MD Link Color Default Design',
		name: 'mDLinkColorDefaultDesign',
		defaultValue: '<primaryLinkFontColor>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Color On Visited',
		displayName: 'MD Link Color On Visited Default Design',
		name: 'mDLinkColorOnVisitedDefaultDesign',
		defaultValue: '<primaryLinkFontColor>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown a:visited, ._markDownContent a:visited',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Decoration Color ',
		displayName: 'MD Link Decoration Color  Default Design',
		name: 'mDLinkDecorationColorDefaultDesign',
		defaultValue: '<primaryTextDecorationColor>',
		cssProperty: 'text-decoration-color',
		selector: '.comp.compText._markdown a:visited, ._markDownContent a:visited',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Color On Hover',
		displayName: 'MD Link Color On Hover Default Design',
		name: 'mDLinkColorOnHoverDefaultDesign',
		defaultValue: 'underline',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown a:hover, ._markDownContent a:hover',
		noPrefix: true,
	},

	{
		groupName: 'MD Blockquote Border',
		displayName: 'MD Blockquote Border Default Design',
		name: 'mDBlockquoteBorderDefaultDesign',
		defaultValue: '5px solid <fontColorEight>',
		cssProperty: 'border-left',
		selector: '.comp.compText._markdown blockquote, ._markDownContent blockquote',
		noPrefix: true,
	},
	{
		groupName: 'MD Blockquote Padding',
		displayName: 'MD Blockquote Padding Default Design',
		name: 'mDBlockquotePaddingDefaultDesign',
		defaultValue: '0 16px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown blockquote, ._markDownContent blockquote',
		noPrefix: true,
	},
	{
		groupName: 'MD Top Level Blockquote Margin',
		displayName: 'MD Top Level Blockquote Margin Default Design',
		name: 'mDTopLevelBlockquoteMarginDefaultDesign',
		defaultValue: '0 0 16px 0',
		cssProperty: 'margin',
		selector:
			'.comp.compText._markdown blockquote._topLevel_blockquote, ._markDownContent blockquote._topLevel_blockquote',
		noPrefix: true,
	},
	{
		groupName: 'MD Blockquote Margin',
		displayName: 'MD Blockquote Margin Default Design',
		name: 'mDBlockquoteMarginDefaultDesign',
		defaultValue: '0',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown blockquote, ._markDownContent blockquote',
		noPrefix: true,
	},
	{
		groupName: 'MD Blockquote Paragraph Margin',
		displayName: 'MD Blockquote Paragraph Margin Default Design',
		name: 'mDBlockquoteParagraphMarginDefaultDesign',
		defaultValue: '0 16px',
		cssProperty: 'margin',
		selector: '.comp.compText._markdown blockquote p, ._markDownContent blockquote p',
		noPrefix: true,
	},

	{
		groupName: 'MD Single Code Background ',
		displayName: 'MD Single Code Background  Default Design',
		name: 'mDSingleCodeBackgroundDefaultDesign',
		defaultValue: '<backgroundColorNine>',
		cssProperty: 'background-color',
		selector: '.comp.compText._markdown code, ._markDownContent code',
		noPrefix: true,
	},
	{
		groupName: 'MD Single Code Border Radius ',
		displayName: 'MD Single Code Border Radius  Default Design',
		name: 'mDSingleCodeBorderRadiusDefaultDesign',
		defaultValue: '6px',
		cssProperty: 'border-radius',
		selector: '.comp.compText._markdown code, ._markDownContent code',
		noPrefix: true,
	},
	{
		groupName: 'MD Single Code Padding',
		displayName: 'MD Single Code Padding Default Design',
		name: 'mDSingleCodePaddingDefaultDesign',
		defaultValue: '3px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown code, ._markDownContent code',
		noPrefix: true,
	},

	{
		groupName: 'MD Multi Code Background ',
		displayName: 'MD Multi Code Background  Default Design',
		name: 'mDMultiCodeBackgroundDefaultDesign',
		defaultValue: '<backgroundColorNine>',
		cssProperty: 'background-color',
		selector: '.comp.compText._markdown pre, ._markDownContent pre',
		noPrefix: true,
	},
	{
		groupName: 'MD Multi Code Border Radius ',
		displayName: 'MD Multi Code Border Radius  Default Design',
		name: 'mDMultiCodeBorderRadiusDefaultDesign',
		defaultValue: '6px',
		cssProperty: 'border-radius',
		selector: '.comp.compText._markdown pre, ._markDownContent pre',
		noPrefix: true,
	},
	{
		groupName: 'MD Multi Code Padding',
		displayName: 'MD Multi Code Padding Default Design',
		name: 'mDMultiCodePaddingDefaultDesign',
		defaultValue: '8px',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown pre, ._markDownContent pre',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
