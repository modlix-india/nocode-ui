import { duplicate, isNullValue } from '@fincity/kirun-js';
import { setStoreData, StoreExtractor } from '@fincity/path-reactive-state-management';

const IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

// The path engine has no escape sequences; a key containing one quote style is wrapped in the
// other. Keys containing both quote styles cannot be path-addressed — structural operations
// below rebuild parent maps instead, so only subfield edits under such keys are affected.
export function joinPath(base: string, key: string | number): string {
	if (typeof key === 'number') return `${base}[${key}]`;
	if (IDENTIFIER.test(key)) return base ? `${base}.${key}` : key;
	return `${base}${key.includes('"') ? `['${key}']` : `["${key}"]`}`;
}

export function applySchemaChange(schema: any, path: string, v: any): any {
	const newSchema = isNullValue(schema) ? {} : duplicate(schema);
	const internal = { value: newSchema };

	const map = new Map([['Internal.', new StoreExtractor(internal, 'Internal.')]]);
	setStoreData(
		'Internal.value' + (path ? (path.startsWith('[') ? path : '.' + path) : ''),
		internal,
		v,
		'Internal',
		map,
		true,
	);
	return internal.value;
}

export function getEffectiveTypes(schema: any): string[] {
	if (!schema?.type) return [];
	const types = Array.isArray(schema.type) ? schema.type : [schema.type];
	return types.filter((e: any) => typeof e === 'string').map((e: string) => e.toUpperCase());
}

export function setSchemaTypes(schema: any, types: string[]): any {
	let v: any;
	if (types.length === 0) v = undefined;
	else if (types.length === 1) v = types[0];
	else v = types;
	return applySchemaChange(schema, 'type', v);
}

export function toggleRequired(objectSchema: any, name: string, on: boolean): any {
	const current: string[] = Array.isArray(objectSchema?.required) ? objectSchema.required : [];
	if (on === current.includes(name)) return objectSchema;
	const next = on ? [...current, name] : current.filter(e => e !== name);
	return applySchemaChange(objectSchema, 'required', next.length ? next : undefined);
}

export function addProperty(objectSchema: any, name: string, propSchema?: any): any {
	if (!name || objectSchema?.properties?.[name] !== undefined) return objectSchema;
	const dup = isNullValue(objectSchema) ? {} : duplicate(objectSchema);
	if (!dup.properties) dup.properties = {};
	dup.properties[name] = propSchema ?? { type: 'STRING' };
	return dup;
}

export function renameProperty(objectSchema: any, oldName: string, newName: string): any {
	if (!newName || oldName === newName) return objectSchema;
	const props = objectSchema?.properties;
	if (!props || props[oldName] === undefined || props[newName] !== undefined) return objectSchema;

	const dup = duplicate(objectSchema);
	const newProps: Record<string, any> = {};
	for (const [k, s] of Object.entries(dup.properties)) newProps[k === oldName ? newName : k] = s;
	dup.properties = newProps;
	if (Array.isArray(dup.required))
		dup.required = dup.required.map((n: string) => (n === oldName ? newName : n));
	return dup;
}

export function removeProperty(objectSchema: any, name: string): any {
	const props = objectSchema?.properties;
	if (!props || props[name] === undefined) return objectSchema;

	const dup = duplicate(objectSchema);
	delete dup.properties[name];
	if (!Object.keys(dup.properties).length) delete dup.properties;
	if (Array.isArray(dup.required)) {
		dup.required = dup.required.filter((n: string) => n !== name);
		if (!dup.required.length) delete dup.required;
	}
	return dup;
}

export interface SchemaChildNode {
	key: string;
	path: string;
	schema: any;
	kind: 'property' | 'item' | 'tupleItem';
	index?: number;
}

export function childNodesOf(schema: any, basePath: string): SchemaChildNode[] {
	const out: SchemaChildNode[] = [];
	if (!schema || typeof schema !== 'object') return out;

	if (schema.properties && typeof schema.properties === 'object') {
		const propsPath = joinPath(basePath, 'properties');
		for (const [k, s] of Object.entries(schema.properties))
			out.push({ key: k, path: joinPath(propsPath, k), schema: s, kind: 'property' });
	}

	if (!isNullValue(schema.items)) {
		const itemsPath = joinPath(basePath, 'items');
		if (Array.isArray(schema.items)) {
			schema.items.forEach((s: any, i: number) =>
				out.push({
					key: `items[${i}]`,
					path: joinPath(itemsPath, i),
					schema: s,
					kind: 'tupleItem',
					index: i,
				}),
			);
		} else {
			out.push({ key: 'items', path: itemsPath, schema: schema.items, kind: 'item' });
		}
	}

	return out;
}
