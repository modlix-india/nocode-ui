import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'popoverContainerBorder',
		cssProperty: 'border',
		displayName: 'Popover Container Border',
		description: 'Popover Container Border.',
		selector: '.popoverContainer',
	},
	{
		name: 'popoverContainerBorderRadius',
		cssProperty: 'border-radius',
		displayName: 'Popover Container Border Radius',
		description: 'Popover Container Border Radius.',
		selector: '.popoverContainer',
	},
	{
		name: 'popoverContainerBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Popover Container Background Color',
		description: 'Popover Container Background Color.',
		selector: '.popoverContainer',
	},
	{
		name: 'popoverTipBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Popover Tip Background Color',
		description: 'Popover Tip Background Color.',
		selector: '.popoverTip::before',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
