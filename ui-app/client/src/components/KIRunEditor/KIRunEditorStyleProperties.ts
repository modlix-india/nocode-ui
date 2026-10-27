import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

/**
 * The editor takes these only when it runs an app theme: a Default Theme outside kirun-ui's
 * built-in list puts `_theme-app` on its root. Built-in themes never match this selector, so
 * setting the palette cannot change an editor that uses them.
 */
const APP_THEME_SELECTOR = '.comp.compKIRunEditor ._kirun-editor._theme-app';

// [name, CSS variable, display name, description, default]. kirun-ui derives the rest of its
// variables (hover, soft accent, focus rings, comment notes, shadows) from these, and falls back to
// its light look for any left unset; KIRunEditorThemes.css in kirun-ui lists them all. Defaults only
// name app variables whose meaning is plain, as in blueprintEditorStyleProperties.ts.
type PaletteEntry = [string, string, string, string, string?];

const EDITOR_PALETTE: Array<PaletteEntry> = [
	[
		'kirunEditorHeaderBackground',
		'--kirun-bg-primary',
		'Header Background',
		'The toolbar along the top.',
		'<backgroundColorSeven>',
	],
	[
		'kirunEditorCanvasBackground',
		'--kirun-bg-secondary',
		'Canvas Background',
		'The graph canvas behind the steps.',
	],
	[
		'kirunEditorWellBackground',
		'--kirun-bg-tertiary',
		'Well Background',
		'Inputs, toggles and hover fills.',
	],
	[
		'kirunEditorTextColor',
		'--kirun-text-primary',
		'Text Color',
		'Step names, values and labels.',
		'<fontColorOne>',
	],
	[
		'kirunEditorMutedTextColor',
		'--kirun-text-secondary',
		'Muted Text Color',
		'Icons, hints and secondary labels.',
	],
	[
		'kirunEditorBorderColor',
		'--kirun-border-color',
		'Border Color',
		'Hairlines, input borders and the canvas dots.',
	],
	[
		'kirunEditorStepBackground',
		'--kirun-node-bg',
		'Step Background',
		'The fill of each step card.',
		'<backgroundColorSeven>',
	],
	[
		'kirunEditorStepBorderColor',
		'--kirun-node-border',
		'Step Border Color',
		'The outline of each step card.',
	],
	[
		'kirunEditorStepShadowColor',
		'--kirun-node-shadow',
		'Step Shadow Color',
		'Shadow colour under cards and popups. Use transparent for flat cards.',
	],
	[
		'kirunEditorAccentColor',
		'--kirun-accent',
		'Accent Color',
		'Selection, links, active toggles and the lines between steps.',
		'<colorOne>',
	],
	[
		'kirunEditorAccentHoverColor',
		'--kirun-accent-hover',
		'Accent Hover Color',
		'The accent under the pointer.',
	],
	[
		'kirunEditorOnAccentColor',
		'--kirun-on-accent',
		'On-Accent Color',
		'Text and icons on an accent fill.',
	],
	[
		'kirunEditorSuccessColor',
		'--kirun-success',
		'Success Color',
		'Event nodes.',
		'<successColor>',
	],
	[
		'kirunEditorErrorColor',
		'--kirun-danger',
		'Error Color',
		'Validation messages and steps with errors.',
		'<errorColor>',
	],
	[
		'kirunEditorWarningColor',
		'--kirun-warning',
		'Warning Color',
		'Step comment notes.',
		'<warningColor>',
	],
	[
		'kirunEditorSmallRadius',
		'--kirun-radius-sm',
		'Small Radius',
		'Corners of inputs and small buttons. 0 for square.',
	],
	[
		'kirunEditorRadius',
		'--kirun-radius',
		'Radius',
		'Corners of steps and buttons. 0 for square.',
	],
	[
		'kirunEditorLargeRadius',
		'--kirun-radius-lg',
		'Large Radius',
		'Corners of popups and store nodes. 0 for square.',
	],
	[
		'kirunEditorFontFamily',
		'--kirun-font-family',
		'Font Family',
		'Font family of the editor chrome and steps.',
	],
	[
		'kirunEditorCodeFontFamily',
		'--kirun-code-font-family',
		'Code Font Family',
		'Font family of the text editor and code values.',
	],
];

