import { isNullValue } from '@fincity/kirun-js';

/**
 * Build a schema from a sample payload.
 *
 * Defining a storage document shape or an event payload shape means typing out every property by
 * hand against a sample the author already has in front of them. JSON mode lets you paste a
 * schema; this takes a payload.
 *
 * The rules below are deliberately dull. A schema is a contract other people read, so guessing
 * narrowly (FLOAT because one sample value happened to round-trip, or NULL because one record
 * had a hole) produces something that rejects real data later. Where we learn nothing, we leave
 * the hole visible and report it, rather than inventing a type.
 */

/** Matches SingleSchemaForm's int32 bounds, so the two agree on INTEGER vs LONG. */
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME = /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}(:\d{2})?(\.\d+)?([Zz]|[+-]\d{2}:?\d{2})?$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface InferOptions {
	/** A root array is usually a list of records; ELEMENT infers the shape of one. */
	rootArrayAs: 'ELEMENT' | 'ARRAY';
	/** ALL_RECORDS marks a property required only when every merged record has it non-null. */
	requiredFrom: 'NONE' | 'ALL_RECORDS';
	detectFormats: boolean;
	maxDepth: number;
	maxSamples: number;
}

export interface InferStats {
	/** Paths whose only observed value was null, so they carry no type. */
	untyped: string[];
	/** Paths cut off by maxDepth. */
	truncated: string[];
	nodes: number;
}

export interface InferResult {
	schema: any;
	stats: InferStats;
}

export const DEFAULT_INFER_OPTIONS: InferOptions = {
	rootArrayAs: 'ELEMENT',
	requiredFrom: 'NONE',
	detectFormats: true,
	maxDepth: 10,
	maxSamples: 200,
};

/** The default treatment for a root array depends on what is in it. */
export function suggestRootArrayAs(sample: any): 'ELEMENT' | 'ARRAY' {
	if (!Array.isArray(sample) || !sample.length) return 'ARRAY';
	// "The schema of one record" is only a meaningful answer for records.
	return sample.every(e => e && typeof e === 'object' && !Array.isArray(e)) ? 'ELEMENT' : 'ARRAY';
}

export function inferSchema(sample: any, options?: Partial<InferOptions>): InferResult {
	const opts = { ...DEFAULT_INFER_OPTIONS, ...options };
	const stats: InferStats = { untyped: [], truncated: [], nodes: 0 };

	let schema: any;
	if (Array.isArray(sample) && opts.rootArrayAs === 'ELEMENT') {
		const records = sample.slice(0, opts.maxSamples);
		schema = records.length
			? records.map(r => infer(r, '', 0, opts, stats)).reduce((a, b) => mergeInferred(a, b))
			: { type: 'OBJECT' };
		if (opts.requiredFrom === 'ALL_RECORDS') applyRequired(schema, records);
	} else {
		schema = infer(sample, '', 0, opts, stats);
		if (opts.requiredFrom === 'ALL_RECORDS' && sample && typeof sample === 'object')
			applyRequired(schema, [sample]);
	}

	return { schema, stats };
}

