import { refShortName, summarize, valuePreview } from './summary';

function deepFreeze<T>(o: T): T {
	if (o && typeof o === 'object') {
		Object.freeze(o);
		Object.values(o).forEach(deepFreeze);
	}
	return o;
}

function texts(schema: any): string[] {
	return summarize(deepFreeze(schema)).chips.map(c => c.text);
}

describe('valuePreview', () => {
	test('renders scalars, quotes strings, and names containers', () => {
		expect(valuePreview('x')).toBe('"x"');
		expect(valuePreview(0)).toBe('0');
		expect(valuePreview(false)).toBe('false');
		expect(valuePreview([])).toBe('[Empty Array]');
		expect(valuePreview([1, 2])).toBe('[Array(2)]');
		expect(valuePreview({ a: 1 })).toBe('[Object]');
		expect(valuePreview(undefined)).toBe('');
	});

	test('long values are truncated', () => {
		expect(valuePreview('a'.repeat(80)).length).toBeLessThan(30);
	});
});

describe('refShortName', () => {
	test('mirrors how SchemaUtil resolves a ref', () => {
		expect(refShortName('myapp.Address')).toBe('Address');
		expect(refShortName('myapp.Address/properties/city')).toBe('Address/properties/city');
		expect(refShortName('a.b.c.Thing')).toBe('Thing');
		expect(refShortName('#/properties/city')).toBe('#/properties/city');
		expect(refShortName('Bare')).toBe('Bare');
		expect(refShortName('')).toBe('');
	});
});

describe('summarize', () => {
	test('a bare field summarises to nothing', () => {
		const out = summarize(deepFreeze({ type: 'STRING' }));
		expect(out.chips).toEqual([]);
		expect(out.hiddenCount).toBe(0);
	});

	test('identity chips come before constraints', () => {
		expect(texts({ type: 'STRING', minLength: 3, ref: 'myapp.Address' })).toEqual([
			'→ Address',
			'len 3+',
		]);
	});

	test('ranges render in all three shapes', () => {
		expect(texts({ minLength: 3, maxLength: 20 })).toEqual(['len 3..20']);
		expect(texts({ minLength: 3 })).toEqual(['len 3+']);
		expect(texts({ maxLength: 20 })).toEqual(['len up to 20']);
		expect(texts({ minimum: 1, maximum: 9 })).toEqual(['1..9']);
	});

	test('a false additionalProperties shows, a false uniqueItems does not', () => {
		expect(texts({ additionalProperties: false })).toEqual(['closed']);
		expect(texts({ uniqueItems: false })).toEqual([]);
		expect(texts({ uniqueItems: true })).toEqual(['unique']);
	});

	test('defaultValue of 0 and false still summarise', () => {
		expect(texts({ defaultValue: 0 })).toEqual(['default 0']);
		expect(texts({ defaultValue: false })).toEqual(['default false']);
	});

	test('description feeds the info note, not a chip', () => {
		const out = summarize(deepFreeze({ type: 'STRING', description: 'The city' }));
		expect(out.chips).toEqual([]);
		expect(out.description).toBe('The city');
	});

	test('comment stands in when there is no description', () => {
		expect(summarize(deepFreeze({ comment: 'todo' })).description).toBe('todo');
	});

	test('chips carry the inert finding when a constant overrides them', () => {
		const out = summarize(deepFreeze({ type: 'STRING', constant: 'X', minLength: 3 }));
		const len = out.chips.find(c => c.key === 'minLength');
		expect(len?.inert?.overriddenBy).toBe('constant');
		// The constant itself is not inert.
		expect(out.chips.find(c => c.key === 'constant')?.inert).toBeUndefined();
	});

	test('a ref leaves its constraint chips live and marks composition inert', () => {
		const out = summarize(
			deepFreeze({ type: 'STRING', ref: 'a.B', minLength: 3, not: { type: 'INTEGER' } }),
		);
		expect(out.chips.find(c => c.key === 'minLength')?.inert).toBeUndefined();
		expect(out.chips.find(c => c.key === 'not')?.inert?.overriddenBy).toBe('ref');
	});

	test('an empty sub-schema slot is not yet a setting', () => {
		expect(texts({ not: {} })).toEqual([]);
		expect(texts({ contains: {} })).toEqual([]);
		expect(texts({ not: { type: 'INTEGER' } })).toEqual(['not']);
	});

	test('overflow collapses into one muted chip and reports the count', () => {
		const out = summarize(
			deepFreeze({
				type: 'STRING',
				ref: 'a.B',
				defaultValue: 'x',
				format: 'EMAIL',
				pattern: '^a',
				minLength: 1,
				maxLength: 9,
				minimum: 1,
				multipleOf: 2,
			}),
		);
		expect(out.chips.length).toBe(6);
		const last = out.chips[out.chips.length - 1];
		expect(last.muted).toBe(true);
		expect(last.text).toBe(`+${out.hiddenCount} more`);
		expect(out.hiddenCount).toBeGreaterThan(0);
	});

	test('a non-object is summarised as empty rather than throwing', () => {
		expect(summarize(undefined).chips).toEqual([]);
		expect(summarize(5).chips).toEqual([]);
	});
});
