import { childNodesOf } from './schemaUtils';
import { buildSearchIndex, emptyIndex } from './searchUtils';

function deepFreeze<T>(o: T): T {
	if (o && typeof o === 'object') {
		Object.freeze(o);
		Object.values(o).forEach(deepFreeze);
	}
	return o;
}

const SAMPLE = deepFreeze({
	type: 'OBJECT',
	properties: {
		name: { type: 'STRING' },
		address: {
			type: 'OBJECT',
			properties: {
				city: { type: 'STRING' },
				postCode: { type: 'LONG' },
			},
		},
		linked: { ref: 'myapp.Address' },
	},
});

describe('buildSearchIndex', () => {
	test('an empty query is inactive and matches nothing', () => {
		for (const query of ['', '   ']) {
			const index = buildSearchIndex(SAMPLE, query);
			expect(index.active).toBe(false);
			expect(index.count).toBe(0);
			expect(index.matched.size).toBe(0);
			expect(index.visible.size).toBe(0);
		}
	});

	test('a nested match makes its ancestors visible and force-expanded', () => {
		const index = buildSearchIndex(SAMPLE, 'city');
		expect(index.count).toBe(1);
		expect(index.matched.has('properties.address.properties.city')).toBe(true);
		expect(index.visible.has('properties.address')).toBe(true);
		expect(index.forceExpand.has('properties.address')).toBe(true);
		// The match itself does not need forcing open, only its ancestors.
		expect(index.forceExpand.has('properties.address.properties.city')).toBe(false);
	});

	test('everything under a match stays visible', () => {
		const index = buildSearchIndex(SAMPLE, 'address');
		expect(index.visible.has('properties.address.properties.city')).toBe(true);
		expect(index.visible.has('properties.address.properties.postCode')).toBe(true);
	});

	test('matching is case-insensitive both ways', () => {
		expect(buildSearchIndex(SAMPLE, 'CITY').count).toBe(1);
		expect(buildSearchIndex(SAMPLE, 'postcode').count).toBe(1);
	});

	test('zero matches leaves only the root visible', () => {
		const index = buildSearchIndex(SAMPLE, 'nothinghere');
		expect(index.count).toBe(0);
		expect([...index.visible]).toEqual(['']);
	});

	test('a ref target is searchable', () => {
		const index = buildSearchIndex(SAMPLE, 'myapp.Address');
		expect(index.matched.has('properties.linked')).toBe(true);
	});

	test('type: searches types, not names', () => {
		const index = buildSearchIndex(SAMPLE, 'type:LONG');
		expect(index.count).toBe(1);
		expect(index.matched.has('properties.address.properties.postCode')).toBe(true);

		// A property literally named "name" is not a STRING-type match by accident.
		const strings = buildSearchIndex(SAMPLE, 'type:string');
		expect(strings.matched.has('properties.name')).toBe(true);
		expect(strings.matched.has('properties.address')).toBe(false);
	});

	test('type: with nothing after it matches nothing', () => {
		expect(buildSearchIndex(SAMPLE, 'type:').count).toBe(0);
	});

	test('paths are exactly the ones childNodesOf produces, including quoted keys', () => {
		// joinPath bracket-quotes a key like this; building paths by hand here would mismatch.
		const schema = deepFreeze({
			type: 'OBJECT',
			properties: { 'a.b': { type: 'STRING' }, 'c d': { type: 'STRING' } },
		});
		const expected = childNodesOf(schema, '').map(c => c.path);
		const index = buildSearchIndex(schema, 'a.b');
		expect(expected).toContain('properties["a.b"]');
		expect(index.matched.has('properties["a.b"]')).toBe(true);
	});

	test('tuple items are walked', () => {
		const schema = deepFreeze({
			type: 'OBJECT',
			properties: { list: { type: 'ARRAY', items: [{ type: 'STRING' }] } },
		});
		const index = buildSearchIndex(schema, 'items');
		expect(index.count).toBeGreaterThan(0);
	});

	test('the mode is carried through', () => {
		expect(buildSearchIndex(SAMPLE, 'city', 'NARROW').mode).toBe('NARROW');
		expect(emptyIndex('NARROW').mode).toBe('NARROW');
	});
});

describe('NARROW visibility', () => {
	test('a match keeps its ancestors and its own subtree, and drops its siblings', () => {
		const index = buildSearchIndex(SAMPLE, 'city', 'NARROW');
		expect(index.visible.has('properties.address')).toBe(true);
		expect(index.visible.has('properties.address.properties.city')).toBe(true);
		expect(index.visible.has('properties.address.properties.postCode')).toBe(false);
		expect(index.visible.has('properties.name')).toBe(false);
		expect(index.visible.has('properties.linked')).toBe(false);
	});

	test('a ref target match is a match, so searching a schema name finds its users', () => {
		const index = buildSearchIndex(SAMPLE, 'address', 'NARROW');
		expect(index.visible.has('properties.linked')).toBe(true);
		expect(index.visible.has('properties.address')).toBe(true);
		expect(index.visible.has('properties.name')).toBe(false);
	});
});
