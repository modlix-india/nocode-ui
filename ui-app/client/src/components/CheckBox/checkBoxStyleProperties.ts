import { StylePropertyDefinition } from '../../types/common';

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
		defaultValue: '<contrast-bright-color>',
		selector: ".checkbox input[type='checkbox']:checked",
	},
	{
		name: 'checkBoxLabelColor',
		cssProperty: 'color',
		displayName: "checkbox's Label Color",
		description: 'The Label color of the Checkbox.',
		defaultValue: 'rgba(0,0,0, 0.6)',
		selector: '.checkbox',
	},

	{
		name: 'checkBoxWidth',
		cssProperty: 'width',
		displayName: "checkbox's Width",
		description: 'The width of the Checkbox.',
		defaultValue: 'auto',
		selector: '.checkbox',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
