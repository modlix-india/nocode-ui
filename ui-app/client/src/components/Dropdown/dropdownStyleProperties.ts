import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	//header text style
	{
		name: 'headerTextFontSize',
		cssProperty: 'font-size',
		displayName: "Font size for Header Text",
		description: 'Font size for Header Text.',
		defaultValue: '14px',
		selector: '.headerText',
	},
	{
		name: 'headerTextFontColor',
		cssProperty: 'color',
		displayName: "Font color for Header Text",
		description: 'Font color for Header Text.',
		defaultValue: '#6C7586',
		selector: '.headerText',
	},
	{
		name: 'headerTextFontColorOnDisable',
		cssProperty: 'color',
		displayName: "Font color for Header Text when it is disable",
		description: 'Font color for Header Text when it is disable.',
		defaultValue: '#A7ACB6',
		selector: '.headerText.disabled',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
