import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Flat config (ESLint 10 no longer reads .eslintrc.*).
// Formatting is intentionally NOT linted here -- .prettierrc owns it (useTabs,
// tabWidth 4, singleQuote, semi), and lint-staged runs prettier before eslint.
export default tseslint.config(
	{
		ignores: [
			'dist/**',
			'report/**',
			'coverage/**',
			'webpack.*.js',
			'scripts/**',
			'*.config.mjs',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		...eslintReact.configs['recommended-typescript'],
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			globals: { ...globals.browser },
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		rules: {
			'no-console': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
);
