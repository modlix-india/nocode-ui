import { StylePropertyDefinition } from '../../types/common';

/**
 * The schema builder's palette, as theme variables.
 *
 * `dist/css/SchemaBuilder.css` hard-codes its own grey scale and a stock
 * `#1a56db` blue. (It declares no font stack of its own: every control says
 * `font-family: inherit`, so the component already takes the page's font and
 * `schemaBuilderFontFamily` below is an override, not a correction.) That is
 * fine for a standalone form and
 * wrong inside an app with a design language of its own: dropped into the
 * workspace's storage editor it reads as a foreign default-blue widget sitting
 * in an amber/cream page. `SchemaBuilderStyle.tsx` appends
 * `processStyleDefinition(...)` output AFTER that stylesheet, so declaring a
 * property here overrides the literal without touching a line of the layout CSS.
 *
 * Every `dv` is the literal the component ships today, so an app that sets none
 * of these looks exactly as it did — theming is opt-in per key. Properties with
 * no `dv` are new levers the CSS never had (font family, focus ring, native
 * checkbox accent): `processStyleValue` emits nothing for them until a theme
 * supplies a value.
 *
 * Because these carry `stylePropertiesForTheme`, SchemaBuilder now shows up in
 * the Theme Editor's component list (it filters on
 * `stylePropertiesForTheme.length`), grouped by `gn` below.
 */
