import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'menuColor',
		cssProperty: 'color',
		displayName: 'Menu Color',
		description: 'The color of the menu',
		defaultValue: '<lightFontColor>',
		selector: ' ',
	},
	{
		name: 'menuHoverColor',
		cssProperty: 'color',
		displayName: 'Hover Color',
		description: 'The color of the menu when hovered',
		defaultValue: '<contrastBrightColor>',
		noPrefix: true,
		selector:
			'.comp.compMenu:hover, .comp.compMenu:visited:hover, .comp.compMenu._isActive, .comp.compMenu._isActive:visited',
	},
	{
		name: 'menuVisitedColor',
		cssProperty: 'color',
		displayName: 'Visited Color',
		description: 'The color of the menu after visited',
		defaultValue: '<mainFontColor>',
		noPrefix: true,
		selector: '.comp.compMenu:visited',
	},
	{
		name: 'menuTextDecoration',
		cssProperty: 'text-decoration',
		displayName: 'Text Decoration',
		description: 'Text decroation of the menu',
		defaultValue: 'none',
		selector: ' ',
	},
	{
		name: 'menuTextDecorationOnHover',
		cssProperty: 'text-decoration',
		displayName: 'Hover text decoration',
		description: 'Text decroation of the menu when hovered',
		defaultValue: 'none',
		noPrefix: true,
		selector: '.comp.compMenu:hover, .comp.compMenu._isActive',
	},
	{
		name: 'menuFont',
		cssProperty: 'font',
		displayName: 'Font',
		description: 'Font of the menu',
		defaultValue: '14px <mainFontFamily>',
		selector: ' ',
	},
	{
		name: 'menuFontOnHover',
		cssProperty: 'font',
		displayName: 'Font',
		description: 'Font of the menu',
		defaultValue: '14px <mainFontFamily>',
		noPrefix: true,
		selector: '.comp.compMenu:hover, .comp.compMenu._isActive',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
