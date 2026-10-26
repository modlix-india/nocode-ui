/**
 * Turns runtime values (Maps, Sets, nested results, debug log arguments) into plain JSON-safe
 * data, so they can go into the page store and show in a JSON view. Cycles become "[Circular]",
 * functions are dropped, and anything with toJSON is honoured.
 */
export function toPlain(value: any, seen: WeakSet<object> = new WeakSet()): any {
	if (value === null || value === undefined) return value ?? null;
	const t = typeof value;
	if (t === 'number') return Number.isFinite(value) ? value : String(value);
	if (t === 'string' || t === 'boolean') return value;
	if (t === 'bigint') return value.toString();
	if (t === 'function' || t === 'symbol') return undefined;
	if (seen.has(value)) return '[Circular]';
	seen.add(value);
	try {
		if (value instanceof Map) {
			const out: Record<string, any> = {};
			for (const [k, v] of value.entries()) out[String(k)] = toPlain(v, seen);
			return out;
		}
		if (value instanceof Set) return Array.from(value, v => toPlain(v, seen));
		if (Array.isArray(value)) return value.map(v => toPlain(v, seen) ?? null);
		if (typeof value.toJSON === 'function') return toPlain(value.toJSON(), seen);
		const out: Record<string, any> = {};
		for (const [k, v] of Object.entries(value)) {
			const p = toPlain(v, seen);
			if (p !== undefined) out[k] = p;
		}
		return out;
	} finally {
		seen.delete(value);
	}
}

/** A short type name for showing beside a value: null, array, object, string, number, boolean. */
export function typeName(value: any): string {
	if (value === null || value === undefined) return 'null';
	if (Array.isArray(value)) return 'array';
	return typeof value;
}

export function errorMessage(err: any): string {
	if (!err) return 'Unknown error';
	if (typeof err === 'string') return err;
	return err.message ?? String(err);
}

/**
 * An output event's results plus `result`, the same values as one plain object. A page reads
 * `Steps.<step>.output.<name>` for one value, but `Steps.<step>.output` itself is a Map, which
 * SetStore cannot keep as JSON; `Steps.<step>.output.result` is the whole thing, storable.
 */
export function withResult(result: Record<string, any>): Map<string, any> {
	return new Map<string, any>([...Object.entries(result), ['result', result]]);
}
