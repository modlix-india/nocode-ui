import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'modalTitleColor',
		cssProperty: 'color',
		displayName: "Modal Title's Color",
		description: 'The color of the Modal Title.',
		defaultValue: '#000000',
		selector: '.modelTitleStyle',
	},
	{
		name: 'modalTitleFontSize',
		cssProperty: 'font-size',
		displayName: "Modal Title's font size",
		description: 'The font size of the Modal Title.',
		defaultValue: '18px',
		selector: '.modelTitleStyle',
	},
	{
		name: 'backdropFilter',
		displayName: 'backdrop filter',
		description: 'The backdrop filter of the Modal.',
		defaultValue: '1px',
	},
	{
		name: 'backgroundColor',
		cssProperty: 'background-color',
		displayName: 'background Color',
		description: 'The background color.',
		defaultValue: 'rgba(51, 51, 51, 0.3)',
		selector: '.backdrop',
	},
	{
		name: 'modalBackgroundColor',
		cssProperty: 'background-color',
		displayName: "Modal Title's background Color",
		description: 'The background color of the Modal.',
		defaultValue: '#000000',
		selector: '.modal',
	},
	{
		name: 'modalBorderRadius',
		cssProperty: 'border-radius',
		displayName: "Modal's border radius",
		description: 'The border-radius of the Modal.',
		defaultValue: '3px',
		selector: '.modal',
	},
	{
		name: 'modalMinWidth',
		cssProperty: 'min-width',
		displayName: "Modal's min width",
		description: 'The min-width of the Modal.',
		defaultValue: '50px',
		selector: '.modal',
	},
	{
		name: 'modalMaxWidth',
		cssProperty: 'max-width',
		displayName: "Modal's max-width",
		description: 'The max-width of the Modal.',
		defaultValue: '100%',
		selector: '.modal',
	},
	{
		name: 'modalMinHeight',
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
		defaultValue: '100%',
		selector: '.modal',
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
		name: 'modalPaddingWhenDesign1',
		cssProperty: 'padding',
		displayName: 'Padding',
		description: 'The padding of the modal for design 1.',
		defaultValue: '5px 20px 20px 20px',
		selector: '.modal',
	},
	{
		name: 'modalPaddingWhenDesign2',
		cssProperty: 'padding',
		displayName: 'Padding for design 2',
		description: 'The padding of the modal for design 2.',
		defaultValue: '0',
		selector: '.modal.design2',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
