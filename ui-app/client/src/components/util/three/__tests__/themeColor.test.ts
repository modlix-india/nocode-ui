/**
 * themeColor resolves against the live ThemeExtractor, so the extractor is
 * mocked rather than the whole store being stood up: importing StoreContext for
 * real pulls in components/index, whose module graph is circular under Jest.
 * That constraint is already recorded in Tree's treeStyleArtifact test.
 */
const resolveValue = jest.fn();

jest.mock('../../../../context/StoreContext', () => ({
	themeExtractor: { resolveValue: (v: string) => resolveValue(v) },
}));

import { colorOr, resolveThemeColor, resolveThemeColors, schemePalette } from '../themeColor';

beforeEach(() => resolveValue.mockReset());

describe('resolveThemeColor', () => {
	it('passes a plain colour straight through without touching the theme', () => {
		expect(resolveThemeColor('#1e1b4b')).toBe('#1e1b4b');
		expect(resolveValue).not.toHaveBeenCalled();
	});

	it('leaves undefined and empty alone', () => {
		expect(resolveThemeColor(undefined)).toBeUndefined();
		expect(resolveThemeColor('')).toBe('');
		expect(resolveValue).not.toHaveBeenCalled();
	});

	it('resolves a variable reference', () => {
		resolveValue.mockReturnValue('#00d9ff');
		expect(resolveThemeColor('<colorOne>')).toBe('#00d9ff');
		expect(resolveValue).toHaveBeenCalledWith('<colorOne>');
	});

	it('resolves a value that is a variable nested inside another', () => {
		// The case the platform gets wrong on its own: ThemeExtractor returns
		// the live theme entry verbatim, so `Theme.colorOne` can arrive here
		// still holding `<colorTwo>`.
		resolveValue.mockReturnValue('#52bd94');
		expect(resolveThemeColor('<colorTwo>')).toBe('#52bd94');
	});

	it('returns undefined for an unknown variable rather than an empty string', () => {
		// processStyleValueWithFunction yields '' for a name it cannot find.
		// Passing that on would overwrite the preset's colour with nothing;
		// undefined lets the caller keep its default.
		resolveValue.mockReturnValue('');
		expect(resolveThemeColor('<noSuchVariable>')).toBeUndefined();
	});

	it('treats a whitespace-only resolution as unresolved too', () => {
		resolveValue.mockReturnValue('   ');
		expect(resolveThemeColor('<blank>')).toBeUndefined();
	});

	it('is not fooled by a non-string value', () => {
		expect(resolveThemeColor(42 as any)).toBe(42);
		expect(resolveValue).not.toHaveBeenCalled();
	});
});

describe('resolveThemeColors', () => {
	it('preserves position, including gaps', () => {
		resolveValue.mockReturnValue('#abcdef');
		expect(resolveThemeColors(['#111111', undefined, '<colorOne>'])).toEqual([
			'#111111',
			undefined,
			'#abcdef',
		]);
	});

	it('maps an unknown variable to undefined in place', () => {
		resolveValue.mockReturnValue('');
		expect(resolveThemeColors(['#111111', '<ghost>'])).toEqual(['#111111', undefined]);
	});
});

describe('schemePalette', () => {
	it('builds a palette from the theme colour the scheme names', () => {
		resolveValue.mockReturnValue('#52bd94');
		const p = schemePalette('_secondary');
		expect(resolveValue).toHaveBeenCalledWith('<colorTwo>');
		expect(p?.b).toBe('#52bd94');
		expect(p?.a).not.toBe(p?.c);
	});

	it('gives nothing back for the preset scheme, without asking the theme', () => {
		// This is the whole safety of the feature: the default value leaves
		// every scene exactly as its preset drew it, and does not even read
		// the theme to decide that.
		expect(schemePalette('_preset')).toBeUndefined();
		expect(schemePalette(undefined)).toBeUndefined();
		expect(resolveValue).not.toHaveBeenCalled();
	});

	it('gives nothing back when the theme has no such colour', () => {
		resolveValue.mockReturnValue('');
		expect(schemePalette('_primary')).toBeUndefined();
	});

	it('gives nothing back when the theme colour cannot be read', () => {
		// A theme is free to hold a named colour. Falling through to the
		// preset is right; shading a colour we guessed at is not.
		resolveValue.mockReturnValue('rebeccapurple');
		expect(schemePalette('_primary')).toBeUndefined();
	});
});

describe('colorOr', () => {
	it('prefers the value the author typed over the scheme', () => {
		expect(colorOr('#ff0000', '#00ff00')).toBe('#ff0000');
		expect(resolveValue).not.toHaveBeenCalled();
	});

	it('falls back to the scheme when the property is empty', () => {
		expect(colorOr(undefined, '#00ff00')).toBe('#00ff00');
		expect(colorOr('', '#00ff00')).toBe('#00ff00');
		expect(colorOr('   ', '#00ff00')).toBe('#00ff00');
	});

	it('resolves a theme reference in the property before preferring it', () => {
		resolveValue.mockReturnValue('#123456');
		expect(colorOr('<colorSix>', '#00ff00')).toBe('#123456');
	});

	it('falls back to the scheme when the property names a variable the theme lacks', () => {
		resolveValue.mockReturnValue('');
		expect(colorOr('<ghost>', '#00ff00')).toBe('#00ff00');
	});

	it('yields undefined with neither, so the preset keeps its own colour', () => {
		expect(colorOr(undefined, undefined)).toBeUndefined();
	});
});
