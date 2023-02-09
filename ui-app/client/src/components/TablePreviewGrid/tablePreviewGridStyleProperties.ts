import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'tablePreviewGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		name: 'tablePreviewGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		name: 'tablePreviewGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		name: 'tablePreviewGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid._noAnchorGrid',
	},
	{
		name: 'anchoredGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for table preview grid.',
		selector: '.comp.compTablePreviewGrid ._anchorGrid',
	},
	{
		name: 'tablePreviewGridGapBetween',
		cssProperty: 'gap',
		displayName: 'Gap between children',
		description: 'Gap between children of table preview grid.',
		defaultValue: '5px',
		selector:
			'.comp.compTablePreviewGrid ._anchorGrid, .comp.compTablePreviewGrid._noAnchorGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
