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
		name: 'Modal border radius',
		cssProperty: 'border-radius',
		displayName: "Modal's border radius",
		description: 'The border-radius of the Modal.',
		defaultValue: '3px',
		selector: '.modal',
	},
	{
		name: 'Modal min-width',
		cssProperty: 'min-width',
		displayName: "Modal's min width",
		description: 'The min-width of the Modal.',
		defaultValue: '50px',
		selector: '.modal',
	},
	{
		name: 'Modal max-width',
		cssProperty: 'max-width',
		displayName: "Modal's max-width",
		description: 'The max-width of the Modal.',
		defaultValue: '80%',
		selector: '.modal',
	},
	{
		name: 'Modal min-height',
		cssProperty: 'min-height',
		displayName: "Modal's min-height",
		description: 'The min-height of the Modal.',
		defaultValue: '50px',
		selector: '.modal',
	},
	{
		name: 'modalMaxHeight',
		cssProperty: 'max-height',
		displayName: "Modal's max-height",
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
	{
		name: 'modalPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Padding top',
		description: 'The padding top of the modal.',
		defaultValue: '5px',
		selector: '.modal',
	},
	{
		name: 'modalPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Padding right',
		description: 'The padding right of the modal.',
		defaultValue: '20px',
		selector: '.modal',
	},
	{
		name: 'modalPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Padding bottom',
		description: 'The padding bottom of the modal.',
		defaultValue: '20px',
		selector: '.modal',
	},
	{
		name: 'modalPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Padding left',
		description: 'The padding left of the modal.',
		defaultValue: '20px',
		selector: '.modal',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
