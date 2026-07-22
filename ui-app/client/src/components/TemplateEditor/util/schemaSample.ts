// Generates a plausible sample instance from a Kirun schema, for previewing templates.
// Walks the schema's properties, filling type-appropriate (and name-aware) example values.

function firstType(schema: any): string {
	const t = schema?.type;
	if (Array.isArray(t)) return `${t[0] ?? 'STRING'}`.toUpperCase();
	if (typeof t === 'string') return t.toUpperCase();
	if (schema?.properties) return 'OBJECT';
	if (schema?.items) return 'ARRAY';
	return 'STRING';
}

function exampleString(name: string): string {
	const n = (name || 'value').toLowerCase();
	if (n.includes('email')) return 'user@example.com';
	if (n.includes('url') || n.includes('link')) return 'https://example.com';
	if (n.includes('phone') || n.includes('mobile')) return '+1 555 0100';
	if (n.includes('date')) return '2026-01-01';
	if (n.includes('amount') || n.includes('price') || n.includes('total')) return '100.00';
	if (n.includes('name')) return 'Sample Name';
	return `Sample ${name}`;
}

export function sampleFromSchema(schema: any, name = '', depth = 0): any {
	if (!schema || typeof schema !== 'object' || depth > 6) return null;

	switch (firstType(schema)) {
		case 'OBJECT': {
			const obj: Record<string, any> = {};
			for (const [k, v] of Object.entries<any>(schema.properties ?? {})) {
				obj[k] = sampleFromSchema(v, k, depth + 1);
			}
			return obj;
		}
		case 'ARRAY':
			return schema.items ? [sampleFromSchema(schema.items, name, depth + 1)] : [];
		case 'INTEGER':
		case 'LONG':
			return 1;
		case 'FLOAT':
		case 'DOUBLE':
			return 1.0;
		case 'BOOLEAN':
			return true;
		default:
			return exampleString(name);
	}
}

// Builds an empty Kirun OBJECT schema (used when starting a custom variable definition).
export function emptyObjectSchema(): any {
	return { type: ['OBJECT'], properties: {} };
}
