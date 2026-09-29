import { StylePropertyDefinition } from '../../types/common';

/**
 * The board's palette and geometry, as theme variables.
 *
 * ── The one decision this file rests on ──────────────────────────────────
 *
 * Every structural rule in BlueprintEditorStyle.tsx is written against the
 * custom properties declared on the component root there, never against a
 * literal. So an app repoints the WHOLE board by setting the ten names in
 * "Board Palette" below, rather than one variable per rule. The ink ramp alone
 * appears in about fifty rules; a per-rule variable would mean fifty theme
 * writes to change one colour.
 *
 * ── Why almost nothing here carries a literal `dv` ───────────────────────
 *
 * A `dv` is NOT a CSS fallback. It is injected into the theme map as the `ALL`
 * value for that name and emits a real rule, so a literal here is something
 * every theme would have to restate in order to be rid of. That is the right
 * trade when EXTERNALISING a component that already shipped its literals, where
 * the point is that no existing screen moves. This component has no installed
 * base, so the literals live in the root block of BlueprintEditorStyle.tsx
 * instead, where a property with no `dv` and no theme value emits nothing and
 * leaves that declaration standing.
 *
 * `dv: '<standardVar>'` appears only where a standard app variable genuinely
 * means the same thing. Where the board needs a token the platform has no name
 * for — a near-white recessed ground, a mid-grey secondary ink, a
 * dashed-affordance ink — `dv` is absent and the name here IS the theme hook.
 *
 * Five of them lost their `dv` after being measured against a real theme, and
 * the failure was not subtle. `<borderColorSix>` resolved to #808284, a MID
 * GREY, so every card and column header on the board was ringed in it;
 * `<fontColorEight>` to #C0C0C1, lighter than the ink it was supposed to be a
 * step down from; `<fontColorTwo>` to #56585B, which is dark text on the dark
 * fill of a selected chip; `<backgroundColorOne>` to the ink itself, so the one
 * saturated action colour was not saturated. A name that reads like a synonym
 * is not one. Status colours keep theirs: success, information, warning and
 * error do mean the same thing here, and a status SHOULD follow the app.
 *
 * Deliberately NOT copied from Prompt: `<accentTintColor>`, `<surfaceColorOne>`
 * and `<borderColorNine>` are not declared in appStyleProperties.ts. They are
 * one app's private vocabulary and resolve to empty everywhere else.
 */
