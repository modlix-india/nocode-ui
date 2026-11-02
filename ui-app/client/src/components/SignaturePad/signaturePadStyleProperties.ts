import { StylePropertyDefinition } from '../../types/common';

const PREFIX = '.comp.compSignaturePad';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		gn: 'Pad',
		dn: 'Pad Background',
		n: 'signaturePadBackground',
		dv: '<backgroundColorSeven>',
		cp: 'background',
		sel: `${PREFIX} ._pad`,
		np: true,
	},
	{
		gn: 'Pad',
		dn: 'Pad Border Color',
		n: 'signaturePadBorderColor',
		dv: '<fontColorSix>',
		cp: 'border-color',
		sel: `${PREFIX} ._pad`,
		np: true,
	},
	{
		gn: 'Pad',
		dn: 'Pad Border Radius',
		n: 'signaturePadBorderRadius',
		dv: '8px',
		cp: 'border-radius',
		sel: `${PREFIX} ._pad`,
		np: true,
	},
	{
		gn: 'Pad',
		dn: 'Signature Line Color',
		n: 'signaturePadLineColor',
		dv: '<fontColorEight>',
		cp: 'border-top-color',
		sel: `${PREFIX} ._line`,
		np: true,
	},
	{
		gn: 'Hint',
		dn: 'Hint Color',
		n: 'signaturePadHintColor',
		dv: '<fontColorEight>',
		cp: 'color',
		sel: `${PREFIX} ._hint`,
		np: true,
	},
	{
		gn: 'Hint',
		dn: 'Hint Font',
		n: 'signaturePadHintFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: `${PREFIX} ._hint`,
		np: true,
	},
	{
		gn: 'Buttons',
		dn: 'Button Color',
		n: 'signaturePadButtonColor',
		dv: '<fontColorSeven>',
		cp: 'color',
		sel: `${PREFIX} ._button`,
		np: true,
	},
	{
		gn: 'Buttons',
		dn: 'Button Font',
		n: 'signaturePadButtonFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: `${PREFIX} ._button`,
		np: true,
	},
	{
		gn: 'Read Only',
		dn: 'Read Only Pad Opacity',
		n: 'signaturePadReadOnlyOpacity',
		dv: '0.7',
		cp: 'opacity',
		sel: `${PREFIX}._readOnly ._pad`,
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
