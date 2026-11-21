import { validate } from '../validationProcessor';

// A validation in the wrong shape resolved to an empty entry; Object.entries on it threw inside
// the field's render and the error boundary dropped every field in the grid (2026-11-21).
describe('validate with malformed entries', () => {
	const def = { key: 'k', name: 'company', type: 'TextBox' } as any;

	it('skips entries that are not objects instead of throwing', () => {
		expect(() => validate(def, {} as any, [undefined, null], 'x', [], {} as any)).not.toThrow();
		expect(validate(def, {} as any, [undefined, null], 'x', [], {} as any)).toEqual([]);
	});

	it('still runs a well-formed MANDATORY check next to a broken entry', () => {
		const msgs = validate(
			def,
			{} as any,
			[undefined, { type: 'MANDATORY', message: 'Company is required' }],
			'',
			[],
			{} as any,
		);
		expect(msgs).toEqual(['Company is required']);
	});
});
