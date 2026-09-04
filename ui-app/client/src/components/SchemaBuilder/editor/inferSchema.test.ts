import { inferSchema, mergeInferred, suggestRootArrayAs } from './inferSchema';

function deepFreeze<T>(o: T): T {
	if (o && typeof o === 'object') {
		Object.freeze(o);
		Object.values(o).forEach(deepFreeze);
	}
	return o;
}

function schemaOf(sample: any, opts?: any) {
	return inferSchema(deepFreeze(sample), opts).schema;
}

describe('scalar types', () => {
	test('integers stay INTEGER inside int32 and widen to LONG outside it', () => {
		expect(schemaOf(2147483647).type).toBe('INTEGER');
		expect(schemaOf(2147483648).type).toBe('LONG');
		expect(schemaOf(-2147483648).type).toBe('INTEGER');
		expect(schemaOf(-2147483649).type).toBe('LONG');
	});

	test('a non-integer is DOUBLE, never FLOAT', () => {
		// Declaring FLOAT off one sample that happened to round-trip truncates real values later.
		expect(schemaOf(1.5).type).toBe('DOUBLE');
		expect(schemaOf(0.1).type).toBe('DOUBLE');
	});

	test('booleans and strings', () => {
		expect(schemaOf(true).type).toBe('BOOLEAN');
		expect(schemaOf('x').type).toBe('STRING');
	});

	test('a lone null carries no type at all', () => {
		const out = inferSchema(null);
		expect('type' in out.schema).toBe(false);
		expect(out.stats.untyped).toEqual(['root']);
	});
});

describe('formats', () => {
	test('date, datetime and email are detected', () => {
		expect(schemaOf('2026-09-04').format).toBe('DATE');
		expect(schemaOf('2026-09-04T10:00:00Z').format).toBe('DATETIME');
		expect(schemaOf('a@b.com').format).toBe('EMAIL');
	});

	test('ordinary text gets no format', () => {
		expect(schemaOf('hello').format).toBeUndefined();
		expect(schemaOf('2026').format).toBeUndefined();
	});

	test('detection can be turned off', () => {
		expect(schemaOf('a@b.com', { detectFormats: false }).format).toBeUndefined();
	});

	test('a format only survives when every sample agrees', () => {
		expect(
			schemaOf({ a: ['a@b.com', 'not an email'] }).properties.a.items.format,
		).toBeUndefined();
		expect(schemaOf({ a: ['a@b.com', 'c@d.com'] }).properties.a.items.format).toBe('EMAIL');
	});
});

describe('objects', () => {
	test('properties recurse and keep sample order', () => {
		const out = schemaOf({ b: 1, a: { city: 'X' } });
		expect(Object.keys(out.properties)).toEqual(['b', 'a']);
		expect(out.properties.a.properties.city.type).toBe('STRING');
	});

	test('an empty object gets no properties key', () => {
		expect(schemaOf({})).toEqual({ type: 'OBJECT' });
	});

	test('required is left off by default', () => {
		expect(schemaOf({ a: 1 }).required).toBeUndefined();
	});

	test('ALL_RECORDS marks only the keys every record carries non-null', () => {
		const out = schemaOf([{ a: 1, b: 2 }, { a: 3 }, { a: 4, b: null }], {
			requiredFrom: 'ALL_RECORDS',
		});
		expect(out.required).toEqual(['a']);
	});
});

describe('arrays', () => {
	test('an empty array gets no items, so the hole stays visible', () => {
		expect(schemaOf({ a: [] }).properties.a).toEqual({ type: 'ARRAY' });
	});

	test('a homogeneous array gets one items schema, never a tuple', () => {
		const out = schemaOf({ a: ['x', 'y'] });
		expect(Array.isArray(out.properties.a.items)).toBe(false);
		expect(out.properties.a.items.type).toBe('STRING');
	});

	test('mixed scalars produce a union', () => {
		expect(schemaOf({ a: ['x', true] }).properties.a.items.type.sort()).toEqual([
			'BOOLEAN',
			'STRING',
		]);
	});

	test('mixed numbers widen instead of producing a useless union', () => {
		expect(schemaOf({ a: [1, 2.5] }).properties.a.items.type).toBe('DOUBLE');
		expect(schemaOf({ a: [1, 9999999999] }).properties.a.items.type).toBe('LONG');
	});

	test('records in an array union their keys', () => {
		const out = schemaOf({ a: [{ x: 1 }, { y: 'z' }] });
		expect(Object.keys(out.properties.a.items.properties).sort()).toEqual(['x', 'y']);
	});
});

describe('root arrays', () => {
	const RECORDS = [
		{ id: 1, name: 'a' },
		{ id: 2, city: 'b' },
	];

	test('ELEMENT builds the shape of one record', () => {
		const out = schemaOf(RECORDS, { rootArrayAs: 'ELEMENT' });
		expect(out.type).toBe('OBJECT');
		expect(Object.keys(out.properties).sort()).toEqual(['city', 'id', 'name']);
	});

	test('ARRAY builds the list itself', () => {
		const out = schemaOf(RECORDS, { rootArrayAs: 'ARRAY' });
		expect(out.type).toBe('ARRAY');
		expect(out.items.type).toBe('OBJECT');
	});

	test('the suggested default follows what is in the array', () => {
		expect(suggestRootArrayAs(RECORDS)).toBe('ELEMENT');
		expect(suggestRootArrayAs([1, 2, 3])).toBe('ARRAY');
		expect(suggestRootArrayAs([])).toBe('ARRAY');
		expect(suggestRootArrayAs({ a: 1 })).toBe('ARRAY');
	});

	test('an empty root array still yields an object shell under ELEMENT', () => {
		expect(schemaOf([], { rootArrayAs: 'ELEMENT' })).toEqual({ type: 'OBJECT' });
	});
});

describe('bounds', () => {
	test('depth is capped and the cut reported', () => {
		const deep = { a: { b: { c: { d: { e: 1 } } } } };
		const out = inferSchema(deepFreeze(deep), { maxDepth: 2 });
		expect(out.stats.truncated.length).toBeGreaterThan(0);
	});

	test('only maxSamples elements are merged', () => {
		const sample = [...Array(50).fill('x'), 1];
		expect(schemaOf({ a: sample }, { maxSamples: 10 }).properties.a.items.type).toBe('STRING');
	});

	test('null-only fields are reported by path', () => {
		const out = inferSchema(deepFreeze({ a: null, b: { c: null } }));
		expect(out.stats.untyped.sort()).toEqual(['a', 'b.c']);
	});
});

describe('mergeInferred', () => {
	test('an empty side yields the other', () => {
		expect(mergeInferred({}, { type: 'STRING' })).toEqual({ type: 'STRING' });
		expect(mergeInferred({ type: 'STRING' }, {})).toEqual({ type: 'STRING' });
	});

	test('a null observation alongside a typed one keeps the type', () => {
		expect(mergeInferred({}, { type: 'STRING' }).type).toBe('STRING');
	});

	test('nested properties merge recursively', () => {
		const out = mergeInferred(
			{
				type: 'OBJECT',
				properties: { a: { type: 'OBJECT', properties: { x: { type: 'STRING' } } } },
			},
			{
				type: 'OBJECT',
				properties: { a: { type: 'OBJECT', properties: { y: { type: 'INTEGER' } } } },
			},
		);
		expect(Object.keys(out.properties.a.properties).sort()).toEqual(['x', 'y']);
	});
});
