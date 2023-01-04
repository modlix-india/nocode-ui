import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'menuMinWidth',
		cssProperty: 'min-width',
		displayName: "Menu's minimum width",
		description: "Menu's minimum width.",
		defaultValue: '200px',
		selector: '.menu',
	},
	{
		name: 'menuMaxWidth',
		cssProperty: 'max-width',
		displayName: "Menu's maximum width",
		description: "Menu's maximum width.",
		defaultValue: '250px',
		selector: '.menu',
	},
	{
		name: 'menuHeight',
		cssProperty: 'height',
		displayName: "Menu's height",
		description: "Menu's height.",
		defaultValue: '60px',
		selector: '.menu',
	},
	{
		name: 'menuBgColor',
		cssProperty: 'background-color',
		displayName: "Menu's background color",
		description: "Menu's background color.",
		defaultValue: '#212B35',
		selector: '.menu',
	},
	{
		name: 'menuBgColorHover',
		cssProperty: 'background-color',
		displayName: "Menu's background color",
		description: "Menu's background color.",
		defaultValue: '#8790aa',
		selector: '.menu:hover',
	},
	{
		name: 'menuTextColor',
		cssProperty: 'color',
		displayName: "Menu's text color",
		description: "Menu's text color.",
		defaultValue: '#DCDCDC',
		selector: '.menuText',
	},
	{
		name: 'menuIconColor',
		cssProperty: 'color',
		displayName: "Menu's icon color",
		description: "Menu's icon color.",
		defaultValue: '#DCDCDC',
		selector: '.icon',
	},
	{
		name: 'menuCaretIconColor',
		cssProperty: 'color',
		displayName: "Menu's caret icon color",
		description: "Menu's caret icon color.",
		defaultValue: '#DCDCDC',
		selector: '.menuCaretIcon',
	},
	{
		name: 'menuSize',
		cssProperty: 'font-size',
		displayName: "Menu's size",
		description: "Menu's font size applied to icons and text.",
		defaultValue: '16px',
		selector: '.menu',
	},
	{
		name: 'menuActiveColor',
		cssProperty: 'color',
		displayName: "Menu's Active color",
		description: "Menu's color when the menu is activated.",
		selector: '.menu.isActive',
	},
	{
		name: 'menuActiveBgColor',
		cssProperty: 'background-color',
		displayName: "Menu's Active background color",
		description: "Menu's background color when the menu is activated.",
		defaultValue: '#FCF6E7',
		selector: '.menu.isActive',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
// #e5b122
