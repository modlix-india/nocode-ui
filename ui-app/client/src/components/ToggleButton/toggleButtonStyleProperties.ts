import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'toggleButtonBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'toggleButton Background Color',
		description: 'The backgroundcolor of the toggleButton.',
		defaultValue: '<app-secondary-grey-color>',
		selector: ".toggleButton input[type='checkbox'] ",
	},
	{
		name: 'toggleButtonColor before checked ',
		cssProperty: 'background-color',
		displayName: 'toggleButton color before Checked',
		description: 'The color of the toggleButton before clicked.',
		defaultValue: 'rgba(0 ,0 ,0 , 0.75)',
		selector: ".toggleButton input[type='checkbox']::before",
	},
	{
		name: 'toggleButton background after checked',
		cssProperty: 'background-color',
		displayName: 'toggleButton background after checked',
		description: 'The Backgroundcolor to be filled after checked`',
		defaultValue: '<contrast-bright-color>',
		selector: ".toggleButton input[type='checkbox']:checked ",
	},

	{
		name: 'toggleButton color after checked',
		cssProperty: 'background-color',
		displayName: 'toggleButton color after checked',
		description: 'The toggleButton color after checked`',
		defaultValue: '#ffffff',
		selector: ".toggleButton input[type='checkbox']:checked::before",
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
