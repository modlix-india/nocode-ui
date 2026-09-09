import { childNodesOf, getEffectiveTypes } from './schemaUtils';

/**
 * Finding a field in a large schema.
 *
 * Two modes, because neither alone covers both shapes of schema:
 *
 * REVEAL highlights matches in place and opens their ancestors, leaving everything else on
 * screen. This is what the PageEditor's tree navigator does, and it is right for a deep schema
 * where the surrounding structure is the context you need.
 *
 * NARROW hides everything that is not a match, an ancestor of one, or below one. A flat storage
 * schema is already fully expanded in COMPACT mode (the depth default opens anything shallower
 * than 2), so there are no ancestors to open and REVEAL leaves you with the same wall of rows
 * with one of them tinted. Narrowing is the only thing that actually helps there.
 */

export type SearchMode = 'REVEAL' | 'NARROW';

export interface SearchIndex {
	active: boolean;
	mode: SearchMode;
	count: number;
	/** Paths to render at all. Only consulted in NARROW. */
	visible: Set<string>;
	/** Paths that matched, for the row tint. */
	matched: Set<string>;
	/** Ancestors of matches, forced open regardless of the depth default. */
	forceExpand: Set<string>;
}

const TYPE_PREFIX = 'type:';

export function emptyIndex(mode: SearchMode = 'REVEAL'): SearchIndex {
	return {
		active: false,
		mode,
		count: 0,
		visible: new Set(),
		matched: new Set(),
		forceExpand: new Set(),
	};
}

/**
 * Walks the schema with `childNodesOf` so every path is byte-identical to the ones SchemaTree
 * receives. Building paths by hand here would silently miss keys that joinPath bracket-quotes.
 */
export function buildSearchIndex(
	schema: any,
	query: string,
	mode: SearchMode = 'REVEAL',
): SearchIndex {
	const index = emptyIndex(mode);
	const trimmed = query.trim();
	if (!trimmed) return index;

	index.active = true;
	// The root always renders, so a zero-match search shows an empty tree rather than a blank.
	index.visible.add('');

	const isTypeQuery = trimmed.toLowerCase().startsWith(TYPE_PREFIX);
	const needle = isTypeQuery
		? trimmed.slice(TYPE_PREFIX.length).trim().toUpperCase()
		: trimmed.toUpperCase();
	if (!needle) return index;

	const walk = (node: any, path: string, label: string, ancestors: string[]) => {
		if (matches(node, label, needle, isTypeQuery)) {
			index.matched.add(path);
			index.count++;
			for (const a of ancestors) {
				index.forceExpand.add(a);
				index.visible.add(a);
			}
			index.visible.add(path);
			markSubtree(node, path, index.visible);
		}

		const nextAncestors = [...ancestors, path];
		for (const child of childNodesOf(node, path))
			walk(child.schema, child.path, child.key, nextAncestors);
	};

	for (const child of childNodesOf(schema, '')) walk(child.schema, child.path, child.key, ['']);

	return index;
}

function matches(schema: any, label: string, needle: string, isTypeQuery: boolean): boolean {
	if (isTypeQuery) return getEffectiveTypes(schema).some(t => t.includes(needle));
	if (label.toUpperCase().includes(needle)) return true;
	// A ref target is the other thing worth finding: "which fields point at Address?"
	const ref = schema?.ref;
	return typeof ref === 'string' && ref.toUpperCase().includes(needle);
}

/** Everything under a match stays visible, so a matched object can still be opened up. */
function markSubtree(schema: any, path: string, into: Set<string>) {
	for (const child of childNodesOf(schema, path)) {
		into.add(child.path);
		markSubtree(child.schema, child.path, into);
	}
}

// No substring highlighter here on purpose. The PageEditor's tree navigator wraps matched runs
// in a <span>, but a property name in this tree is an editable <input>, which cannot render
// markup inside its value. A row-level tint is the one signal that works for every node kind.
