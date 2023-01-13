import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'supportTextDisabledColor',
		cssProperty: 'color',
		displayName: 'Application/Site Disabled font color',
		description: "This color is used for disabled textbox's support text.",
		defaultValue: '<form-input-text-color-when-disabled>',
		selector: '.supportText.disabled',
	},
	{
		name: 'supportTextErrorColor',
		cssProperty: 'color',
		displayName: 'Application/Site Error font color',
		description: "This color is used for error textbox's support text.",
		defaultValue: '<main-error-color>',
		selector: '.supportText.error',
	},
	{
		name: 'textBoxBorderColor',
		cssProperty: 'border-color',
		displayName: "textbox's border color",
		description: "This color is used for textbox's border color.",
		defaultValue: '<form-input-border-color>',
		selector: '.textBoxDiv',
	},
	{
		name: 'textBoxBorderErrorColor',
		cssProperty: 'border-color',
		displayName: "textbox's border color on error",
		description: "This color is used for textbox's error border color.",
		defaultValue: '#ed6a5e',
		selector: '.textBoxDiv.error',
	},
	{
		name: 'textBoxBorderColorOnFocus',
		cssProperty: 'border-color',
		displayName: "textbox's border color on focus",
		description: "This color is used for textbox's focus border color.",
		defaultValue: '<form-input-border-color-focussed>',
		selector: '.textBoxDiv.focussed',
	},
	{
		name: 'textBoxBorderColorWhenHasText',
		cssProperty: 'border-color',
		displayName: "textbox's border color with text",
		description: "This color is used for textbox's border color when it has text.",
		defaultValue: '<form-input-border-color-with-text>',
		selector: '.textBoxDiv.hasText',
	},
	{
		name: 'textBoxBorderColorWhenDisabled',
		cssProperty: 'border',
		displayName: "textbox's border color when disabled",
		description: "This color is used for textbox's border color when it is disabled.",
		defaultValue: '1px solid <form-input-border-color-when-disabled>',
		selector: '.textBoxDiv.disabled',
	},

	{
		name: 'textBoxLabelTextColor',
		cssProperty: 'color',
		displayName: "textbox's label color",
		description: "This color is used for textbox's label color.",
		defaultValue: '<form-input-text-color>',
		selector: '.textBoxDiv .inputContainer .textBoxLabel',
	},
	{
		name: 'textBoxTextColorWhenDisabled',
		cssProperty: 'color',
		displayName: "textbox's border color when disabled",
		description: "This color is used for textbox's border color when it is disabled.",
		defaultValue: '<form-input-text-color-when-disabled>',
		selector: '.textBoxDiv .inputContainer .textBoxLabel.disabled',
	},
	{
		name: 'textBoxLabelTextColorWhenError',
		cssProperty: 'color',
		displayName: "textbox's label color when error",
		description: "This color is used for textbox's label color when it has error.",
		defaultValue: '<form-input-error-color>',
		selector: '.textBoxDiv .inputContainer .textBoxLabel.error',
	},
	{
		name: 'noFloatTextBoxLabelTextColor',
		cssProperty: 'color',
		displayName: "No Float textbox's label color",
		description: "This color is used for textbox's label color.",
		defaultValue: '<form-input-text-color>',
		selector: '.noFloatTextBoxLabel',
	},
	{
		name: 'noFloatTextBoxTextColorWhenDisabled',
		cssProperty: 'color',
		displayName: "No Float textbox's border color when disabled",
		description: "This color is used for textbox's border color when it is disabled.",
		defaultValue: '<form-input-text-color-when-disabled>',
		selector: '.noFloatTextBoxLabel.disabled',
	},
	{
		name: 'noFloatTextBoxLabelTextColorWhenError',
		cssProperty: 'color',
		displayName: "No Float textbox's label color when error",
		description: "This color is used for textbox's label color when it has error.",
		defaultValue: '<form-input-error-color>',
		selector: '.noFloatTextBoxLabel.error',
	},
	{
		name: 'textBoxTextMouseEventWhenDisabled',
		cssProperty: 'cursor',
		displayName: "textbox's mouse cursor when disabled",
		description: "This not allowed mouse event is used for textbox's when it is disabled.",
		defaultValue: '<form-input-mouse-event-when-disabled>',
		selector: '.textBoxDiv .inputContainer .textbox:disabled',
	},
	{
		name: 'textBoxIconColorWhenError',
		cssProperty: 'color',
		displayName: "textbox's Error Icon color when error",
		description: "This color is used for textbox's error icon color when it has error",
		defaultValue: '<form-input-text-color-when-error>',
		selector: '.textBoxDiv .errorIcon',
	},
	{
		name: 'textBoxTextColorWhenDisabled',
		cssProperty: 'color',
		displayName: "textbox's text color when disabled",
		description: "This color is used for textbox's text color when its disabled",
		defaultValue: '<form-input-text-color-when-disabled>',
		selector: '.textBoxDiv .inputContainer .textbox:disabled'
	},
	{
		name: 'textBoxIconColorWhenTextPresent',
		cssProperty: 'color',
		displayName: "textbox's Error Icon Color",
		description:
			"This color is used for textbox's icon color when we input new data in textbox after error",
		defaultValue: '<from-input-error-icon-hastext-color>',
		selector: '.textBoxDiv .errorIcon.hasText',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
