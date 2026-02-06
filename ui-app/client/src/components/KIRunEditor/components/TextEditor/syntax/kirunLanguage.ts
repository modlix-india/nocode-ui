import * as monaco from 'monaco-editor';

/**
 * Register KIRun DSL language with Monaco
 *
 * Syntax highlighting colors:
 * - Keywords (FUNCTION, NAMESPACE, etc.): keyword (purple/magenta)
 * - Type keywords (INTEGER, STRING, etc.): type (teal/cyan)
 * - Function names (System.Math.Add): function (yellow/gold)
 * - Parameter names (name = value): parameter (light blue)
 * - Expression references (Steps.x, Arguments.y): variable (light blue)
 * - Strings: string (orange/brown)
 * - Numbers: number (green)
 * - Block names (iteration, true, false): keyword.control
 */
export function registerKIRunLanguage() {
	// Register the language
	monaco.languages.register({ id: 'kirun-dsl' });

	// Set language configuration
	monaco.languages.setLanguageConfiguration('kirun-dsl', {
		comments: {
			blockComment: ['/*', '*/'],
		},
		brackets: [
			['{', '}'],
			['[', ']'],
			['(', ')'],
		],
		autoClosingPairs: [
			{ open: '{', close: '}' },
			{ open: '[', close: ']' },
			{ open: '(', close: ')' },
			{ open: '"', close: '"' },
			{ open: "'", close: "'" },
			{ open: '`', close: '`' },
		],
		surroundingPairs: [
			{ open: '{', close: '}' },
			{ open: '[', close: ']' },
			{ open: '(', close: ')' },
			{ open: '"', close: '"' },
			{ open: "'", close: "'" },
			{ open: '`', close: '`' },
		],
	});

	// Set tokenizer (syntax highlighting rules)
	monaco.languages.setMonarchTokensProvider('kirun-dsl', {
		defaultToken: '',
		tokenPostfix: '.kirun',

		keywords: [
			'FUNCTION',
			'NAMESPACE',
			'PARAMETERS',
			'EVENTS',
			'LOGIC',
			'AS',
			'OF',
			'AFTER',
			'IF',
			'WITH',
			'DEFAULT',
			'VALUE',
		],

		typeKeywords: [
			'INTEGER',
			'LONG',
			'FLOAT',
			'DOUBLE',
			'STRING',
			'BOOLEAN',
			'NULL',
			'ANY',
			'ARRAY',
			'OBJECT',
		],

		blockNames: ['iteration', 'true', 'false', 'output', 'error'],

		// Expression prefixes that indicate a reference
		expressionPrefixes: [
			'Steps',
			'Arguments',
			'Context',
			'Store',
			'Page',
			'Application',
			'LocalStore',
			'SessionStore',
			'Parent',
			'Cookies',
			'URL',
		],

		operators: ['=', ':', ',', '.', '+', '-', '*', '/', '%', '<', '>', '!', '&', '|', '?'],

		// Regular expressions
		symbols: /[=><!~?:&|+\-*\/\^%]+/,
		escapes: /\\(?:[abfnrtv\\"'`]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

		tokenizer: {
			root: [
				// Backtick strings (expressions)
				[/`/, 'string.expression', '@backtick_string'],

				// Statement definition: statementName: FunctionCall
				// Match "identifier:" pattern for statement names
				[/([a-zA-Z_]\w*)(\s*)(:)/, ['entity.name.tag', '', 'delimiter']],

				// Function call: Namespace.Name(
				// Match dotted identifier followed by (
				[/([a-zA-Z_][\w.]*)(\s*)(\()/, ['entity.name.function', '', '@brackets']],

				// Parameter assignment: paramName =
				// Match identifier followed by =
				[/([a-zA-Z_]\w*)(\s*)(=)/, ['variable.parameter', '', 'operator']],

				// Expression references: Steps.x, Arguments.y, Context.z, Page.a, Store.b
				[
					/\b(Steps|Arguments|Context|Store|Page|Application|LocalStore|SessionStore|Parent|Cookies|URL)\b/,
					'variable.predefined',
				],

				// Keywords
				[
					/[a-zA-Z_]\w*/,
					{
						cases: {
							'@keywords': 'keyword',
							'@typeKeywords': 'type.identifier',
							'@blockNames': 'keyword.control',
							'@default': 'identifier',
						},
					},
				],

				// Whitespace
				{ include: '@whitespace' },

				// Double braces {{ }} for embedded expressions
				[/\{\{/, 'delimiter.bracket.embed', '@embedded_expression'],

				// Delimiters and operators
				[/[{}()\[\]]/, '@brackets'],
				[/[<>](?!@symbols)/, '@brackets'],
				[/@symbols/, 'operator'],

				// Numbers
				[/-?\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
				[/-?\d+/, 'number'],

				// Strings
				[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
				[/'([^'\\]|\\.)*$/, 'string.invalid'], // non-terminated string
				[/"/, 'string.value', '@string_double'],
				[/'/, 'string.expression', '@string_single'],
			],

			whitespace: [
				[/[ \t\r\n]+/, ''],
				[/\/\*/, 'comment', '@comment'],
			],

			comment: [
				[/[^\/*]+/, 'comment'],
				[/\*\//, 'comment', '@pop'],
				[/[\/*]/, 'comment'],
			],

			// Double-quoted strings are VALUES (orange/brown)
			string_double: [
				[/[^\\"]+/, 'string.value'],
				[/@escapes/, 'string.escape'],
				[/\\./, 'string.escape.invalid'],
				[/"/, 'string.value', '@pop'],
			],

			// Single-quoted strings are EXPRESSIONS (different color)
			string_single: [
				[/[^\\']+/, 'string.expression'],
				[/@escapes/, 'string.escape'],
				[/\\./, 'string.escape.invalid'],
				[/'/, 'string.expression', '@pop'],
			],

			// Backtick strings are EXPRESSIONS
			backtick_string: [
				[/[^\\`]+/, 'string.expression'],
				[/@escapes/, 'string.escape'],
				[/\\./, 'string.escape.invalid'],
				[/`/, 'string.expression', '@pop'],
			],

			// Embedded expressions in {{ }}
			embedded_expression: [
				[/\}\}/, 'delimiter.bracket.embed', '@pop'],
				[/[a-zA-Z_]\w*/, 'variable'],
				[/\./, 'delimiter'],
				[/\[/, '@brackets'],
				[/\]/, '@brackets'],
				[/[^}]+/, 'variable'],
			],
		},
	});
}
