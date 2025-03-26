import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{ dn: 'Text Font', n: 'textFont', dv: '<primaryFont>' },

	{
		gn: 'SPAN',
		dn: 'SPAN Font',
		n: 'spanTextFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: '.comp.compText.span',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Font',
		n: 'h1TextFont',
		dv: 'bold <quinaryFont>',
		cp: 'font',
		sel: '.comp.compText.h1',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 Font',
		n: 'h2TextFont',
		dv: '<quinaryFont>',
		cp: 'font',
		sel: '.comp.compText.h2',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 Font',
		n: 'h3TextFont',
		dv: 'bold <secondaryFont>',
		cp: 'font',
		sel: '.comp.compText.h3',
		np: true,
	},
	{
		gn: 'H4',
		dn: 'H4 Font',
		n: 'h4TextFont',
		dv: '<secondaryFont>',
		cp: 'font',
		sel: '.comp.compText.h4',
		np: true,
	},
	{
		gn: 'H5',
		dn: 'H5 Font',
		n: 'h5TextFont',
		dv: 'bold <tertiaryFont>',
		cp: 'font',
		sel: '.comp.compText.h5',
		np: true,
	},
	{
		gn: 'H6',
		dn: 'H6 Font',
		n: 'h6TextFont',
		dv: '<tertiaryFont>',
		cp: 'font',
		sel: '.comp.compText.h6',
		np: true,
	},
	{
		gn: 'I',
		dn: 'I Font',
		n: 'iTextFont',
		dv: 'italic <primaryFont>',
		cp: 'font',
		sel: '.comp.compText.i i',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Font',
		n: 'pTextFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: '.comp.compText.p',
		np: true,
	},
	{
		gn: 'B',
		dn: 'B Font',
		n: 'bTextFont',
		dv: 'bold <primaryFont>',
		cp: 'font',
		sel: '.comp.compText.b',
		np: true,
	},
	{
		gn: 'PRE',
		dn: 'PRE Font',
		n: 'preTextFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: '.comp.compText.pre',
		np: true,
	},

	{
		gn: 'SPAN',
		dn: 'SPAN Padding',
		n: 'spanTextPadding',
		dv: '0',
		cp: 'padding',
		sel: '.comp.compText.span span',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Padding',
		n: 'h1TextPadding',
		dv: '5px 0px',
		cp: 'padding',
		sel: '.comp.compText.h1 h1',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 Padding',
		n: 'h2TextPadding',
		dv: '4px 0px',
		cp: 'padding',
		sel: '.comp.compText.h2 h2',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 Padding',
		n: 'h3TextPadding',
		dv: '3px 0px',
		cp: 'padding',
		sel: '.comp.compText.h3 h3',
		np: true,
	},
	{
		gn: 'H4',
		dn: 'H4 Padding',
		n: 'h4TextPadding',
		dv: '2px 0px',
		cp: 'padding',
		sel: '.comp.compText.h4 h4',
		np: true,
	},
	{
		gn: 'H5',
		dn: 'H5 Padding',
		n: 'h5TextPadding',
		dv: '1px 0px',
		cp: 'padding',
		sel: '.comp.compText.h5 h5',
		np: true,
	},
	{
		gn: 'H6',
		dn: 'H6 Padding',
		n: 'h6TextPadding',
		dv: '1px 0px',
		cp: 'padding',
		sel: '.comp.compText.h6 h6',
		np: true,
	},
	{
		gn: 'I',
		dn: 'I Padding',
		n: 'iTextPadding',
		dv: '0',
		cp: 'padding',
		sel: '.comp.compText.i i',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Padding',
		n: 'pTextPadding',
		dv: '0',
		cp: 'padding',
		sel: '.comp.compText.p p',
		np: true,
	},
	{
		gn: 'B',
		dn: 'B Padding',
		n: 'bTextPadding',
		dv: '0',
		cp: 'padding',
		sel: '.comp.compText.b b',
		np: true,
	},
	{
		gn: 'PRE',
		dn: 'PRE Padding',
		n: 'preTextPadding',
		dv: '0',
		cp: 'padding',
		sel: '.comp.compText.pre pre',
		np: true,
	},

	{
		gn: 'SPAN',
		dn: 'SPAN Margin',
		n: 'spanTextMargin',
		dv: '0',
		cp: 'margin',
		sel: '.comp.compText.span span',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Margin',
		n: 'h1TextMargin',
		dv: '5px 0px',
		cp: 'margin',
		sel: '.comp.compText.h1 h1',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 Margin',
		n: 'h2TextMargin',
		dv: '4px 0px',
		cp: 'margin',
		sel: '.comp.compText.h2 h2',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 Margin',
		n: 'h3TextMargin',
		dv: '3px 0px',
		cp: 'margin',
		sel: '.comp.compText.h3 h3',
		np: true,
	},
	{
		gn: 'H4',
		dn: 'H4 Margin',
		n: 'h4TextMargin',
		dv: '2px 0px',
		cp: 'margin',
		sel: '.comp.compText.h4 h4',
		np: true,
	},
	{
		gn: 'H5',
		dn: 'H5 Margin',
		n: 'h5TextMargin',
		dv: '1px 0px',
		cp: 'margin',
		sel: '.comp.compText.h5 h5',
		np: true,
	},
	{
		gn: 'H6',
		dn: 'H6 Margin',
		n: 'h6TextMargin',
		dv: '1px 0px',
		cp: 'margin',
		sel: '.comp.compText.h6 h6',
		np: true,
	},
	{
		gn: 'I',
		dn: 'I Margin',
		n: 'iTextMargin',
		dv: '0',
		cp: 'margin',
		sel: '.comp.compText.i i',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Margin',
		n: 'pTextMargin',
		dv: '0',
		cp: 'margin',
		sel: '.comp.compText.p p',
		np: true,
	},
	{
		gn: 'B',
		dn: 'B Margin',
		n: 'bTextMargin',
		dv: '0',
		cp: 'margin',
		sel: '.comp.compText.b b',
		np: true,
	},
	{
		gn: 'PRE',
		dn: 'PRE Margin',
		n: 'preTextMargin',
		dv: '0',
		cp: 'margin',
		sel: '.comp.compText.pre pre',
		np: true,
	},

	{
		gn: 'SPAN',
		dn: 'SPAN Text Decoration',
		n: 'spanTextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.span span',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Text Decoration',
		n: 'h1TextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.h1 h1',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 Text Decoration',
		n: 'h2TextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.h2 h2',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 Text Decoration',
		n: 'h3TextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.h3 h3',
		np: true,
	},
	{
		gn: 'H4',
		dn: 'H4 Text Decoration',
		n: 'h4TextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.h4 h4',
		np: true,
	},
	{
		gn: 'H5',
		dn: 'H5 Text Decoration',
		n: 'h5TextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.h5 h5',
		np: true,
	},
	{
		gn: 'H6',
		dn: 'H6 Text Decoration',
		n: 'h6TextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.h6 h6',
		np: true,
	},
	{
		gn: 'I',
		dn: 'I Text Decoration',
		n: 'iTextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.i i',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Text Decoration',
		n: 'pTextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.p p',
		np: true,
	},
	{
		gn: 'B',
		dn: 'B Text Decoration',
		n: 'bTextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.b b',
		np: true,
	},
	{
		gn: 'PRE',
		dn: 'PRE Text Decoration',
		n: 'preTextDecoration',
		cp: 'text-decoration',
		sel: '.comp.compText.pre pre',
		np: true,
	},

	{
		gn: 'Text Component Color',
		dn: 'primaryText',
		n: 'textComponentprimaryTextcolor',
		dv: '<fontColorOne>',
		cp: 'color',
		sel: '.comp.compText._primaryText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'subText',
		n: 'textComponentsubTextcolor',
		dv: '<fontColorTwo>',
		cp: 'color',
		sel: '.comp.compText._subText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'labelText',
		n: 'textComponentlabelTextcolor',
		dv: '<fontColorThree>',
		cp: 'color',
		sel: '.comp.compText._labelText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'paragraphText',
		n: 'textComponentparagraphTextcolor',
		dv: '<fontColorFour>',
		cp: 'color',
		sel: '.comp.compText._paragraphText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'lightPrimaryText',
		n: 'textComponentlightPrimaryTextcolor',
		dv: '<fontColorFive>',
		cp: 'color',
		sel: '.comp.compText._lightPrimaryText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'lightSubText',
		n: 'textComponentlightSubTextcolor',
		dv: '<fontColorSix>',
		cp: 'color',
		sel: '.comp.compText._lightSubText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'lightLabelText',
		n: 'textComponentlightLabelTextcolor',
		dv: '<fontColorSeven>',
		cp: 'color',
		sel: '.comp.compText._lightLabelText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'lightParagraphText',
		n: 'textComponentlightParagraphTextcolor',
		dv: '<fontColorEight>',
		cp: 'color',
		sel: '.comp.compText._lightParagraphText',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'coloredText1',
		n: 'textComponentcoloredText1color',
		dv: '<colorFifteen>',
		cp: 'color',
		sel: '.comp.compText._coloredText1',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'coloredText2',
		n: 'textComponentcoloredText2color',
		dv: '<colorTen>',
		cp: 'color',
		sel: '.comp.compText._coloredText2',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'coloredText3',
		n: 'textComponentcoloredText3color',
		dv: '<colorEleven>',
		cp: 'color',
		sel: '.comp.compText._coloredText3',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'coloredText4',
		n: 'textComponentcoloredText4color',
		dv: '<colorFourteen>',
		cp: 'color',
		sel: '.comp.compText._coloredText4',
		np: true,
	},
	{
		gn: 'Text Component Color',
		dn: 'coloredText5',
		n: 'textComponentcoloredText5',
		dv: '<colorTwelve>',
		cp: 'color',
		sel: '.comp.compText._coloredText5',
		np: true,
	},

	{
		gn: 'MD Heading1 Font',
		dn: 'MD Heading1 Font Default Design',
		n: 'mDHeading1FontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Heading2 Font',
		dn: 'MD Heading2 Font Default Design',
		n: 'mDHeading2FontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Heading3 Font',
		dn: 'MD Heading3 Font Default Design',
		n: 'mDHeading3FontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Heading4 Font',
		dn: 'MD Heading4 Font Default Design',
		n: 'mDHeading4FontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Heading5 Font',
		dn: 'MD Heading5 Font Default Design',
		n: 'mDHeading5FontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Heading6 Font',
		dn: 'MD Heading6 Font Default Design',
		n: 'mDHeading6FontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Paragraph Font',
		dn: 'MD Paragraph Font Default Design',
		n: 'mDParagraphFontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Link Font',
		dn: 'MD Link Font Default Design',
		n: 'mDLinkFontDefaultDesign',
		cp: 'font',
		sel: '.comp.compText._textMarkdown ._markdown ._a',
		np: true,
	},

	{
		gn: 'MD Heading1 Padding',
		dn: 'MD Heading1 Padding Default Design',
		n: 'mDHeading1PaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Heading2 Padding',
		dn: 'MD Heading2 Padding Default Design',
		n: 'mDHeading2PaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Heading3 Padding',
		dn: 'MD Heading3 Padding Default Design',
		n: 'mDHeading3PaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Heading4 Padding',
		dn: 'MD Heading4 Padding Default Design',
		n: 'mDHeading4PaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Heading5 Padding',
		dn: 'MD Heading5 Padding Default Design',
		n: 'mDHeading5PaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Heading6 Padding',
		dn: 'MD Heading6 Padding Default Design',
		n: 'mDHeading6PaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Paragraph Padding',
		dn: 'MD Paragraph Padding Default Design',
		n: 'mDParagraphPaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Link Padding',
		dn: 'MD Link Padding Default Design',
		n: 'mDLinkPaddingDefaultDesign',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown ._markdown ._a',
		np: true,
	},

	{
		gn: 'MD Heading1 Margin',
		dn: 'MD Heading1 Margin Default Design',
		n: 'mDHeading1MarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Heading2 Margin',
		dn: 'MD Heading2 Margin Default Design',
		n: 'mDHeading2MarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Heading3 Margin',
		dn: 'MD Heading3 Margin Default Design',
		n: 'mDHeading3MarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Heading4 Margin',
		dn: 'MD Heading4 Margin Default Design',
		n: 'mDHeading4MarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Heading5 Margin',
		dn: 'MD Heading5 Margin Default Design',
		n: 'mDHeading5MarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Heading6 Margin',
		dn: 'MD Heading6 Margin Default Design',
		n: 'mDHeading6MarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Paragraph Margin',
		dn: 'MD Paragraph Margin Default Design',
		n: 'mDParagraphMarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Link Margin',
		dn: 'MD Link Margin Default Design',
		n: 'mDLinkMarginDefaultDesign',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown ._markdown ._a',
		np: true,
	},

	{
		gn: 'MD Heading1 Text Decoration',
		dn: 'MD Heading1 Text Decoration Default Design',
		n: 'mDHeading1TextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Heading2 Text Decoration',
		dn: 'MD Heading2 Text Decoration Default Design',
		n: 'mDHeading2TextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Heading3 Text Decoration',
		dn: 'MD Heading3 Text Decoration Default Design',
		n: 'mDHeading3TextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Heading4 Text Decoration',
		dn: 'MD Heading4 Text Decoration Default Design',
		n: 'mDHeading4TextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Heading5 Text Decoration',
		dn: 'MD Heading5 Text Decoration Default Design',
		n: 'mDHeading5TextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Heading6 Text Decoration',
		dn: 'MD Heading6 Text Decoration Default Design',
		n: 'mDHeading6TextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Paragraph Text Decoration',
		dn: 'MD Paragraph Text Decoration Default Design',
		n: 'mDParagraphTextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Link Text Decoration',
		dn: 'MD Link Text Decoration Default Design',
		n: 'mDLinkTextDecorationDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._a',
		np: true,
	},

	{
		gn: 'MD Heading1 Color',
		dn: 'MD Heading1 Color Default Design',
		n: 'mDHeading1ColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Heading2 Color',
		dn: 'MD Heading2 Color Default Design',
		n: 'mDHeading2ColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Heading3 Color',
		dn: 'MD Heading3 Color Default Design',
		n: 'mDHeading3ColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Heading4 Color',
		dn: 'MD Heading4 Color Default Design',
		n: 'mDHeading4ColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Heading5 Color',
		dn: 'MD Heading5 Color Default Design',
		n: 'mDHeading5ColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Heading6 Color',
		dn: 'MD Heading6 Color Default Design',
		n: 'mDHeading6ColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Paragraph Color',
		dn: 'MD Paragraph Color Default Design',
		n: 'mDParagraphColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Link Color',
		dn: 'MD Link Color Default Design',
		n: 'mDLinkColorDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._a',
		np: true,
	},
	{
		gn: 'MD Link Color On Visited',
		dn: 'MD Link Color On Visited Default Design',
		n: 'mDLinkColorOnVisitedDefaultDesign',
		cp: 'color',
		sel: '.comp.compText._textMarkdown ._markdown ._a:visited',
		np: true,
	},
	{
		gn: 'MD Link Decoration Color ',
		dn: 'MD Link Decoration Color  Default Design',
		n: 'mDLinkDecorationColorDefaultDesign',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown ._markdown ._a:visited',
		np: true,
	},
	{
		gn: 'MD Link Color On Hover',
		dn: 'MD Link Color On Hover Default Design',
		n: 'mDLinkColorOnHoverDefaultDesign',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown ._markdown ._a:hover',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN Primary Font',
		n: 'spanPrimaryFont',
		cp: 'font',
		sel: '.comp.compText.span._primaryText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN SubText Font',
		n: 'spanSubTextFont',
		cp: 'font',
		sel: '.comp.compText.span._subText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LabelText Font',
		n: 'spanLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.span._labelText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ParagraphText Font',
		n: 'spanParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.span._paragraphText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightPrimaryText Font',
		n: 'spanLightPrimaryTextFont',
		cp: 'font',
		sel: '.comp.compText.span._lightPrimaryText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightSubText Font',
		n: 'spanLightSubTextFont',
		cp: 'font',
		sel: '.comp.compText.span._lightSubText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightLabelText Font',
		n: 'spanLightLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.span._lightLabelText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightParagraphText Font',
		n: 'spanLightParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.span._lightParagraphText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText1Font',
		n: 'spanColoredText1Font',
		cp: 'font',
		sel: '.comp.compText.span._coloredText1',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText2Font',
		n: 'spanColoredText2Font',
		cp: 'font',
		sel: '.comp.compText.span._coloredText2',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText3Font',
		n: 'spanColoredText3Font',
		cp: 'font',
		sel: '.comp.compText.span._coloredText3',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText4Font',
		n: 'spanColoredText4Font',
		cp: 'font',
		sel: '.comp.compText.span._coloredText4',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText5Font',
		n: 'spanColoredText5Font',
		cp: 'font',
		sel: '.comp.compText.span._coloredText5',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Font',
		n: 'h1TextFont',
		dv: 'bold <quinaryFont>',
		cp: 'font',
		sel: '.comp.compText.h1',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Primary  Font',
		n: 'h1PrimaryFont',
		cp: 'font',
		sel: '.comp.compText.h1._primaryText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 SubText Font',
		n: 'h1SubTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._subText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LabelText Font',
		n: 'h1LabelTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._labelText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ParagraphText Font',
		n: 'h1ParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._paragraphText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightPrimaryText Font',
		n: 'h1LightPrimaryTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._lightPrimaryText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightSubText Font',
		n: 'h1LightSubTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._lightSubText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightLabelText Font',
		n: 'h1LightLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._lightLabelText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightParagraphText Font',
		n: 'h1LightParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.h1._lightParagraphText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText1Font',
		n: 'h1ColoredText1Font',
		cp: 'font',
		sel: '.comp.compText.h1._coloredText1',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText2Font',
		n: 'h1ColoredText2Font',
		cp: 'font',
		sel: '.comp.compText.h1._coloredText2',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText3Font',
		n: 'h1ColoredText3Font',
		cp: 'font',
		sel: '.comp.compText.h1._coloredText3',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText4Font',
		n: 'h1ColoredText4Font',
		cp: 'font',
		sel: '.comp.compText.h1._coloredText4',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText5Font',
		n: 'h1ColoredText5Font',
		cp: 'font',
		sel: '.comp.compText.h1._coloredText5',
		np: true,
	},

	{
		gn: 'H2',
		dn: 'H2 Font',
		n: 'h2TextFont',
		dv: '<quinaryFont>',
		cp: 'font',
		sel: '.comp.compText.h2',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 Primary  Font',
		n: 'h2PrimaryFont',
		cp: 'font',
		sel: '.comp.compText.h2._primaryText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 SubText Font',
		n: 'h2SubTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._subText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LabelText Font',
		n: 'h2LabelTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._labelText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ParagraphText Font',
		n: 'h2ParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._paragraphText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightPrimaryText Font',
		n: 'h2LightPrimaryTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._lightPrimaryText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightSubText Font',
		n: 'h2LightSubTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._lightSubText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightLabelText Font',
		n: 'h2LightLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._lightLabelText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightParagraphText Font',
		n: 'h2LightParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.h2._lightParagraphText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText1Font',
		n: 'h2ColoredText1Font',
		cp: 'font',
		sel: '.comp.compText.h2._coloredText1',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText2Font',
		n: 'h2ColoredText2Font',
		cp: 'font',
		sel: '.comp.compText.h2._coloredText2',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText3Font',
		n: 'h2ColoredText3Font',
		cp: 'font',
		sel: '.comp.compText.h2._coloredText3',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText4Font',
		n: 'h2ColoredText4Font',
		cp: 'font',
		sel: '.comp.compText.h2._coloredText4',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText5Font',
		n: 'h2ColoredText5Font',
		cp: 'font',
		sel: '.comp.compText.h2._coloredText5',
		np: true,
	},

	{
		gn: 'H3',
		dn: 'H3 Font',
		n: 'h3TextFont',
		dv: 'bold <secondaryFont>',
		cp: 'font',
		sel: '.comp.compText.h3',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 Primary  Font',
		n: 'h3PrimaryFont',
		cp: 'font',
		sel: '.comp.compText.h3._primaryText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 SubText Font',
		n: 'h3SubTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._subText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LabelText Font',
		n: 'h3LabelTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._labelText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ParagraphText Font',
		n: 'h3ParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._paragraphText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightPrimaryText Font',
		n: 'h3LightPrimaryTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._lightPrimaryText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightSubText Font',
		n: 'h3LightSubTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._lightSubText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightLabelText Font',
		n: 'h3LightLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._lightLabelText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightParagraphText Font',
		n: 'h3LightParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.h3._lightParagraphText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText1Font',
		n: 'h3ColoredText1Font',
		cp: 'font',
		sel: '.comp.compText.h3._coloredText1',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText2Font',
		n: 'h3ColoredText2Font',
		cp: 'font',
		sel: '.comp.compText.h3._coloredText2',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText3Font',
		n: 'h3ColoredText3Font',
		cp: 'font',
		sel: '.comp.compText.h3._coloredText3',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText4Font',
		n: 'h3ColoredText4Font',
		cp: 'font',
		sel: '.comp.compText.h3._coloredText4',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText5Font',
		n: 'h3ColoredText5Font',
		cp: 'font',
		sel: '.comp.compText.h3._coloredText5',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN Color',
		n: 'spanTextColor',
		dv: '<primaryColor>',
		cp: 'color',
		sel: '.comp.compText.span',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN Primary  Color',
		n: 'spanPrimaryColor',
		cp: 'color',
		sel: '.comp.compText.span._primaryText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN SubText Color',
		n: 'spanSubTextColor',
		cp: 'color',
		sel: '.comp.compText.span._subText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LabelText Color',
		n: 'spanLabelTextColor',
		cp: 'color',
		sel: '.comp.compText.span._labelText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ParagraphText Color',
		n: 'spanParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.span._paragraphText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightPrimaryText Color',
		n: 'spanLightPrimaryTextColor',
		cp: 'color',
		sel: '.comp.compText.span._lightPrimaryText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightSubText Color',
		n: 'spanLightSubTextColor',
		cp: 'color',
		sel: '.comp.compText.span._lightSubText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightLabelText Color',
		n: 'spanLightLabelTextColor',
		cp: 'color',
		sel: '.comp.compText.span._lightLabelText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN LightParagraphText Color',
		n: 'spanLightParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.span._lightParagraphText',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText1',
		n: 'spanColoredText1',
		cp: 'color',
		sel: '.comp.compText.span._coloredText1',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText2',
		n: 'spanColoredText2',
		cp: 'color',
		sel: '.comp.compText.span._coloredText2',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText3',
		n: 'spanColoredText3',
		cp: 'color',
		sel: '.comp.compText.span._coloredText3',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText4',
		n: 'spanColoredText4',
		cp: 'color',
		sel: '.comp.compText.span._coloredText4',
		np: true,
	},
	{
		gn: 'SPAN',
		dn: 'SPAN ColoredText5',
		n: 'spanColoredText5',
		cp: 'color',
		sel: '.comp.compText.span._coloredText5',
		np: true,
	},

	{
		gn: 'H1',
		dn: 'H1 Color',
		n: 'h1TextColor',
		dv: 'bold <quinaryColor>',
		cp: 'color',
		sel: '.comp.compText.h1',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 Primary  Color',
		n: 'h1PrimaryColor',
		cp: 'color',
		sel: '.comp.compText.h1._primaryText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 SubText Color',
		n: 'h1SubTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._subText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LabelText Color',
		n: 'h1LabelTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._labelText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ParagraphText Color',
		n: 'h1ParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._paragraphText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightPrimaryText Color',
		n: 'h1LightPrimaryTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._lightPrimaryText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightSubText Color',
		n: 'h1LightSubTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._lightSubText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightLabelText Color',
		n: 'h1LightLabelTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._lightLabelText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 LightParagraphText Color',
		n: 'h1LightParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.h1._lightParagraphText',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText1',
		n: 'h1ColoredText1',
		cp: 'color',
		sel: '.comp.compText.h1._coloredText1',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText2',
		n: 'h1ColoredText2',
		cp: 'color',
		sel: '.comp.compText.h1._coloredText2',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText3',
		n: 'h1ColoredText3',
		cp: 'color',
		sel: '.comp.compText.h1._coloredText3',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText4',
		n: 'h1ColoredText4',
		cp: 'color',
		sel: '.comp.compText.h1._coloredText4',
		np: true,
	},
	{
		gn: 'H1',
		dn: 'H1 ColoredText5',
		n: 'h1ColoredText5',
		cp: 'color',
		sel: '.comp.compText.h1._coloredText5',
		np: true,
	},

	{
		gn: 'H2',
		dn: 'H2 Color',
		n: 'h2TextColor',
		dv: '<quinaryColor>',
		cp: 'color',
		sel: '.comp.compText.h2',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 Primary  Color',
		n: 'h2PrimaryColor',
		cp: 'color',
		sel: '.comp.compText.h2._primaryText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 SubText Color',
		n: 'h2SubTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._subText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LabelText Color',
		n: 'h2LabelTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._labelText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ParagraphText Color',
		n: 'h2ParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._paragraphText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightPrimaryText Color',
		n: 'h2LightPrimaryTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._lightPrimaryText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightSubText Color',
		n: 'h2LightSubTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._lightSubText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightLabelText Color',
		n: 'h2LightLabelTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._lightLabelText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 LightParagraphText Color',
		n: 'h2LightParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.h2._lightParagraphText',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText1',
		n: 'h2ColoredText1',
		cp: 'color',
		sel: '.comp.compText.h2._coloredText1',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText2',
		n: 'h2ColoredText2',
		cp: 'color',
		sel: '.comp.compText.h2._coloredText2',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText3',
		n: 'h2ColoredText3',
		cp: 'color',
		sel: '.comp.compText.h2._coloredText3',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText4',
		n: 'h2ColoredText4',
		cp: 'color',
		sel: '.comp.compText.h2._coloredText4',
		np: true,
	},
	{
		gn: 'H2',
		dn: 'H2 ColoredText5',
		n: 'h2ColoredText5',
		cp: 'color',
		sel: '.comp.compText.h2._coloredText5',
		np: true,
	},

	{
		gn: 'H3',
		dn: 'H3 Color',
		n: 'h3TextColor',
		dv: 'bold <secondaryColor>',
		cp: 'color',
		sel: '.comp.compText.h3',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 Primary  Color',
		n: 'h3PrimaryColor',
		cp: 'color',
		sel: '.comp.compText.h3._primaryText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 SubText Color',
		n: 'h3SubTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._subText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LabelText Color',
		n: 'h3LabelTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._labelText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ParagraphText Color',
		n: 'h3ParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._paragraphText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightPrimaryText Color',
		n: 'h3LightPrimaryTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._lightPrimaryText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightSubText Color',
		n: 'h3LightSubTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._lightSubText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightLabelText Color',
		n: 'h3LightLabelTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._lightLabelText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 LightParagraphText Color',
		n: 'h3LightParagraphTextColor',
		cp: 'color',
		sel: '.comp.compText.h3._lightParagraphText',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText1',
		n: 'h3ColoredText1',
		cp: 'color',
		sel: '.comp.compText.h3._coloredText1',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText2',
		n: 'h3ColoredText2',
		cp: 'color',
		sel: '.comp.compText.h3._coloredText2',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText3',
		n: 'h3ColoredText3',
		cp: 'color',
		sel: '.comp.compText.h3._coloredText3',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText4',
		n: 'h3ColoredText4',
		cp: 'color',
		sel: '.comp.compText.h3._coloredText4',
		np: true,
	},
	{
		gn: 'H3',
		dn: 'H3 ColoredText5',
		n: 'h3ColoredText5',
		cp: 'color',
		sel: '.comp.compText.h3._coloredText5',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Primary  Font',
		n: 'pPrimaryFont',
		cp: 'font',
		sel: '.comp.compText.p._primaryText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P SubText Font',
		n: 'pSubTextFont',
		cp: 'font',
		sel: '.comp.compText.p._subText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LabelText Font',
		n: 'pLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.p._labelText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ParagraphText Font',
		n: 'pParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.p._paragraphText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightPrimaryText Font',
		n: 'pLightPrimaryTextFont',
		cp: 'font',
		sel: '.comp.compText.p._lightPrimaryText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightSubText Font',
		n: 'pLightSubTextFont',
		cp: 'font',
		sel: '.comp.compText.p._lightSubText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightLabelText Font',
		n: 'pLightLabelTextFont',
		cp: 'font',
		sel: '.comp.compText.p._lightLabelText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightParagraphText Font',
		n: 'pLightParagraphTextFont',
		cp: 'font',
		sel: '.comp.compText.p._lightParagraphText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText1',
		n: 'pColoredText1',
		cp: 'font',
		sel: '.comp.compText.p._coloredText1',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText2',
		n: 'pColoredText2',
		cp: 'font',
		sel: '.comp.compText.p._coloredText2',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText3',
		n: 'pColoredText3',
		cp: 'font',
		sel: '.comp.compText.p._coloredText3',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText4',
		n: 'pColoredText4',
		cp: 'font',
		sel: '.comp.compText.p._coloredText4',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText5',
		n: 'pColoredText5',
		cp: 'font',
		sel: '.comp.compText.p._coloredText5',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Color',
		n: 'pTextColor',
		dv: '<primaryColor>',
		cp: 'Color',
		sel: '.comp.compText.p p',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P Primary  Color',
		n: 'pPrimaryColor',
		cp: 'Color',
		sel: '.comp.compText.p._primaryText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P SubText Color',
		n: 'pSubTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._subText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LabelText Color',
		n: 'pLabelTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._labelText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ParagraphText Color',
		n: 'pParagraphTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._paragraphText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightPrimaryText Color',
		n: 'pLightPrimaryTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._lightPrimaryText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightSubText Color',
		n: 'pLightSubTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._lightSubText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightLabelText Color',
		n: 'pLightLabelTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._lightLabelText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P LightParagraphText Color',
		n: 'pLightParagraphTextColor',
		cp: 'Color',
		sel: '.comp.compText.p._lightParagraphText',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText1',
		n: 'pColoredText1',
		cp: 'Color',
		sel: '.comp.compText.p._coloredText1',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText2',
		n: 'pColoredText2',
		cp: 'Color',
		sel: '.comp.compText.p._coloredText2',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText3',
		n: 'pColoredText3',
		cp: 'Color',
		sel: '.comp.compText.p._coloredText3',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText4',
		n: 'pColoredText4',
		cp: 'Color',
		sel: '.comp.compText.p._coloredText4',
		np: true,
	},
	{
		gn: 'P',
		dn: 'P ColoredText5',
		n: 'pColoredText5',
		cp: 'Color',
		sel: '.comp.compText.p._coloredText5',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
