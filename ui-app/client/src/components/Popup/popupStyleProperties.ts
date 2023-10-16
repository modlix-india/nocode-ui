import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		groupName: 'Close Icon',
		displayName: 'Popup Close Icon Size',
		name: 'popupCloseIconSize',
		defaultValue: '15px',
		cssProperty: 'font-size',
		selector: '.mio-demoicon-close',
	},
	{
		groupName: 'Close Icon',
		displayName: 'Popup Close Icon Color',
		name: 'popupCloseIconColor',
		defaultValue: '<fontColorOne>',
		cssProperty: 'color',
		selector: '.mio-demoicon-close',
	},

	{
		groupName: 'Modal',
		displayName: 'Modal Padding',
		name: 'modalPadding',
		defaultValue: '15px',
		cssProperty: 'padding',
		selector: '.modal',
	},
	{
		groupName: 'Modal',
		displayName: 'Modal Border Radius',
		name: 'modalBorderRadius',
		defaultValue: '3px',
		cssProperty: 'border-radius',
		selector: '.modal',
	},
	{
		groupName: 'Modal',
		displayName: 'Modal Box Shadow',
		name: 'modalBoxShadow',
		defaultValue: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
		cssProperty: 'box-shadow',
		selector: '.modal',
	},

	{
		groupName: 'Popup backdrop',
		displayName: 'Popup Backdrop Filter',
		name: 'popupBackdropFilter',
		defaultValue: 'blur(1px)',
		cssProperty: 'backdrop-filter',
		selector: '.backdrop',
	},
	{
		groupName: 'Popup backdrop',
		displayName: 'Popup Backdrop Background',
		name: 'popupBackdropBackground',
		defaultValue: '#33333345',
		cssProperty: 'background',
		selector: '.backdrop',
	},
	{
		groupName: 'Popup backdrop',
		displayName: 'Popup Backdrop Padding',
		name: 'popupBackdropPadding',
		defaultValue: '20px',
		cssProperty: 'padding',
		selector: '.backdrop',
	},

	{
		groupName: 'Popup title icon grid top left border',
		displayName: 'popup title icon grid',
		name: 'popuptitleicongridleftBorder',
		defaultValue: '2px',
		cssProperty: 'border-top-left-radius',
		selector: '.TitleIconGrid',
	},
	{
		groupName: 'Popup title icon grid top right border',
		displayName: 'Popup title icon grid ',
		name: 'popuptitleicongridrightBorder',
		defaultValue: '2px',
		cssProperty: 'border-top-right-radius',
		selector: '.TitleIconGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);
