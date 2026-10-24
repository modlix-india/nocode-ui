/**
 * The real component registry pulls in components/index, whose module graph is
 * circular under Jest, so the defaults behind the theme are mocked here.
 */
jest.mock('../../components', () => ({
	__esModule: true,
	default: new Map([['Grid', { styleDefaults: new Map([['borderColorOne', '#333333']]) }]]),
}));
jest.mock('../../App/appStyleProperties', () => ({
	styleProperties: new Map(),
	styleDefaults: new Map([
		['fontColorOne', '#111111'],
		['errorColor', '#ed6a5e'],
		['validationMessageFontColor', '<errorColor>'],
		['focusRing', '0 0 0 2px rgba(0, 0, 0, 0.2), 0 0 0 4px <errorColor>'],
	]),
}));
jest.mock('../../App/usedComponents', () => ({ usedComponents: { lastAdded: () => 1 } }));

import { ThemeExtractor } from '../ThemeExtractor';

function extractor(theme: any, devices?: any) {
	const t = new ThemeExtractor();
	t.setStore({ theme, devices });
	return t;
}

describe('ThemeExtractor Theme.x', () => {
	it('returns a literal theme value as stored', () => {
		const t = extractor({ ALL: { backgroundColorThree: '#FFFFFF' } });
		expect(t.getValue('Theme.backgroundColorThree')).toBe('#FFFFFF');
	});

	it('resolves a theme value that is a reference to another variable', () => {
		// Classic stores backgroundColorThree as <colorThree>; returned raw, the
		// consent card on leadzump's Classic pages lost its fill.
		const t = extractor({
			ALL: { backgroundColorThree: '<colorThree>', colorThree: '#FBF6E9' },
		});
		expect(t.getValue('Theme.backgroundColorThree')).toBe('#FBF6E9');
	});

	it('resolves references nested inside a larger value and chains of them', () => {
		const t = extractor({
			ALL: { ring: '0 0 0 2px <accent>', accent: '<brand>', brand: '#2563EB' },
		});
		expect(t.getValue('Theme.ring')).toBe('0 0 0 2px #2563EB');
	});

	it('falls back to component and app defaults for a reference the theme lacks', () => {
		const t = extractor({ ALL: { edge: '1px solid <borderColorOne>', ink: '<fontColorOne>' } });
		expect(t.getValue('Theme.edge')).toBe('1px solid #333333');
		expect(t.getValue('Theme.ink')).toBe('#111111');
	});

	it('still resolves a variable the theme does not define from the defaults', () => {
		const t = extractor({ ALL: {} });
		expect(t.getValue('Theme.borderColorOne')).toBe('#333333');
	});

	it('resolves a reference in a resolution-specific value', () => {
		const t = extractor(
			{ ALL: { colorThree: '#FBF6E9' }, DESKTOP_SCREEN: { panel: '<colorThree>' } },
			{ DESKTOP_SCREEN: true },
		);
		expect(t.getValue('Theme.panel')).toBe('#FBF6E9');
	});

	it('returns a variable the theme sets over its default', () => {
		const t = extractor({ ALL: { validationMessageFontColor: '#00AA00', errorColor: '#C0362C' } });
		expect(t.getValue('Theme.validationMessageFontColor')).toBe('#00AA00');
	});

	it('returns the plain default of a variable only the defaults set', () => {
		const t = extractor({ ALL: { errorColor: '#C0362C' } });
		expect(t.getValue('Theme.fontColorOne')).toBe('#111111');
	});

	it('resolves a default that references a variable the theme overrides against the theme', () => {
		// validationMessageFontColor defaults to <errorColor>; it used to resolve against
		// the catalog defaults (#ed6a5e) instead of the theme's own errorColor.
		const t = extractor({ ALL: { errorColor: '#C0362C' } });
		expect(t.getValue('Theme.validationMessageFontColor')).toBe('#C0362C');
		expect(t.getValue('Theme.focusRing')).toBe('0 0 0 2px rgba(0, 0, 0, 0.2), 0 0 0 4px #C0362C');
	});

	it('resolves a referencing default against the defaults when the theme leaves both unset', () => {
		const t = extractor({ ALL: {} });
		expect(t.getValue('Theme.validationMessageFontColor')).toBe('#ed6a5e');
	});

	it('returns an empty string for a variable nobody defines', () => {
		const t = extractor({ ALL: {} });
		expect(t.getValue('Theme.noSuchVariable')).toBe('');
	});

	it('picks up a new theme object rather than a cached one', () => {
		const t = extractor({ ALL: { bg: '<c>', c: '#000000' } });
		expect(t.getValue('Theme.bg')).toBe('#000000');
		t.setStore({ theme: { ALL: { bg: '<c>', c: '#FFFFFF' } } });
		expect(t.getValue('Theme.bg')).toBe('#FFFFFF');
	});
});
