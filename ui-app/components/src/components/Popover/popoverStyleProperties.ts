import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'popoverContainerBorder',
		cp: 'border',
		dn: 'Popover Container Border',
		de: 'Popover Container Border.',
		sel: '.popoverContainer',
	},
	{
		n: 'popoverContainerBorderRadius',
		cp: 'border-radius',
		dn: 'Popover Container Border Radius',
		de: 'Popover Container Border Radius.',
		sel: '.popoverContainer',
	},
	{
		n: 'popoverContainerBackgroundColor',
		cp: 'background-color',
		dn: 'Popover Container Background Color',
		de: 'Popover Container Background Color.',
		sel: '.popoverContainer',
	},
	{
		n: 'popoverTipBackgroundColor',
		cp: 'background-color',
		dn: 'Popover Tip Background Color',
		de: 'Popover Tip Background Color.',
		sel: '.popoverTip::before',
	},
	{
		n: 'popoverContainerBoxShadow',
		cp: 'box-shadow',
		dn: 'Popover Container BoxShadow',
		de: 'Popover Container BoxShadow.',
		sel: '.popoverContainer',
	},
	{
		n: 'popoverTipBoxShadow',
		cp: 'box-shadow',
		dn: 'Popover Tip BoxShadow',
		de: 'Popover Tip BoxShadow.',
		sel: '.popoverTip::before',
	},
	{
		n: 'popoverTipBorder',
		cp: 'border',
		dn: 'Popover Tip Border',
		de: 'Popover Tip Border.',
		sel: '.popoverTip::before',
	},
	{
		n: 'popoverTipBorderRadius',
		cp: 'border-radius',
		dn: 'Popover Tip Border Radius',
		de: 'Popover Tip Border Radius.',
		sel: '.popoverTip::before',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
