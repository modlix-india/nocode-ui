import {
	hasAny,
	inertGroups,
	isSchemaObject,
	isSet,
	schemaWarnings,
	SECTION_KEYWORDS,
} from './precedence';

describe('isSet', () => {
	test('false is a real setting, blank containers are not', () => {
		expect(isSet(false)).toBe(true);
		expect(isSet(0)).toBe(true);
		expect(isSet(undefined)).toBe(false);
		expect(isSet(null)).toBe(false);
		expect(isSet('')).toBe(false);
		expect(isSet([])).toBe(false);
		expect(isSet({})).toBe(false);
		expect(isSet('x')).toBe(true);
		expect(isSet([1])).toBe(true);
		expect(isSet({ a: 1 })).toBe(true);
	});
});

describe('hasAny', () => {
	test('reports only keywords that carry a setting', () => {
		expect(hasAny({ minProperties: 1 }, SECTION_KEYWORDS.object)).toBe(true);
		expect(hasAny({ additionalProperties: false }, SECTION_KEYWORDS.object)).toBe(true);
		expect(hasAny({ patternProperties: {} }, SECTION_KEYWORDS.object)).toBe(false);
		expect(hasAny({ type: 'OBJECT' }, SECTION_KEYWORDS.object)).toBe(false);
		expect(hasAny(undefined, SECTION_KEYWORDS.object)).toBe(false);
	});

	test('items is not an array-section keyword, so an ordinary array stays closed', () => {
		expect(SECTION_KEYWORDS.array).not.toContain('items');
		expect(hasAny({ type: 'ARRAY', items: { type: 'STRING' } }, SECTION_KEYWORDS.array)).toBe(
			false,
		);
	});
});

describe('inertGroups', () => {
	test('a bare schema has nothing inert', () => {
		expect(inertGroups({ type: 'STRING', minLength: 3 }).size).toBe(0);
	});

	test('constant kills everything, including enums and ref', () => {
		const out = inertGroups({ type: 'STRING', constant: 'X', enums: ['a'], ref: 'a.B' });
		for (const g of [
			'type',
			'string',
			'number',
			'object',
			'array',
			'composition',
			'ref',
			'enums',
		])
			expect(out.get(g as any)?.overriddenBy).toBe('constant');
	});

	test('enums kills everything except itself', () => {
		const out = inertGroups({ type: 'STRING', enums: ['a'], minLength: 3 });
		expect(out.get('string')?.overriddenBy).toBe('enums');
		expect(out.get('type')?.overriddenBy).toBe('enums');
		expect(out.get('ref')?.overriddenBy).toBe('enums');
		expect(out.has('enums')).toBe(false);
	});

	test('ref leaves type and constraints live, and kills only composition', () => {
		const out = inertGroups({ type: 'STRING', ref: 'myapp.Address', minLength: 3, not: {} });
		expect(out.has('type')).toBe(false);
		expect(out.has('string')).toBe(false);
		expect(out.has('number')).toBe(false);
		expect(out.get('composition')?.overriddenBy).toBe('ref');
	});

	test('a blank ref is not a ref', () => {
		expect(inertGroups({ type: 'STRING', ref: '   ' }).size).toBe(0);
		expect(inertGroups({ type: 'STRING', ref: '' }).size).toBe(0);
	});

	test('constant wins over enums, and enums over ref', () => {
		expect(inertGroups({ constant: 1, enums: [1] }).get('type')?.overriddenBy).toBe('constant');
		expect(inertGroups({ enums: [1], ref: 'a.B' }).get('type')?.overriddenBy).toBe('enums');
	});

	test('a constant of false or 0 still counts', () => {
		expect(inertGroups({ constant: false }).size).toBeGreaterThan(0);
		expect(inertGroups({ constant: 0 }).size).toBeGreaterThan(0);
	});
});

describe('schemaWarnings', () => {
	test('a format with no type throws at validation time', () => {
		expect(schemaWarnings({ format: 'EMAIL' })[0].keyword).toBe('format');
		expect(schemaWarnings({ format: 'EMAIL', type: 'STRING' })).toEqual([]);
	});

	test('the four built-in formats shadow pattern, REGEX does not', () => {
		for (const format of ['DATE', 'TIME', 'DATETIME', 'EMAIL']) {
			const out = schemaWarnings({ type: 'STRING', format, pattern: '^a' });
			expect(out.some(w => w.keyword === 'pattern')).toBe(true);
		}
		const regex = schemaWarnings({ type: 'STRING', format: 'REGEX', pattern: '^a' });
		expect(regex.some(w => w.keyword === 'pattern')).toBe(false);
	});

	test('inverted bounds can never pass', () => {
		expect(schemaWarnings({ type: 'STRING', minLength: 9, maxLength: 2 })).toHaveLength(1);
		expect(schemaWarnings({ type: 'INTEGER', minimum: 5, maximum: 5 })).toHaveLength(0);
		expect(schemaWarnings({ type: 'ARRAY', minItems: 3, maxItems: 1 })).toHaveLength(1);
	});
});

describe('isSchemaObject', () => {
	test('only a plain object can be a schema root', () => {
		expect(isSchemaObject({})).toBe(true);
		expect(isSchemaObject({ type: 'OBJECT' })).toBe(true);
		expect(isSchemaObject(5)).toBe(false);
		expect(isSchemaObject('x')).toBe(false);
		expect(isSchemaObject(true)).toBe(false);
		expect(isSchemaObject([])).toBe(false);
		expect(isSchemaObject(null)).toBe(false);
		expect(isSchemaObject(undefined)).toBe(false);
	});
});
