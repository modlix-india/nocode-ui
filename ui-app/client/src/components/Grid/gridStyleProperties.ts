import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'gridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for grid.',
		selector: '.comp.compGrid.noAnchorGrid',
	},
	{
		name: 'gridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for grid.',
		selector: '.comp.compGrid.noAnchorGrid',
	},
	{
		name: 'gridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for grid.',
		selector: '.comp.compGrid.noAnchorGrid',
	},
	{
		name: 'gridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for grid.',
		selector: '.comp.compGrid.noAnchorGrid',
	},
	{
		name: 'anchoredGridPaddingLeft',
		cssProperty: 'padding-left',
		displayName: 'Grid Left padding',
		description: 'Left padding for grid.',
		selector: '.comp.compGrid .anchorGrid',
	},
	{
		name: 'anchoredGridPaddingRight',
		cssProperty: 'padding-right',
		displayName: 'Grid Right padding',
		description: 'Right padding for grid.',
		selector: '.comp.compGrid .anchorGrid',
	},
	{
		name: 'anchoredGridPaddingTop',
		cssProperty: 'padding-top',
		displayName: 'Grid Top padding',
		description: 'Top padding for grid.',
		selector: '.comp.compGrid .anchorGrid',
	},
	{
		name: 'anchoredGridPaddingBottom',
		cssProperty: 'padding-bottom',
		displayName: 'Grid Bottom padding',
		description: 'Bottom padding for grid.',
		selector: '.comp.compGrid .anchorGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