// The text editor (Monaco) colours. Unset ones keep kirun-ui's light or dark code colours, picked by
// how dark the code background is.
const EDITOR_CODE_COLORS: Array<PaletteEntry> = [
	['kirunEditorCodeBackground', '--kirun-code-bg', 'Code Background', 'Text editor background.'],
	[
		'kirunEditorCodeColor',
		'--kirun-code-fg',
		'Code Color',
		'Plain identifiers, operators and punctuation.',
	],
	[
		'kirunEditorCodeKeywordColor',
		'--kirun-code-keyword',
		'Keyword Color',
		'FUNCTION, PARAMETERS, EVENTS, LOGIC and the like.',
	],
	[
		'kirunEditorCodeControlColor',
		'--kirun-code-control',
		'Control Keyword Color',
		'AFTER, IF and the event block names.',
	],
	['kirunEditorCodeTypeColor', '--kirun-code-type', 'Type Color', 'Schema types.'],
	[
		'kirunEditorCodeFunctionColor',
		'--kirun-code-function',
		'Function Color',
		'Function names such as System.Math.Add.',
	],
	['kirunEditorCodeTagColor', '--kirun-code-tag', 'Tag Color', 'Namespaces and tags.'],
	[
		'kirunEditorCodeVariableColor',
		'--kirun-code-variable',
		'Variable Color',
		'Step names, parameter names and paths.',
	],
	[
		'kirunEditorCodePredefinedColor',
		'--kirun-code-predefined',
		'Predefined Color',
		'Arguments, Steps and Context.',
	],
	[
		'kirunEditorCodeValueColor',
		'--kirun-code-value',
		'Value Color',
		'VALUES references, escapes and embedded brackets.',
	],
	['kirunEditorCodeNumberColor', '--kirun-code-number', 'Number Color', 'Numbers.'],
	['kirunEditorCodeStringColor', '--kirun-code-string', 'String Color', 'Strings.'],
	[
		'kirunEditorCodeExpressionColor',
		'--kirun-code-expression',
		'Expression Color',
		'Backtick expressions.',
	],
	[
		'kirunEditorCodeCommentColor',
		'--kirun-code-comment',
		'Comment Color',
		'Comments and line numbers.',
	],
	[
		'kirunEditorCodeErrorColor',
		'--kirun-code-error',
		'Error Color',
		'Unterminated strings and other invalid text.',
	],
	[
		'kirunEditorCodeLineHighlight',
		'--kirun-code-line-highlight',
		'Line Highlight',
		'Background of the line with the cursor.',
	],
	[
		'kirunEditorCodeSelection',
		'--kirun-code-selection',
		'Selection Color',
		'Background of selected text.',
	],
	['kirunEditorCodeCursorColor', '--kirun-code-cursor', 'Cursor Color', 'The text cursor.'],
];

const paletteProperties = (
	group: string,
	entries: Array<PaletteEntry>,
): Array<StylePropertyDefinition> =>
	entries.map(([n, cp, dn, de, dv]) => ({
		gn: group,
		n,
		cp,
		dn,
		de,
		...(dv ? { dv } : {}),
		sel: APP_THEME_SELECTOR,
		np: true,
	}));

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		n: 'gridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'gridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'gridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'gridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for grid.',
		sel: '.comp.compGrid._noAnchorGrid',
	},
	{
		n: 'anchoredGridPaddingLeft',
		cp: 'padding-left',
		dn: 'Grid Left padding',
		de: 'Left padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingRight',
		cp: 'padding-right',
		dn: 'Grid Right padding',
		de: 'Right padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingTop',
		cp: 'padding-top',
		dn: 'Grid Top padding',
		de: 'Top padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'anchoredGridPaddingBottom',
		cp: 'padding-bottom',
		dn: 'Grid Bottom padding',
		de: 'Bottom padding for grid.',
		sel: '.comp.compGrid ._anchorGrid',
	},
	{
		n: 'gapBetween',
		cp: 'gap',
		dn: 'Gap between children',
		de: 'Gap between children of grid.',
		dv: '5px',
		sel: '.comp.compGrid ._anchorGrid, .comp.compGrid._noAnchorGrid',
	},
	...paletteProperties('Editor Palette', EDITOR_PALETTE),
	...paletteProperties('Editor Code Colors', EDITOR_CODE_COLORS),
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.dv)
		.map(({ n: name, dv: defaultValue }) => [name, defaultValue!]),
);
