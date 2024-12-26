import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		dn: 'File Selector Font',
		n: 'fileSelectorFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: '.comp.compFileSelector',
	},

	{
		gn: 'Color of the upload image',
		dn: 'Primary Upload Image Color',
		n: 'primaryUploadImageColor',
		dv: '<fontColorThree>',
		cp: 'color',
		sel: '.comp.compFileSelector._primary',
		np: true,
	},
	{
		gn: 'Color of the upload image',
		dn: 'Secondary Upload Image Color',
		n: 'secondaryUploadImageColor',
		dv: '<fontColorFour>',
		cp: 'color',
		sel: '.comp.compFileSelector._secondary',
		np: true,
	},
	{
		gn: 'Color of the upload image',
		dn: 'Tertiary Upload Image Color',
		n: 'tertiaryUploadImageColor',
		dv: '<fontColorFive>',
		cp: 'color',
		sel: '.comp.compFileSelector._tertiary',
		np: true,
	},
	{
		gn: 'Color of the upload image',
		dn: 'Quaternary Upload Image Color',
		n: 'quaternaryUploadImageColor',
		dv: '<fontColorNine>',
		cp: 'color',
		sel: '.comp.compFileSelector._quaternary',
		np: true,
	},
	{
		gn: 'Color of the upload image',
		dn: 'Quinary Upload Image Color',
		n: 'quinaryUploadImageColor',
		dv: '<fontColorSeven>',
		cp: 'color',
		sel: '.comp.compFileSelector._quinary',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
