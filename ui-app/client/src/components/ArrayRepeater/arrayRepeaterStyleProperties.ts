import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'addButtonMargin',
		cssProperty: 'padding',
		displayName: 'Align Icons',
		description: 'Align the Icons with respect to comoponent.',
		selector: '.addOne ',
	},
	{
		name: 'reduceButtonMargin',
		cssProperty: 'padding',
		displayName: 'Align Icons',
		description: 'Align the Icons with respect to comoponent.',
		selector: '.reduceOne',
	},
	{
		name: 'moveOneMargin',
		cssProperty: 'padding',
		displayName: 'Align Icons',
		description: 'Align the Icons with respect to component.',
		selector: '.moveOne',
	},
	{
		name: 'dragBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Background color while draging',
		description: 'Change background color while draging',
		defaultValue: '#D8D8D8',
		selector: '.dragging',
	},
	{
		name: 'paddingForComponent',
		cssProperty: 'padding',
		displayName: 'Padding for the component',
		description: 'Padding around the component',
		selector: '.repeaterProperties',
	},
	{
		name: 'addOneColor',
		cssProperty: 'color',
		displayName: 'Change Icon Color',
		description: 'Change Icons Color of add one',
		selector: '.addOne',
		defaultValue: '<mainFontColor>',
	},
	{
		name: 'reduceOnecolor',
		cssProperty: 'color',
		displayName: 'Change Icon Color',
		description: 'Change Icons Color of reduce one',
		selector: '.reduceOne',
		defaultValue: '<mainFontColor>',
	},
	{
		name: 'moveOneColor',
		cssProperty: 'color',
		displayName: 'Change Icon Color',
		description: 'Change Icons Color of Move one',
		selector: '.moveOne',
		defaultValue: '<mainFontColor>',
	},
	{
		name: 'addOneSize',
		cssProperty: 'font-size',
		displayName: 'Change Icon Size',
		description: 'Change Icons Size of add one',
		selector: '.addOne',
		defaultValue: '14px',
	},
	{
		name: 'reduceOneSize',
		cssProperty: 'font-size',
		displayName: 'Change Icon Size',
		description: 'Change Icons Size of reduce one',
		selector: '.reduceOne',
		defaultValue: '14px',
	},
	{
		name: 'moveOneSize',
		cssProperty: 'font-size',
		displayName: 'Change Icon Size',
		description: 'Change Icons Size of Move one',
		selector: '.moveOne',
		defaultValue: '14px',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
