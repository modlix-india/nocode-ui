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
		name: 'tagBorder',
		cssProperty: 'border',
		displayName: 'Tag border',
		description: "The Tag's border.",
		defaultValue: '1px solid #c7c8d6',
		selector: '.container',
	},
	{
		name: 'tagBorderOnHover',
		cssProperty: 'border',
		displayName: 'Tag border - Hover',
		description: "The Tag's border color on hover.",
		selector: '.container:hover',
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
		name: 'tagBackgroundColorHover',
		cssProperty: 'background-color',
		displayName: 'Tag background color - Hover',
		description: "The Tag's background color on hover.",
		selector: '.container:hover',
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
		name: 'tagIconColorHover',
		cssProperty: 'color',
		displayName: 'Tag icon color - hover',
		description: "The Tag's icon color on hover.",
		selector: '.iconCss:hover',
	},
	{
		name: 'closeIconColor',
		cssProperty: 'color',
		displayName: 'close icon color of the Tag',
		description: "The Tag's close icon color.",
		selector: '.closeButton',
	},
	{
		name: 'closeIconColorHover',
		cssProperty: 'color',
		displayName: 'Tag close icon - hover',
		description: "The Tag's close icon color on hover.",
		selector: '.closeButton:hover',
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
		name: 'labelColor',
		cssProperty: 'color',
		displayName: 'Label color',
		description: "The Tag's label label color.",
		selector: '.text',
	},
	{
		name: 'labelColorHover',
		cssProperty: 'color',
		displayName: 'Label color - Hover',
		description: "The Tag's label label color on hover.",
		selector: '.text:hover',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
