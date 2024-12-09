import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'sectionGridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for section grid.',
		sel: '.comp.compSectionGrid',
	},
	{
		n: 'sectionGridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for section grid.',
		sel: '.comp.compSectionGrid',
	},
	{
		n: 'sectionGridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for section grid.',
		sel: '.comp.compSectionGrid',
	},
	{
		n: 'sectionGridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for section grid.',
		sel: '.comp.compSectionGrid',
	},

	{
		n: 'gapBetweenSectionGrid',
		cp: 'gap',
		dn: 'Gap between children',
		de: 'Gap between children of section grid.',
		dv: '5px',
		sel: '.comp.compSectionGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
