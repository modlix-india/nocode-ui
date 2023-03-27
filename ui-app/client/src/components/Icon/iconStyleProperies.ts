import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'iconColor',
		cssProperty: 'color',
		displayName: 'Icon Color',
		description: 'The color of the Icon.',
		defaultValue: '<main-font-color>',
		selector: '._icon',
	},

	{
		name: 'iconFontSize',
		cssProperty: 'font-size',
		displayName: 'Icon Font Size',
		description: 'The icon size',
		selector: '._icon',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
