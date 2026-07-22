import {
	addProperty,
	applySchemaChange,
	childNodesOf,
	getEffectiveTypes,
	joinPath,
	removeProperty,
	renameProperty,
	setSchemaTypes,
	toggleRequired,
} from './schemaUtils';

function deepFreeze<T>(o: T): T {
	if (o && typeof o === 'object') {
		Object.freeze(o);
		Object.values(o).forEach(deepFreeze);
	}
	return o;
}

describe('joinPath', () => {
	test('plain identifiers use dots', () => {
		expect(joinPath('', 'properties')).toBe('properties');
		expect(joinPath('properties', 'name')).toBe('properties.name');
	});

	test('numbers use brackets', () => {
		expect(joinPath('items', 0)).toBe('items[0]');
	});

	test('keys with special characters are bracket-quoted', () => {
		expect(joinPath('properties', 'a.b')).toBe('properties["a.b"]');
		expect(joinPath('properties', 'a b')).toBe('properties["a b"]');
		expect(joinPath('properties', 'a"b')).toBe(`properties['a"b']`);
	});
});

describe('applySchemaChange', () => {
	test('sets a nested value without mutating the input', () => {
		const schema = deepFreeze({ type: 'OBJECT', properties: { name: { type: 'STRING' } } });
		const out = applySchemaChange(schema, 'properties.name.minLength', 3);
		expect(out.properties.name.minLength).toBe(3);
		expect((schema.properties.name as any).minLength).toBeUndefined();
	});

	test('undefined deletes the key', () => {
		const schema = deepFreeze({ type: 'STRING', minLength: 2 });
		const out = applySchemaChange(schema, 'minLength', undefined);
		expect('minLength' in out).toBe(false);
		expect(out.type).toBe('STRING');
	});

	test('creates intermediate objects', () => {
		const out = applySchemaChange(undefined, 'properties.name.type', 'STRING');
		expect(out).toEqual({ properties: { name: { type: 'STRING' } } });
	});

	test('array indices work', () => {
		const schema = deepFreeze({ items: [{ type: 'STRING' }, { type: 'INTEGER' }] });
		const out = applySchemaChange(schema, 'items[1].type', 'LONG');
		expect(out.items[1].type).toBe('LONG');
		expect(out.items[0].type).toBe('STRING');
	});

	test('quoted keys with dots address the right property', () => {
		const schema = deepFreeze({ properties: { 'a.b': { type: 'STRING' } } });
		const out = applySchemaChange(schema, 'properties["a.b"].type', 'INTEGER');
		expect(out.properties['a.b'].type).toBe('INTEGER');
		expect(Object.keys(out.properties)).toEqual(['a.b']);
	});

	test('empty path replaces nothing and returns a copy', () => {
		const schema = deepFreeze({ type: 'STRING' });
		const out = applySchemaChange(schema, 'format', 'EMAIL');
		expect(out).not.toBe(schema);
		expect(out.format).toBe('EMAIL');
	});

	test('unrendered kirun fields survive edits', () => {
		const schema = deepFreeze({
			type: 'OBJECT',
			details: { a: 1 },
			viewDetails: 'x',
			preferredComponent: 'TextBox',
		});
		const out = applySchemaChange(schema, 'description', 'd');
		expect(out.details).toEqual({ a: 1 });
		expect(out.viewDetails).toBe('x');
		expect(out.preferredComponent).toBe('TextBox');
	});
});

describe('getEffectiveTypes', () => {
	test('scalar, array, absent, and case normalization', () => {
		expect(getEffectiveTypes({ type: 'STRING' })).toEqual(['STRING']);
		expect(getEffectiveTypes({ type: ['STRING', 'INTEGER'] })).toEqual(['STRING', 'INTEGER']);
		expect(getEffectiveTypes({})).toEqual([]);
		expect(getEffectiveTypes(undefined)).toEqual([]);
		expect(getEffectiveTypes({ type: 'string' })).toEqual(['STRING']);
	});
});

describe('setSchemaTypes', () => {
	test('one type writes a plain string', () => {
		const out = setSchemaTypes(deepFreeze({ type: ['STRING', 'INTEGER'] }), ['LONG']);
		expect(out.type).toBe('LONG');
	});

	test('many types write an array', () => {
		const out = setSchemaTypes(deepFreeze({ type: 'STRING' }), ['STRING', 'NULL']);
		expect(out.type).toEqual(['STRING', 'NULL']);
	});

	test('no types deletes the key', () => {
		const out = setSchemaTypes(deepFreeze({ type: 'STRING', minLength: 1 }), []);
		expect('type' in out).toBe(false);
		expect(out.minLength).toBe(1);
	});
});

