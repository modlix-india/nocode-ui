import { StyleResolution } from '../../../types/common';
import { processStyleDefinition } from '../../../util/styleProcessor';
import { buildAppTheme, cssColorToMonaco } from '../appMonacoTheme';
import { styleDefaults, styleProperties } from '../textEditorStyleProperies';

/** Editor Theme `app`: Monaco colours from the app theme's Editor Palette, only on `_appTheme`. */
describe('TextEditor app theme', () => {
	it('builds a dark Monaco theme from a dark palette', () => {
		const vars: Record<string, string> = { '--te-bg': '0E111A', '--te-key': '7DCFFF', '--te-string': '9ECE6A80' };
		const t = buildAppTheme(v => vars[v]);
		expect(t.base).toBe('vs-dark');
		expect(t.colors['editor.background']).toBe('#0E111A');
		expect(t.rules).toContainEqual({ token: 'string.key.json', foreground: '7DCFFF' });
		expect(t.rules).toContainEqual({ token: 'string.value.json', foreground: '9ECE6A' });
	});

	it('with nothing set it is a plain light theme', () => {
		const t = buildAppTheme(() => undefined);
		expect(t).toEqual({ base: 'vs', inherit: true, rules: [], colors: {} });
	});

	it('reads computed colours', () => {
		expect(cssColorToMonaco('rgb(14, 17, 26)')).toBe('0E111A');
		expect(cssColorToMonaco('rgba(251, 191, 36, 0.5)')).toBe('FBBF2480');
		expect(cssColorToMonaco('rgba(0, 0, 0, 0)')).toBeUndefined();
	});

	it('scopes the palette to _appTheme and resolves its defaults', () => {
		for (const p of styleProperties) expect(p.sel).toBe('.comp.compTextEditor._appTheme');
		const theme = new Map([[StyleResolution.ALL, new Map([['backgroundColorSeven', '#0d0e16'], ['fontColorOne', '#e4e8f7']])]]);
		const css = processStyleDefinition('.comp.compTextEditor', styleProperties, styleDefaults, theme);
		expect(css).toContain('--te-bg: #0d0e16;');
		expect(css).toContain('--te-fg: #e4e8f7;');
	});
});
