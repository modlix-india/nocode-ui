import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		dn: 'Radio Button Font',
		n: 'radioButtonFont',
		dv: '<primaryFont>',
		np: true,
	},

	{
		gn: 'Default',
		dn: 'Default Radio Button Font',
		n: 'defaultRadioButtonFont',
		dv: '<radioButtonFont>',
		cp: 'font',
		sel: '.comp.compRadioButton._default label',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Font',
		n: 'outlineRadioButtonFont',
		dv: '<radioButtonFont>',
		cp: 'font',
		sel: '.comp.compRadioButton._outlined label',
		np: true,
	},

	{
		gn: 'Default',
		dn: 'Default Radio Button Border',
		n: 'defaultRadioButtonBorder',
		dv: 'none',
		cp: 'border',
		sel: '.comp.compRadioButton._default .commonCheckbox',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Border',
		n: 'outlineRadioButtonBorder',
		dv: '2px solid',
		cp: 'border',
		sel: '.comp.compRadioButton._outlined .commonCheckbox',
		np: true,
	},

	{
		gn: 'Border Color',
		dn: 'Primary Outline Radio Button Border Color',
		n: 'primaryOutlineRadioButtonBorderColor',
		dv: '<fontColorThree>',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._primary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Border Color',
		dn: 'Secondary Outline Radio Button Border Color',
		n: 'secondaryOutlineRadioButtonBorderColor',
		dv: '<fontColorFour>',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._secondary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Border Color',
		dn: 'Tertiary Outline Radio Button Border Color',
		n: 'tertiaryOutlineRadioButtonBorderColor',
		dv: '<fontColorFive>',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._tertiary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Border Color',
		dn: 'Quaternary Outline Radio Button Border Color',
		n: 'quaternaryOutlineRadioButtonBorderColor',
		dv: '<fontColorNine>',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._quaternary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Border Color',
		dn: 'Quinary Outline Radio Button Border Color',
		n: 'quinaryOutlineRadioButtonBorderColor',
		dv: '<fontColorSeven>',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._quinary .commonCheckbox',
		np: true,
	},

	{
		gn: 'Background Color',
		dn: 'Primary Default Radio Button Background',
		n: 'primaryDefaultRadioButtonBackground',
		dv: '<backgroundColorOne>',
		cp: 'background',
		sel: '.comp.compRadioButton._default._primary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Background Color',
		dn: 'Secondary Default Radio Button Background',
		n: 'secondaryDefaultRadioButtonBackground',
		dv: '<backgroundColorTwo>',
		cp: 'background',
		sel: '.comp.compRadioButton._default._secondary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Background Color',
		dn: 'Tertiary Default Radio Button Background',
		n: 'tertiaryDefaultRadioButtonBackground',
		dv: '<backgroundColorThree>',
		cp: 'background',
		sel: '.comp.compRadioButton._default._tertiary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Background Color',
		dn: 'Quaternary Default Radio Button Background',
		n: 'quaternaryDefaultRadioButtonBackground',
		dv: '<backgroundColorFour>',
		cp: 'background',
		sel: '.comp.compRadioButton._default._quaternary .commonCheckbox',
		np: true,
	},
	{
		gn: 'Background Color',
		dn: 'Quinary Default Radio Button Background',
		n: 'quinaryDefaultRadioButtonBackground',
		dv: '<backgroundColorFive>',
		cp: 'background',
		sel: '.comp.compRadioButton._default._quinary .commonCheckbox',
		np: true,
	},

	{
		gn: 'Background Color',
		dn: 'Outline Radio Button Background',
		n: 'outlineRadioButtonBackground',
		dv: '<backgroundColorSeven>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined .commonCheckbox',
		np: true,
	},

	{
		gn: 'Tick Color',
		dn: 'Radio Button Tick Color',
		n: 'radioButtonTickColor',
		dv: '<backgroundColorSeven>',
		cp: 'background',
		sel: '.comp.compRadioButton._default .commonCheckbox ._thumb',
		np: true,
	},

	{
		gn: 'Tick Color',
		dn: 'Primary Outline Radio Button Tick Color',
		n: 'primaryOutlineRadioButtonTickColor',
		dv: '<fontColorThree>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined._primary .commonCheckbox ._thumb',
		np: true,
	},
	{
		gn: 'Tick Color',
		dn: 'Secondary Outline Radio Button Tick Color',
		n: 'secondaryOutlineRadioButtonTickColor',
		dv: '<fontColorFour>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined._secondary .commonCheckbox ._thumb',
		np: true,
	},
	{
		gn: 'Tick Color',
		dn: 'Tertiary Outline Radio Button Tick Color',
		n: 'tertiaryOutlineRadioButtonTickColor',
		dv: '<fontColorFive>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined._tertiary .commonCheckbox ._thumb',
		np: true,
	},
	{
		gn: 'Tick Color',
		dn: 'Quaternary Outline Radio Button Tick Color',
		n: 'quaternaryOutlineRadioButtonTickColor',
		dv: '<fontColorNine>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined._quaternary .commonCheckbox ._thumb',
		np: true,
	},
	{
		gn: 'Tick Color',
		dn: 'Quinary Outline Radio Button Tick Color',
		n: 'quinaryOutlineRadioButtonTickColor',
		dv: '<fontColorSeven>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined._quinary .commonCheckbox ._thumb',
		np: true,
	},

	{
		gn: 'Border Color',
		dn: 'Outline Disabled Radio Button Border Color',
		n: 'outlineDisabledRadioButtonBorderColor',
		dv: '<fontColorEight>',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._primary .commonCheckbox._disabled,.comp.compRadioButton._outlined._secondary .commonCheckbox._disabled,.comp.compRadioButton._outlined._tertiary .commonCheckbox._disabled,.comp.compRadioButton._outlined._quaternary .commonCheckbox._disabled,.comp.compRadioButton._outlined._quinary .commonCheckbox._disabled',
		np: true,
	},
	{
		gn: 'Background Color',
		dn: 'Default Disabled Radio Button Background',
		n: 'defaultDisabledRadioButtonBackground',
		dv: '<backgroundColorEight>',
		cp: 'background',
		sel: '.comp.compRadioButton._default._primary .commonCheckbox._disabled,.comp.compRadioButton._default._secondary .commonCheckbox._disabled,.comp.compRadioButton._default._tertiary .commonCheckbox._disabled,.comp.compRadioButton._default._quaternary .commonCheckbox._disabled,.comp.compRadioButton._default._quinary .commonCheckbox._disabled',
		np: true,
	},
	{
		gn: 'Tick Color',
		dn: ' Outline Disabled Radio Button Tick Color',
		n: ' OutlineDisabledRadioButtonTickColor',
		dv: '<fontColorEight>',
		cp: 'background',
		sel: '.comp.compRadioButton._outlined._primary .commonCheckbox._disabled ._thumb,.comp.compRadioButton._outlined._secondary .commonCheckbox._disabled ._thumb,.comp.compRadioButton._outlined._tertiary .commonCheckbox._disabled ._thumb,.comp.compRadioButton._outlined._quaternary .commonCheckbox._disabled ._thumb,.comp.compRadioButton._outlined._quinary .commonCheckbox._disabled ._thumb',
		np: true,
	},
	{
		gn: 'Font Color',
		dn: 'Outline Disabled Radio Button Font Color',
		n: 'outlineDisabledRadioButtonFontColor',
		dv: '<fontColorEight>',
		cp: 'color',
		sel: '.comp.compRadioButton._outlined label._disabled',
		np: true,
	},

	{
		gn: 'Font Color',
		dn: 'Primary Outline Radio Button Font Color',
		n: 'primaryOutlineRadioButtonFontColor',
		dv: '<fontColorThree>',
		cp: 'color',
		sel: '.comp.compRadioButton._outlined._primary',
		np: true,
	},
	{
		gn: 'Font Color',
		dn: 'Secondary Outline Radio Button Font Color',
		n: 'secondaryOutlineRadioButtonFontColor',
		dv: '<fontColorFour>',
		cp: 'color',
		sel: '.comp.compRadioButton._outlined._secondary',
		np: true,
	},
	{
		gn: 'Font Color',
		dn: 'Tertiary Outline Radio Button Font Color',
		n: 'tertiaryOutlineRadioButtonFontColor',
		dv: '<fontColorFive>',
		cp: 'color',
		sel: '.comp.compRadioButton._outlined._tertiary',
		np: true,
	},
	{
		gn: 'Font Color',
		dn: 'Quaternary Outline Radio Button Font Color',
		n: 'quaternaryOutlineRadioButtonFontColor',
		dv: '<fontColorNine>',
		cp: 'color',
		sel: '.comp.compRadioButton._outlined._quaternary',
		np: true,
	},
	{
		gn: 'Font Color',
		dn: 'Quinary Outline Radio Button Font Color',
		n: 'quinaryOutlineRadioButtonFontColor',
		dv: '<fontColorSeven>',
		cp: 'color',
		sel: '.comp.compRadioButton._outlined._quinary',
		np: true,
	},

	{
		gn: 'Gap',
		dn: 'Radio Button Group Gap',
		n: 'radioButtonGroupGap',
		dv: '5px',
		cp: 'gap',
		sel: '.comp.compRadioButton',
		np: true,
	},
	{
		gn: 'Default',
		dn: 'Default Radio Button Label Width',
		n: 'defaultRadioButtonLabelWidth',
		cp: 'width',
		sel: '.comp.compRadioButton._default label',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Label Width',
		n: 'outlineRadioButtonLabelWidth',
		cp: 'width',
		sel: '.comp.compRadioButton._outlined label',
		np: true,
	},

	{
		gn: 'Default',
		dn: 'Default Radio Button Label Height',
		n: 'defaultRadioButtonLabelHeight',
		cp: 'height',
		sel: '.comp.compRadioButton._default label',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Label Height',
		n: 'outlineRadioButtonLabelHeight',
		cp: 'height',
		sel: '.comp.compRadioButton._outlined label',
		np: true,
	},

	{
		gn: 'Default',
		dn: 'Default Radio Button Label Border Radius',
		n: 'defaultRadioButtonLabelBorderRadius',
		cp: 'border-radius',
		sel: '.comp.compRadioButton._default label',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Label Border Radius',
		n: 'outlineRadioButtonLabelBorderRadius',
		cp: 'border-radius',
		sel: '.comp.compRadioButton._outlined label',
		np: true,
	},

	{
		gn: 'Default',
		dn: 'Default Radio Button Label Border',
		n: 'defaultRadioButtonLabelBorder',
		cp: 'border',
		sel: '.comp.compRadioButton._default label',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Label Border',
		n: 'outlineRadioButtonLabelBorder',
		cp: 'border',
		sel: '.comp.compRadioButton._outlined label',
		np: true,
	},

	{
		gn: 'Default',
		dn: 'Default Radio Button Label Padding',
		n: 'defaultRadioButtonLabelPadding',
		cp: 'padding',
		sel: '.comp.compRadioButton._default label',
		np: true,
	},
	{
		gn: 'Outline',
		dn: 'Outline Radio Button Label Padding',
		n: 'outlineRadioButtonLabelPadding',
		cp: 'padding',
		sel: '.comp.compRadioButton._outlined label',
		np: true,
	},
	{
		gn: 'Checked Border Color',
		dn: 'Primary Outline Radio Button Checked Border Color',
		n: 'primaryOutlineRadioButtonCheckedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._primary .commonCheckbox._checked',
		np: true,
	},
	{
		gn: 'Checked Border Color',
		dn: 'Secondary Outline Radio Button Checked Border Color',
		n: 'secondaryOutlineRadioButtonCheckedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._secondary .commonCheckbox._checked',
		np: true,
	},
	{
		gn: 'Checked Border Color',
		dn: 'Tertiary Outline Radio Button Checked Border Color',
		n: 'tertiaryOutlineRadioButtonCheckedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._tertiary .commonCheckbox._checked',
		np: true,
	},
	{
		gn: 'Checked Border Color',
		dn: 'Quaternary Outline Radio Button Checked Border Color',
		n: 'quaternaryOutlineRadioButtonCheckedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._quaternary .commonCheckbox._checked',
		np: true,
	},
	{
		gn: 'Checked Border Color',
		dn: 'Quinary Outline Radio Button Checked Border Color',
		n: 'quinaryOutlineRadioButtonCheckedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._quinary .commonCheckbox._checked',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Primary Outline Radio Button Label Selected Border Color',
		n: 'primaryOutlineRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._primary  label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Secondary Outline Radio Button Label Selected Border Color',
		n: 'secondaryOutlineRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._secondary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Tertiary Outline Radio Button Label Selected Border Color',
		n: 'tertiaryOutlineRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._tertiary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Quaternary Outline Radio Button Label Selected Border Color',
		n: 'quaternaryOutlineRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._quaternary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Quinary Outline Radio Button Label Selected Border Color',
		n: 'quinaryOutlineRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._outlined._quinary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Primary Outline Radio Button Label Selected Box Shadow',
		n: 'primaryOutlineRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._outlined._primary  label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Secondary Outline Radio Button Label Selected Box Shadow',
		n: 'secondaryOutlineRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._outlined._secondary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Tertiary Outline Radio Button Label Selected Box Shadow',
		n: 'tertiaryOutlineRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._outlined._tertiary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Quaternary Outline Radio Button Label Selected Box Shadow',
		n: 'quaternaryOutlineRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._outlined._quaternary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Quinary Outline Radio Button Label Selected Box Shadow',
		n: 'quinaryOutlineRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._outlined._quinary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Primary Default Radio Button Label Selected Border Color',
		n: 'primaryDefaultRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._default._primary  label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Secondary Default Radio Button Label Selected Border Color',
		n: 'secondaryDefaultRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._default._secondary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Tertiary Default Radio Button Label Selected Border Color',
		n: 'tertiaryDefaultRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._default._tertiary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Quaternary Default Radio Button Label Selected Border Color',
		n: 'quaternaryDefaultRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._default._quaternary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Border Color',
		dn: 'Quinary Default Radio Button Label Selected Border Color',
		n: 'quinaryDefaultRadioButtonLabelSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compRadioButton._default._quinary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Primary Default Radio Button Label Selected Box Shadow',
		n: 'primaryDefaultRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._default._primary  label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Secondary Default Radio Button Label Selected Box Shadow',
		n: 'secondaryDefaultRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._default._secondary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Tertiary Default Radio Button Label Selected Box Shadow',
		n: 'tertiaryDefaultRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._default._tertiary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Quaternary Default Radio Button Label Selected Box Shadow',
		n: 'quaternaryDefaultRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._default._quaternary label._selected',
		np: true,
	},
	{
		gn: 'Selected Label Box Shadow',
		dn: 'Quinary Default Radio Button Label Selected Box Shadow',
		n: 'quinaryDefaultRadioButtonLabelSelectedBoxShadow',
		cp: 'box-shadow',
		sel: '.comp.compRadioButton._default._quinary label._selected',
		np: true,
	},
	
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
