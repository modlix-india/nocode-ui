import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'imageRendering',
		cssProperty: 'image-rendering',
		displayName: 'Image rendering',
		description: 'This property specifies the type of algorithm to be used for image scaling',
		defaultValue: 'auto',
		selector: '.image',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
