import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/style';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'fabButtonColor',
		cssProperty: 'background-color',
		displayName: "Fab Button's Color",
		description: 'The color of the Fab Button.',
		defaultValue: '<primary-color>',
		selector: '.fabButton',
	},
	{
		name: 'fabButtonIconColor',
		cssProperty: 'color',
		displayName: "Fab Button's Icon Color",
		description: 'The color of the Fab Button Icon.',
		defaultValue: '<white>',
		selector: '.fabButton',
	},
	{
		name: 'fabButtonMiniColor',
		cssProperty: 'background-color',
		displayName: "Mini Fab Button's Color",
		description: 'The color of the Mini Fab Button.',
		defaultValue: '<primary-color>',
		selector: '.fabButtonMini',
	},
	{
		name: 'fabButtonIconColor',
		cssProperty: 'color',
		displayName: "Mini Fab Button's Icon Color",
		description: 'The color of the Mini Fab Button Icon.',
		defaultValue: '<white>',
		selector: '.fabButtonMini',
	},
	{
		name: 'buttonColor',
		cssProperty: 'background-color',
		displayName: "Button's  Color",
		description: 'The color of the Primary Button.',
		defaultValue: '<primary-color>',
		selector: '.button',
	},
	{
		name: 'buttonTextColor',
		cssProperty: 'color',
		displayName: "Button's text Color",
		description: "The color of the Primary Button's text.",
		defaultValue: '<secondary-white>',
		selector: '.button',
	},
	{
		name: 'buttonColorDisabled',
		cssProperty: 'background-color',
		displayName: "Disabled Button's Color",
		description: 'The color of the disabled Primary Button.',
		defaultValue: '<app-disabled-color>',
		selector: '.button:disabled',
	},
	{
		name: 'buttonTextColorDisabled',
		cssProperty: 'color',
		displayName: "Disabled Button's text Color",
		description: "The color of the Primary Button's text when disabled.",
		defaultValue: '<primary-color>',
		selector: '.button:disabled',
	},
	{
		name: 'buttonOutlinedColorBorder',
		cssProperty: 'border',
		displayName: "Oultined Button's Border color",
		description: "The color of the Outline Button's border.",
		defaultValue: '1px solid <primary-color>',
		selector: '.button.outlined',
	},
	{
		name: 'buttonOutlinedTextColor',
		cssProperty: 'color',
		displayName: "Outlined Button's text Color",
		description: "The color of the Oultined Button's text.",
		defaultValue: '<primary-color>',
		selector: '.button.outlined',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
