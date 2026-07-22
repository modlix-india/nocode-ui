// Derives a flat list of FreeMarker variable paths from a template's variableSchema
// (a KIRun/JSON schema). Used to power the "Insert variable" merge-field picker.

export interface VariableEntry {
	// Dot path e.g. "customer.address.city"
	path: string;
	// FreeMarker token e.g. "${customer.address.city}"
	token: string;
	// Best-effort type label for display.
	type?: string;
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
export function collectVariables(schema: any, prefix = '', depth = 0): VariableEntry[] {
	if (!schema || typeof schema !== 'object' || depth > 6) return [];

	const out: VariableEntry[] = [];

	if (isObjectSchema(schema) && schema.properties) {
		for (const [key, child] of Object.entries<any>(schema.properties)) {
			const path = prefix ? `${prefix}.${key}` : key;
			out.push({ path, token: `\${${path}}`, type: typeLabel(child) });
			out.push(...collectVariables(child, path, depth + 1));
		}
		return out;
	}

	// Array of objects: expose the first element's fields as [0].field for discoverability.
	if (schema.items && typeof schema.items === 'object') {
		const path = prefix ? `${prefix}[0]` : '[0]';
		out.push(...collectVariables(schema.items, path, depth + 1));
	}

	return out;
}
