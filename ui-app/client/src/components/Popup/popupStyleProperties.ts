import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'Modal TitleColor',
		cssProperty: 'color',
		displayName: "Modal Title's Color",
		description: 'The color of the Modal Title.',
		defaultValue: '#000000',
		selector: '.modelTitleStyle',
	},
	{
		name: 'Modal Title font size',
		cssProperty: 'font-size',
		displayName: "Modal Title's font size",
		description: 'The font size of the Modal Title.',
		defaultValue: '18px',
		selector: '.modelTitleStyle',
	},
	{
		name: 'Modal background Color',
		cssProperty: 'background-color',
		displayName: "Modal Title's background Color",
		description: 'The background color of the Modal.',
		defaultValue: '#000000',
		selector: '.modal',
	},
	{
		name: 'Modal background Color',
		cssProperty: 'border-radius',
		displayName: "Modal's border radius",
		description: 'The border-radius of the Modal.',
		defaultValue: '3px',
		selector: '.modal',
	},
	{
		name: 'Modal width',
		cssProperty: 'min-width',
		displayName: 'Modal width',
		description: 'The min-width of the Modal.',
		defaultValue: '50px',
		selector: '.modal',
	},
	{
		name: 'Modal min-width',
		cssProperty: 'max-width',
		displayName: 'Modal min-width',
		description: 'The max-width of the Modal.',
		defaultValue: '80%',
		selector: '.modal',
	},
	{
		name: 'Modal min-height',
		cssProperty: 'min-height',
		displayName: 'Modal min-height',
		description: 'The min-height of the Modal.',
		defaultValue: '50px',
		selector: '.modal',
	},
	{
		name: 'modalMaxHeight',
		cssProperty: 'max-height',
		displayName: 'Modal max-height',
		description: 'The max-height of the Modal.',
		defaultValue: '80%',
		selector: '.modal',
	},

	{
		name: 'backdropFilter',
		displayName: 'backdrop filter',
		description: 'The backdrop filter of the Modal.',
		defaultValue: '1px',
	},
	{
		name: 'background Color',
		cssProperty: 'background-color',
		displayName: 'background Color',
		description: 'The background color.',
		defaultValue: 'rgba(51, 51, 51, 0.3)',
		selector: '.backdrop',
	},
	{
		name: 'boxShadow',
		cssProperty: 'box-shadow',
		displayName: 'boxShadow Color',
		description: 'The boxShadow color.',
		defaultValue: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
		selector: '.modal',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
