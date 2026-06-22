import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'svgFill',
		cp: 'fill',
		dn: 'SVG Fill',
		de: 'Fill color applied to the inline SVG (use to recolor single-color icons).',
		sel: '._svgContainer svg',
	},
	{
		n: 'svgStroke',
		cp: 'stroke',
		dn: 'SVG Stroke',
		de: 'Stroke color applied to the inline SVG.',
		sel: '._svgContainer svg',
	},
	{
		n: 'imageRendering',
		cp: 'image-rendering',
		dn: 'Image rendering',
		de: 'Specifies the algorithm used when scaling the SVG.',
		dv: 'auto',
		sel: '._svgContainer',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
