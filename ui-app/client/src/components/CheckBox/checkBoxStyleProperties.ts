import { StylePropertyDefinition } from '../../types/style';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'checkBoxBackgroundColor',
		cssProperty: 'background-color',
		displayName: "checkbox's Color",
		description: 'The color of the Checkbox.',
		defaultValue: '<white>',
		selector: ".checkbox input[type='checkbox']",
	},

	{
		name: 'checkBoxBorderColor',
		cssProperty: 'border-color',
		displayName: "checkbox's border Color",
		description: 'The border color of the Checkbox.',
		defaultValue: 'rgba(0, 0, 0, 0.38)',
		selector: ".checkbox input[type='checkbox']",
	},
	{
		name: 'checkBoxChecked',
		cssProperty: 'background-color',
		displayName: "checkbox's checked animation Color",
		description: 'The checked animation color of the Checkbox.',
		defaultValue: '<app-yellow>',
		selector: ".checkbox input[type='checkbox']:checked",
	},
	{
		name: 'checkBoxLableColor',
		cssProperty: 'color',
		displayName: "checkbox's Lable Color",
		description: 'The Lable color of the Checkbox.',
		defaultValue: 'rgba(0,0,0, 0.6)',
		selector: '.checkbox',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
