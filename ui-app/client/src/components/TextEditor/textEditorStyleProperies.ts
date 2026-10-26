import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

/**
 * The Editor Palette: Monaco's colours when Editor Theme is `app`. Only that mode puts `_appTheme`
 * on the editor, so these never touch an editor on a Monaco theme. appMonacoTheme.ts reads the
 * variables and builds the Monaco theme from them; unset ones keep Monaco's light or dark colours,
 * picked by how dark the background is.
 */
const APP_THEME = '.comp.compTextEditor._appTheme';

// [name, CSS variable, display name, description, default]
const EDITOR_PALETTE: Array<[string, string, string, string, string?]> = [
	[
		'textEditorBackground',
		'--te-bg',
		'Background',
		'Editor and gutter background.',
		'<backgroundColorSeven>',
	],
	['textEditorColor', '--te-fg', 'Text Color', 'Plain text and identifiers.', '<fontColorOne>'],
	['textEditorKeyColor', '--te-key', 'Key Color', 'JSON keys and attribute names.'],
	['textEditorStringColor', '--te-string', 'String Color', 'Strings and attribute values.'],
	['textEditorNumberColor', '--te-number', 'Number Color', 'Numbers and types.'],
	[
		'textEditorKeywordColor',
		'--te-keyword',
		'Keyword Color',
		'true, false, null, keywords and tags.',
	],
	[
		'textEditorDelimiterColor',
		'--te-delimiter',
		'Delimiter Color',
		'Brackets, commas and colons.',
	],
	[
		'textEditorCommentColor',
		'--te-comment',
		'Comment Color',
		'Comments, and line numbers unless set.',
	],
	['textEditorLineNumberColor', '--te-line-number', 'Line Number Color', 'Gutter line numbers.'],
	[
		'textEditorLineHighlight',
		'--te-line-highlight',
		'Line Highlight',
		'The line with the cursor, and indent guides.',
	],
	['textEditorSelection', '--te-selection', 'Selection Color', 'Background of selected text.'],
	['textEditorCursorColor', '--te-cursor', 'Cursor Color', 'The text cursor.'],
	['textEditorFontFamily', '--te-font-family', 'Font Family', 'The editor font.'],
];

export const styleProperties: Array<StylePropertyDefinition> = EDITOR_PALETTE.map(
	([n, cp, dn, de, dv]) => ({
		gn: 'Editor Palette',
		n,
		cp,
		dn,
		de,
		...(dv ? { dv } : {}),
		sel: APP_THEME,
		np: true,
	}),
);

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);
