import { requestedLanguage } from '../requestedLanguage';

const app = {
	defaultLanguage: 'en',
	languages: { en: 'English', hi: 'Hindi' },
	translations: { 'pt-BR': {}, 'bad:key': {} },
};

describe('requestedLanguage', () => {
	it('answers a language the app is written in, from languages or translations', () => {
		expect(requestedLanguage(app, '?lang=hi')).toBe('hi');
		expect(requestedLanguage(app, '?lang=pt-BR')).toBe('pt-BR');
		expect(requestedLanguage(app, '?lang=en')).toBe('en');
	});

	it("returns the app's own spelling of the key", () => {
		expect(requestedLanguage(app, '?lang=HI')).toBe('hi');
		expect(requestedLanguage(app, '?x=1&lang=pt-br')).toBe('pt-BR');
	});

	it('ignores a language the app does not have, or one that is no language tag', () => {
		expect(requestedLanguage(app, '?lang=fr')).toBeUndefined();
		expect(requestedLanguage(app, '?lang=bad:key')).toBeUndefined();
		expect(requestedLanguage(app, '?lang=')).toBeUndefined();
		expect(requestedLanguage(app, '?other=hi')).toBeUndefined();
		expect(requestedLanguage(app, '')).toBeUndefined();
		expect(requestedLanguage(app, undefined)).toBeUndefined();
	});

	it('ignores everything for an app with no languages, or no app at all', () => {
		expect(requestedLanguage({ defaultLanguage: 'en' }, '?lang=en')).toBeUndefined();
		expect(requestedLanguage({ languages: ['hi'] }, '?lang=hi')).toBeUndefined();
		expect(requestedLanguage(undefined, '?lang=hi')).toBeUndefined();
	});
});
