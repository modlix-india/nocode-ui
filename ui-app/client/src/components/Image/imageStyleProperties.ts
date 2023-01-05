import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'imageWidth',
		cssProperty: 'width',
		displayName: 'Image width',
		description: 'The width of the image.',
		defaultValue: '300px',
		selector: '.image',
	},
	{
		name: 'imageHeight',
		cssProperty: 'height',
		displayName: 'Image height',
		description: 'The height of the image.',
		defaultValue: '300px',
		selector: '.image',
	},
	{
		name: 'imageObjectFit',
		cssProperty: 'object-fit',
		displayName: 'Image object fit',
		description: "This property set's the fit of the image .",
		defaultValue: 'fill',
		selector: '.image',
	},
	{
		name: 'imageOrientation',
		cssProperty: 'image-orientation',
		displayName: 'Image height',
		description: "This property set's the orientation of the image",
		selector: '.image',
	},
	{
		name: 'imageRendering',
		cssProperty: 'image-rendering',
		displayName: 'Image rendering',
		description: 'This property specifies the type of algorithm to be used for image scaling',
		defaultValue: 'auto',
		selector: '.image',
	},
	{
		name: 'imagePosition',
		cssProperty: 'object-position',
		displayName: 'image position',
		description: 'This property allows to resize the image to fit its content box',
		defaultValue: '50% 50%',
		selector: '.image',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
