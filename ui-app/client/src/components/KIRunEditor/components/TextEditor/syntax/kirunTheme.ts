import * as monaco from 'monaco-editor';

/**
 * KIRun DSL Theme for Monaco
 *
 * Colors aligned with visual editor (from colors/index.ts SIDE_COLORS):
 * - Greens: 10B981, 34D399, 6EE7B7, 22C55E, 4ADE80
 * - Blues: 3B82F6, 60A5FA, 93C5FD, 6366F1, 818CF8
 * - Oranges: F97316, FB923C, FDBA74
 * - Teals: 14B8A6, 2DD4BF, 5EEAD4, 06B6D4, 22D3EE
 * - Purples: 8B5CF6, A78BFA, C4B5FD
 * - Grays: 64748B, 94A3B8, 6B7280
 *
 * Token colors:
 * - keyword: Purple - FUNCTION, NAMESPACE, LOGIC, etc.
 * - type.identifier: Teal - INTEGER, STRING, ARRAY, etc.
 * - entity.name.function: Emerald (bold) - Function names like System.Math.Add
 * - entity.name.tag: Slate gray (subtle) - Statement names (before colon)
 * - variable.parameter: Blue - Parameter names in function calls
 * - variable.predefined: Cyan (bold) - Expression prefixes (Steps, Arguments, etc.)
 * - string.value: Orange - Double-quoted VALUE strings
 * - string.expression: Teal - Single-quoted/backtick EXPRESSION strings
 */
export const kirunDarkTheme: monaco.editor.IStandaloneThemeData = {
	base: 'vs-dark',
	inherit: true,
	rules: [
		// Keywords (purple - prominent)
		{ token: 'keyword', foreground: 'A78BFA', fontStyle: 'bold' }, // Violet 400
		{ token: 'keyword.control', foreground: 'FB923C' }, // Orange 400 - for iteration, true, false, output

		// Types (teal)
		{ token: 'type', foreground: '2DD4BF', fontStyle: 'bold' }, // Teal 400
		{ token: 'type.identifier', foreground: '2DD4BF', fontStyle: 'bold' },

		// Function names - PROMINENT (emerald green, bold)
		{ token: 'entity.name.function', foreground: '34D399', fontStyle: 'bold' }, // Emerald 400

		// Statement names - SUBTLE (slate gray, no bold)
		{ token: 'entity.name.tag', foreground: '94A3B8' }, // Slate 400

		// Parameter names (blue)
		{ token: 'variable.parameter', foreground: '60A5FA' }, // Blue 400

		// Expression prefixes - Steps, Arguments, Context, etc. (cyan, bold)
		{ token: 'variable.predefined', foreground: '22D3EE', fontStyle: 'bold' }, // Cyan 400
		{ token: 'variable', foreground: '93C5FD' }, // Blue 300

		// Identifiers
		{ token: 'identifier', foreground: 'e4e4e7' },

		// Numbers (lime green)
		{ token: 'number', foreground: 'A3E635' }, // Lime 400
		{ token: 'number.float', foreground: 'A3E635' },

		// Double-quoted strings - VALUES (orange)
		{ token: 'string.value', foreground: 'FB923C' }, // Orange 400

		// Single-quoted/backtick strings - EXPRESSIONS (teal)
		{ token: 'string.expression', foreground: '5EEAD4' }, // Teal 300
		{ token: 'string', foreground: 'FDBA74' }, // Orange 300
		{ token: 'string.escape', foreground: 'FACC15' }, // Yellow 400
		{ token: 'string.invalid', foreground: 'F43F5E' }, // Rose 500

		// Comments (slate gray, italic)
		{ token: 'comment', foreground: '64748B', fontStyle: 'italic' }, // Slate 500

		// Operators and delimiters
		{ token: 'operator', foreground: 'e4e4e7' },
		{ token: 'delimiter', foreground: 'e4e4e7' },
		{ token: 'delimiter.bracket.embed', foreground: 'FACC15' }, // Yellow 400 for {{ }}
	],
	colors: {
		'editor.background': '#242424',
		'editor.foreground': '#e4e4e7',
		'editor.lineHighlightBackground': '#2d2d2d',
		'editorCursor.foreground': '#60a5fa',
		'editor.selectionBackground': '#3f3f46',
		'editorBracketMatch.background': '#3f3f4620',
		'editorBracketMatch.border': '#52525b',
	},
};

