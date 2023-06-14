import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'linkColor',
		cssProperty: 'color',
		displayName: 'Link Color',
		description: 'The color of the link',
		defaultValue: '<mainFontColor>',
		selector: ' ',
	},
	{
		name: 'linkHoverColor',
		cssProperty: 'color',
		displayName: 'Hover Color',
		description: 'The color of the link when hovered',
		defaultValue: '<contrastBrightColor>',
		noPrefix: true,
		selector: '.comp.compLink:hover, .comp.compLink:visited:hover',
	},
	{
		name: 'linkVisitedColor',
		cssProperty: 'color',
		displayName: 'Visited Color',
		description: 'The color of the link after visited',
		defaultValue: '<mainFontColor>',
		noPrefix: true,
		selector: '.comp.compLink:visited',
	},
	{
		name: 'linkTextDecoration',
		cssProperty: 'text-decoration',
		displayName: 'Text Decoration',
		description: 'Text decroation of the link',
		defaultValue: 'underline',
		selector: ' ',
	},
	{
		name: 'linkTextDecorationOnHover',
		cssProperty: 'text-decoration',
		displayName: 'Hover text decoration',
		description: 'Text decroation of the link when hovered',
		defaultValue: 'underline',
		noPrefix: true,
		selector: '.comp.compLink:hover',
	},
	{
		name: 'linkFont',
		cssProperty: 'font',
		displayName: 'Font',
		description: 'Font of the link',
		defaultValue: '14px <mainFontFamily>',
		selector: ' ',
	},
	{
		name: 'linkFontOnHover',
		cssProperty: 'font',
		displayName: 'Font',
		description: 'Font of the link',
		defaultValue: '14px <mainFontFamily>',
		noPrefix: true,
		selector: '.comp.compLink:hover',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