export const styleProperties: Array<StylePropertyDefinition> = [
	// ─── Surface ───
	{
		gn: 'Schema Builder Surface',
		dn: 'Font Family',
		de: 'Inherited by every select, input and textarea inside the builder — they are declared `font-family: inherit`.',
		n: 'schemaBuilderFontFamily',
		cp: 'font-family',
		sel: '.comp.compSchemaBuilder',
		np: true,
	},
	{
		gn: 'Schema Builder Surface',
		dn: 'Font Size',
		n: 'schemaBuilderFontSize',
		dv: '13px',
		cp: 'font-size',
		sel: '.comp.compSchemaBuilder',
		np: true,
	},
	{
		gn: 'Schema Builder Surface',
		dn: 'Font Color',
		n: 'schemaBuilderFontColor',
		cp: 'color',
		sel: '.comp.compSchemaBuilder',
		np: true,
	},
	{
		gn: 'Schema Builder Surface',
		dn: 'Background',
		n: 'schemaBuilderBackground',
		cp: 'background',
		sel: '.comp.compSchemaBuilder',
		np: true,
	},
	{
		gn: 'Schema Builder Surface',
		dn: 'Native Checkbox Accent Color',
		de: 'The `required` boxes are native checkboxes the stylesheet never touches; this colours their tick.',
		n: 'schemaBuilderCheckboxAccentColor',
		cp: 'accent-color',
		sel: '.comp.compSchemaBuilder',
		np: true,
	},

	// ─── Accent ───
	{
		gn: 'Schema Builder Accent',
		dn: 'Accent Background',
		de: 'Selected segment of the Compact / Extended / JSON switch, and the dot marking a field whose settings panel holds more than the row shows.',
		n: 'schemaBuilderAccentBackground',
		dv: '#1a56db',
		cp: 'background',
		sel:
			'.comp.compSchemaBuilder ._segmented button._on, ' +
			'.comp.compSchemaBuilder ._rowAction._hasContent::after',
		np: true,
	},
	{
		gn: 'Schema Builder Accent',
		dn: 'Accent Font Color',
		n: 'schemaBuilderAccentFontColor',
		dv: '#fff',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._segmented button._on',
		np: true,
	},
	{
		gn: 'Schema Builder Accent',
		dn: 'Accent Ink Color',
		de: 'Type badge text and an active row action.',
		n: 'schemaBuilderAccentInkColor',
		dv: '#1a56db',
		cp: 'color',
		// The `:hover` branch is not redundant: without it the row-action hover
		// colour below ties on specificity and, being later in this array, would
		// steal an active icon's accent the moment you point at it.
		sel:
			'.comp.compSchemaBuilder ._badge, .comp.compSchemaBuilder ._rowAction._active, ' +
			'.comp.compSchemaBuilder ._rowAction._active:hover',
		np: true,
	},

	// ─── Ink ───
	{
		gn: 'Schema Builder Ink',
		dn: 'Label Font Color',
		de: 'Fixed field names and details section headers.',
		n: 'schemaBuilderLabelFontColor',
		dv: '#555',
		cp: 'color',
		sel: '.comp.compSchemaBuilder span._nodeName._fixed, .comp.compSchemaBuilder ._detailsSection > summary',
		np: true,
	},
	{
		gn: 'Schema Builder Ink',
		dn: 'Secondary Font Color',
		de: 'The `required` label and collapsed value previews.',
		n: 'schemaBuilderSubFontColor',
		dv: '#666',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._requiredCheck, .comp.compSchemaBuilder ._valuePreview',
		np: true,
	},
	{
		gn: 'Schema Builder Ink',
		dn: 'Secondary Font Size',
		de: 'The 12px islands that override the root size. Without this token, raising Font Size leaves them behind and the type scale falls apart.',
		n: 'schemaBuilderSecondaryFontSize',
		dv: '12px',
		cp: 'font-size',
		sel:
			'.comp.compSchemaBuilder ._requiredCheck, .comp.compSchemaBuilder ._typeOption, ' +
			'.comp.compSchemaBuilder ._refPickerItem, .comp.compSchemaBuilder ._valuePreview, ' +
			'.comp.compSchemaBuilder ._error, .comp.compSchemaBuilder ._detailsSection > summary, ' +
			'.comp.compSchemaBuilder ._editorLoading, .comp.compSchemaBuilder ._smallButton',
		np: true,
	},
	{
		gn: 'Schema Builder Ink',
		dn: 'Hint Font Color',
		n: 'schemaBuilderHintFontColor',
		dv: '#999',
		cp: 'color',
		sel:
			'.comp.compSchemaBuilder ._hint, .comp.compSchemaBuilder ._helptext, ' +
			'.comp.compSchemaBuilder ._editorLoading, .comp.compSchemaBuilder ._badge._muted, ' +
			'.comp.compSchemaBuilder ._docNote',
		np: true,
	},
	{
		gn: 'Schema Builder Ink',
		dn: 'Hint Font Size',
		n: 'schemaBuilderHintFontSize',
		dv: '11px',
		cp: 'font-size',
		sel: '.comp.compSchemaBuilder ._hint, .comp.compSchemaBuilder ._helptext',
		np: true,
	},
	{
		gn: 'Schema Builder Ink',
		dn: 'Error Font Color',
		n: 'schemaBuilderErrorFontColor',
		dv: '#ff2b2b',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._error',
		np: true,
	},
	{
		gn: 'Schema Builder Ink',
		dn: 'Invalid Field Border Color',
		n: 'schemaBuilderErrorBorderColor',
		dv: '#ff2b2b',
		cp: 'border-color',
		sel: '.comp.compSchemaBuilder input._nodeName._invalid',
		np: true,
	},

	// ─── Borders and radii ───
	{
		gn: 'Schema Builder Borders',
		dn: 'Border Color',
		de: 'Every control edge: the mode switch, popovers, small buttons and form inputs.',
		n: 'schemaBuilderBorderColor',
		dv: '#d8d8d8',
		cp: 'border-color',
		sel:
			'.comp.compSchemaBuilder ._segmented, .comp.compSchemaBuilder ._segmented button, ' +
			'.comp.compSchemaBuilder ._typePopover, .comp.compSchemaBuilder ._refPickerList, ' +
			'.comp.compSchemaBuilder ._smallButton, .comp.compSchemaBuilder select, ' +
			'.comp.compSchemaBuilder ._smallEditorContainer > button, ' +
			'.comp.compSchemaBuilder ._popupButtons button, ' +
			'.comp.compSchemaBuilder input[type="text"], .comp.compSchemaBuilder input[type="number"], ' +
			'.comp.compSchemaBuilder textarea',
		np: true,
	},
	{
		gn: 'Schema Builder Borders',
		dn: 'Line Color',
		de: 'The faint rules inside the details card: grid lines and list entry outlines.',
		n: 'schemaBuilderLineColor',
		dv: '#eee',
		cp: 'border-color',
		sel:
			'.comp.compSchemaBuilder ._detailsGrid, .comp.compSchemaBuilder ._leftJustify, ' +
			'.comp.compSchemaBuilder ._rightJustify, .comp.compSchemaBuilder ._eachValue, ' +
			'.comp.compSchemaBuilder ._patternEntry, .comp.compSchemaBuilder ._schemaListEntry, ' +
			'.comp.compSchemaBuilder ._popupBackground ._popupContainer ._jsonEditorContainer',
		np: true,
	},
	{
		gn: 'Schema Builder Borders',
		dn: 'Border Radius',
		de: 'The 4px family: tree rows, popovers, small buttons, list entries and the JSON frame.',
		n: 'schemaBuilderBorderRadius',
		dv: '4px',
		cp: 'border-radius',
		sel:
			'.comp.compSchemaBuilder ._nodeRow, .comp.compSchemaBuilder ._typePopover, ' +
			'.comp.compSchemaBuilder ._refPickerList, .comp.compSchemaBuilder ._smallButton, ' +
			'.comp.compSchemaBuilder ._smallEditorContainer > button, ' +
			'.comp.compSchemaBuilder ._popupButtons button, ' +
			'.comp.compSchemaBuilder ._patternEntry, .comp.compSchemaBuilder ._schemaListEntry, ' +
			'.comp.compSchemaBuilder ._jsonView, ' +
			'.comp.compSchemaBuilder ._popupBackground ._popupContainer ._jsonEditorContainer',
		np: true,
	},
	{
		gn: 'Schema Builder Borders',
		dn: 'Large Border Radius',
		de: 'The outer containers: the mode switch and the details card.',
		n: 'schemaBuilderLargeBorderRadius',
		dv: '6px',
		cp: 'border-radius',
		sel: '.comp.compSchemaBuilder ._segmented, .comp.compSchemaBuilder ._detailsCard',
		np: true,
	},
	{
		gn: 'Schema Builder Borders',
		dn: 'Small Border Radius',
		de: 'The tightest boxes: row actions, array steppers, form inputs and the value popup.',
		n: 'schemaBuilderSmallBorderRadius',
		dv: '4px',
		cp: 'border-radius',
		sel:
			'.comp.compSchemaBuilder ._rowAction, .comp.compSchemaBuilder ._eachUpDown i.fa, ' +
			'.comp.compSchemaBuilder select, .comp.compSchemaBuilder input[type="text"], ' +
			'.comp.compSchemaBuilder input[type="number"], .comp.compSchemaBuilder textarea, ' +
			'.comp.compSchemaBuilder ._popupBackground ._popupContainer',
		np: true,
	},

	// ─── Tree ───
	{
		gn: 'Schema Builder Tree',
		dn: 'Row Height',
		n: 'schemaBuilderRowHeight',
		dv: '30px',
		cp: 'min-height',
		sel: '.comp.compSchemaBuilder ._nodeRow',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Row Padding',
		n: 'schemaBuilderRowPadding',
		dv: '3px 4px',
		cp: 'padding',
		sel: '.comp.compSchemaBuilder ._nodeRow',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Row Gap',
		n: 'schemaBuilderRowGap',
		dv: '8px',
		cp: 'gap',
		sel: '.comp.compSchemaBuilder ._nodeRow',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Row Hover Background',
		n: 'schemaBuilderRowHoverBackground',
		dv: '#f7f7f7',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._nodeRow:hover',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Search Match Background',
		de: 'Row background for a field matching the current search.',
		n: 'schemaBuilderMatchBackground',
		dv: '#f0f4ff',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._nodeRow._match',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Search Match Marker',
		de: 'The bar down the left of a matching row. Given as a box-shadow, so an inset is what draws inside the row.',
		n: 'schemaBuilderMatchMarker',
		dv: 'inset 2px 0 0 #1a56db',
		cp: 'box-shadow',
		sel: '.comp.compSchemaBuilder ._nodeRow._match',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Property Name Width',
		de: 'Width of the editable property name box on each tree row. Worth raising for schemas with long property names.',
		n: 'schemaBuilderNameFieldWidth',
		dv: '140px',
		cp: 'width',
		sel: '.comp.compSchemaBuilder input._nodeName',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Tree Indent',
		n: 'schemaBuilderTreeIndent',
		dv: '20px',
		cp: 'margin-left',
		// The draft row was indented by an inline style, so raising this used to leave it
		// misaligned with the children it sits among.
		sel:
			'.comp.compSchemaBuilder ._nodeChildren, ' +
			'.comp.compSchemaBuilder ._nodeRow._draftRow',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Tree Guide Line',
		de: 'The vertical rule down a nested branch. A full border-left shorthand, so `none` removes it.',
		n: 'schemaBuilderTreeGuide',
		dv: '1px dashed #ddd',
		cp: 'border-left',
		sel: '.comp.compSchemaBuilder ._nodeChildren',
		np: true,
	},
	{
		gn: 'Schema Builder Tree',
		dn: 'Caret Color',
		n: 'schemaBuilderCaretColor',
		dv: '#888',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._caret',
		np: true,
	},

	// ─── Row actions ───
	{
		gn: 'Schema Builder Row Actions',
		dn: 'Action Font Color',
		n: 'schemaBuilderActionFontColor',
		dv: '#999',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._rowAction, .comp.compSchemaBuilder ._clearRef',
		np: true,
	},
	{
		gn: 'Schema Builder Row Actions',
		dn: 'Action Hover Background',
		n: 'schemaBuilderActionHoverBackground',
		dv: '#eee',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._rowAction:hover',
		np: true,
	},
	{
		gn: 'Schema Builder Row Actions',
		dn: 'Action Hover Font Color',
		n: 'schemaBuilderActionHoverFontColor',
		dv: '#333',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._rowAction:hover',
		np: true,
	},
	{
		gn: 'Schema Builder Row Actions',
		dn: 'Stepper Background',
		de: 'The up/down chips on array and enum values.',
		n: 'schemaBuilderStepperBackground',
		dv: '#eee',
		cp: 'background-color',
		sel: '.comp.compSchemaBuilder ._eachUpDown i.fa',
		np: true,
	},
	{
		gn: 'Schema Builder Row Actions',
		dn: 'Stepper Hover Background',
		n: 'schemaBuilderStepperHoverBackground',
		dv: '#ddd',
		cp: 'background-color',
		sel: '.comp.compSchemaBuilder ._eachUpDown i.fa:hover',
		np: true,
	},

	// ─── Mode switch ───
	{
		gn: 'Schema Builder Mode Switch',
		dn: 'Segment Background',
		n: 'schemaBuilderSegmentedBackground',
		dv: '#fff',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._segmented button',
		np: true,
	},
	{
		gn: 'Schema Builder Mode Switch',
		dn: 'Segment Font Color',
		n: 'schemaBuilderSegmentedFontColor',
		cp: 'color',
		sel: '.comp.compSchemaBuilder ._segmented button',
		np: true,
	},
	{
		gn: 'Schema Builder Mode Switch',
		dn: 'Segment Font Size',
		n: 'schemaBuilderSegmentedFontSize',
		dv: '12px',
		cp: 'font-size',
		sel: '.comp.compSchemaBuilder ._segmented button',
		np: true,
	},
	{
		gn: 'Schema Builder Mode Switch',
		dn: 'Segment Padding',
		n: 'schemaBuilderSegmentedPadding',
		dv: '4px 12px',
		cp: 'padding',
		sel: '.comp.compSchemaBuilder ._segmented button',
		np: true,
	},

	// ─── Inputs ───
	{
		gn: 'Schema Builder Inputs',
		dn: 'Input Background',
		n: 'schemaBuilderInputBackground',
		dv: '#fff',
		cp: 'background-color',
		sel:
			'.comp.compSchemaBuilder select, .comp.compSchemaBuilder input[type="text"], ' +
			'.comp.compSchemaBuilder input[type="number"], .comp.compSchemaBuilder textarea',
		np: true,
	},
	{
		gn: 'Schema Builder Inputs',
		dn: 'Input Font Color',
		n: 'schemaBuilderInputFontColor',
		cp: 'color',
		sel:
			'.comp.compSchemaBuilder select, .comp.compSchemaBuilder input[type="text"], ' +
			'.comp.compSchemaBuilder input[type="number"], .comp.compSchemaBuilder textarea',
		np: true,
	},
	{
		gn: 'Schema Builder Inputs',
		dn: 'Input Font Size',
		n: 'schemaBuilderInputFontSize',
		dv: '12px',
		cp: 'font-size',
		sel:
			'.comp.compSchemaBuilder select, .comp.compSchemaBuilder input[type="text"], ' +
			'.comp.compSchemaBuilder input[type="number"], .comp.compSchemaBuilder textarea',
		np: true,
	},
	{
		gn: 'Schema Builder Inputs',
		dn: 'Input Padding',
		n: 'schemaBuilderInputPadding',
		dv: '0 7px',
		cp: 'padding',
		sel:
			'.comp.compSchemaBuilder select, .comp.compSchemaBuilder input[type="text"], ' +
			'.comp.compSchemaBuilder input[type="number"], .comp.compSchemaBuilder textarea',
		np: true,
	},
	{
		gn: 'Schema Builder Inputs',
		dn: 'Input Focus Border Color',
		de: 'The stylesheet has no focus rule, so unset leaves the browser ring alone.',
		n: 'schemaBuilderInputFocusBorderColor',
		cp: 'border-color',
		sel:
			'.comp.compSchemaBuilder select:focus, .comp.compSchemaBuilder input[type="text"]:focus, ' +
			'.comp.compSchemaBuilder input[type="number"]:focus, .comp.compSchemaBuilder textarea:focus',
		np: true,
	},

	// ─── Details card and popovers ───
	{
		gn: 'Schema Builder Details',
		dn: 'Card Background',
		n: 'schemaBuilderCardBackground',
		dv: '#fafafa',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._detailsCard',
		np: true,
	},
	{
		gn: 'Schema Builder Details',
		dn: 'Card Padding',
		n: 'schemaBuilderCardPadding',
		dv: '2px 10px 6px',
		cp: 'padding',
		sel: '.comp.compSchemaBuilder ._detailsCard',
		np: true,
	},
	{
		gn: 'Schema Builder Details',
		dn: 'Card Border Color',
		n: 'schemaBuilderCardBorderColor',
		dv: '#e5e5e5',
		cp: 'border-color',
		sel: '.comp.compSchemaBuilder ._detailsCard',
		np: true,
	},
	{
		gn: 'Schema Builder Details',
		dn: 'Settings Grid Background',
		de: 'Transparent by default so the card tint shows through and the white inputs read against it. Set a colour to make the form its own panel.',
		n: 'schemaBuilderGridBackground',
		dv: 'transparent',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._detailsGrid',
		np: true,
	},
	{
		gn: 'Schema Builder Popovers',
		dn: 'Popover Background',
		n: 'schemaBuilderPopoverBackground',
		dv: '#fff',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._typePopover, .comp.compSchemaBuilder ._refPickerList',
		np: true,
	},
	{
		gn: 'Schema Builder Popovers',
		dn: 'Popover Box Shadow',
		n: 'schemaBuilderPopoverBoxShadow',
		dv: '0 2px 8px #0002',
		cp: 'box-shadow',
		sel: '.comp.compSchemaBuilder ._typePopover, .comp.compSchemaBuilder ._refPickerList',
		np: true,
	},
	{
		gn: 'Schema Builder Popovers',
		dn: 'Popover Item Hover Background',
		n: 'schemaBuilderPopoverItemHoverBackground',
		dv: '#f0f4ff',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._refPickerItem:hover',
		np: true,
	},

	// ─── Small buttons ───
	{
		gn: 'Schema Builder Small Buttons',
		dn: 'Small Button Background',
		n: 'schemaBuilderSmallButtonBackground',
		dv: '#fff',
		cp: 'background',
		sel:
			'.comp.compSchemaBuilder ._smallButton, ' +
			'.comp.compSchemaBuilder ._smallEditorContainer > button, ' +
			'.comp.compSchemaBuilder ._popupButtons button',
		np: true,
	},
	{
		gn: 'Schema Builder Small Buttons',
		dn: 'Small Button Padding',
		n: 'schemaBuilderSmallButtonPadding',
		dv: '0 10px',
		cp: 'padding',
		sel:
			'.comp.compSchemaBuilder ._smallButton, ' +
			'.comp.compSchemaBuilder ._smallEditorContainer > button, ' +
			'.comp.compSchemaBuilder ._popupButtons button',
		np: true,
	},
	{
		gn: 'Schema Builder Small Buttons',
		dn: 'Small Button Font Color',
		n: 'schemaBuilderSmallButtonFontColor',
		cp: 'color',
		sel:
			'.comp.compSchemaBuilder ._smallButton, ' +
			'.comp.compSchemaBuilder ._smallEditorContainer > button, ' +
			'.comp.compSchemaBuilder ._popupButtons button',
		np: true,
	},
	{
		gn: 'Schema Builder Small Buttons',
		dn: 'Small Button Hover Background',
		n: 'schemaBuilderSmallButtonHoverBackground',
		dv: '#f0f0f0',
		cp: 'background',
		sel:
			'.comp.compSchemaBuilder ._smallButton:hover:not(:disabled), ' +
			'.comp.compSchemaBuilder ._smallEditorContainer > button:hover:not(:disabled), ' +
			'.comp.compSchemaBuilder ._popupButtons button:hover:not(:disabled)',
		np: true,
	},

	// ─── Type badge ───
	{
		gn: 'Schema Builder Badge',
		dn: 'Badge Background',
		n: 'schemaBuilderBadgeBackground',
		dv: '#e8f0fe',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._badge',
		np: true,
	},
	{
		gn: 'Schema Builder Badge',
		dn: 'Badge Border Radius',
		n: 'schemaBuilderBadgeBorderRadius',
		dv: '8px',
		cp: 'border-radius',
		sel: '.comp.compSchemaBuilder ._badge',
		np: true,
	},
	{
		gn: 'Schema Builder Badge',
		dn: 'Badge Font Size',
		n: 'schemaBuilderBadgeFontSize',
		dv: '10px',
		cp: 'font-size',
		sel: '.comp.compSchemaBuilder ._badge',
		np: true,
	},

	// ─── JSON view and value popup ───
	{
		gn: 'Schema Builder JSON View',
		dn: 'JSON View Height',
		n: 'schemaBuilderJsonViewHeight',
		dv: '400px',
		cp: 'height',
		sel: '.comp.compSchemaBuilder ._jsonView',
		np: true,
	},
	{
		gn: 'Schema Builder JSON View',
		dn: 'JSON View Border Color',
		n: 'schemaBuilderJsonViewBorderColor',
		dv: '#ddd',
		cp: 'border-color',
		sel: '.comp.compSchemaBuilder ._jsonView',
		np: true,
	},
	{
		gn: 'Schema Builder JSON View',
		dn: 'Value Popup Backdrop',
		n: 'schemaBuilderPopupBackdropBackground',
		dv: '#0004',
		cp: 'background',
		sel: '.comp.compSchemaBuilder ._popupBackground',
		np: true,
	},
	{
		gn: 'Schema Builder JSON View',
		dn: 'Value Popup Background',
		n: 'schemaBuilderPopupBackground',
		dv: '#fff',
		cp: 'background-color',
		sel: '.comp.compSchemaBuilder ._popupBackground ._popupContainer',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);
