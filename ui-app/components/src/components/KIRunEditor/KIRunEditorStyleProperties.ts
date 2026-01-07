import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'gridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'gridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'gridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'gridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'anchoredGridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'gapBetween',
		cp: 'gap',
		dn: 'Gap between children',
		de: 'Gap between children of grid.',
		dv: '5px',
		sel: '.comp.compGrid ._anchorGrid, .comp.compGrid._noAnchorGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
