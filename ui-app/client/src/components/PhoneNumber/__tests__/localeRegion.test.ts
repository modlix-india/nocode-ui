import { localeRegion } from '../../util/localeRegion';

// With no topCountries the phone field took the alphabetical first country (Afghanistan, +93);
// it now starts on the visitor's own region (2026-11-21).
describe('localeRegion', () => {
	const nav = globalThis.navigator;
	const setLangs = (languages: string[], language = languages[0]) =>
		Object.defineProperty(globalThis, 'navigator', {
			value: { languages, language },
			configurable: true,
		});
	afterEach(() => Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true }));

	it('reads the region of the preferred language', () => {
		setLangs(['en-IN', 'en']);
		expect(localeRegion()).toBe('IN');
	});

	it('skips languages without a region', () => {
		setLangs(['en', 'pt-BR']);
		expect(localeRegion()).toBe('BR');
	});

	it('returns undefined when no language names a region', () => {
		setLangs(['en']);
		expect(localeRegion()).toBeUndefined();
	});

	it('does not throw on an unparseable tag', () => {
		setLangs(['!!']);
		expect(localeRegion()).toBeUndefined();
	});
});
