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
		defaultValue: '<blackFontColor>',
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
		defaultValue: '<blackFontColor>',
		selector: '.progressValue',
	},

	// Design 1

	{
		groupName: 'Design1',
		displayName: 'Background Of Progress Completed',
		name: 'progressCompletedBackgroundOne',
		defaultValue: '<backgroundColorGradientEight>',
		description: 'Background Color For completed progress',
		cssProperty: 'background',
		selector: '.comp.compProgressBar._progressBarDesignOne .progressBar .progress',
		noPrefix: true,
	},
	{
		groupName: 'Design1',
		displayName: 'Background Of Progress Bar',
		name: 'progressBarBackgroundOne',
		defaultValue: '<fontColorNine>',
		description: 'Background Color For Progress bar',
		cssProperty: 'background-color',
		selector: '.comp.compProgressBar._progressBarDesignOne .progressBar',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
