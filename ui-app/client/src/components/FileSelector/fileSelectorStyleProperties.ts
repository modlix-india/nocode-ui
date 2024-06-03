import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		displayName: 'File Selector Font',
		name: 'fileSelectorFont',
		defaultValue: '<primaryFont>',
		cssProperty: 'font',
		selector: '.comp.compFileSelector',
	},

	{
		groupName: 'Color of the upload image',
		displayName: 'Primary Upload Image Color',
		name: 'primaryUploadImageColor',
		defaultValue: '<fontColorThree>',
		cssProperty: 'color',
		selector: '.comp.compFileSelector._primary',
		noPrefix: true,
	},
	{
		groupName: 'Color of the upload image',
		displayName: 'Secondary Upload Image Color',
		name: 'secondaryUploadImageColor',
		defaultValue: '<fontColorFour>',
		cssProperty: 'color',
		selector: '.comp.compFileSelector._secondary',
		noPrefix: true,
	},
	{
		groupName: 'Color of the upload image',
		displayName: 'Tertiary Upload Image Color',
		name: 'tertiaryUploadImageColor',
		defaultValue: '<fontColorFive>',
		cssProperty: 'color',
		selector: '.comp.compFileSelector._tertiary',
		noPrefix: true,
	},
	{
		groupName: 'Color of the upload image',
		displayName: 'Quaternary Upload Image Color',
		name: 'quaternaryUploadImageColor',
		defaultValue: '<fontColorNine>',
		cssProperty: 'color',
		selector: '.comp.compFileSelector._quaternary',
		noPrefix: true,
	},
	{
		groupName: 'Color of the upload image',
		displayName: 'Quinary Upload Image Color',
		name: 'quinaryUploadImageColor',
		defaultValue: '<fontColorSeven>',
		cssProperty: 'color',
		selector: '.comp.compFileSelector._quinary',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
