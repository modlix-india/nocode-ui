import { StylePropertyDefinition } from '../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'main-font-family',
		cssProperty: 'font-family',
		selector: 'body',
		displayName: 'Application/Site Font Family',
		description: 'This font is used throughout application.',
		defaultValue: "'Open Sans', 'Microsoft Sans Serif', sans-serif",
		noPrefix: true,
	},
	{
		name: 'main-body-margin',
		cssProperty: 'margin',
		selector: 'body',
		displayName: 'Application/Site Body margin',
		description: 'This margin is applied to the body.',
		defaultValue: '0px',
		noPrefix: true,
	},
	{
		name: 'main-font-weight',
		displayName: 'Application/Site Font Weight',
		description: 'This font is used throughout application.',
		selector: 'body',
		noPrefix: true,
	},
	{
		name: 'main-focus-color',
		displayName: 'Application/Site text box Focus Color',
		description: 'This color is used for focus on text box',
		defaultValue: '#397ef5',
		noPrefix: true,
	},
	{
		name: 'main-error-icon-color',
		displayName: 'Application/Site text box error icon color',
		description: 'This color is used for error icon when error occurs during validation',
		defaultValue: '#EC6A5F',
		noPrefix: true,
	},
	{
		name: 'main-font-color',
		cssProperty: 'color',
		selector: 'body',
		displayName: 'Application/Site Color',
		description: 'This color is used throughout application for all fonts.',
		defaultValue: '#1f3c3d',
		noPrefix: true,
	},
	{
		name: 'form-input-border-color',
		displayName: 'Form input border color',
		description: 'This border color is used throughout form input controls.',
		defaultValue: '#C7C8D6',
		noPrefix: true,
	},
	{
		name: 'form-input-border-color-focussed',
		displayName: 'Form input border color when focussed',
		description: 'This border color is used throughout form input controls when focussed.',
		defaultValue: '#2680EB',
		noPrefix: true,
	},
	{
		name: 'form-input-border-color-with-text',
		displayName: 'Form input border color when has text',
		description: 'This border color is used throughout form input controls when has text.',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'form-input-text-color',
		displayName: 'Form input text color',
		description: 'This text color is used throughout form input controls.',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'form-input-border-color-when-disabled',
		displayName: 'Form input border color when disabled',
		description: 'This border color is used throughout form input controls when disabled.',
		defaultValue: '#C7C8D6',
		noPrefix: true,
	},
	{
		name: 'form-input-border-color-when-error',
		displayName: 'Form input border color when error',
		description: 'This border color is used throughout form input controls when error.',
		defaultValue: '#EC6A5F',
		noPrefix: true,
	},
	{
		name: 'form-input-text-color-when-disabled',
		displayName: 'Form input text color when disabled',
		description: 'This text color is used throughout form input controls when disabled.',
		defaultValue: '#C7C8D6',
		noPrefix: true,
	},
	{
		name: 'form-input-mouse-event-when-disabled',
		displayName: 'Form input mouse event when disabled',
		description: 'This mouse event is used throughout form input controls when disbaled',
		defaultValue: 'not-allowed',
		noPrefix: true,
	},
	{
		name: 'form-input-text-color-when-error',
		displayName: 'Form input text color when error',
		description: 'This text color is used throughout form input controls when error.',
		defaultValue: '#ED6A5E',
		noPrefix: true,
	},
	{
		name: 'form-input-icon-disabled-color',
		displayName: 'Application/Site Disabled font color',
		description: 'This disabled color is used throughout application.',
		defaultValue: '#d5d5d5',
		noPrefix: true,
	},
	{
		name: 'form-input-border-error-color',
		displayName: 'Application/Site Error color',
		description: 'This error color is used throughout application.',
		defaultValue: '#ed6a5e',
		noPrefix: true,
	},
	{
		name: 'from-input-error-icon-hastext-color',
		displayName: 'Form Input Text Box Error Icon Color When Text',
		description: 'This error icon color is used when we input in textbox after any error',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'main-disabled-color',
		displayName: 'Application/Site Disabled font color',
		description: 'This disabled color is used throughout application.',
		defaultValue: '#d5d5d5',
		noPrefix: true,
	},
	{
		name: 'main-error-color',
		displayName: 'Application/Site Error color',
		description: 'This error color is used throughout application.',
		defaultValue: '#ed6a5e',
		noPrefix: true,
	},
	{
		name: 'main-font-size',
		displayName: 'Application/Site font size',
		description: 'This error color is used throughout application.',
		defaultValue: '12px',
		noPrefix: true,
	},
	{
		name: 'light-font-color',
		displayName: 'Application/Site Light font color',
		description: 'This font color is used throughout application where light color is needed.',
		defaultValue: '#ffffff',
		noPrefix: true,
	},
	{
		name: 'contrast-bright-color',
		displayName: 'Application/Site Bright color',
		description: 'This color is used throughout application where bright color is needed',
		defaultValue: '#e5b122',
		noPrefix: true,
	},
	{
		name: 'main-disabled-text',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#6e6e6e',
		noPrefix: true,
	},
	{
		name: 'secondary-disabled-border',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#bcbcbc',
		noPrefix: true,
	},
	{
		name: 'app-text-disabled-color',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#888585',
		noPrefix: true,
	},
	{
		name: 'app-grey-color',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#dddddd',
		noPrefix: true,
	},
	{
		name: 'app-secondary-grey-color',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#e3e3e3',
		noPrefix: true,
	},
	{
		name: 'body-background',
		displayName: 'Application/Site Background',
		description: 'This is the application level background',
		noPrefix: true,
		cssProperty: 'background',
		selector: 'body',
	},
	{
		name: 'primary-background',
		displayName: 'Primary background',
		description: 'Primary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._PRIMARYBG',
		defaultValue: '<main-font-color>',
	},
	{
		name: 'secondary-background',
		displayName: 'Secondary background',
		description: 'Secondary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._SECONDARYBG',
		defaultValue: 'white',
	},
	{
		name: 'tertiary-background',
		displayName: 'Tertiary background',
		description: 'Tertiary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._TERTIARYBG',
		defaultValue: '#E6A435',
	},
	{
		name: 'quaternary-background',
		displayName: 'Quaternary background',
		description: 'Quaternary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._QUATERNARYBG',
		defaultValue: '#DAAC53',
	},
	{
		name: 'quinary-background',
		displayName: 'Quinary background',
		description: 'Quinary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._QUINARYBG',
		defaultValue: 'radial-gradient(farthest-corner at 10% 55%, #F7E7D1, #F9CDC7 120%)',
	},
	{
		name: 'senary-background',
		displayName: 'Senary background',
		description: 'Senary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._SENARYBG',
		defaultValue: 'radial-gradient(farthest-corner at 10% 85%, #555D6D, #9EE2D0 120%)',
	},
	{
		name: 'septenary-background',
		displayName: 'Septenary background',
		description: 'Septenary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._SEPTENARYBG',
		defaultValue: '#F5E2C6',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