describe('toggleRequired', () => {
	test('adds and removes names', () => {
		const schema = deepFreeze({ type: 'OBJECT', properties: { a: {}, b: {} } });
		const on = toggleRequired(schema, 'a', true);
		expect(on.required).toEqual(['a']);
		const off = toggleRequired(deepFreeze(on), 'a', false);
		expect('required' in off).toBe(false);
	});

	test('no-ops return the same object', () => {
		const schema = deepFreeze({ type: 'OBJECT', required: ['a'] });
		expect(toggleRequired(schema, 'a', true)).toBe(schema);
		expect(toggleRequired(schema, 'b', false)).toBe(schema);
	});

	test('leaves unknown hand-authored entries alone', () => {
		const schema = deepFreeze({ type: 'OBJECT', required: ['ghost', 'a'] });
		const out = toggleRequired(schema, 'a', false);
		expect(out.required).toEqual(['ghost']);
	});
});

describe('addProperty', () => {
	test('adds with default STRING schema', () => {
		const out = addProperty(deepFreeze({ type: 'OBJECT' }), 'name');
		expect(out.properties.name).toEqual({ type: 'STRING' });
	});

	test('rejects empty and duplicate names', () => {
		const schema = deepFreeze({ type: 'OBJECT', properties: { a: { type: 'STRING' } } });
		expect(addProperty(schema, '')).toBe(schema);
		expect(addProperty(schema, 'a')).toBe(schema);
	});

	test('works on an empty root', () => {
		const out = addProperty(undefined, 'a', { type: 'INTEGER' });
		expect(out.properties.a).toEqual({ type: 'INTEGER' });
	});
});

describe('renameProperty', () => {
	test('preserves key order and updates required in place', () => {
		const schema = deepFreeze({
			type: 'OBJECT',
			properties: { a: { type: 'STRING' }, b: { type: 'INTEGER' }, c: {} },
			required: ['c', 'b'],
		});
		const out = renameProperty(schema, 'b', 'z');
		expect(Object.keys(out.properties)).toEqual(['a', 'z', 'c']);
		expect(out.properties.z).toEqual({ type: 'INTEGER' });
		expect(out.required).toEqual(['c', 'z']);
	});

	test('rejects empty, missing, and colliding names', () => {
		const schema = deepFreeze({ type: 'OBJECT', properties: { a: {}, b: {} } });
		expect(renameProperty(schema, 'a', '')).toBe(schema);
		expect(renameProperty(schema, 'x', 'y')).toBe(schema);
		expect(renameProperty(schema, 'a', 'b')).toBe(schema);
		expect(renameProperty(schema, 'a', 'a')).toBe(schema);
	});
});

describe('removeProperty', () => {
	test('removes the property and its required entry', () => {
		const schema = deepFreeze({
			type: 'OBJECT',
			properties: { a: {}, b: {} },
			required: ['a', 'b'],
		});
		const out = removeProperty(schema, 'a');
		expect(Object.keys(out.properties)).toEqual(['b']);
		expect(out.required).toEqual(['b']);
	});

	test('drops empty properties and required maps', () => {
		const schema = deepFreeze({ type: 'OBJECT', properties: { a: {} }, required: ['a'] });
		const out = removeProperty(schema, 'a');
		expect('properties' in out).toBe(false);
		expect('required' in out).toBe(false);
	});

	test('missing property is a no-op', () => {
		const schema = deepFreeze({ type: 'OBJECT', properties: { a: {} } });
		expect(removeProperty(schema, 'x')).toBe(schema);
	});
});

describe('childNodesOf', () => {
	test('object properties become property children', () => {
		const schema = deepFreeze({
			type: 'OBJECT',
			properties: { name: { type: 'STRING' }, 'a.b': { type: 'INTEGER' } },
		});
		const out = childNodesOf(schema, '');
		expect(out).toHaveLength(2);
		expect(out[0]).toMatchObject({ key: 'name', path: 'properties.name', kind: 'property' });
		expect(out[1]).toMatchObject({ key: 'a.b', path: 'properties["a.b"]', kind: 'property' });
	});

	test('single items child', () => {
		const schema = deepFreeze({ type: 'ARRAY', items: { type: 'STRING' } });
		const out = childNodesOf(schema, 'properties.list');
		expect(out).toEqual([
			{
				key: 'items',
				path: 'properties.list.items',
				schema: { type: 'STRING' },
				kind: 'item',
			},
		]);
	});

	test('tuple items children', () => {
		const schema = deepFreeze({
			type: 'ARRAY',
			items: [{ type: 'STRING' }, { type: 'INTEGER' }],
		});
		const out = childNodesOf(schema, '');
		expect(out.map(c => c.path)).toEqual(['items[0]', 'items[1]']);
		expect(out.map(c => c.kind)).toEqual(['tupleItem', 'tupleItem']);
	});

	test('non-objects have no children', () => {
		expect(childNodesOf(undefined, '')).toEqual([]);
		expect(childNodesOf({ type: 'STRING' }, '')).toEqual([]);
	});
});
