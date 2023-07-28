import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'textAreaSupportTextDisabledColor',
		cssProperty: 'color',
		displayName: 'Application/Site Disabled font color',
		description: "This color is used for disabled TextArea's support text.",
		defaultValue: '<formInputTextColorWhenDisabled>',

		selector: '.supportText.disabled',
	},
	{
		name: 'textAreaSupportTextFontSize',
		cssProperty: 'font-size',
		displayName: 'TextArea support text font size',
		description: "This TextArea's font size is used for TextArea's support text.",
		defaultValue: '<mainFontSize>',
		selector: '.supportText',
	},
	{
		name: 'textAreaSupportTextFontColor',
		cssProperty: 'color',
		displayName: 'TextArea support text font color',
		description: "This TextArea's color is used for TextArea's support text.",
		selector: '.supportText',
	},
	{
		name: 'textAreaInputTextFontSize',
		cssProperty: 'font-size',
		displayName: 'TextArea input text font size',
		description: "This TextArea's font size is used for TextArea's input text.",
		defaultValue: '<mainFontSize>',
		selector: '.inputContainer .textArea',
	},
	{
		name: 'textAreaBorderColor',
		cssProperty: 'border',
		displayName: "TextArea's border color",
		description: "This color is used for TextArea's border color.",
		defaultValue: '1px solid <formInputBorderColor>',
		selector: '.inputContainer',
	},
	{
		name: 'textAreaDivBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Text Area Background Color',
		description: 'The background color of Dropdown.',
		defaultValue: 'transparent',
		selector: '.inputContainer',
	},
	{
		name: 'textAreaWdith',
		cssProperty: 'width',
		displayName: "TextArea's width",
		description: "This is for TextArea's width",
		selector: '.inputContainer',
	},
	{
		name: 'textAreaHeight',
		cssProperty: 'height',
		displayName: "TextArea's height",
		description: "This is for TextArea's height",
		defaultValue: '150px',
		selector: '.inputContainer',
	},
	{
		name: 'textAreaBorderRadius',
		cssProperty: 'border-radius',
		displayName: "TextArea's border radius",
		description: "This is for TextArea's border radius",
		defaultValue: '4px',
		selector: '.inputContainer',
	},
	{
		name: 'textAreaBorderErrorColor',
		cssProperty: 'border',
		displayName: "TextArea's border color on error",
		description: "This color is used for TextArea's error border color.",
		defaultValue: '1px solid <formInputBorderErrorColor>',
		selector: '.inputContainer.error',
	},
	{
		name: 'noFloatTextAreaLabelBottomMargin',
		cssProperty: 'margin-bottom',
		displayName: "TextArea's label margin",
		description: "This is for TextArea's space between label and input box",
		defaultValue: '5px',
		selector: '.noFloatTextAreaLabel',
	},
	{
		name: 'textAreaBorderColorOnFocus',
		cssProperty: 'border',
		displayName: "TextArea's border color on focus",
		description: "This color is used for TextArea's focus border color.",
		defaultValue: '1px solid <formInputBorderColorFocussed>',
		selector: '.inputContainer.focussed',
	},
	{
		name: 'textAreaBorderColorWhenHasText',
		cssProperty: 'border',
		displayName: "TextArea's border color with text",
		description: "This color is used for TextArea's border color when it has text.",
		defaultValue: '1px solid <formInputBorderColorWithText>',
		selector: '.inputContainer.hasText',
	},
	{
		name: 'textAreaBorderColorWhenDisabled',
		cssProperty: 'border',
		displayName: "TextArea's border color when disabled",
		description: "This color is used for TextArea's border color when it is disabled.",
		defaultValue: '1px solid <formInputBorderColorWhenDisabled>',
		selector: '.inputContainer.disabled',
	},
	{
		name: 'textAreaLabelTextSize',
		cssProperty: 'font-size',
		displayName: "TextArea's label font size",
		description: "This font size is used for TextArea's label.",
		defaultValue: '<mainFontSize>',
		selector: '.inputContainer .textAreaLabel',
	},
	{
		name: 'textAreaLabelTextColor',
		cssProperty: 'color',
		displayName: "TextArea's label color",
		description: "This color is used for TextArea's label color.",
		defaultValue: '<formInputTextColor>',
		selector: '.inputContainer .textAreaLabel',
	},
	{
		name: 'textAreaLabelTextCursorEvent',
		cssProperty: 'cursor',
		displayName: "TextArea's label text cursor event",
		description: "This cursor is used for TextArea's label text cursor event.",
		defaultValue: 'text',
		selector: '.inputContainer .textAreaLabel',
	},

	{
		name: 'textAreaHeight',
		cssProperty: 'height',
		displayName: "TextArea's input container height",
		description: "This height is used for TextArea's input container height.",
		selector: '.inputContainer .textArea',
	},

	{
		name: 'textAreaMinHeight',
		cssProperty: 'min-height',
		displayName: "textarea's input container min-height",
		description: "This min-height is used for textarea's component height.",
		selector: ' ',
	},

	{
		name: 'textAreaPaddingLeft',
		cssProperty: 'padding-left',
		displayName: "textarea's input container padding",
		description: "This padding is used for textarea's content padding.",
		defaultValue: '5px',
		selector: '.inputContainer .textArea',
	},

	{
		name: 'textAreaPaddingRight',
		cssProperty: 'padding-right',
		displayName: "textarea's input container padding",
		description: "This padding is used for textarea's content padding.",
		defaultValue: '5px',
		selector: '.inputContainer .textArea',
	},

	{
		name: 'textAreaPaddingTop',
		cssProperty: 'padding-top',
		displayName: "textarea's input container padding",
		description: "This padding is used for textarea's content padding.",
		defaultValue: '10px',
		selector: '.inputContainer .textArea',
	},

	{
		name: 'textAreaPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: "textarea's input container padding",
		description: "This padding is used for textarea's content padding.",
		defaultValue: '5px',
		selector: '.inputContainer .textArea',
	},

	{
		name: 'textAreaInputContainerWidth',
		cssProperty: 'width',
		displayName: "TextArea's input container width",
		description: "This width is used for TextArea's input container height.",
		selector: '.inputContainer',
	},

	{
		name: 'textAreaTextColorWhenDisabled',
		cssProperty: 'color',
		displayName: "TextArea's border color when disabled",
		description: "This color is used for TextArea's border color when it is disabled.",
		defaultValue: '<formInputTextColorWhenDisabled>',
		selector: '.inputContainer .textAreaLabel.disabled',
	},
	{
		name: 'textAreaLabelTextPostionFromLeft',
		cssProperty: 'left',
		displayName: "TextArea's label position from left when input",
		description: "This left is used for TextArea's label position when it has any input.",
		defaultValue: '0',
		selector: ' .inputContainer .textAreaLabel',
	},
	{
		name: 'textAreaLabelTextPaddingFromLeft',
		cssProperty: 'padding-left',
		displayName: "TextArea's label padding from left when input",
		description: "This left is used for TextArea's label padding when it has any input.",
		defaultValue: '5px',
		selector: ' .inputContainer .textAreaLabel',
	},
	{
		name: 'textAreaLabelTextTransformWhenContainsTextFromTop',
		cssProperty: 'top',
		displayName: "TextArea's label text position from top when input",
		description:
			"This top is used for TextArea's label text position from top when it has any input.",
		defaultValue: '0',
		selector:
			'.inputContainer .textArea:focus + .textAreaLabel, .inputContainer .textArea:not(:placeholder-shown) + .textAreaLabel',
	},
	{
		name: 'textAreaLabelTextTransformWhenContainsTextFromLeft',
		cssProperty: 'left',
		displayName: "TextArea's label text position from left when input",
		description:
			"This left is used for TextArea's label text position from top when it has any input.",
		defaultValue: '5px',
		selector:
			'.inputContainer .textArea:focus + .textAreaLabel, .inputContainer .textArea:not(:placeholder-shown) + .textAreaLabel',
	},

	{
		name: 'textAreaLabelTextTransformWhenContainsTextPaddingLeft',
		cssProperty: 'padding-left',
		displayName: "TextArea's label text padding from left when input",
		description:
			"This left is used for TextArea's label text padding left when it has any input.",
		defaultValue: '0',
		selector:
			'.inputContainer .textArea:focus + .textAreaLabel, .inputContainer .textArea:not(:placeholder-shown) + .textAreaLabel',
	},
	{
		name: 'textAreaLabelTextTransformWhenContainsTextBackgroundColor',
		cssProperty: 'background-color',
		displayName: "TextArea's label text background color when input",
		description:
			"This background color is used for TextArea's label text background color when it has any input.",
		defaultValue: '#fff',
		selector:
			'.inputContainer .textArea:focus + .textAreaLabel, .inputContainer .textArea:not(:placeholder-shown) + .textAreaLabel',
	},
	{
		name: 'textAreaContainerContentAlign',
		cssProperty: 'align-items',
		displayName: "TextArea's Container Content Align in the grid",
		description: "This align items is used for TextArea's conatiner content align.",
		defaultValue: 'center',
		selector: '.inputContainer',
	},
	{
		name: 'textAreaLabelTextColorWhenError',
		cssProperty: 'color',
		displayName: "TextArea's label color when error",
		description: "This color is used for TextArea's label color when it has error.",
		defaultValue: '<form-input-error-color>',
		selector: '.inputContainer .textAreaLabel.error',
	},
	{
		name: 'noFloatTextAreaLabelFontSize',
		cssProperty: 'font-size',
		displayName: "No Float TextArea's font size",
		description: 'TextArea label font size (no float variant).',
		defaultValue: '<mainFontSize>',
		selector: '.noFloatTextAreaLabel',
	},
	{
		name: 'noFloatTextAreaLabelTextColor',
		cssProperty: 'color',
		displayName: "No Float TextArea's label color",
		description: "This color is used for TextArea's label color.",
		defaultValue: '<formInputTextColor>',
		selector: '.noFloatTextAreaLabel',
	},
	{
		name: 'noFloatTextAreaTextColorWhenDisabled',
		cssProperty: 'color',
		displayName: "No Float TextArea's border color when disabled",
		description: "This color is used for TextArea's border color when it is disabled.",
		defaultValue: '<formInputTextColorWhenDisabled>',
		selector: '.noFloatTextAreaLabel.disabled',
	},
	{
		name: 'noFloatTextAreaLabelTextColorWhenError',
		cssProperty: 'color',
		displayName: "No Float TextArea's label color when error",
		description: "This color is used for TextArea's label color when it has error.",
		defaultValue: '<formInputErrorColor>',
		selector: '.noFloatTextAreaLabel.error',
	},
	{
		name: 'textAreaTextMouseEventWhenDisabled',
		cssProperty: 'cursor',
		displayName: "TextArea's mouse cursor when disabled",
		description: "This not allowed mouse event is used for TextArea's when it is disabled.",
		defaultValue: '<formInputMouseEventWhenDisabled>',
		selector: '.inputContainer .textArea:disabled',
	},

	{
		name: 'textAreaTextBackgroundColorWhenDisabled',
		cssProperty: 'background-color',
		displayName: "TextArea's background color when disabled",
		description: "This background color is used for TextArea's when it is disabled.",
		defaultValue: 'transparent',
		selector: '.inputContainer .textArea:disabled',
	},

	{
		name: 'textAreaTextColorWhenDisabled',
		cssProperty: 'color',
		displayName: "TextArea's color when disabled",
		description: 'This color is used for TextArea when it is disabled.',
		defaultValue: '<formInputTextColorWhenDisabled>',
		selector: '.inputContainer .textArea:disabled',
	},

	{
		name: 'textAreaLabelBackgroundColorWhenDisabled',
		cssProperty: 'background-color',
		displayName: "TextArea's label background color when disabled",
		description: "This background color is used for TextArea's label when it is disabled.",
		defaultValue: '<lightFontColor>',
		selector: '.textAreaLabel.disabled',
	},

	{
		name: 'textAreaIconColorWhenError',
		cssProperty: 'color',
		displayName: "TextArea's Error Icon color when error",
		description: "This color is used for TextArea's error icon color when it has error",
		defaultValue: '<formInputTextColor>',
		selector: '.inputContainer .errorIcon',
	},

	{
		name: 'textAreaRightIconRightPadding',
		cssProperty: 'padding-right',
		displayName: "TextArea's right icon padding right",
		description: "This is for TextArea's right icon right padding",
		defaultValue: '0',
		selector: '.inputContainer .errorIcon',
	},

	{
		name: 'textAreaRightIconRightMargin',
		cssProperty: 'margin-right',
		displayName: "TextArea's right icon margin right",
		description: "This is for TextArea's right icon right margin",
		defaultValue: '5px',
		selector: '.inputContainer .errorIcon',
	},

	{
		name: 'textAreaAutofillBackgroundColor',
		cssProperty: 'background-color',
		displayName: "TextArea's Browser Autofill Background color.",
		description: "TextArea's Background color for override browser autofill style.",
		defaultValue: '<textAreaDivBackgroundColor>',
		selector: '.inputContainer .textArea:-webkit-autofill, .inputContainer .textArea:autofill',
	},

	{
		name: 'textAreaPlaceholderColor',
		cssProperty: 'color',
		displayName: "TextArea's placeholder color.",
		description: "TextArea's placeholder color.",
		selector: '.inputContainer .textArea::placeholder',
	},

	{
		name: 'textAreaPlaceholderFontSize',
		cssProperty: 'font-size',
		displayName: "TextArea's placeholder font size.",
		description: "TextArea's placeholder font size.",
		selector: '.inputContainer .textArea::placeholder',
	},

	{
		name: 'textAreaPlaceholderFontWeight',
		cssProperty: 'font-weight',
		displayName: "TextArea's placeholder font weight.",
		description: "TextArea's placeholder font weight.",
		selector: '.inputContainer .textArea::placeholder',
	},

	{
		name: 'textAreaPlaceholderlineHeight',
		cssProperty: 'line-height',
		displayName: "TextArea's placeholder line height.",
		description: "TextArea's placeholder line height.",
		selector: '.inputContainer .textArea::placeholder',
	},

	{
		name: 'textAreaPlaceholderColorWhenDisabled',
		cssProperty: 'color',
		displayName: "TextArea's placeholder color when disabled.",
		description: "TextArea's placeholder color when disabled.",
		defaultValue: '<formInputTextColorWhenDisabled>',
		selector: '.inputContainer.disabled .textArea:disabled::placeholder',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
