import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'addButtonMargin',
		cssProperty: 'padding',
		displayName: "Align Icons",
		description: 'Align the Icons with respect to comoponent.',
		selector: '.addOne ',
	},
	{
		name: 'reduceButtonMargin',
		cssProperty: 'padding',
		displayName: "Align Icons",
		description: 'Align the Icons with respect to comoponent.',
		selector: '.reduceOne',
	},
	{
		name: "moveOneMargin",
		cssProperty: 'padding',
		displayName: "Align Icons",
		description: 'Align the Icons with respect to component.',
		selector: '.moveOne',
	},
	{
		name: "dragBackgroundColor",
		cssProperty: 'background-color',
		displayName: 'Background color while draging',
		description: 'Change background color while draging',
		defaultValue: '#D8D8D8',
		selector: '.dragging',
	},
	{
		name: "paddingForComponent",
		cssProperty: 'padding',
		displayName: 'Padding for the component',
		description: 'Padding around the component',
		selector: '.repeaterProperties'
	},
	{
		name: "addOneColor",
		cssProperty: 'color',
		displayName: 'Change Icon Color',
		description: 'Change Icons Color of add one',
		selector: '.addOne',
		defaultValue: "<main-font-color>"
	},
	{
		name: "reduceOnecolor",
		cssProperty: 'color',
		displayName: 'Change Icon Color',
		description: 'Change Icons Color of reduce one',
		selector: '.reduceOne',
		defaultValue: "<main-font-color>"
	},
	{
		name: "moveOneColor",
		cssProperty: 'color',
		displayName: 'Change Icon Color',
		description: 'Change Icons Color of Move one',
		selector: '.moveOne',
		defaultValue: "<main-font-color>"
	}
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
