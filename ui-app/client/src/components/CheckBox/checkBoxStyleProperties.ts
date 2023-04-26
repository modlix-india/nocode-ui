import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'checkBoxBackgroundColor',
		cssProperty: 'background-color',
		displayName: "checkbox's Color",
		description: 'The color of the Checkbox.',
		defaultValue: '<white>',
		selector: "input[type='checkbox'].commonCheckbox, span.commonTriStateCheckbox",
		noPrefix: true,
	},

	{
		name: 'checkBoxCheckColor',
		cssProperty: 'color',
		displayName: "checkbox check's Color",
		description: 'The color of the Checkbox check.',
		defaultValue: '<lightFontColor>',
		selector:
			"input[type='checkbox'].commonCheckbox::before, span.commonTriStateCheckbox::before",
		noPrefix: true,
	},

	{
		name: 'checkBoxBorderColor',
		cssProperty: 'border-color',
		displayName: "checkbox's border Color",
		description: 'The border color of the Checkbox.',
		defaultValue: 'rgba(0, 0, 0, 0.38)',
		selector: "input[type='checkbox'].commonCheckbox, span.commonTriStateCheckbox",
		noPrefix: true,
	},
	{
		name: 'checkBoxChecked',
		cssProperty: 'background-color',
		displayName: "checkbox's checked animation Color",
		description: 'The checked animation color of the Checkbox.',
		defaultValue: '<contrastBrightColor>',
		selector:
			"input[type='checkbox'].commonCheckbox:checked, span.commonTriStateCheckbox._true",
		noPrefix: true,
	},
	{
		name: 'checkBoxTriStateFalseChecked',
		cssProperty: 'color',
		displayName: "checkbox's checked false animation Color",
		description: 'The checked animation color of the Checkbox when false.',
		defaultValue: '<blackFontColor>',
		selector: 'span.commonTriStateCheckbox._false::before',
		noPrefix: true,
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

	{
		name: 'checkboxCheckedHoverColor',
		displayName: "checkbox's hover color",
		description: "checkbox's hover color.",
		defaultValue: '<light-contrastBrightColor>',
		noPrefix: true,
	},

	{
		name: 'checkboxHoverColor',
		displayName: "checkbox's hover color",
		description: "checkbox's hover color.",
		defaultValue: '<light-blackFontColor>',
		noPrefix: true,
	},

	{
		name: 'checkBoxDisabledBorderColor',
		cssProperty: 'border-color',
		displayName: 'CheckBox disabled border color',
		description: 'CheckBox disabled border color.',
		defaultValue: '<appGreyColor>',
		selector: "input[type='checkbox'].commonCheckbox:disabled",
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
