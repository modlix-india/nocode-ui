import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'progressBarLabelFont',
		cssProperty: 'font-size',
		displayName: 'Progress Bar Label Font',
		description: 'Progress Bar Label Font.',
		defaultValue: '16px',
		selector: '.progressBarLabel',
	},
	{
		name: 'progressBarLabelColor',
		cssProperty: 'color',
		displayName: 'Progress Bar Label Color',
		description: 'Progress Bar Label Color.',
		defaultValue: '<black-font-color>',
		selector: '.progressBarLabel',
	},
	{
		name: 'progressBarWidth',
		cssProperty: 'width',
		displayName: 'Progress Bar Width',
		description: 'Width of the Progress Bar.',
		defaultValue: '300px',
		selector: '.progressBar',
	},
	{
		name: 'progressBarHeight',
		cssProperty: 'height',
		displayName: 'Progress Bar Height',
		description: 'Height of the Progress Bar.',
		defaultValue: '20px',
		selector: '.progressBar',
	},
	{
		name: 'progressBarBorder',
		cssProperty: 'border',
		displayName: 'Progress Bar Border',
		description: 'Border of the Progress Bar.',
		defaultValue: '1px solid black',
		selector: '.progressBar',
	},
	{
		name: 'progressBarBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'Progress Bar Border Radius',
		description: 'Border Radius of the Progress Bar.',
		defaultValue: '20px',
		selector: '.progressBar',
	},
	{
		name: 'progressBarBackGroundColor',
		cssProperty: 'background',
		displayName: 'Progress Bar BackGround Color',
		description: 'BackGround Color of the Progress Bar.',
		defaultValue: '<contrast-bright-color>',
		selector: '.progress',
	},
	{
		name: 'progressBarValueFontSize',
		cssProperty: 'font-size',
		displayName: 'Progress Bar Font Size',
		description: 'Font Size of the Progress Bar.',
		defaultValue: '10px',
		selector: '.progressValue',
	},
	{
		name: 'progressBarValueFontColor',
		cssProperty: 'color',
		displayName: 'Progress Bar Font Color',
		description: 'Font Color of the Progress Bar.',
		defaultValue: '<black-font-color>',
		selector: '.progressValue',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
