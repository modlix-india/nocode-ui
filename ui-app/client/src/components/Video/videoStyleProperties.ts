import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'videControlsPadding',
		displayName: 'Controls padding',
		description: 'Padding of the video controls.',
		cssProperty: 'padding',
		defaultValue: '0px 10px 5px 5px',
		selector: '.videoControlsContainer',
	},
	{
		name: 'videoControlsContainerGap',
		displayName: 'Controls gap',
		description: 'Gap between the video controls and the video.',
		cssProperty: 'gap',
		defaultValue: '8px;',
		selector: '.videoControlsContainer',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
