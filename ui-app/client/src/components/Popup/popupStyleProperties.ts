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

	// The close control was a bare glyph: no target, no hover, and not even a
	// pointer cursor. These make it a real button. The four structural ones carry a
	// `dv` so the node can be sized at all — an inline <i> ignores width and height
	// — and render identically to before while no size is set. Everything
	// decorative has no `dv`, so a theme that says nothing gets the same bare glyph.
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Display',
		n: 'popupCloseIconDisplay',
		dv: 'inline-flex',
		cp: 'display',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Align Items',
		n: 'popupCloseIconAlignItems',
		dv: 'center',
		cp: 'align-items',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Justify Content',
		n: 'popupCloseIconJustifyContent',
		dv: 'center',
		cp: 'justify-content',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Cursor',
		n: 'popupCloseIconCursor',
		dv: 'pointer',
		cp: 'cursor',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Width',
		n: 'popupCloseIconWidth',
		cp: 'width',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Height',
		n: 'popupCloseIconHeight',
		cp: 'height',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Border',
		n: 'popupCloseIconBorder',
		cp: 'border',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Border Radius',
		n: 'popupCloseIconBorderRadius',
		cp: 'border-radius',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Background',
		n: 'popupCloseIconBackground',
		cp: 'background',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Transition',
		n: 'popupCloseIconTransition',
		cp: 'transition',
		sel: '.mio-demoicon-close',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Hover Border Color',
		n: 'popupCloseIconHoverBorderColor',
		cp: 'border-color',
		sel: '.mio-demoicon-close:hover',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Hover Color',
		n: 'popupCloseIconHoverColor',
		cp: 'color',
		sel: '.mio-demoicon-close:hover',
	},
	{
		gn: 'Close Icon',
		dn: 'Popup Close Icon Hover Background',
		n: 'popupCloseIconHoverBackground',
		cp: 'background',
		sel: '.mio-demoicon-close:hover',
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

	// The dialog surface itself had no background and no border, so every popup in
	// every app restated both inline. Deliberately no `dv`: a variable nothing sets
	// emits no CSS, so this is inert until a theme opts in.
	{
		gn: 'Modal',
		dn: 'Modal Background',
		n: 'modalBackground',
		cp: 'background',
		sel: '.modal',
	},
	{
		gn: 'Modal',
		dn: 'Modal Border',
		n: 'modalBorder',
		cp: 'border',
		sel: '.modal',
	},
	{
		gn: 'popup title',
		dn: 'Popup Title Color',
		n: 'popupTitleColor',
		cp: 'color',
		sel: '.modelTitleStyle',
	},

	// PopupStyles hard-codes `z-index: 7` on the root, which decides whether a
	// dialog sits above or below the rest of an app's chrome — a per-app answer
	// with no way to give it. `np` because this targets the prefix itself, and the
	// `dv` is the literal it replaces, so nothing moves until a theme says otherwise.
	{
		gn: 'Modal',
		dn: 'Popup Z Index',
		n: 'popupZIndex',
		dv: '7',
		cp: 'z-index',
		sel: '.comp.compPopup',
		np: true,
	},
	{
		gn: 'Modal',
		dn: 'Modal Z Index',
		n: 'modalZIndex',
		cp: 'z-index',
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

	// The title row sat flush against the first field, so dialogs either lived with
	// it or set `titleGrid-padding` inline one at a time. No `dv`, so it stays flush
	// until a theme asks for the gap.
	{
		gn: 'popup title',
		dn: 'Popup Title Grid Padding',
		n: 'popupTitleGridPadding',
		cp: 'padding',
		sel: '.TitleIconGrid',
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
