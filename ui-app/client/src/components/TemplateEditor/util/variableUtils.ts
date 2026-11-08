// Derives a flat list of FreeMarker variable paths from a template's variableSchema
// (a KIRun/JSON schema). Used to power the "Insert variable" merge-field picker.

export interface VariableEntry {
	// Dot path e.g. "customer.address.city"
	path: string;
	// FreeMarker token e.g. "${customer.address.city}"
	token: string;
	// Best-effort type label for display.
	type?: string;
	// The field's name in words (schema title), when the schema gives one.
	label?: string;
	// One line on what the field holds (schema description), when the schema gives one.
	description?: string;
	// Top-level key the field sits under ('' for a top-level leaf), for grouping in the panel.
	group: string;
	// True for an object or a list (a group of fields, not a value to print).
	container?: boolean;
}

function isArraySchema(schema: any): boolean {
	const t = schema?.type;
	if (Array.isArray(t)) return t.map((x: string) => `${x}`.toUpperCase()).includes('ARRAY');
	if (typeof t === 'string') return t.toUpperCase() === 'ARRAY';
	return !!schema?.items && !schema?.properties;
}

function text(v: any): string | undefined {
	return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

function typeLabel(schema: any): string | undefined {
	const t = schema?.type;
	if (Array.isArray(t)) return t.join(' | ');
	if (typeof t === 'string') return t;
	return undefined;
}

function isObjectSchema(schema: any): boolean {
	if (!schema) return false;
	if (schema.properties && typeof schema.properties === 'object') return true;
	const t = schema.type;
	if (Array.isArray(t)) return t.map((x: string) => `${x}`.toUpperCase()).includes('OBJECT');
	if (typeof t === 'string') return t.toUpperCase() === 'OBJECT';
	return false;
}

// Walk the schema producing dot paths for every leaf and object node.
export function collectVariables(schema: any, prefix = '', depth = 0, group = ''): VariableEntry[] {
	if (!schema || typeof schema !== 'object' || depth > 6) return [];

	const out: VariableEntry[] = [];

	if (isObjectSchema(schema) && schema.properties) {
		for (const [key, child] of Object.entries<any>(schema.properties)) {
			const path = prefix ? `${prefix}.${key}` : key;
			const g = depth === 0 ? key : group;
			out.push({
				path,
				token: `\${${path}}`,
				type: typeLabel(child),
				label: text(child?.title),
				description: text(child?.description),
				group: depth === 0 && !isObjectSchema(child) && !isArraySchema(child) ? '' : g,
				container: isObjectSchema(child) || isArraySchema(child),
			});
			out.push(...collectVariables(child, path, depth + 1, g));
		}
		return out;
	}

	// Array of objects: expose the first element's fields as [0].field for discoverability.
	if (schema.items && typeof schema.items === 'object') {
		const path = prefix ? `${prefix}[0]` : '[0]';
		out.push(...collectVariables(schema.items, path, depth + 1, group));
	}

	return out;
}
