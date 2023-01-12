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
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
