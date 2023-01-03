import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'tagBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'border radius of the Tag',
		description: "The Tag's border radius.",
		defaultValue: '2px',
		selector: '.container',
	},
	{
		name: 'tagBorderColor',
		cssProperty: 'border-color',
		displayName: 'border color of the Tag',
		description: "The Tag's border color.",
		defaultValue: '#c7c8d6',
		selector: '.container',
	},
	{
		name: 'tagBorderStyle',
		cssProperty: 'border-style',
		displayName: 'border style of the Tag',
		description: "The Tag's border style.",
		defaultValue: 'solid',
		selector: '.container',
	},
	{
		name: 'tagHeight',
		cssProperty: 'height',
		displayName: 'height style of the Tag',
		description: "The Tag's height.",
		defaultValue: '32px',
		selector: '.container',
	},
	{
		name: 'tagBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'background color of the Tag',
		description: "The Tag's background color.",
		selector: '.container',
	},
	{
		name: 'tagFontSize',
		cssProperty: 'font-size',
		displayName: 'Tag font size',
		description: "The Tag's label font size.",
		selector: '.iconCss',
	},
	{
		name: 'tagIconColor',
		cssProperty: 'color',
		displayName: 'icon color of the Tag',
		description: "The Tag's icon color.",
		selector: '.iconCss',
	},
	{
		name: 'closeIconColor',
		cssProperty: 'color',
		displayName: 'close icon color of the Tag',
		description: "The Tag's close icon color.",
		selector: '.closeButton',
	},
	{
		name: 'closeIconSize',
		cssProperty: 'font-size',
		displayName: 'Close icon size',
		description: "The Tag's size of close icon.",
		selector: '.closeButton',
	},
	{
		name: 'labelFontSize',
		cssProperty: 'font-size',
		displayName: 'Label font size',
		description: 'Label font size.',
		selector: '.text',
	},
	{
		name: 'iconSize',
		cssProperty: 'font-size',
		displayName: "Icon's size",
		description: 'The size of icon.',
		selector: '.iconCss',
	},
	{
		name: 'label color',
		cssProperty: 'color',
		displayName: 'Label color',
		description: "The Tag's label label color.",
		selector: '.text',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
