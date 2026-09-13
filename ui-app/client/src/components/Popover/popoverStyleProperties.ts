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

	// The panel is portalled to the end of the body and positioned `fixed`, and a fixed
	// element is a stacking context whatever its z-index. So every z-index set INSIDE the
	// panel - on popoverContainer, on the tip - is sealed in and cannot lift the panel over
	// page chrome; only a z-index on the panel itself can. `np` because this targets the
	// portalled root, which is not a descendant of the component's own prefix.
	{
		n: 'popoverZIndex',
		dv: '1000',
		cp: 'z-index',
		dn: 'Popover Z Index',
		de: 'Stacking order of the popover panel against the rest of the app.',
		sel: '.comp.compPopover.popover',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
