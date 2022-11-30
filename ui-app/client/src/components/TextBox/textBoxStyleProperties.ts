import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/style';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'supportTextFontFamily',
		cssProperty: 'font-family',
		displayName: 'Support Text Font Family',
		description: 'The font of the support text.',
		selector: '.supportText',
	},
	{
		name: 'supportTextFontSize',
		cssProperty: 'font-size',
		displayName: 'Support Text Font Size',
		description: 'The font size of the support text.',
		selector: '.supportText',
		defaultValue: '12px',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