export const styleProperties: Array<StylePropertyDefinition> = [
	// ─────────────────────────────── Board Palette ───────────────────────────────
	// Ten names. Setting these restyles the entire board.
	{
		gn: 'Board Palette',
		dn: 'Surface Background',
		de: 'The board ground and the card fill. Everything that reads as paper.',
		n: 'blueprintSurfaceBackground',
		dv: '<backgroundColorSeven>',
		cp: '--_bpSurface',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Recessed Background',
		de: 'The quieter wash behind column headers, readonly field values and chrome cards. No app-level variable means this, so it is unset until a theme names it.',
		n: 'blueprintGroundBackground',
		cp: '--_bpGround',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Hairline Color',
		de: 'Dividers: under the board header, above a card detail, under a preview caption.',
		n: 'blueprintHairlineColor',
		cp: '--_bpHairline',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Border Color',
		de: 'Resting border on cards, chips and column headers.',
		n: 'blueprintBorderColor',
		cp: '--_bpBorder',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Ink Color',
		de: 'Primary text, and the fill of a selected chip or a selected card rail.',
		n: 'blueprintInkColor',
		dv: '<fontColorOne>',
		cp: '--_bpInk',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Secondary Ink Color',
		de: 'One step down from ink: chrome card titles, ghost button labels. The app font ramp jumps straight from ink to muted, so this has no standard default.',
		n: 'blueprintInkSecondaryColor',
		cp: '--_bpInk2',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Muted Ink Color',
		de: 'Band headings, roll-up counts, field labels, one-line descriptions.',
		n: 'blueprintInkMutedColor',
		cp: '--_bpInkMuted',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'On-Ink Color',
		de: 'Text on an ink fill: a selected lens chip, a selected option chip.',
		n: 'blueprintOnInkColor',
		cp: '--_bpOnInk',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Accent Color',
		de: 'The one saturated colour: primary action buttons.',
		n: 'blueprintAccentColor',
		cp: '--_bpAccent',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Palette',
		dn: 'Chrome Card Icon Color',
		de: 'Marks a card as belonging to the shell rather than the content, so a nav bar and a footer do not compete with what differs between pages.',
		n: 'blueprintChromeIconColor',
		cp: '--_bpChromeInk',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},

	// ─────────────────────────────── Board Status ────────────────────────────────
	// Pending and drifted point in OPPOSITE directions, so they must never read
	// as the same colour, and neither may be confused with selection, which is
	// an ink ring rather than a hue.
	{
		gn: 'Board Status',
		dn: 'Clean Status Color',
		de: 'The plan and the definition agree.',
		n: 'blueprintStatusCleanColor',
		dv: '<successColor>',
		cp: '--_bpStatusClean',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Status',
		dn: 'Pending Status Color',
		de: 'The plan moved and the definition has not. Apply moves the definition.',
		n: 'blueprintStatusPendingColor',
		dv: '<informationColor>',
		cp: '--_bpStatusPending',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Status',
		dn: 'Drifted Status Color',
		de: 'The definition moved and the plan has not. Update moves the plan. Not an error, and must not read as one.',
		n: 'blueprintStatusDriftedColor',
		dv: '<warningColor>',
		cp: '--_bpStatusDrifted',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Status',
		dn: 'Failed Status Color',
		n: 'blueprintStatusFailedColor',
		dv: '<errorColor>',
		cp: '--_bpStatusFailed',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},

	// ────────────────────────────── Board Geometry ───────────────────────────────
	// No `dv`: the root block carries the literals, so an app that sets none of
	// these is never geometrically broken.
	{
		gn: 'Board Geometry',
		dn: 'Column Width',
		de: 'Fixed width of every column in a rail. The rail scrolls; the column does not stretch.',
		n: 'blueprintColumnWidth',
		cp: '--_bpColumnWidth',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Geometry',
		dn: 'Rail Gutter',
		de: 'Space between columns in a rail.',
		n: 'blueprintRailGutter',
		cp: '--_bpRailGutter',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Geometry',
		dn: 'Board Inset',
		de: 'Horizontal inset shared by the header, the lens row, band headings and the rail padding, so they line up on one edge.',
		n: 'blueprintBoardInset',
		cp: '--_bpBoardInset',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Geometry',
		dn: 'Card Radius',
		n: 'blueprintCardRadius',
		cp: '--_bpCardRadius',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Geometry',
		dn: 'Site Tile Radius',
		de: 'The square tiles on the site picker, which match the account screen.',
		n: 'blueprintTileRadius',
		cp: '--_bpTileRadius',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Geometry',
		dn: 'Control Radius',
		de: 'Field values, option chips, preview frame.',
		n: 'blueprintControlRadius',
		cp: '--_bpControlRadius',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Geometry',
		dn: 'Pill Radius',
		de: 'Lens chips and action buttons.',
		n: 'blueprintPillRadius',
		cp: '--_bpPillRadius',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},

	// ──────────────────────────────── Board Type ─────────────────────────────────
	// One `font` shorthand on the root, then font-size only per slot. Re-emitting
	// `font` resets everything it omits, so a slot that only needs to be smaller
	// must never restate the shorthand.
	{
		gn: 'Board Type',
		dn: 'Board Font',
		n: 'blueprintFont',
		dv: '<primaryFont>',
		cp: 'font',
		sel: '.comp.compBlueprintEditor',
		np: true,
	},
	{
		gn: 'Board Header',
		dn: 'Title Font',
		n: 'blueprintBoardTitleFont',
		dv: '<quinaryFont>',
		cp: 'font',
		sel: '.comp.compBlueprintEditor ._boardTitle',
		np: true,
	},
	{
		gn: 'Board Header',
		dn: 'Description Font',
		n: 'blueprintBoardDescriptionFont',
		dv: '<tertiaryFont>',
		cp: 'font',
		sel: '.comp.compBlueprintEditor ._boardDescription',
		np: true,
	},

	// ────────────────────────────────── Band ─────────────────────────────────────
	{
		gn: 'Band',
		dn: 'Band Heading Font Size',
		n: 'blueprintBandHeadingFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._bandHeading',
		np: true,
	},
	{
		gn: 'Band',
		dn: 'Band Heading Letter Spacing',
		de: 'The small-caps heading is spaced rather than sized; this is what makes it read as a label.',
		n: 'blueprintBandHeadingLetterSpacing',
		cp: 'letter-spacing',
		sel: '.comp.compBlueprintEditor ._bandHeading',
		np: true,
	},
	{
		gn: 'Band',
		dn: 'Band Sub-line Font Size',
		n: 'blueprintBandSubLineFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._bandSubLine',
		np: true,
	},

	// ────────────────────────────────── Lens ─────────────────────────────────────
	{
		gn: 'Lens',
		dn: 'Lens Chip Border',
		n: 'blueprintLensChipBorder',
		cp: 'border',
		sel: '.comp.compBlueprintEditor ._lensChip',
		np: true,
	},
	{
		gn: 'Lens',
		dn: 'Lens Chip Hover Border Color',
		n: 'blueprintLensChipHoverBorderColor',
		cp: 'border-color',
		sel: '.comp.compBlueprintEditor ._lensChip:hover',
		np: true,
	},
	{
		gn: 'Lens',
		dn: 'Lens Chip Selected Background',
		de: 'Defaults through the ink token. Set this to make the on state accent-filled without moving the ink ramp.',
		n: 'blueprintLensChipSelectedBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._lensChip._selected',
		np: true,
	},
	{
		gn: 'Lens',
		dn: 'Lens Chip Selected Font Color',
		n: 'blueprintLensChipSelectedFontColor',
		cp: 'color',
		sel: '.comp.compBlueprintEditor ._lensChip._selected',
		np: true,
	},

	// ───────────────────────────────── Column ────────────────────────────────────
	{
		gn: 'Column',
		dn: 'Column Header Background',
		n: 'blueprintColumnHeaderBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._columnHeader',
		np: true,
	},
	{
		gn: 'Column',
		dn: 'Column Header Min Height',
		n: 'blueprintColumnHeaderMinHeight',
		cp: 'min-height',
		sel: '.comp.compBlueprintEditor ._columnHeader',
		np: true,
	},
	{
		gn: 'Column',
		dn: 'Column Header Hover Border Color',
		n: 'blueprintColumnHeaderHoverBorderColor',
		cp: 'border-color',
		sel: '.comp.compBlueprintEditor ._columnHeader:hover',
		np: true,
	},
	{
		gn: 'Column',
		dn: 'Column Icon Size',
		n: 'blueprintColumnIconFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._columnIcon',
		np: true,
	},
	{
		gn: 'Column',
		dn: 'Roll-up Count Font Size',
		n: 'blueprintColumnRollupFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._columnRollup',
		np: true,
	},

	// ────────────────────────────────── Card ─────────────────────────────────────
	{
		gn: 'Card',
		dn: 'Card Border',
		n: 'blueprintCardBorder',
		cp: 'border',
		sel: '.comp.compBlueprintEditor ._planCard',
		np: true,
	},
	{
		gn: 'Card',
		dn: 'Card Padding',
		n: 'blueprintCardPadding',
		cp: 'padding',
		sel: '.comp.compBlueprintEditor ._planCard',
		np: true,
	},
	{
		gn: 'Card',
		dn: 'Card Hover Border Color',
		n: 'blueprintCardHoverBorderColor',
		cp: 'border-color',
		sel: '.comp.compBlueprintEditor ._planCard:hover',
		np: true,
	},
	{
		gn: 'Card',
		dn: 'Card Title Font Size',
		n: 'blueprintCardTitleFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._cardTitle',
		np: true,
	},
	{
		gn: 'Card',
		dn: 'Card Description Font Size',
		n: 'blueprintCardDescriptionFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._cardDescription',
		np: true,
	},

	// ─────────────────────────────── Card States ─────────────────────────────────
	// Selection is an ink ring plus a left rail, NOT a colour: pending and
	// drifted already spend blue and amber, and a selected card must not be
	// mistaken for either. Both parts are named so a theme can drop one.
	{
		gn: 'Card States',
		dn: 'Card Selected Border Color',
		n: 'blueprintCardSelectedBorderColor',
		cp: 'border-color',
		sel: '.comp.compBlueprintEditor ._planCard._selected, .comp.compBlueprintEditor ._columnHeader._selected',
		np: true,
	},
	{
		gn: 'Card States',
		dn: 'Card Selected Ring',
		n: 'blueprintCardSelectedRing',
		cp: 'box-shadow',
		sel: '.comp.compBlueprintEditor ._planCard._selected, .comp.compBlueprintEditor ._columnHeader._selected',
		np: true,
	},
	{
		gn: 'Card States',
		dn: 'Card Selected Rail Width',
		de: 'The stripe down the left edge of a selected card. Set to 0 to turn it off.',
		n: 'blueprintCardSelectedRailWidth',
		cp: 'width',
		sel: '.comp.compBlueprintEditor ._planCard._selected::before',
		np: true,
	},
	{
		gn: 'Card States',
		dn: 'Card Expanded Shadow',
		n: 'blueprintCardExpandedShadow',
		cp: 'box-shadow',
		sel: '.comp.compBlueprintEditor ._planCard._expanded',
		np: true,
	},
	{
		gn: 'Card States',
		dn: 'Chrome Card Background',
		n: 'blueprintChromeCardBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._planCard._chrome',
		np: true,
	},

	// ─────────────────────────────── Card Detail ─────────────────────────────────
	{
		gn: 'Card Detail',
		dn: 'Detail Divider Color',
		n: 'blueprintCardDetailDividerColor',
		cp: 'border-top-color',
		sel: '.comp.compBlueprintEditor ._cardDetail',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Field Label Font Size',
		n: 'blueprintFieldLabelFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._fieldLabel',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Field Label Letter Spacing',
		n: 'blueprintFieldLabelLetterSpacing',
		cp: 'letter-spacing',
		sel: '.comp.compBlueprintEditor ._fieldLabel',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Field Value Background',
		n: 'blueprintFieldValueBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._fieldValue',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Field Value Border',
		n: 'blueprintFieldValueBorder',
		cp: 'border',
		sel: '.comp.compBlueprintEditor ._fieldValue',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Option Chip Border',
		n: 'blueprintOptionChipBorder',
		cp: 'border',
		sel: '.comp.compBlueprintEditor ._optionChip',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Option Chip Selected Background',
		n: 'blueprintOptionChipSelectedBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._optionChip._selected',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Preview Frame Border',
		n: 'blueprintPreviewFrameBorder',
		cp: 'border',
		sel: '.comp.compBlueprintEditor ._previewFrame',
		np: true,
	},
	{
		gn: 'Card Detail',
		dn: 'Preview Caption Font Size',
		n: 'blueprintPreviewCaptionFontSize',
		cp: 'font-size',
		sel: '.comp.compBlueprintEditor ._previewCaption',
		np: true,
	},

	// ──────────────────────────────── Affordances ────────────────────────────────
	// A comma-separated `sel` REQUIRES np:true with the full prefix on every
	// branch; the automatic prefix only lands on the first one.
	{
		gn: 'Affordances',
		dn: 'Add Affordance Border',
		de: 'The dashed outline shared by "add card" and "add column".',
		n: 'blueprintAddAffordanceBorder',
		cp: 'border',
		sel: '.comp.compBlueprintEditor ._addCardBox, .comp.compBlueprintEditor ._addColumnBox',
		np: true,
	},
	{
		gn: 'Affordances',
		dn: 'Add Affordance Hover Border Color',
		n: 'blueprintAddAffordanceHoverBorderColor',
		cp: 'border-color',
		sel: '.comp.compBlueprintEditor ._addCardBox:hover, .comp.compBlueprintEditor ._addColumnBox:hover',
		np: true,
	},
	{
		gn: 'Affordances',
		dn: 'Add Affordance Hover Font Color',
		n: 'blueprintAddAffordanceHoverFontColor',
		cp: 'color',
		sel: '.comp.compBlueprintEditor ._addCardBox:hover, .comp.compBlueprintEditor ._addColumnBox:hover',
		np: true,
	},
	{
		gn: 'Affordances',
		dn: 'Rail Scrollbar Thumb Background',
		n: 'blueprintRailScrollbarThumbBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._rail::-webkit-scrollbar-thumb',
		np: true,
	},
	{
		gn: 'Affordances',
		dn: 'Action Button Radius',
		n: 'blueprintActionButtonRadius',
		cp: 'border-radius',
		sel: '.comp.compBlueprintEditor ._actionButton',
		np: true,
	},
	{
		gn: 'Affordances',
		dn: 'Primary Action Background',
		n: 'blueprintActionButtonPrimaryBackground',
		cp: 'background',
		sel: '.comp.compBlueprintEditor ._actionButton._primary',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = styleProperties;
