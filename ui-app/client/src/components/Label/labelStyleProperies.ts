import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'defaultLabelfontColor',
		cssProperty: 'color',
		displayName: 'Default text Color',
		description: 'Default text Color',
		defaultValue: '<main-font-color>',
		selector: 'span',
	},
	{
		name: 'defaultLabelfontSize',
		cssProperty: 'font-size',
		displayName: 'Default text Size',
		description: 'Default text Size',
		defaultValue: '<main-font-size>',
		selector: 'span',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
