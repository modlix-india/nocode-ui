import { getAlphaNumeral, getRoman } from '../../../src/components/util/numberConverter';

describe('test suite for translations', () => {
	test('get Roman numeral', () => {
		expect(getRoman(4)).toBe('IV');
		expect(getRoman(4, false)).toBe('iv');
	});

	test('get alpha numeral', () => {
		expect(getAlphaNumeral(27)).toBe('AA');
		expect(getAlphaNumeral(28)).toBe('AB');
		expect(getAlphaNumeral(4, false)).toBe('d');
	});
});
