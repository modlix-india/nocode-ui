import { StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		gn: 'popup title',
		dn: 'Poup Title',
		n: 'popupTitleFont',
		dv: '<tertiaryFont>',
		cp: 'font',
		sel: '.modelTitleStyle',
	},

	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Size',
		n: 'popupCloseIconSize',
		dv: '15px',
		cp: 'font-size',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Color',
		n: 'popupCloseIconColor',
		dv: '<fontColorOne>',
		cp: 'color',
		sel: '.mio-demoicon-close',
	},

	{
		gn: 'Modal',
		dn: 'Modal Padding',
		n: 'modalPadding',
		dv: '15px',
		cp: 'padding',
		sel: '.modal',
	},
	{
		gn: 'Modal',
		dn: 'Modal Border Radius',
		n: 'modalBorderRadius',
		dv: '3px',
		cp: 'border-radius',
		sel: '.modal',
	},
	{
		gn: 'Modal',
		dn: 'Modal Box Shadow',
		n: 'modalBoxShadow',
		dv: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
		cp: 'box-shadow',
		sel: '.modal',
	},

	{
		gn: 'Popup backdrop',
		dn: 'Popup Backdrop Filter',
		n: 'popupBackdropFilter',
		dv: 'blur(1px)',
		cp: 'backdrop-filter',
		sel: '.backdrop',
	},
	{
		gn: 'Popup backdrop',
		dn: 'Popup Backdrop Background',
		n: 'popupBackdropBackground',
		dv: '#33333345',
		cp: 'background',
		sel: '.backdrop',
	},
	{
		gn: 'Popup backdrop',
		dn: 'Popup Backdrop Padding',
		n: 'popupBackdropPadding',
		dv: '20px',
		cp: 'padding',
		sel: '.backdrop',
	},

	{
		gn: 'Popup title icon grid top left border',
		dn: 'popup title icon grid',
		n: 'popuptitleicongridleftBorder',
		dv: '2px',
		cp: 'border-top-left-radius',
		sel: '.TitleIconGrid',
	},
	{
		gn: 'Popup title icon grid top right border',
		dn: 'Popup title icon grid ',
		n: 'popuptitleicongridrightBorder',
		dv: '2px',
		cp: 'border-top-right-radius',
		sel: '.TitleIconGrid',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
