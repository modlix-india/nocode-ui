import { toCountryCodes } from '../countryCodes';

// The agent wrote topCountries: ["India"]; only "IN" matched, so the field fell back to +93 (2026-11-21).
describe('toCountryCodes', () => {
	it('turns names into ISO codes, any case', () => {
		expect(toCountryCodes(['India', 'united states', 'gb'])).toEqual(['IN', 'US', 'GB']);
	});
	it('keeps codes and unknown entries as written', () => {
		expect(toCountryCodes(['IN', 'Atlantis'])).toEqual(['IN', 'Atlantis']);
	});
	it('passes a missing list through', () => {
		expect(toCountryCodes(undefined)).toBeUndefined();
	});
});
