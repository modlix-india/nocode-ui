// Only the pure helper is under test; the component registry would import this file again.
jest.mock('../../index', () => ({}));

import { getSelectedCountry } from '../PhoneNumber';
import { COUNTRY_LIST } from '../components/listOfCountries';
import { DropdownOption } from '../components/Dropdown';

// The component sorts by name by default, so Canada comes before the United States for +1.
const byName = [...COUNTRY_LIST].sort((a, b) => (a.N <= b.N ? -1 : 1)) as DropdownOption[];
const pick = (value: string, map = new Map<string, DropdownOption>()) =>
	getSelectedCountry(byName, map, value)?.C;

describe('PhoneNumber getSelectedCountry', () => {
	it('picks the country from a NANP area code', () => {
		expect(pick('+18295583967')).toBe('DO');
		expect(pick('+14165551234')).toBe('CA');
		expect(pick('+17875551234')).toBe('PR');
	});

	it('falls back to the main country of a shared dial code, not the first by name', () => {
		expect(pick('+12125551234')).toBe('US');
		expect(pick('+442071234567')).toBe('GB');
		expect(pick('+74951234567')).toBe('RU');
	});

	it('keeps a country picked by hand when no area code matches', () => {
		const ca = byName.find(e => e.C === 'CA')!;
		expect(pick('+12125551234', new Map([['+1', ca]]))).toBe('CA');
	});

	it('returns the single country of a unique dial code', () => {
		expect(pick('+919876543210')).toBe('IN');
	});
});