function infer(
	value: any,
	path: string,
	depth: number,
	opts: InferOptions,
	stats: InferStats,
): any {
	stats.nodes++;

	if (depth > opts.maxDepth) {
		stats.truncated.push(path || 'root');
		return {};
	}

	// A lone null teaches us nothing. NULL is a validating type that accepts only null, so
	// declaring it would reject every real value the field ever carries. Leave the hole and
	// report it instead.
	if (isNullValue(value)) {
		stats.untyped.push(path || 'root');
		return {};
	}

	if (typeof value === 'boolean') return { type: 'BOOLEAN' };
	if (typeof value === 'number') return { type: numberType(value) };
	if (typeof value === 'string') {
		const schema: any = { type: 'STRING' };
		if (opts.detectFormats) {
			const format = detectFormat(value);
			if (format) schema.format = format;
		}
		return schema;
	}

	if (Array.isArray(value)) {
		const schema: any = { type: 'ARRAY' };
		const elements = value.slice(0, opts.maxSamples);
		// An empty array teaches us nothing about its items. The tree already offers an
		// "Add item schema" action for exactly this state.
		if (elements.length)
			schema.items = elements
				.map(e => infer(e, `${path}[]`, depth + 1, opts, stats))
				.reduce((a, b) => mergeInferred(a, b));
		return schema;
	}

	const schema: any = { type: 'OBJECT' };
	const keys = Object.keys(value);
	if (keys.length) {
		schema.properties = {};
		for (const key of keys)
			schema.properties[key] = infer(
				value[key],
				path ? `${path}.${key}` : key,
				depth + 1,
				opts,
				stats,
			);
	}
	return schema;
}

function numberType(value: number): string {
	// JSON numbers are IEEE-754 doubles and TypeUtil maps NUMBER to DOUBLE, so widen rather than
	// declaring FLOAT off one sample that happened to fit.
	if (!Number.isInteger(value)) return 'DOUBLE';
	return value < INT32_MIN || value > INT32_MAX ? 'LONG' : 'INTEGER';
}

function detectFormat(value: string): string | undefined {
	if (DATETIME.test(value)) return 'DATETIME';
	if (DATE.test(value)) return 'DATE';
	if (EMAIL.test(value)) return 'EMAIL';
	return undefined;
}

const NUMERIC_WIDTH: Record<string, number> = { INTEGER: 1, LONG: 2, FLOAT: 3, DOUBLE: 4 };

/** Merge two inferred schemas, widening rather than producing a union where one type covers both. */
export function mergeInferred(a: any, b: any): any {
	if (!a || !Object.keys(a).length) return b;
	if (!b || !Object.keys(b).length) return a;

	const out: any = {};
	const types = mergeTypes(typesOf(a), typesOf(b));
	if (types.length === 1) out.type = types[0];
	else if (types.length > 1) out.type = types;

	if (a.properties || b.properties) {
		out.properties = { ...(a.properties ?? {}) };
		for (const [key, schema] of Object.entries(b.properties ?? {}))
			out.properties[key] = out.properties[key]
				? mergeInferred(out.properties[key], schema)
				: schema;
	}

	if (a.items || b.items)
		out.items = a.items && b.items ? mergeInferred(a.items, b.items) : (a.items ?? b.items);

	// A format only survives when every observation agreed on it.
	if (a.format && a.format === b.format) out.format = a.format;

	return out;
}

function typesOf(schema: any): string[] {
	if (isNullValue(schema?.type)) return [];
	return Array.isArray(schema.type) ? schema.type : [schema.type];
}

function mergeTypes(a: string[], b: string[]): string[] {
	const all = new Set([...a, ...b]);

	// INTEGER alongside DOUBLE is technically valid and practically useless. Keep the widest.
	const numeric = [...all].filter(t => NUMERIC_WIDTH[t]);
	if (numeric.length > 1) {
		const widest = numeric.reduce((x, y) => (NUMERIC_WIDTH[x] >= NUMERIC_WIDTH[y] ? x : y));
		for (const t of numeric) if (t !== widest) all.delete(t);
	}

	return [...all];
}

/** Marks a property required when every record carries it with a non-null value. */
function applyRequired(schema: any, records: any[]) {
	if (!schema?.properties || !records.length) return;

	const required = Object.keys(schema.properties).filter(key =>
		records.every(r => r && typeof r === 'object' && !isNullValue(r[key])),
	);
	if (required.length) schema.required = required;

	for (const key of Object.keys(schema.properties)) {
		const nested = records
			.map(r => r?.[key])
			.filter(v => v && typeof v === 'object' && !Array.isArray(v));
		if (nested.length) applyRequired(schema.properties[key], nested);
	}
}
