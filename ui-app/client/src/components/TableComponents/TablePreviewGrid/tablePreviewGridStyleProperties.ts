import { StyleGroupDefinition, StylePropertyDefinition } from '../../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'tablePreviewGridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		n: 'tablePreviewGridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		n: 'tablePreviewGridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		n: 'tablePreviewGridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		n: 'anchoredGridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for table preview grid.',
		sel: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		n: 'tablePreviewGridGapBetween',
		cp: 'gap',
		dn: 'Gap between children',
		de: 'Gap between children of table preview grid.',
		dv: '5px',
		sel: '.comp.compTablePreviewGrid ._anchorGrid, .comp.compTablePreviewGrid._noAnchorGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);