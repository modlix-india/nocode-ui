import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [];

export const styleDefaults = new Map<string, string>();

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = [
	{
		gn: 'Text',
		dn: 'Text Font',
		n: 'textFont<textContainer><textColor>',
		cp: 'font',
		sel: '.comp.compText<textContainer><textColor>',
		np: true,
		spv: {
			'SPAN-': '<primaryFont>',
			'H1-': 'bold <quinaryFont>',
			'H2-': '<quinaryFont>',
			'H3-': 'bold <secondaryFont>',
			'H4-': '<secondaryFont>',
			'H5-': 'bold <tertiaryFont>',
			'H6-': '<tertiaryFont>',
			'I-': 'italic <primaryFont>',
			'P-': '<primaryFont>',
			'B-': 'bold <primaryFont>',
			'PRE-': '<primaryFont>',
		},
	},
	{
		gn: 'Text',
		dn: 'Text Padding',
		n: 'textPadding<textContainer><textColor>',
		cp: 'padding',
		sel: '.comp.compText<textContainer><textColor> ._textContainer',
		np: true,
		spv: {
			'SPAN-': '0',
			'H1-': '5px 0px',
			'H2-': '5px 0px',
			'H3-': '5px 0px',
			'H4-': '5px 0px',
			'H5-': '5px 0px',
			'H6-': '5px 0px',
			'I-': '0',
			'P-': '0',
			'B-': '0',
			'PRE-': '0',
		},
	},
	{
		gn: 'Text',
		dn: 'Text Margin',
		n: 'textMargin<textContainer><textColor>',
		cp: 'margin',
		sel: '.comp.compText<textContainer><textColor> ._textContainer',
		np: true,
		spv: {
			'SPAN-': '0',
			'H1-': '5px 0px',
			'H2-': '4px 0px',
			'H3-': '3px 0px',
			'H4-': '2px 0px',
			'H5-': '1px 0px',
			'H6-': '1px 0px',
			'I-': '0',
			'P-': '0',
			'B-': '0',
			'PRE-': '0',
		},
	},
	{
		gn: 'Text',
		dn: 'Text Decoration',
		n: 'textDecoration<textContainer><textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText<textContainer><textColor>',
		np: true,
		spv: {},
	},
	{
		gn: 'Text',
		dn: 'Color',
		n: 'textColor<textContainer><textColor>',
		cp: 'color',
		sel: '.comp.compText<textContainer><textColor>',
		np: true,
		spv: {
			'-_primaryText': '<fontColorOne>',
			'-_subText': '<fontColorTwo>',
			'-_labelText': '<fontColorThree>',
			'-_paragraphText': '<fontColorFour>',
			'-_lightPrimaryText': '<fontColorFive>',
			'-_lightSubText': '<fontColorSix>',
			'-_lightLabelText': '<fontColorSeven>',
			'-_lightParagraphText': '<fontColorEight>',
			'-_coloredText1': '<colorFifteen>',
			'-_coloredText2': '<colorTen>',
			'-_coloredText3': '<colorEleven>',
			'-_coloredText4': '<colorFourteen>',
			'-_coloredText5': '<colorTwelve>',
		},
	},

	{
		gn: 'MD Font',
		dn: 'MD Heading1 Font',
		n: 'mDHeading1Font<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading2 Font',
		n: 'mDHeading2Font<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading3 Font',
		n: 'mDHeading3Font<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading4 Font',
		n: 'mDHeading4Font<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading5 Font',
		n: 'mDHeading5Font<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading6 Font',
		n: 'mDHeading6Font<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Paragraph Font',
		n: 'mDParagraphFont<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Link Font',
		n: 'mDLinkFont<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links, .comp.compText._textMarkdown<textColor> ._markdown ._links:visited',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Link Hover Font',
		n: 'mDLinkHoverFont<textColor>',
		cp: 'font',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:hover',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Heading1 Padding',
		n: 'mdHeading1Padding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Heading2 Padding',
		n: 'mdHeading2Padding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Heading3 Padding',
		n: 'mdHeading3Padding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Heading4 Padding',
		n: 'mdHeading4Padding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Heading5 Padding',
		n: 'mdHeading5Padding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Heading6 Padding',
		n: 'mdHeading6Padding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Paragraph Padding',
		n: 'mdParagraphPadding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Padding',
		dn: 'MD Link Padding',
		n: 'mdLinkPadding<textColor>',
		cp: 'padding',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links',
		np: true,
	},

	{
		gn: 'MD Margin',
		dn: 'MD Heading1 Margin',
		n: 'mdHeading1Margin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Heading2 Margin',
		n: 'mdHeading2Margin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Heading3 Margin',
		n: 'mdHeading3Margin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Heading4 Margin',
		n: 'mdHeading4Margin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Heading5 Margin',
		n: 'mdHeading5Margin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Heading6 Margin',
		n: 'mdHeading6Margin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Paragraph Margin',
		n: 'mdParagraphMargin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Margin',
		dn: 'MD Link Margin',
		n: 'mdLinkMargin<textColor>',
		cp: 'margin',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links',
		np: true,
	},

	{
		gn: 'MD Decoration',
		dn: 'MD Heading1 Text Decoration',
		n: 'mdHeading1TextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading2 Text Decoration',
		n: 'mdHeading2TextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading3 Text Decoration',
		n: 'mdHeading3TextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading4 Text Decoration',
		n: 'mdHeading4TextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading5 Text Decoration',
		n: 'mdHeading5TextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading6 Text Decoration',
		n: 'mdHeading6TextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Paragraph Text Decoration',
		n: 'mdParagraphTextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Link Text Decoration',
		n: 'mdLinkTextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Link Hover Text Decoration',
		n: 'mdLinkHoverTextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:hover',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Link Visited Text Decoration',
		n: 'mdLinkVisitedTextDecoration<textColor>',
		cp: 'text-decoration',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:visited',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading1 Color',
		n: 'mDHeading1Color<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading2 Color',
		n: 'mDHeading2Color<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading3 Color',
		n: 'mDHeading3Color<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading4 Color',
		n: 'mDHeading4Color<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading5 Color',
		n: 'mDHeading5Color<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Heading6 Color',
		n: 'mDHeading6Color<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Paragraph Color',
		n: 'mDParagraphColor<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Link Color',
		n: 'mDLinkColor<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Link Hover Color',
		n: 'mDLinkHoverColor<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:hover',
		np: true,
	},
	{
		gn: 'MD Font',
		dn: 'MD Link Visited Color',
		n: 'mDLinkVisitedColor<textColor>',
		cp: 'color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:visited',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading1 Text Decoration Color',
		n: 'mdHeading1TextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h1',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading2 Text Decoration Color',
		n: 'mdHeading2TextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h2',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading3 Text Decoration Color',
		n: 'mdHeading3TextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h3',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading4 Text Decoration Color',
		n: 'mdHeading4TextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h4',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading5 Text Decoration Color',
		n: 'mdHeading5TextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h5',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Heading6 Text Decoration Color',
		n: 'mdHeading6TextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._h6',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Paragraph Text Decoration Color',
		n: 'mdParagraphTextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._p',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Link Text Decoration Color',
		n: 'mdLinkTextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Link Hover Text Decoration Color',
		n: 'mdLinkHoverTextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:hover',
		np: true,
	},
	{
		gn: 'MD Decoration',
		dn: 'MD Link Visited Text Decoration Color',
		n: 'mdLinkVisitedTextDecorationColor<textColor>',
		cp: 'text-decoration-color',
		sel: '.comp.compText._textMarkdown<textColor> ._markdown ._links:visited',
		np: true,
	},
];
