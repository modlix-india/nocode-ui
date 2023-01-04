import { getTranslations } from '../../../src/components/util/getTranslations';
import * as dataFunctions from '../../../src/context/StoreContext';

describe('test suite for translations', () => {
	const languageObject = {
		en: {
			a: 'en-1',
			b: 'en-2',
		},
	};
	test('get valid translations', () => {
		const key = 'a';
		expect(getTranslations(key, languageObject)).toBe('en-1');
	});

	test('get key value as return for invalid key', () => {
		const key = 'd';
		expect(getTranslations(key, languageObject)).toBe(key);
	});

	test('mocking language get data', () => {
		const mock = jest.spyOn(dataFunctions, 'getDataFromPath');
		mock.mockImplementation(() => 'fr');
		const key = 'a';
		expect(getTranslations(key, languageObject)).toBe(key);
	});
});
