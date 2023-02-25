import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'tableEmptyGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid._noAnchorGrid',
	},
	{
		name: 'tableEmptyGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid._noAnchorGrid',
	},
	{
		name: 'tableEmptyGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid._noAnchorGrid',
	},
	{
		name: 'tableEmptyGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid._noAnchorGrid',
	},
	{
		name: 'anchoredGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for table empty grid.',
		selector: '.comp.compTableEmptyGrid ._anchorGrid',
	},
	{
		name: 'tableEmptyGridGapBetween',
		cssProperty: 'gap',
		displayName: 'Gap between children',
		description: 'Gap between children of table empty grid.',
		defaultValue: '5px',
		selector: '.comp.compTableEmptyGrid ._anchorGrid, .comp.compTableEmptyGrid._noAnchorGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
