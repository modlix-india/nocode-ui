import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{ displayName: 'Text Area Font', name: 'textAreaFont', defaultValue: '<primaryFont>' },

	{
		groupName: 'Default',
		displayName: 'Default Text Area Font',
		name: 'defaultTextAreaFont',
		defaultValue: '<textAreaFont>',
		cssProperty: 'font',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Font',
		name: 'filledTextAreaFont',
		defaultValue: '<textAreaFont>',
		cssProperty: 'font',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Font Color',
		name: 'defaultTextAreaFontColor',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Font Color',
		name: 'filledTextAreaFontColor',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Label Font',
		name: 'defaultTextAreaLabelFont',
		defaultValue: '<quaternaryFont>',
		cssProperty: 'font',
		selector: '.comp.compTextArea._default ._label',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Label Font',
		name: 'filledTextAreaLabelFont',
		defaultValue: '<quaternaryFont>',
		cssProperty: 'font',
		selector: '.comp.compTextArea._filled ._label',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Label Color',
		name: 'defaultTextAreaLabelColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._default ._label',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Label Color',
		name: 'filledTextAreaLabelColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._filled ._label',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text  Box Height',
		name: 'defaultTextAreaHeight',
		cssProperty: 'height',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Height',
		name: 'filledTextAreaHeight',
		cssProperty: 'height',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Border Radius',
		name: 'defaultTextAreaBorderRadius',
		defaultValue: '4px',
		cssProperty: 'border-radius',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Border Radius',
		name: 'filledTextAreaBorderRadius',
		defaultValue: '4px',
		cssProperty: 'border-radius',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Border',
		name: 'defaultTextAreaBorder',
		defaultValue: '1px solid',
		cssProperty: 'border',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Border',
		name: 'filledTextAreaBorder',
		cssProperty: 'border',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Border Color',
		name: 'defaultTextAreaBorderColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'border-color',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Border Color',
		name: 'filledTextAreaBorderColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'border-color',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Padding',
		name: 'defaultTextAreaPadding',
		defaultValue: '0px 5px',
		cssProperty: 'padding',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Padding',
		name: 'filledTextAreaPadding',
		defaultValue: '0px 5px',
		cssProperty: 'padding',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Icon Padding',
		name: 'defaultIconTextAreaPadding',
		defaultValue: '0px 8px',
		cssProperty: 'padding',
		selector:
			'.comp.compTextArea._default ._leftIcon, .comp.compTextArea._default ._rightIcon ',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Icon Padding',
		name: 'filledIconTextAreaPadding',
		defaultValue: '0px 8px',
		cssProperty: 'padding',
		selector: '.comp.compTextArea._filled ._leftIcon, .comp.compTextArea._filled ._rightIcon',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Border When Active',
		name: 'defaultTextAreaActiveBorder',
		defaultValue: '2px solid',
		cssProperty: 'border',
		selector: '.comp.compTextArea._default._isActive',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Border When Active',
		name: 'filledTextAreaActiveBorder',
		cssProperty: 'border',
		selector: '.comp.compTextArea._filled._isActive',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Background',
		name: 'defaultTextAreaBackground',
		defaultValue: '<backgroundColorSeven>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._default',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Background',
		name: 'filledTextAreaBackground',
		defaultValue: '<backgroundColorNine>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._filled',
		noPrefix: true,
	},

	{
		groupName: 'Active Label Color',
		displayName: 'Primary Text Area Active Label Color',
		name: 'primaryTextAreaActiveLabelColor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._primary ._label, .comp.compTextArea._filled._isActive._primary ._label',
		noPrefix: true,
	},
	{
		groupName: 'Active Label Color',
		displayName: 'Secondary Text Area Active  Label Color',
		name: 'secondaryTextAreaActiveLabelColor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._secondary ._label, .comp.compTextArea._filled._isActive._secondary ._label',
		noPrefix: true,
	},
	{
		groupName: 'Active Label Color',
		displayName: 'Tertiary Text Area Active Label Color',
		name: 'tertiaryTextAreaActiveLabelColor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._tertiary ._label, .comp.compTextArea._filled._isActive._tertiary ._label',
		noPrefix: true,
	},
	{
		groupName: 'Active Label Color',
		displayName: 'Quaternary Text Area Active Label Color',
		name: 'quaternaryTextAreaActiveLabelColor',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._quaternary ._label, .comp.compTextArea._filled._isActive._quaternary ._label',
		noPrefix: true,
	},
	{
		groupName: 'Active Label Color',
		displayName: 'Quinary Text Area Active Label Color',
		name: 'quinaryTextAreaActiveLabelColor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._quinary ._label, .comp.compTextArea._filled._isActive._quinary ._label',
		noPrefix: true,
	},

	{
		groupName: 'Active Background',
		displayName: 'Primary Filled Text Area Active Background Color',
		name: 'primaryTextAreaActiveBackgroundColor',
		defaultValue: '<backgroundColorOne>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._filled._isActive._primary',
		noPrefix: true,
	},
	{
		groupName: 'Active Background',
		displayName: 'Secondary Filled Text Area Active  Background Color',
		name: 'secondaryTextAreaActiveBackgroundColor',
		defaultValue: '<backgroundColorTwo>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._filled._isActive._secondary',
		noPrefix: true,
	},
	{
		groupName: 'Active Background',
		displayName: 'Tertiary Filled Text Area Active Background Color',
		name: 'tertiaryTextAreaActiveBackgroundColor',
		defaultValue: '<backgroundColorThree>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._filled._isActive._tertiary',
		noPrefix: true,
	},
	{
		groupName: 'Active Background',
		displayName: 'Quaternary Filled Text Area Active Background Color',
		name: 'quaternaryTextAreaActiveBackgroundColor',
		defaultValue: '<backgroundColorFour>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._filled._isActive._quaternary',
		noPrefix: true,
	},
	{
		groupName: 'Active Background',
		displayName: 'Quinary Filled Text Area Active Background Color',
		name: 'quinaryTextAreaActiveBackgroundColor',
		defaultValue: '<backgroundColorFive>',
		cssProperty: 'background',
		selector: '.comp.compTextArea._filled._isActive._quinary',
		noPrefix: true,
	},

	{
		groupName: 'Active Border Color',
		displayName: 'Primary Text Area Active Border Color',
		name: 'primaryTextAreaActiveBorderColor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'border-color',
		selector:
			'.comp.compTextArea._default._isActive._primary, .comp.compTextArea._filled._isActive._primary',
		noPrefix: true,
	},
	{
		groupName: 'Active Border Color',
		displayName: 'Secondary Text Area Active  Border Color',
		name: 'secondaryTextAreaActiveBorderColor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'border-color',
		selector:
			'.comp.compTextArea._default._isActive._secondary, .comp.compTextArea._filled._isActive._secondary',
		noPrefix: true,
	},
	{
		groupName: 'Active Border Color',
		displayName: 'Tertiary Text Area Active Border Color',
		name: 'tertiaryTextAreaActiveBorderColor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'border-color',
		selector:
			'.comp.compTextArea._default._isActive._tertiary,  .comp.compTextArea._filled._isActive._tertiary',
		noPrefix: true,
	},
	{
		groupName: 'Active Border Color',
		displayName: 'Quaternary Text Area Active Border Color',
		name: 'quaternaryTextAreaActiveBorderColor',
		defaultValue: '<fontColorNine>',
		cssProperty: 'border-color',
		selector:
			'.comp.compTextArea._default._isActive._quaternary, .comp.compTextArea._filled._isActive._quaternary',
		noPrefix: true,
	},
	{
		groupName: 'Active Border Color',
		displayName: 'Quinary Text Area Active Border Color',
		name: 'quinaryTextAreaActiveBorderColor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'border-color',
		selector:
			'.comp.compTextArea._default._isActive._quinary, .comp.compTextArea._filled._isActive._quinary',
		noPrefix: true,
	},

	{
		groupName: 'Active Filled Font Color',
		displayName: 'Text Area Filled Active  Font Color',
		name: 'textBoxFilledActiveFontColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._filled._isActive._secondary, .comp.compTextArea._filled._isActive._quaternary',
		noPrefix: true,
	},

	{
		groupName: 'IconColor',
		displayName: 'Primary Icon Color',
		name: 'primaryTextAreaIconColor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._primary ._leftIcon, .comp.compTextArea._primary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'IconColor',
		displayName: 'Secondary Icon Color',
		name: 'secondaryTextAreaIconColor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._secondary ._leftIcon, .comp.compTextArea._secondary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'IconColor',
		displayName: 'Tertiary Icon Color',
		name: 'tertiaryTextAreaIconColor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._tertiary ._leftIcon, .comp.compTextArea._tertiary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'IconColor',
		displayName: 'Quaternary Icon Color',
		name: 'quaternaryTextAreaIconColor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._quaternary ._leftIcon, .comp.compTextArea._quaternary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'IconColor',
		displayName: 'Quinary Icon Color',
		name: 'quinaryTextAreaIconColor',
		defaultValue: '<fontColorSix>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._quinary ._leftIcon, .comp.compTextArea._quinary ._rightIcon',
		noPrefix: true,
	},

	{
		groupName: 'Active IconColor',
		displayName: 'Primary Active Icon Color',
		name: 'primaryActiveTextAreaIconColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._isActive._primary ._leftIcon, .comp.compTextArea._isActive._primary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'Active IconColor',
		displayName: 'Secondary Active Icon Color',
		name: 'secondaryActiveTextAreaIconColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._isActive._secondary ._leftIcon, .comp.compTextArea._isActive._secondary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'Active IconColor',
		displayName: 'Tertiary Active Icon Color',
		name: 'tertiaryActiveTextAreaIconColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._isActive._tertiary ._leftIcon, .comp.compTextArea._isActive._tertiary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'Active IconColor',
		displayName: 'Quaternary Active Icon Color',
		name: 'quaternaryActiveTextAreaIconColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._isActive._quaternary ._leftIcon, .comp.compTextArea._isActive._quaternary ._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'Active IconColor',
		displayName: 'Quinary Active Icon Color',
		name: 'quinaryActiveTextAreaIconColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._isActive._quinary ._leftIcon, .comp.compTextArea._isActive._quinary ._rightIcon',
		noPrefix: true,
	},

	{
		groupName: 'Active Filled Icon Color',
		displayName: 'Text Area Filled Active  Font Color',
		name: 'textBoxFilledActiveFontColor',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._filled._isActive._secondary ._leftIcon, .comp.compTextArea._filled._isActive._quaternary ._leftIcon, .comp.compTextArea._filled._isActive._secondary ._rightIcon, .comp.compTextArea._filled._isActive._quaternary ._rightIcon',
		noPrefix: true,
	},

	{
		groupName: 'Success Icon Color',
		displayName: 'Success Icon Color',
		name: 'successTextAreaIconColor',
		defaultValue: '<successColor>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea ._successIcon._rightIcon, .comp.compTextArea._isActive ._successIcon._rightIcon',
		noPrefix: true,
	},
	{
		groupName: 'Error Icon Color',
		displayName: 'Error Icon Color',
		name: 'errorTextAreaIconColor',
		defaultValue: '<errorColor>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea ._errorIcon._rightIcon, .comp.compTextArea._isActive ._errorIcon._rightIcon',
		noPrefix: true,
	},

	{
		groupName: 'Error Border Color',
		displayName: 'Error Active Border Color',
		name: 'errorTextAreaBorderColor',
		defaultValue: '<errorColor>',
		cssProperty: 'border-color',
		selector:
			'.comp.compTextArea._default._hasError, .comp.compTextArea._outlined._hasError, .comp.compTextArea._filled._hasError, .comp.compTextArea._default._isActive._hasError, .comp.compTextArea._filled._isActive._hasError',
		noPrefix: true,
	},

	{
		groupName: 'Error Filled',
		displayName: 'Error Filled Text Area Background',
		name: 'errorTextAreaBackgroundColorForFilledDesign',
		defaultValue: '<errorColor>',
		cssProperty: 'background',
		selector:
			'.comp.compTextArea._filled._isActive._hasError, .comp.compTextArea._filled._hasError',
		noPrefix: true,
	},

	{
		groupName: 'Error Filled',
		displayName: 'Error Filled Text Area Font Color',
		name: 'errorTextAreaFontColorForFilledDesign',
		defaultValue: '<fontColorTwo>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._filled._isActive._hasError, .comp.compTextArea._filled._hasError, .comp.compTextArea._filled._isActive._hasError ._leftIcon, .comp.compTextArea._filled._hasError ._leftIcon, .comp.compTextArea._filled._isActive._hasError ._rightIcon, .comp.compTextArea._filled._hasError ._rightIcon',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Support Text Font',
		name: 'defaultTextAreaSupportTextFont',
		defaultValue: '<quaternaryFont>',
		cssProperty: 'font',
		selector: '.comp.compTextArea._default ._supportText',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Support Text Font',
		name: 'filledTextAreaSupportTextFont',
		defaultValue: '<quaternaryFont>',
		cssProperty: 'font',
		selector: '.comp.compTextArea._filled ._supportText',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Text Area Support Text Color',
		name: 'defaultTextAreaSupportTextColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._default ._supportText',
		noPrefix: true,
	},
	{
		groupName: 'Filled',
		displayName: 'Filled Text Area Support Text Color',
		name: 'filledTextAreaSupportTextColor',
		defaultValue: '<fontColorEight>',
		cssProperty: 'color',
		selector: '.comp.compTextArea._filled ._supportText',
		noPrefix: true,
	},

	{
		groupName: 'Active Support Text Color',
		displayName: 'Primary Text Area Active Support Text Color',
		name: 'primaryTextAreaActiveSupportTextColor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._primary ._supportText, .comp.compTextArea._filled._isActive._primary ._supportText',
		noPrefix: true,
	},
	{
		groupName: 'Active Support Text Color',
		displayName: 'Secondary Text Area Active  Support Text Color',
		name: 'secondaryTextAreaActiveSupportTextColor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._secondary ._supportText, .comp.compTextArea._filled._isActive._secondary ._supportText',
		noPrefix: true,
	},
	{
		groupName: 'Active Support Text Color',
		displayName: 'Tertiary Text Area Active Support Text Color',
		name: 'tertiaryTextAreaActiveSupportTextColor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._tertiary ._supportText, .comp.compTextArea._filled._isActive._tertiary ._supportText',
		noPrefix: true,
	},
	{
		groupName: 'Active Support Text Color',
		displayName: 'Quaternary Text Area Active Support Text Color',
		name: 'quaternaryTextAreaActiveSupportTextColor',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._quaternary ._supportText, .comp.compTextArea._filled._isActive._quaternary ._supportText',
		noPrefix: true,
	},
	{
		groupName: 'Active Support Text Color',
		displayName: 'Quinary Text Area Active Support Text Color',
		name: 'quinaryTextAreaActiveSupportTextColor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector:
			'.comp.compTextArea._default._isActive._quinary ._supportText, .comp.compTextArea._filled._isActive._quinary ._supportText',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