export const kirunLightTheme: monaco.editor.IStandaloneThemeData = {
	base: 'vs',
	inherit: true,
	rules: [
		// Keywords (purple - prominent)
		{ token: 'keyword', foreground: '8B5CF6', fontStyle: 'bold' }, // Violet 500
		{ token: 'keyword.control', foreground: 'F97316' }, // Orange 500 - for iteration, true, false, output

		// Types (teal)
		{ token: 'type', foreground: '14B8A6', fontStyle: 'bold' }, // Teal 500
		{ token: 'type.identifier', foreground: '14B8A6', fontStyle: 'bold' },

		// Function names - PROMINENT (emerald green, bold)
		{ token: 'entity.name.function', foreground: '10B981', fontStyle: 'bold' }, // Emerald 500

		// Statement names - SUBTLE (slate gray, no bold)
		{ token: 'entity.name.tag', foreground: '64748B' }, // Slate 500

		// Parameter names (blue)
		{ token: 'variable.parameter', foreground: '3B82F6' }, // Blue 500

		// Expression prefixes - Steps, Arguments, Context, etc. (cyan, bold)
		{ token: 'variable.predefined', foreground: '06B6D4', fontStyle: 'bold' }, // Cyan 500
		{ token: 'variable', foreground: '6366F1' }, // Indigo 500

		// Identifiers
		{ token: 'identifier', foreground: '1a202c' },

		// Numbers (lime green)
		{ token: 'number', foreground: '84CC16' }, // Lime 500
		{ token: 'number.float', foreground: '84CC16' },

		// Double-quoted strings - VALUES (orange)
		{ token: 'string.value', foreground: 'F97316' }, // Orange 500

		// Single-quoted/backtick strings - EXPRESSIONS (teal)
		{ token: 'string.expression', foreground: '14B8A6' }, // Teal 500
		{ token: 'string', foreground: 'F97316' }, // Orange 500
		{ token: 'string.escape', foreground: 'EAB308' }, // Yellow 500
		{ token: 'string.invalid', foreground: 'F43F5E' }, // Rose 500

		// Comments (slate gray, italic)
		{ token: 'comment', foreground: '94A3B8', fontStyle: 'italic' }, // Slate 400

		// Operators and delimiters
		{ token: 'operator', foreground: '1a202c' },
		{ token: 'delimiter', foreground: '1a202c' },
		{ token: 'delimiter.bracket.embed', foreground: 'EAB308' }, // Yellow 500 for {{ }}
	],
	colors: {
		'editor.background': '#f5f7fa',
		'editor.foreground': '#1a202c',
		'editor.lineHighlightBackground': '#e8ecef',
		'editorCursor.foreground': '#3182ce',
		'editor.selectionBackground': '#cbd5e0',
		'editorBracketMatch.background': '#cbd5e020',
		'editorBracketMatch.border': '#a0aec0',
	},
};

export const kirunHighContrastTheme: monaco.editor.IStandaloneThemeData = {
	base: 'hc-black',
	inherit: true,
	rules: [
		// Keywords (bright cyan - maximum contrast)
		{ token: 'keyword', foreground: '00FFFF', fontStyle: 'bold' },
		{ token: 'keyword.control', foreground: 'FFD700' }, // Gold for block names

		// Types (bright magenta)
		{ token: 'type', foreground: 'FF00FF', fontStyle: 'bold' },
		{ token: 'type.identifier', foreground: 'FF00FF', fontStyle: 'bold' },

		// Function names (bright green)
		{ token: 'entity.name.function', foreground: '00FF00', fontStyle: 'bold' },

		// Statement names (white)
		{ token: 'entity.name.tag', foreground: 'FFFFFF' },

		// Parameter names (bright yellow)
		{ token: 'variable.parameter', foreground: 'FFFF00' },

		// Expression prefixes (bright cyan)
		{ token: 'variable.predefined', foreground: '00FFFF', fontStyle: 'bold' },
		{ token: 'variable', foreground: 'ADD8E6' },

		// Numbers (bright orange)
		{ token: 'number', foreground: 'FFA500' },
		{ token: 'number.float', foreground: 'FFA500' },

		// Strings
		{ token: 'string.value', foreground: 'FF6347' }, // Tomato red
		{ token: 'string.expression', foreground: '00CED1' }, // Dark turquoise
		{ token: 'string', foreground: 'FFA500' },

		// Comments (gray)
		{ token: 'comment', foreground: '808080', fontStyle: 'italic' },

		// Operators and delimiters (white)
		{ token: 'operator', foreground: 'FFFFFF' },
		{ token: 'delimiter', foreground: 'FFFFFF' },
	],
	colors: {
		'editor.background': '#0a0a0a',
		'editor.foreground': '#ffffff',
		'editor.lineHighlightBackground': '#1a1a1a',
		'editorCursor.foreground': '#ffff00',
		'editor.selectionBackground': '#1a1a1a',
		'editorBracketMatch.background': '#ffff0030',
		'editorBracketMatch.border': '#ffff00',
	},
};

