import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
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
		groupName: 'MD Link Padding',
		displayName: 'MD Link Padding Default Design',
		name: 'mDLinkPaddingDefaultDesign',
		defaultValue: '0',
		cssProperty: 'padding',
		selector: '.comp.compText._markdown a, ._markDownContent a',
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
		groupName: 'MD Link Text Decoration',
		displayName: 'MD Link Text Decoration Default Design',
		name: 'mDLinkTextDecorationDefaultDesign',
		defaultValue: 'none',
		cssProperty: 'text-decoration',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Color',
		displayName: 'MD Link Color Default Design',
		name: 'mDLinkColorDefaultDesign',
		defaultValue: '<colorOne>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown a, ._markDownContent a',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Color On Visited',
		displayName: 'MD Link Color On Visited Default Design',
		name: 'mDLinkColorOnVisitedDefaultDesign',
		defaultValue: '<colorSix>',
		cssProperty: 'color',
		selector: '.comp.compText._markdown a:visited, ._markDownContent a:visited',
		noPrefix: true,
	},
	{
		groupName: 'MD Link Decoration Color',
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
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
