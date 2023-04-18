import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'gridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for grid.',
		selector: '.comp.compGrid._noAnchorGrid',
	},
	{
		name: 'gridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for grid.',
		selector: '.comp.compGrid._noAnchorGrid',
	},
	{
		name: 'gridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for grid.',
		selector: '.comp.compGrid._noAnchorGrid',
	},
	{
		name: 'gridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for grid.',
		selector: '.comp.compGrid._noAnchorGrid',
	},
	{
		name: 'anchoredGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for grid.',
		selector: '.comp.compGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for grid.',
		selector: '.comp.compGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for grid.',
		selector: '.comp.compGrid ._anchorGrid',
	},
	{
		name: 'anchoredGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for grid.',
		selector: '.comp.compGrid ._anchorGrid',
	},
	{
		name: 'gapBetween',
		cssProperty: 'gap',
		displayName: 'Gap between children',
		description: 'Gap between children of grid.',
		defaultValue: '5px',
		selector: '.comp.compGrid ._anchorGrid, .comp.compGrid._noAnchorGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
