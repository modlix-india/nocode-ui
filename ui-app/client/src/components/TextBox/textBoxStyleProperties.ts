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
	{
		name: 'supportTextDisabledColor',
		cssProperty: 'color',
		displayName: 'Application/Site Disabled font color',
		description: "This color is used for disabled textbox's support text.",
		defaultValue: '<main-disabled-color>',
		selector: '.supportText.disabled',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
