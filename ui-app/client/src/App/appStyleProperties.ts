import { StylePropertyDefinition } from '../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'mainFontFamily',
		cssProperty: 'font-family',
		selector: 'body',
		displayName: 'Application/Site Font Family',
		description: 'This font is used throughout application.',
		defaultValue: "'Open Sans', 'Microsoft Sans Serif', sans-serif",
		noPrefix: true,
	},
	{
		name: 'mainBodyMargin',
		cssProperty: 'margin',
		selector: 'body',
		displayName: 'Application/Site Body margin',
		description: 'This margin is applied to the body.',
		defaultValue: '0px',
		noPrefix: true,
	},
	{
		name: 'boxBoxShadow',
		displayName: 'Box shadow for container',
		description: 'Box shadow for container.',
		defaultValue: '#E6E6E6',
		noPrefix: true,
	},
	{
		name: 'mainFontWeight',
		displayName: 'Application/Site Font Weight',
		description: 'This font is used throughout application.',
		selector: 'body',
		noPrefix: true,
	},
	{
		name: 'mainFocusColor',
		displayName: 'Application/Site text box Focus Color',
		description: 'This color is used for focus on text box',
		defaultValue: '#397ef5',
		noPrefix: true,
	},
	{
		name: 'mainErrorIconColor',
		displayName: 'Application/Site text box error icon color',
		description: 'This color is used for error icon when error occurs during validation',
		defaultValue: '#EC6A5F',
		noPrefix: true,
	},
	{
		name: 'mainFontColor',
		cssProperty: 'color',
		selector: 'body',
		displayName: 'Application/Site Color',
		description: 'This color is used throughout application for all fonts.',
		defaultValue: '#1f3c3d',
		noPrefix: true,
	},
	{
		name: 'blackFontColor',
		cssProperty: 'color',
		displayName: 'Application/Site Color',
		description: 'This color is used throughout application for all fonts.',
		defaultValue: '#000000',
		noPrefix: true,
	},
	{
		name: 'lightBlackFontColor',
		displayName: 'Application/Site Color',
		description: 'This color is used throughout application for all fonts.',
		defaultValue: '#0000001F',
		noPrefix: true,
	},
	{
		name: 'formInputBorderColor',
		displayName: 'Form input border color',
		description: 'This border color is used throughout form input controls.',
		defaultValue: '#C7C8D6',
		noPrefix: true,
	},
	{
		name: 'formInputBorderColorFocussed',
		displayName: 'Form input border color when focussed',
		description: 'This border color is used throughout form input controls when focussed.',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'formInputBorderColorHover',
		displayName: 'Form input border color when hover',
		description: 'This border color is used throughout form input controls when hover.',
		defaultValue: '#2680EB',
		noPrefix: true,
	},
	{
		name: 'optionHoverBackground',
		displayName: 'Hover background color',
		description: 'Background color on hover.',
		defaultValue: '#F4F6F6',
		noPrefix: true,
	},
	{
		name: 'formInputBorderColorWithText',
		displayName: 'Form input border color when has text',
		description: 'This border color is used throughout form input controls when has text.',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'formInputTextColor',
		displayName: 'Form input text color',
		description: 'This text color is used throughout form input controls.',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'formInputBorderColorWhenDisabled',
		displayName: 'Form input border color when disabled',
		description: 'This border color is used throughout form input controls when disabled.',
		defaultValue: '#C7C8D6',
		noPrefix: true,
	},
	{
		name: 'formInputBorderColorWhenError',
		displayName: 'Form input border color when error',
		description: 'This border color is used throughout form input controls when error.',
		defaultValue: '#EC6A5F',
		noPrefix: true,
	},
	{
		name: 'formInputTextColorWhenDisabled',
		displayName: 'Form input text color when disabled',
		description: 'This text color is used throughout form input controls when disabled.',
		defaultValue: '#C7C8D6',
		noPrefix: true,
	},
	{
		name: 'formInputMouseEventWhenDisabled',
		displayName: 'Form input mouse event when disabled',
		description: 'This mouse event is used throughout form input controls when disbaled',
		defaultValue: 'not-allowed',
		noPrefix: true,
	},
	{
		name: 'formInputTextColorWhenError',
		displayName: 'Form input text color when error',
		description: 'This text color is used throughout form input controls when error.',
		defaultValue: '#ED6A5E',
		noPrefix: true,
	},
	{
		name: 'formInputIconDisabledColor',
		displayName: 'Application/Site Disabled font color',
		description: 'This disabled color is used throughout application.',
		defaultValue: '#d5d5d5',
		noPrefix: true,
	},
	{
		name: 'formInputBorderErrorColor',
		displayName: 'Application/Site Error color',
		description: 'This error color is used throughout application.',
		defaultValue: '#ed6a5e',
		noPrefix: true,
	},
	{
		name: 'fromInputErrorIconHastextColor',
		displayName: 'Form Input Text Box Error Icon Color When Text',
		description: 'This error icon color is used when we input in textbox after any error',
		defaultValue: '#393A3C',
		noPrefix: true,
	},
	{
		name: 'mainDisabledColor',
		displayName: 'Application/Site Disabled font color',
		description: 'This disabled color is used throughout application.',
		defaultValue: '#d5d5d5',
		noPrefix: true,
	},
	{
		name: 'mainErrorColor',
		displayName: 'Application/Site Error color',
		description: 'This error color is used throughout application.',
		defaultValue: '#ed6a5e',
		noPrefix: true,
	},
	{
		name: 'mainFontSize',
		displayName: 'Application/Site font size',
		description: 'This error color is used throughout application.',
		defaultValue: '12px',
		noPrefix: true,
	},
	{
		name: 'lightFontColor',
		displayName: 'Application/Site Light font color',
		description: 'This font color is used throughout application where light color is needed.',
		defaultValue: '#ffffff',
		noPrefix: true,
	},
	{
		name: 'contrastBrightColor',
		displayName: 'Application/Site Bright color',
		description: 'This color is used throughout application where bright color is needed',
		defaultValue: '#e5b122',
		noPrefix: true,
	},
	{
		name: 'lightContrastBrightColor',
		displayName: 'Application/Site Bright color',
		description: 'This color is used throughout application where bright color is needed',
		defaultValue: '#e5b12221',
		noPrefix: true,
	},
	{
		name: 'mainDisabledText',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#6e6e6e',
		noPrefix: true,
	},
	{
		name: 'secondaryDisabledBorder',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#bcbcbc',
		noPrefix: true,
	},
	{
		name: 'appTextDisabledColor',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#888585',
		noPrefix: true,
	},
	{
		name: 'appGreyColor',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#dddddd',
		noPrefix: true,
	},
	{
		name: 'appSecondaryGreyColor',
		displayName: 'Application/Site Primary color',
		description: 'This color is used throughout application.',
		defaultValue: '#e3e3e3',
		noPrefix: true,
	},
	{
		name: 'bodyBackground',
		displayName: 'Application/Site Background',
		description: 'This is the application level background',
		noPrefix: true,
		cssProperty: 'background',
		selector: 'body',
	},
	{
		name: 'primaryBackground',
		displayName: 'Primary background',
		description: 'Primary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._PRIMARYBG',
		defaultValue: '<mainFontColor>',
	},
	{
		name: 'secondaryBackground',
		displayName: 'Secondary background',
		description: 'Secondary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._SECONDARYBG',
		defaultValue: '#FFFFFFF8',
	},
	{
		name: 'tertiaryBackground',
		displayName: 'Tertiary background',
		description: 'Tertiary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._TERTIARYBG',
		defaultValue: '#E6A435',
	},
	{
		name: 'quaternaryBackground',
		displayName: 'Quaternary background',
		description: 'Quaternary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._QUATERNARYBG',
		defaultValue: '#DAAC53',
	},
	{
		name: 'quinaryBackground',
		displayName: 'Quinary background',
		description: 'Quinary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._QUINARYBG',
		defaultValue: 'radial-gradient(farthest-corner at 10% 55%, #F7E7D1, #F9CDC7 120%)',
	},
	{
		name: 'senaryBackground',
		displayName: 'Senary background',
		description: 'Senary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._SENARYBG',
		defaultValue: 'radial-gradient(farthest-corner at 10% 85%, #555D6D, #9EE2D0 120%)',
	},
	{
		name: 'septenaryBackground',
		displayName: 'Septenary background',
		description: 'Septenary background image/color',
		noPrefix: true,
		cssProperty: 'background',
		selector: '._SEPTENARYBG',
		defaultValue: '#F5E2C6',
	},
	{
		name: 'scrollBarWidth',
		displayName: 'Scroll bar width',
		description: 'Scroll bar width',
		noPrefix: true,
		cssProperty: 'width',
		selector: '::-webkit-scrollbar',
		defaultValue: '7px',
	},
	{
		name: 'scrollBarHeight',
		displayName: 'Scroll bar height',
		description: 'Scroll bar height',
		noPrefix: true,
		cssProperty: 'height',
		selector: '::-webkit-scrollbar',
		defaultValue: '7px',
	},
	{
		name: 'scrollBarThumbBg',
		displayName: 'Scroll bar thumb background',
		description: 'Scroll bar thumb background',
		noPrefix: true,
		cssProperty: 'background',
		selector: '::-webkit-scrollbar-thumb',
		defaultValue: '#a3b2c0',
	},
	{
		name: 'scrollBarThumbBorderRadius',
		displayName: 'Scroll bar thumb border radius',
		description: 'Scroll bar thumb border radius',
		noPrefix: true,
		cssProperty: 'border-radius',
		selector: '::-webkit-scrollbar-thumb, ::-webkit-scrollbar-corner',
		defaultValue: '3px',
	},
	{
		name: 'scrollBarHoverWidth',
		displayName: 'Scroll bar hover width',
		description: 'Scroll bar hover width',
		noPrefix: true,
		cssProperty: 'width',
		selector: '*:hover::-webkit-scrollbar',
		defaultValue: '7px',
	},
	{
		name: 'scrollBarThumbHoverBg',
		displayName: 'Scroll bar hover thumb background',
		description: 'Scroll bar hover thumb background',
		noPrefix: true,
		cssProperty: 'background',
		selector: '*:hover::-webkit-scrollbar-thumb',
		defaultValue: '#6d8499',
	},
	{
		name: 'validationMsgFontSize',
		displayName: 'Validation Messages Font Size',
		description: 'Validation Messages Font Size',
		noPrefix: true,
		cssProperty: 'font-size',
		selector: '._validationMessages',
		defaultValue: 'calc(<mainFontSize> - 2px)',
	},
	{
		name: 'validationMsgFontColor',
		displayName: 'Validation Messages Font Color',
		description: 'Validation Messages Font Color',
		noPrefix: true,
		cssProperty: 'color',
		selector: '._validationMessages',
		defaultValue: '<mainErrorColor>',
	},
	{
		name: 'validationMsgFixedHeight',
		displayName: 'minHeight for Validation Messages with fixed display type',
		description: 'minHeight for Validation Messages with fixed display type',
		noPrefix: true,
		cssProperty: 'min-height',
		selector: '._validationMessages._fixedMessages',
		defaultValue: '20px',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
