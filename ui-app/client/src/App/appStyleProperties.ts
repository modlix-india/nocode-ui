import { StyleGroupDefinition, StylePropertyDefinition } from '../types/style';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'main-font-family',
		cssProperty: 'font-family',
		selector: 'body',
		displayName: 'Application/Site Font Family',
		description: 'This font is used throughout application.',
		defaultValue: "'Open Sans', 'Microsoft Sans Serif', sans-serif",
	},
	{
		name: 'main-font-weight',
		displayName: 'Application/Site Font Weight',
		description: 'This font is used throughout application.',
		selector: 'body',
	},
	{
		name: 'main-font-color',
		cssProperty: 'color',
		selector: 'body',
		displayName: 'Application/Site Color',
		description: 'This color is used throughout application.',
		defaultValue: '#1f3c3d',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
