// ============================================================
// Read-time migrations.
//
// The block-editor document model has changed shape over time; rather
// than migrating stored data, we transform on load.
//
// Currently:
//   • Legacy `list` block (one container, items array, per-level styles)
//     → tree of `bulletItem` / `numberItem` blocks nested via children.
//     The new shape lets any branch mix kinds.
//
// The transform is idempotent — running it twice yields the same document.
// Blocks of unknown type pass through unchanged.
// ============================================================

import type { Block, BlockProps, EditorDocument, TextSpan } from './types';
import { generateId } from './types';

type LegacyListItem = {
	id?: string;
	content?: TextSpan[];
	indent?: number;
	// The checklist kind never occurs in saved legacy lists — it's used by the
	// markdown deserializer, which feeds checklist lines through this converter.
	kind?: 'bullet' | 'number' | 'todo';
	checked?: boolean;
};

type LegacyListLevelStyle = {
	kind?: 'bullet' | 'number';
	bulletStyle?: string;
	numberStyle?: string;
	startFrom?: number;
	size?: string;
	color?: string;
};

/**
 * Migrate one legacy `list` block to a flat array of `bulletItem` /
 * `numberItem` blocks at the same root position, nested via children based
 * on each item's `indent` level. Per-level styles in `props.levelStyles`
 * get pushed onto each item's `props.style` so visual styling survives the
 * transform.
 *
 * Returns the new top-level blocks (may be 0..N items). Always idempotent
 * on input that doesn't look like a legacy list.
 *
 * Exported so the markdown deserializer can reuse the exact same conversion
 * — pasted/imported markdown produces first-class items directly instead of
 * a legacy `list` block (see markdown/deserialize.ts).
 */
export function migrateLegacyList(legacy: Block): Block[] {
	if (legacy.type !== 'list') return [legacy];
	const itemsRaw = legacy.props as BlockProps & {
		listItems?: LegacyListItem[];
		items?: LegacyListItem[];
	};
	const items = itemsRaw.listItems ?? itemsRaw.items ?? [];
	if (!Array.isArray(items) || items.length === 0) return [];

	const levelStyles = ((legacy.props as BlockProps & { levelStyles?: LegacyListLevelStyle[] })
		.levelStyles ?? []) as LegacyListLevelStyle[];

	// Build per-item flat blocks first; nesting via children comes second.
	const flat: Array<{ indent: number; block: Block }> = items.map(it => {
		const indent = Math.max(0, Math.floor(it.indent ?? 0));
		const levelStyle = levelStyles[indent];
		const kind = it.kind ?? levelStyle?.kind ?? 'bullet';
		if (kind === 'todo') {
			// Checklist line from the markdown deserializer — marker styling
			// doesn't apply; the checkbox is the marker.
			return {
				indent,
				block: {
					id: it.id || generateId(),
					type: 'todoItem' as const,
					content: Array.isArray(it.content) ? it.content : [],
					children: [],
					props: { checked: it.checked === true },
				},
			};
		}
		const type = kind === 'number' ? 'numberItem' : 'bulletItem';
		const block: Block = {
			id: it.id || generateId(),
			type,
			content: Array.isArray(it.content) ? it.content : [],
			children: [],
			props: levelStyle ? { style: { ...levelStyle, kind } } : {},
		};
		return { indent, block };
	});

	// Stack-based nesting: each item attaches to the closest preceding item
	// with a strictly lower indent. Indent jumps (e.g. 0 → 2) clamp to the
	// closest parent so we never lose items.
	const roots: Block[] = [];
	const stack: Array<{ indent: number; block: Block }> = [];
	for (const it of flat) {
		while (stack.length > 0 && stack[stack.length - 1]!.indent >= it.indent) {
			stack.pop();
		}
		if (stack.length === 0) {
			roots.push(it.block);
		} else {
			stack[stack.length - 1]!.block.children.push(it.block);
		}
		stack.push(it);
	}
	return roots;
}

/**
 * Walk a block tree and rewrite legacy shapes. Recurses so a legacy list
 * inside a column or toggle child still gets migrated.
 */
function migrateBlocks(blocks: Block[]): Block[] {
	const out: Block[] = [];
	for (const b of blocks) {
		if (b.type === 'list') {
			out.push(...migrateLegacyList(b));
			continue;
		}
		if (b.children.length > 0) {
			out.push({ ...b, children: migrateBlocks(b.children) });
		} else {
			out.push(b);
		}
	}
	return out;
}

/** Run all read-time migrations against a document. Returns the same
 *  document instance when nothing changed (cheap to call on every load). */
export function migrateDocument(doc: EditorDocument): EditorDocument {
	const hasLegacy = containsLegacy(doc.blocks);
	if (!hasLegacy) return doc;
	return { ...doc, blocks: migrateBlocks(doc.blocks) };
}

function containsLegacy(blocks: Block[]): boolean {
	for (const b of blocks) {
		if (b.type === 'list') return true;
		if (b.children.length > 0 && containsLegacy(b.children)) return true;
	}
	return false;
}
