import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'imageRendering',
		cp: 'image-rendering',
		dn: 'Image rendering',
		de: 'This property specifies the type of algorithm to be used for image scaling',
		dv: 'auto',
		sel: '.image',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
