import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'Tag border radius',
		cssProperty: 'border-radius',
		displayName: 'border radius of the Tag',
		description: "The Tag's border radius.",
		defaultValue: '2px',
		selector: '.container',
	},
	{
		name: 'Tag border color',
		cssProperty: 'border-color',
		displayName: 'border color of the Tag',
		description: "The Tag's border color.",
		defaultValue: '#c7c8d6',
		selector: '.container',
	},
	{
		name: 'Tag border style',
		cssProperty: 'border-style',
		displayName: 'border style of the Tag',
		description: "The Tag's border style.",
		defaultValue: 'solid',
		selector: '.container',
	},
	{
		name: 'Tag height',
		cssProperty: 'height',
		displayName: 'height style of the Tag',
		description: "The Tag's height.",
		defaultValue: '32px',
		selector: '.container',
	},
	{
		name: 'Tag background color',
		cssProperty: 'background-color',
		displayName: 'background color of the Tag',
		description: "The Tag's background color.",
		defaultValue: '',
		selector: '.container',
	},
	{
		name: 'font size',
		cssProperty: 'font-size',
		displayName: 'font size of the Tag',
		description: "The Tag's label font size.",
		selector: '.iconCss',
	},
	{
		name: 'icon color',
		cssProperty: 'color',
		displayName: 'icon color of the Tag',
		description: "The Tag's icon color.",
		selector: '.iconCss',
	},
	{
		name: 'close icon color',
		cssProperty: 'color',
		displayName: 'close icon color of the Tag',
		description: "The Tag's close icon color.",
		selector: '.closeButton',
	},
	{
		name: 'close icon font size',
		cssProperty: 'font-size',
		displayName: 'close icon font size of the Tag',
		description: "The Tag's icon font size of close icon.",
		selector: '.closeButton',
	},
	{
		name: 'label font size',
		cssProperty: 'font-size',
		displayName: 'lablefont size of the Tag',
		description: "The Tag's label font size of close icon.",
		selector: '.text',
	},
	{
		name: 'label color',
		cssProperty: 'color',
		displayName: 'label color',
		description: "The Tag's label label color.",
		selector: '.text',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
