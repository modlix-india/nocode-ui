import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'sectionGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for section grid.',
		selector: '.comp.compSectionGrid',
	},
	{
		name: 'sectionGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for section grid.',
		selector: '.comp.compSectionGrid',
	},
	{
		name: 'sectionGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for section grid.',
		selector: '.comp.compSectionGrid',
	},
	{
		name: 'sectionGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for section grid.',
		selector: '.comp.compSectionGrid',
	},

	{
		name: 'gapBetweenSectionGrid',
		cssProperty: 'gap',
		displayName: 'Gap between children',
		description: 'Gap between children of section grid.',
		defaultValue: '5px',
		selector: '.comp.compSectionGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
