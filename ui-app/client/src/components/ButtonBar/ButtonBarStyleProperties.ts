import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';
export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'buttonCursor',
		cssProperty: 'cursor',
		displayName: "Button's cursor",
		description: 'Cursor to be used on hover',
		defaultValue: 'pointer',
		selector: '._button',
	},
	{
		name: 'buttonBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'Button border radius',
		description: 'Border radius of the button.',
		defaultValue: '',
		selector: '._button',
	},
	{
		name: 'buttonBorder',
		cssProperty: 'border',
		displayName: 'Button Border',
		description: 'Border of the button',
		defaultValue: 'none',
		selector: '._button',
	},
	{
		name: 'buttonHeight',
		cssProperty: 'height',
		displayName: 'Button Height',
		description: 'Height of a button',
		defaultValue: '48px',
		selector: '._button',
	},
	{
		name: 'buttonPadding',
		cssProperty: 'padding',
		displayName: 'Button Padding',
		description: 'Padding for button',
		defaultValue: '0 32px',
		selector: '._button',
	},
	{
		name: 'buttonBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Button background color',
		description: 'Background color for the button.',
		defaultValue: '',
		selector: '._button',
	},
	{
		name: 'SelectedbuttonBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Selected Button background color',
		description: 'Background color for the button when selected.',
		defaultValue: '<main-font-color>',
		selector: '._button._selected',
	},
	{
		name: 'SelectedbuttonTextColor',
		cssProperty: 'color',
		displayName: 'Selected Button text color',
		description: 'Text color for the button when selected.',
		defaultValue: '<light-font-color>',
		selector: '._button._selected',
	},
	{
		name: 'ButtonDisabledCursor',
		cssProperty: 'cursor',
		displayName: 'Disabled button cursor',
		description: 'Cursor of the button when disabled.',
		defaultValue: 'not-allowed',
		selector: '._button._disabled',
	},
];
export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
