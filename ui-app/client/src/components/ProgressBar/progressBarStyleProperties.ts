import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'ProgressBar Width',
		cssProperty: 'width',
		displayName: 'Progress Bar Width',
		description: 'Width of the Progress Bar.',
		defaultValue: '300px',
		selector: '.progressBar',
	},
	{
		name: 'ProgressBar Height',
		cssProperty: 'height',
		displayName: 'Progress Bar Height',
		description: 'Height of the Progress Bar.',
		defaultValue: '20px',
		selector: '.progressBar',
	},
	{
		name: 'ProgressBar Border',
		cssProperty: 'border',
		displayName: 'Progress Bar Border',
		description: 'Border of the Progress Bar.',
		defaultValue: '1px solid black',
		selector: '.progressBar',
	},
	{
		name: 'ProgressBar Border Radius',
		cssProperty: 'border-radius',
		displayName: 'Progress Bar Border Radius',
		description: 'Border Radius of the Progress Bar.',
		defaultValue: '20px',
		selector: '.progressBar',
	},
	{
		name: 'ProgressBar BackGround Color',
		cssProperty: 'background',
		displayName: 'Progress Bar BackGround Color',
		description: 'BackGround Color of the Progress Bar.',
		defaultValue: '<contrast-bright-color>',
		selector: '.progress',
	},
	{
		name: 'ProgressBar Padding',
		cssProperty: 'padding',
		displayName: 'Progress Bar Padding',
		description: 'Padding of the Progress Bar.',
		defaultValue: '0px',
		selector: '.progress',
	},
	{
		name: 'ProgressBar Value Font Size',
		cssProperty: 'font-size',
		displayName: 'Progress Bar Font Size',
		description: 'Font Size of the Progress Bar.',
		defaultValue: '10px',
		selector: '.progressValue',
	},
	{
		name: 'ProgressBar Value Font Color',
		cssProperty: 'color',
		displayName: 'Progress Bar Font Color',
		description: 'Font Color of the Progress Bar.',
		defaultValue: 'black',
		selector: '.progressValue',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
