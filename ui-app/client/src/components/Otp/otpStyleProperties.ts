import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [];

export const styleDefaults = new Map<string, string>();

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = [
	{
		"cp": "box-shadow",
		"sel": ".comp.compOtp<designType><colorScheme>  ._inputBox._hasValue",
		"np": true,
		"gn": "Box Shadow",
		"dn": "BoxShadow HasValue Value",
		"n": "otpBoxShadowHasValueValue<designType><colorScheme>"
	},
	{
		"cp": "font",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "<primaryFont>",
			"_dashed-": "<primaryFont>",
			"_filled-": "<primaryFont>",
			"_round-": "<primaryFont>"
		},
		"gn": "Font",
		"dn": "Font InputBox",
		"n": "otpFontInputBox<designType><colorScheme>"
	},
	{
		"cp": "width",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "30px",
			"_dashed-": "30px",
			"_filled-": "30px",
			"_round-": "30px"
		},
		"gn": "Width",
		"dn": "Width InputBox",
		"n": "otpWidthInputBox<designType><colorScheme>"
	},
	{
		"cp": "height",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "30px",
			"_dashed-": "30px",
			"_filled-": "30px",
			"_round-": "30px"
		},
		"gn": "Height",
		"dn": "Height InputBox",
		"n": "otpHeightInputBox<designType><colorScheme>"
	},
	{
		"cp": "margin",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "8px",
			"_dashed-": "8px",
			"_filled-": "8px",
			"_round-": "8px"
		},
		"gn": "Margin",
		"dn": "Margin InputBox",
		"n": "otpMarginInputBox<designType><colorScheme>"
	},
	{
		"cp": "border-style",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "solid",
			"_dashed-": "solid",
			"_filled-": "solid",
			"_round-": "solid"
		},
		"gn": "Border Style",
		"dn": "BorderStyle InputBox",
		"n": "otpBorderStyleInputBox<designType><colorScheme>"
	},
	{
		"cp": "border",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "1 px solid",
			"_dashed-": "none",
			"_filled-": "none",
			"_round-": "1 px solid"
		},
		"gn": "Border",
		"dn": "Border InputBox",
		"n": "otpBorderInputBox<designType><colorScheme>"
	},
	{
		"cp": "border-bottom",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_dashed-": "2px solid"
		},
		"gn": "Border Bottom",
		"dn": "BorderBottom InputBox",
		"n": "otpBorderBottomInputBox<designType><colorScheme>"
	},
	{
		"cp": "border-radius",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-": "4px",
			"_dashed-": "0px",
			"_filled-": "4px",
			"_round-": "50px"
		},
		"gn": "Border Radius",
		"dn": "BorderRadius InputBox",
		"n": "otpBorderRadiusInputBox<designType><colorScheme>"
	},
	{
		"cp": "border-bottom-color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_dashed-_primary": "<fontColorOne>",
			"_dashed-_secondary": "<fontColorOne>",
			"_dashed-_tertiary": "<fontColorOne>",
			"_dashed-_quaternary": "<fontColorOne>",
			"_dashed-_quinary": "<fontColorOne>"
		},
		"gn": "Border Bottom Color",
		"dn": "BorderBottomColor InputBox",
		"n": "otpBorderBottomColorInputBox<designType><colorScheme>"
	},
	{
		"cp": "border-color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_default-_primary": "<fontColorEight>",
			"_default-_secondary": "<fontColorEight>",
			"_default-_tertiary": "<fontColorEight>",
			"_default-_quaternary": "<fontColorEight>",
			"_default-_quinary": "<fontColorEight>",
			"_round-_primary": "<fontColorEight>",
			"_round-_secondary": "<fontColorEight>",
			"_round-_tertiary": "<fontColorEight>",
			"_round-_quaternary": "<fontColorEight>",
			"_round-_quinary": "<fontColorEight>"
		},
		"gn": "Border Color",
		"dn": "BorderColor InputBox",
		"n": "otpBorderColorInputBox<designType><colorScheme>"
	},
	{
		"cp": "background",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"spv": {
			"_filled-_primary": "<backgroundColorOne>",
			"_filled-_secondary": "<backgroundColorTwo>",
			"_filled-_tertiary": "<backgroundColorThree>",
			"_filled-_quaternary": "<backgroundColorFour>",
			"_filled-_quinary": "<backgroundColorFive>",
			"_round-_primary": "linear-gradient(90deg, #96A1B41A 0%, #33333300 64.33%), white",
			"_round-_secondary": "linear-gradient(90deg, #96A1B41A 0%, #33333300 64.33%), white",
			"_round-_tertiary": "linear-gradient(90deg, #96A1B41A 0%, #33333300 64.33%), white",
			"_round-_quaternary": "linear-gradient(90deg, #96A1B41A 0%, #33333300 64.33%), white",
			"_round-_quinary": "linear-gradient(90deg, #96A1B41A 0%, #33333300 64.33%), white"
		},
		"gn": "Background",
		"dn": "Background InputBox",
		"n": "otpBackgroundInputBox<designType><colorScheme>",
		"dv": "<backgroundColorSeven>"
	},
	{
		"cp": "box-shadow",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox",
		"np": true,
		"gn": "Box Shadow",
		"dn": "BoxShadow InputBox",
		"n": "otpBoxShadowInputBox<designType><colorScheme>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_filled-_primary": "<fontColorTwo>",
			"_filled-_secondary": "<fontColorTwo>",
			"_filled-_quaternary": "<fontColorTwo>"
		},
		"gn": "Color",
		"dn": "Color HasValue Value",
		"n": "otpColorHasValueValue<designType><colorScheme>",
		"dv": "<fontColorOne>"
	},
	{
		"cp": "border-color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_default-_primary": "<fontColorThree>",
			"_default-_secondary": "<fontColorFour>",
			"_default-_tertiary": "<fontColorFive>",
			"_default-_quaternary": "<fontColorNine>",
			"_default-_quinary": "<fontColorSeven>",
			"_round-_primary": "<fontColorThree>",
			"_round-_secondary": "<fontColorFour>",
			"_round-_tertiary": "<fontColorFive>",
			"_round-_quaternary": "<fontColorNine>",
			"_round-_quinary": "<fontColorSeven>"
		},
		"gn": "Border Color",
		"dn": "BorderColor HasValue Value",
		"n": "otpBorderColorHasValueValue<designType><colorScheme>"
	},
	{
		"cp": "border-bottom-color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_dashed-_primary": "<fontColorThree>",
			"_dashed-_secondary": "<fontColorFour>",
			"_dashed-_tertiary": "<fontColorFive>",
			"_dashed-_quaternary": "<fontColorNine>",
			"_dashed-_quinary": "<fontColorSeven>"
		},
		"gn": "Border Bottom Color",
		"dn": "BorderBottomColor HasValue Value",
		"n": "otpBorderBottomColorHasValueValue<designType><colorScheme>"
	},
	{
		"cp": "background",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_filled-_primary": "<backgroundColorOne>",
			"_filled-_secondary": "<backgroundColorTwo>",
			"_filled-_tertiary": "<backgroundColorThree>",
			"_filled-_quaternary": "<backgroundColorFour>",
			"_filled-_quinary": "<backgroundColorFive>",
			"_round-_primary": "linear-gradient(90deg, <backgroundColorOne>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_secondary": "linear-gradient(90deg, <backgroundColorTwo>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_tertiary": "linear-gradient(90deg, <backgroundColorThree>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_quaternary": "linear-gradient(90deg, <backgroundColorFour>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_quinary": "linear-gradient(90deg, <backgroundColorFive>19 0%, <backgroundColorSix>00 64.33%), white"
		},
		"gn": "Background",
		"dn": "Background HasValue Value",
		"n": "otpBackgroundHasValueValue<designType><colorScheme>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"spv": {
			"_default-_primary": "<fontColorOne>",
			"_default-_tertiary": "<fontColorOne>",
			"_default-_quaternary": "<fontColorOne>",
			"_default-_quinary": "<fontColorOne>",
			"_dashed-_primary": "<fontColorOne>",
			"_dashed-_secondary": "<fontColorOne>",
			"_dashed-_tertiary": "<fontColorOne>",
			"_dashed-_quaternary": "<fontColorOne>",
			"_dashed-_quinary": "<fontColorOne>",
			"_filled-_primary": "<fontColorTwo>",
			"_filled-_secondary": "<fontColorTwo>",
			"_filled-_tertiary": "<fontColorOne>",
			"_filled-_quaternary": "<fontColorTwo>",
			"_filled-_quinary": "<fontColorOne>",
			"_round-_primary": "<fontColorOne>",
			"_round-_secondary": "<fontColorOne>",
			"_round-_tertiary": "<fontColorOne>",
			"_round-_quaternary": "<fontColorOne>",
			"_round-_quinary": "<fontColorOne>"
		},
		"gn": "Color",
		"dn": "Color IsActive Active",
		"n": "otpColorIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "border",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"spv": {
			"_default-": "2 px solid",
			"_dashed-": "none",
			"_round-": "2 px solid"
		},
		"gn": "Border",
		"dn": "Border IsActive Active",
		"n": "otpBorderIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "border-bottom",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"spv": {
			"_dashed-": "2px solid"
		},
		"gn": "Border Bottom",
		"dn": "BorderBottom IsActive Active",
		"n": "otpBorderBottomIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "border-bottom-color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"spv": {
			"_dashed-_primary": "<fontColorThree>",
			"_dashed-_secondary": "<fontColorFour>",
			"_dashed-_tertiary": "<fontColorFive>",
			"_dashed-_quaternary": "<fontColorNine>",
			"_dashed-_quinary": "<fontColorSeven>"
		},
		"gn": "Border Bottom Color",
		"dn": "BorderBottomColor IsActive Active",
		"n": "otpBorderBottomColorIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "border-color",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"spv": {
			"_default-_primary": "<fontColorThree>",
			"_default-_secondary": "<fontColorFour>",
			"_default-_tertiary": "<fontColorFive>",
			"_default-_quaternary": "<fontColorNine>",
			"_default-_quinary": "<fontColorSeven>",
			"_round-_primary": "<fontColorThree>",
			"_round-_secondary": "<fontColorFour>",
			"_round-_tertiary": "<fontColorFive>",
			"_round-_quaternary": "<fontColorNine>",
			"_round-_quinary": "<fontColorSeven>"
		},
		"gn": "Border Color",
		"dn": "BorderColor IsActive Active",
		"n": "otpBorderColorIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "background",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"spv": {
			"_filled-_primary": "<backgroundColorOne>",
			"_filled-_secondary": "<backgroundColorTwo>",
			"_filled-_tertiary": "<backgroundColorThree>",
			"_filled-_quaternary": "<backgroundColorFour>",
			"_filled-_quinary": "<backgroundColorFive>",
			"_round-_primary": "linear-gradient(90deg, <backgroundColorOne>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_secondary": "linear-gradient(90deg, <backgroundColorTwo>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_tertiary": "linear-gradient(90deg, <backgroundColorThree>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_quaternary": "linear-gradient(90deg, <backgroundColorFour>19 0%, <backgroundColorSix>00 64.33%), white",
			"_round-_quinary": "linear-gradient(90deg, <backgroundColorFive>19 0%, <backgroundColorSix>00 64.33%), white"
		},
		"gn": "Background",
		"dn": "Background IsActive Active",
		"n": "otpBackgroundIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "box-shadow",
		"sel": ".comp.compOtp<designType><colorScheme> ._inputBox._isActive",
		"np": true,
		"gn": "Box Shadow",
		"dn": "BoxShadow IsActive Active",
		"n": "otpBoxShadowIsActiveActive<designType><colorScheme>"
	},
	{
		"cp": "font",
		"sel": ".comp.compOtp<designType><colorScheme> ._supportText",
		"np": true,
		"spv": {
			"_default-": "<quaternaryFont>",
			"_dashed-": "<quaternaryFont>",
			"_filled-": "<quaternaryFont>",
			"_round-": "<quaternaryFont>"
		},
		"gn": "Font",
		"dn": "Font SupportText",
		"n": "otpFontSupportText<designType><colorScheme>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme> ._supportText",
		"np": true,
		"spv": {},
		"gn": "Color",
		"dn": "Color SupportText",
		"n": "otpColorSupportText<designType><colorScheme>",
		"dv": "<fontColorEight>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme> ._supportText._supportTextActive",
		"np": true,
		"spv": {
			"_default-_secondary": "<fontColorFour>",
			"_default-_tertiary": "<fontColorFive>",
			"_default-_quaternary": "<fontColorNine>",
			"_default-_quinary": "<fontColorSeven>",
			"_dashed-_secondary": "<fontColorFour>",
			"_dashed-_tertiary": "<fontColorFive>",
			"_dashed-_quaternary": "<fontColorNine>",
			"_dashed-_quinary": "<fontColorSeven>",
			"_filled-_secondary": "<fontColorFour>",
			"_filled-_tertiary": "<fontColorFive>",
			"_filled-_quaternary": "<fontColorNine>",
			"_filled-_quinary": "<fontColorSeven>",
			"_round-_secondary": "<fontColorFour>",
			"_round-_tertiary": "<fontColorFive>",
			"_round-_quaternary": "<fontColorNine>",
			"_round-_quinary": "<fontColorSeven>"
		},
		"gn": "Color",
		"dn": "Color SupportTextActive",
		"n": "otpColorSupportTextActive<designType><colorScheme>",
		"dv": "<fontColorThree>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme>._disabled ._inputBox",
		"np": true,
		"spv": {
			"_filled-_primary": "<colorSix>",
			"_filled-_secondary": "<colorSix>",
			"_filled-_tertiary": "<colorSix>",
			"_filled-_quaternary": "<colorSix>",
			"_filled-_quinary": "<colorSix>"
		},
		"gn": "Color",
		"dn": "Color InputBox",
		"n": "otpColorInputBox<designType><colorScheme>"
	},
	{
		"cp": "border-color",
		"sel": ".comp.compOtp<designType><colorScheme>._disabled ._inputBox",
		"np": true,
		"spv": {
			"_default-_primary": "<fontColorSix>",
			"_default-_secondary": "<fontColorSix>",
			"_default-_tertiary": "<fontColorSix>",
			"_default-_quaternary": "<fontColorSix>",
			"_default-_quinary": "<fontColorSix>",
			"_filled-_primary": "<fontColorSix>",
			"_filled-_secondary": "<fontColorSix>",
			"_filled-_tertiary": "<fontColorSix>",
			"_filled-_quaternary": "<fontColorSix>",
			"_filled-_quinary": "<fontColorSix>",
			"_round-_primary": "<fontColorSix>",
			"_round-_secondary": "<fontColorSix>",
			"_round-_tertiary": "<fontColorSix>",
			"_round-_quaternary": "<fontColorSix>",
			"_round-_quinary": "<fontColorSix>"
		},
		"gn": "Border Color",
		"dn": "BorderColor Disabled InputBox",
		"n": "otpBorderColorInputBoxDisabled<designType><colorScheme>"
	},
	{
		"cp": "border-bottom-color",
		"sel": ".comp.compOtp<designType><colorScheme>._disabled ._inputBox",
		"np": true,
		"spv": {
			"_dashed-_primary": "<fontColorSix>",
			"_dashed-_secondary": "<fontColorSix>",
			"_dashed-_tertiary": "<fontColorSix>",
			"_dashed-_quaternary": "<fontColorSix>",
			"_dashed-_quinary": "<fontColorSix>"
		},
		"gn": "Border Bottom Color",
		"dn": "BorderBottomColor Disabled InputBox",
		"n": "otpBorderBottomColorInputBoxDisabled<designType><colorScheme>"
	},
	{
		"cp": "background",
		"sel": ".comp.compOtp<designType><colorScheme>._disabled ._inputBox",
		"np": true,
		"spv": {
			"_dashed-_primary": "<backgroundColorSeven>",
			"_dashed-_secondary": "<backgroundColorSeven>",
			"_dashed-_tertiary": "<backgroundColorSeven>",
			"_dashed-_quaternary": "<backgroundColorSeven>",
			"_dashed-_quinary": "<backgroundColorSeven>",
			"_filled-_primary": "<backgroundColorSeven>",
			"_filled-_secondary": "<backgroundColorSeven>",
			"_filled-_tertiary": "<backgroundColorSeven>",
			"_filled-_quaternary": "<backgroundColorSeven>",
			"_filled-_quinary": "<backgroundColorSeven>"
		},
		"gn": "Background",
		"dn": "Background Disabled InputBox",
		"n": "otpBackgroundInputBoxDisabled<designType><colorScheme>"
	},
	{
		"cp": "border-color",
		"sel": ".comp.compOtp<designType><colorScheme>._hasError ._inputBox,.comp.compOtp<designType><colorScheme>._hasError ._inputBox._isActive, .comp.compOtp<designType><colorScheme>._hasError ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_default-": "<errorColor>",
			"_dashed-": "<errorColor>",
			"_round-": "<errorColor>"
		},
		"gn": "Border Color",
		"dn": "BorderColor HasValue Value Active Error",
		"n": "otpBorderColorHasValueValueActiveError<designType><colorScheme>"
	},
	{
		"cp": "background",
		"sel": ".comp.compOtp<designType><colorScheme>._hasError ._inputBox,.comp.compOtp<designType><colorScheme>._hasError ._inputBox._isActive, .comp.compOtp<designType><colorScheme>._hasError ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_filled-": "<errorColor>",
			"_round-": "linear-gradient(90deg, <errorColor>19 0%, <backgroundColorSix>00 64.33%)"
		},
		"gn": "Background",
		"dn": "Background HasValue Value Active Error",
		"n": "otpBackgroundHasValueValueActiveError<designType><colorScheme>"
	},
	{
		"cp": "box-shadow",
		"sel": ".comp.compOtp<designType><colorScheme>._hasError ._inputBox,.comp.compOtp<designType><colorScheme>._hasError ._inputBox._isActive, .comp.compOtp<designType><colorScheme>._hasError ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_default-": "<errorColor>",
			"_dashed-": "<errorColor>",
			"_filled-": "<errorColor>",
			"_round-": "<errorColor>"
		},
		"gn": "Box Shadow",
		"dn": "BoxShadow HasValue Value Active Error",
		"n": "otpBoxShadowHasValueValueActiveError<designType><colorScheme>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme>._hasError ._inputBox._hasValue",
		"np": true,
		"spv": {
			"_filled-": "<fontColorTwo>"
		},
		"gn": "Color",
		"dn": "Color HasValue Value Error",
		"n": "otpColorHasValueValueError<designType><colorScheme>"
	},
	{
		"cp": "color",
		"sel": ".comp.compOtp<designType><colorScheme>._hasError ._inputBox._isActive",
		"np": true,
		"spv": {
			"_filled-": "<fontColorTwo>"
		},
		"gn": "Color",
		"dn": "Color IsActive Active Error",
		"n": "otpColorIsActiveActiveError<designType><colorScheme>"
	},
	{
		"cp": "color",
		"sel": ".comp.compTextBox<designType><colorScheme>._hasError ._inputBox",
		"np": true,
		"spv": {
			"_filled-": "<fontColorTwo>"
		},
		"gn": "Color",
		"dn": "Color InputBox Error",
		"n": "otpColorInputBoxError<designType><colorScheme>"
	}
];
