import { StyleResolution } from '../../../types/common';
import { processStyleDefinition } from '../../../util/styleProcessor';
import { styleDefaults, styleProperties } from '../KIRunEditorStyleProperties';

const PREFIX = '.comp.compKIRunEditor';
const APP_THEME = '.comp.compKIRunEditor ._kirun-editor._theme-app';
const palette = styleProperties.filter(p => p.cp?.startsWith('--kirun-'));

/**
 * The Editor Palette restyles the KIRun Editor only when it runs an app theme (a Default Theme
 * outside kirun-ui's built-in list, which puts `_theme-app` on the editor root). Editors on a
 * built-in theme, such as the page editor's function editor, must never pick it up.
 */
describe('KIRun Editor palette', () => {
	it('scopes every palette entry to the app theme only', () => {
		expect(palette.length).toBeGreaterThan(30);
		for (const p of palette) {
			expect(p.np).toBe(true);
			expect(p.sel).toBe(APP_THEME);
		}
	});

	it('has unique names and variables', () => {
		expect(new Set(palette.map(p => p.n)).size).toBe(palette.length);
		expect(new Set(palette.map(p => p.cp)).size).toBe(palette.length);
	});

	it('emits the defaults as CSS variables, resolved from the app theme', () => {
		const theme = new Map([
			[
				StyleResolution.ALL,
				new Map([
					['fontColorOne', '#0b0d14'],
					['backgroundColorSeven', '#ffffff'],
					['colorOne', '#b45309'],
					['successColor', '#116329'],
					['errorColor', '#cf222e'],
					['warningColor', '#d97706'],
				]),
			],
		]);
		const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
		expect(css).toContain(APP_THEME);
		expect(css).toContain('--kirun-text-primary: #0b0d14;');
		expect(css).toContain('--kirun-accent: #b45309;');
		expect(css).toContain('--kirun-node-bg: #ffffff;');
		expect(css).toContain('--kirun-danger: #cf222e;');
		// Without a value the variable is left unset, so kirun-ui falls back to its light look.
		expect(css).not.toContain('--kirun-code-keyword');
	});

	it('lets an app theme set any palette entry', () => {
		const theme = new Map([
			[
				StyleResolution.ALL,
				new Map([
					['kirunEditorRadius', '0'],
					['kirunEditorCodeKeywordColor', '#bb9af7'],
				]),
			],
		]);
		const css = processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);
		expect(css).toContain('--kirun-radius: 0;');
		expect(css).toContain('--kirun-code-keyword: #bb9af7;');
	});
});
