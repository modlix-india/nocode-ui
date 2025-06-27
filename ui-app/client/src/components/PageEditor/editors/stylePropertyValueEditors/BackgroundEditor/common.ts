// Types for background layers
export interface BackgroundLayer {
	type:
		| 'url'
		| 'linear-gradient'
		| 'radial-gradient'
		| 'conic-gradient'
		| 'repeating-linear-gradient'
		| 'repeating-radial-gradient'
		| 'none';
	value: string;
	properties?: {
		size?: string;
		repeat?: string;
		position?: string;
		attachment?: string;
		clip?: string;
		origin?: string;
	};
}

// Utility to split background-image into layers, respecting parentheses/quotes
export function splitBackgroundLayers(input: string): string[] {
	const results: string[] = [];
	let current = '';
	let depth = 0;
	let inQuote: string | null = null;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		if (char === '(' && !inQuote) depth++;
		else if (char === ')' && !inQuote) depth--;
		else if ((char === '"' || char === "'") && !inQuote) inQuote = char;
		else if (char === inQuote) inQuote = null;
		else if (char === ',' && depth === 0 && !inQuote) {
			results.push(current.trim());
			current = '';
			continue;
		}
		current += char;
	}
	if (current.trim()) results.push(current.trim());
	return results;
}

// Join background layers into a single string
export function joinBackgroundLayers(layers: string[]): string {
	return layers
		.map(l => l.trim())
		.filter(Boolean)
		.join(', ');
}

// Parse a background-image value to determine its type
export function parseBackgroundLayerType(value: string): BackgroundLayer['type'] {
	if (!value) return 'none';
	if (value.startsWith('url(')) return 'url';
	if (value.startsWith('linear-gradient(')) return 'linear-gradient';
	if (value.startsWith('radial-gradient(')) return 'radial-gradient';
	if (value.startsWith('conic-gradient(')) return 'conic-gradient';
	if (value.startsWith('repeating-linear-gradient(')) return 'repeating-linear-gradient';
	if (value.startsWith('repeating-radial-gradient(')) return 'repeating-radial-gradient';
	return 'none';
}
