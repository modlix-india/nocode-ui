import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'addButtonMargin',
		cp: 'padding',
		dn: 'Align Icons',
		de: 'Align the Icons with respect to comoponent.',
		sel: '.addOne ',
	},
	{
		n: 'reduceButtonMargin',
		cp: 'padding',
		dn: 'Align Icons',
		de: 'Align the Icons with respect to comoponent.',
		sel: '.reduceOne',
	},
	{
		n: 'moveOneMargin',
		cp: 'padding',
		dn: 'Align Icons',
		de: 'Align the Icons with respect to component.',
		sel: '.moveOne',
	},
	{
		n: 'dragBackgroundColor',
		cp: 'background-color',
		dn: 'Background color while draging',
		de: 'Change background color while draging',
		dv: '#D8D8D8',
		sel: '.dragging',
	},
	{
		n: 'paddingForComponent',
		cp: 'padding',
		dn: 'Padding for the component',
		de: 'Padding around the component',
		sel: '.repeaterProperties',
	},
	{
		n: 'addOneColor',
		cp: 'color',
		dn: 'Change Icon Color',
		de: 'Change Icons Color of add one',
		sel: '.addOne',
		dv: '<mainFontColor>',
	},
	{
		n: 'reduceOnecolor',
		cp: 'color',
		dn: 'Change Icon Color',
		de: 'Change Icons Color of reduce one',
		sel: '.reduceOne',
		dv: '<mainFontColor>',
	},
	{
		n: 'moveOneColor',
		cp: 'color',
		dn: 'Change Icon Color',
		de: 'Change Icons Color of Move one',
		sel: '.moveOne',
		dv: '<mainFontColor>',
	},
	{
		n: 'addOneSize',
		cp: 'font-size',
		dn: 'Change Icon Size',
		de: 'Change Icons Size of add one',
		sel: '.addOne',
		dv: '14px',
	},
	{
		n: 'reduceOneSize',
		cp: 'font-size',
		dn: 'Change Icon Size',
		de: 'Change Icons Size of reduce one',
		sel: '.reduceOne',
		dv: '14px',
	},
	{
		n: 'moveOneSize',
		cp: 'font-size',
		dn: 'Change Icon Size',
		de: 'Change Icons Size of Move one',
		sel: '.moveOne',
		dv: '14px',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