export const kirunEasyOnEyesTheme: monaco.editor.IStandaloneThemeData = {
	base: 'vs',
	inherit: true,
	rules: [
		// Keywords (soft purple)
		{ token: 'keyword', foreground: '9F7AEA', fontStyle: 'bold' },
		{ token: 'keyword.control', foreground: 'ED8936' },

		// Types (soft teal)
		{ token: 'type', foreground: '38B2AC', fontStyle: 'bold' },
		{ token: 'type.identifier', foreground: '38B2AC', fontStyle: 'bold' },

		// Function names (soft green)
		{ token: 'entity.name.function', foreground: '48BB78', fontStyle: 'bold' },

		// Statement names (muted gray)
		{ token: 'entity.name.tag', foreground: '6b6456' },

		// Parameter names (soft blue)
		{ token: 'variable.parameter', foreground: '4299E1' },

		// Expression prefixes (soft cyan)
		{ token: 'variable.predefined', foreground: '0BC5EA', fontStyle: 'bold' },
		{ token: 'variable', foreground: '667EEA' },

		// Identifiers
		{ token: 'identifier', foreground: '3e3832' },

		// Numbers (soft lime)
		{ token: 'number', foreground: '9AE6B4' },
		{ token: 'number.float', foreground: '9AE6B4' },

		// Strings
		{ token: 'string.value', foreground: 'ED8936' }, // Soft orange
		{ token: 'string.expression', foreground: '38B2AC' }, // Soft teal
		{ token: 'string', foreground: 'DD6B20' },

		// Comments (soft gray)
		{ token: 'comment', foreground: '6b6456', fontStyle: 'italic' },

		// Operators and delimiters
		{ token: 'operator', foreground: '3e3832' },
		{ token: 'delimiter', foreground: '3e3832' },
	],
	colors: {
		'editor.background': '#f4f1ea',
		'editor.foreground': '#3e3832',
		'editor.lineHighlightBackground': '#e8e4dc',
		'editorCursor.foreground': '#7c9885',
		'editor.selectionBackground': '#d4cfc4',
		'editorBracketMatch.background': '#d4cfc430',
		'editorBracketMatch.border': '#bfb9ab',
	},
};

export const kirunFlaredUpTheme: monaco.editor.IStandaloneThemeData = {
	base: 'vs-dark',
	inherit: true,
	rules: [
		// Keywords (vibrant purple)
		{ token: 'keyword', foreground: 'C084FC', fontStyle: 'bold' },
		{ token: 'keyword.control', foreground: 'FB923C' },

		// Types (vibrant cyan)
		{ token: 'type', foreground: '22D3EE', fontStyle: 'bold' },
		{ token: 'type.identifier', foreground: '22D3EE', fontStyle: 'bold' },

		// Function names (vibrant green)
		{ token: 'entity.name.function', foreground: '4ADE80', fontStyle: 'bold' },

		// Statement names (soft purple)
		{ token: 'entity.name.tag', foreground: 'b19cd9' },

		// Parameter names (vibrant blue)
		{ token: 'variable.parameter', foreground: '60A5FA' },

		// Expression prefixes (vibrant pink)
		{ token: 'variable.predefined', foreground: 'F472B6', fontStyle: 'bold' },
		{ token: 'variable', foreground: 'A78BFA' },

		// Identifiers
		{ token: 'identifier', foreground: 'f0e7ff' },

		// Numbers (vibrant yellow)
		{ token: 'number', foreground: 'FDE047' },
		{ token: 'number.float', foreground: 'FDE047' },

		// Strings
		{ token: 'string.value', foreground: 'FBBF24' }, // Vibrant amber
		{ token: 'string.expression', foreground: '2DD4BF' }, // Vibrant teal
		{ token: 'string', foreground: 'FB923C' },

		// Comments (soft gray)
		{ token: 'comment', foreground: 'b19cd9', fontStyle: 'italic' },

		// Operators and delimiters
		{ token: 'operator', foreground: 'f0e7ff' },
		{ token: 'delimiter', foreground: 'f0e7ff' },
	],
	colors: {
		'editor.background': '#151226',
		'editor.foreground': '#f0e7ff',
		'editor.lineHighlightBackground': '#1f1b35',
		'editorCursor.foreground': '#a78bfa',
		'editor.selectionBackground': '#4a3f7a',
		'editorBracketMatch.background': '#4a3f7a30',
		'editorBracketMatch.border': '#6b5ba6',
	},
};

/**
 * Register themes with Monaco
 */
export function registerKIRunThemes() {
	monaco.editor.defineTheme('kirun-dark', kirunDarkTheme);
	monaco.editor.defineTheme('kirun-light', kirunLightTheme);
	monaco.editor.defineTheme('kirun-high-contrast', kirunHighContrastTheme);
	monaco.editor.defineTheme('kirun-easy-on-eyes', kirunEasyOnEyesTheme);
	monaco.editor.defineTheme('kirun-flared-up', kirunFlaredUpTheme);
}
