import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'design1GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 1 Grid Hover or Selected Background Color',
		description: 'Design 1 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design1 ._eachTableGrid._dataGrid:hover, .comp.compTable._design1 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design2GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 2 Grid Hover or Selected Background Color',
		description: 'Design 2 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design2 ._eachTableGrid._dataGrid:hover, .comp.compTable._design2 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design3GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 3 Grid Hover or Selected Background Color',
		description: 'Design 3 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design3 ._eachTableGrid._dataGrid:hover, .comp.compTable._design3 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design4GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 4 Grid Hover or Selected Background Color',
		description: 'Design 4 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design4 ._eachTableGrid._dataGrid:hover, .comp.compTable._design4 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design5GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 5 Grid Hover or Selected Background Color',
		description: 'Design 5 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design5 ._eachTableGrid._dataGrid:hover, .comp.compTable._design5 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design6GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 6 Grid Hover or Selected Background Color',
		description: 'Design 6 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design6 ._eachTableGrid._dataGrid:hover, .comp.compTable._design6 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design7GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 7 Grid Hover or Selected Background Color',
		description: 'Design 7 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design7 ._eachTableGrid._dataGrid:hover, .comp.compTable._design7 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design8GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 8 Grid Hover or Selected Background Color',
		description: 'Design 8 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design8 ._eachTableGrid._dataGrid:hover, .comp.compTable._design8 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design9GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 9 Grid Hover or Selected Background Color',
		description: 'Design 9 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design9 ._eachTableGrid._dataGrid:hover, .comp.compTable._design9 ._eachTableGrid._dataGrid._selected',
	},
	{
		name: 'design10GridHoverSelectedBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Design 10 Grid Hover or Selected Background Color',
		description: 'Design 10 Grid Hover or Selected Background Color',
		defaultValue: '#EEEEEE',
		noPrefix: true,
		selector:
			'.comp.compTable._design10 ._eachTableGrid._dataGrid:hover, .comp.compTable._design10 ._eachTableGrid._dataGrid._selected',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
