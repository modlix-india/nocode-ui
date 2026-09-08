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

/** Root-level fields that identify a stored schema and must survive a wholesale replace. */
const ROOT_IDENTITY = ['name', 'namespace', 'version', 'description', 'comment', 'permission'];

export function pickRootIdentity(schema: any): any {
	const out: any = {};
	if (!schema || typeof schema !== 'object') return out;
	for (const key of ROOT_IDENTITY) if (!isNullValue(schema[key])) out[key] = schema[key];
	return out;
}

/**
 * Fold an inferred schema into an existing one without overwriting anything already there.
 *
 * Conservative on purpose: the second run of "build from a sample" is the valuable one, and by
 * then the schema carries hand-written descriptions, constraints and refs that a replace would
 * destroy. Only `properties` and `items` are descended, because they are the recursion carriers;
 * every other key on `existing` wins. Nothing is ever removed.
 */
export function mergeSchemas(existing: any, incoming: any): any {
	if (isNullValue(existing) || typeof existing !== 'object') return incoming;
	if (isNullValue(incoming) || typeof incoming !== 'object') return existing;

	// A ref replaces the node's definition, so grafting inferred properties underneath it would
	// produce a node that is both a reference and a definition.
	if (typeof existing.ref === 'string' && existing.ref.trim()) return existing;

	const out = duplicate(existing);

	if (incoming.properties && typeof incoming.properties === 'object') {
		if (!out.properties) out.properties = {};
		for (const [key, sub] of Object.entries(incoming.properties)) {
			out.properties[key] =
				out.properties[key] === undefined
					? duplicate(sub)
					: mergeSchemas(out.properties[key], sub);
		}
	}

	// Tuple items have no obvious merge, so leave the existing side alone.
	if (
		!isNullValue(incoming.items) &&
		!Array.isArray(incoming.items) &&
		!Array.isArray(out.items)
	) {
		out.items = isNullValue(out.items)
			? duplicate(incoming.items)
			: mergeSchemas(out.items, incoming.items);
	}

	return out;
}

export interface SchemaDiffEntry {
	path: string;
	from?: string;
	to?: string;
}

export interface SchemaDiff {
	added: string[];
	retyped: SchemaDiffEntry[];
	unchanged: string[];
}

/** What a merge would do, so the choice between Merge and Replace can be made on evidence. */
export function diffSchemas(existing: any, incoming: any, base = ''): SchemaDiff {
	const diff: SchemaDiff = { added: [], retyped: [], unchanged: [] };
	walkDiff(existing, incoming, base, diff);
	return diff;
}

function walkDiff(existing: any, incoming: any, base: string, diff: SchemaDiff) {
	const incomingProps = incoming?.properties;
	if (!incomingProps || typeof incomingProps !== 'object') return;

	const existingProps = existing?.properties ?? {};
	const refBlocked = typeof existing?.ref === 'string' && existing.ref.trim();

	for (const [key, sub] of Object.entries<any>(incomingProps)) {
		const path = base ? `${base}.${key}` : key;
		const current = existingProps[key];

		if (current === undefined && !refBlocked) {
			diff.added.push(path);
			countAdded(sub, path, diff);
			continue;
		}

		const from = typeText(current?.type);
		const to = typeText(sub?.type);
		if (from && to && from !== to) diff.retyped.push({ path, from, to });
		else diff.unchanged.push(path);

		if (!refBlocked) walkDiff(current, sub, path, diff);
	}
}

function countAdded(schema: any, base: string, diff: SchemaDiff) {
	if (!schema?.properties) return;
	for (const [key, sub] of Object.entries<any>(schema.properties)) {
		const path = `${base}.${key}`;
		diff.added.push(path);
		countAdded(sub, path, diff);
	}
}

function typeText(type: any): string {
	if (isNullValue(type)) return '';
	return Array.isArray(type) ? type.join(' | ') : String(type);
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
