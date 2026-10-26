// ============================================================
// Whole-block selection — helpers + bulk operations.
//
// The editor's normal selection is a native text range, which the
// browser cannot extend across the separate `contentEditable` editing
// hosts that list / table / tabs blocks render. Whole-block selection
// sidesteps that: the editor tracks a set of selected top-level block
// IDs (driven by its own pointer geometry, not the DOM Selection) and
// these helpers turn that set into reversible document mutations.
//
// Scope: top-level blocks only (not blocks nested inside columns /
// toggles). Each operation emits a single `replaceBlocks` op so the
// whole change undoes in one step.
// ============================================================

import type { Block, BlockType, EditorDocument, Operation, Selection } from './types';
import { createBlock, generateId, getTextLength } from './types';
import { setContainer } from './document';
import type { ApplyResult } from './operations';

/**
 * IDs of all top-level blocks lying between `idA` and `idB` (inclusive),
 * in document order. Argument order doesn't matter — the range is
 * normalized to document order. Returns `[]` if either id is not a
 * top-level block (nested children aren't selectable in this version).
 */
export function topLevelBlockIdsInRange(doc: EditorDocument, idA: string, idB: string): string[] {
	const top = doc.blocks;
	const ia = top.findIndex(b => b.id === idA);
	const ib = top.findIndex(b => b.id === idB);
	if (ia < 0 || ib < 0) return [];
	const lo = Math.min(ia, ib);
	const hi = Math.max(ia, ib);
	return top.slice(lo, hi + 1).map(b => b.id);
}

/**
 * Delete the given top-level blocks in one reversible `replaceBlocks` op.
 * If every block would be removed, the document collapses to a single
 * empty paragraph (the editor never allows zero blocks). The returned
 * selection parks a collapsed caret at the start of the block that now
 * occupies the first deleted slot (the next survivor), or the new empty
 * paragraph.
 */
export function deleteBlocksOp(doc: EditorDocument, ids: string[]): ApplyResult {
	const idSet = new Set(ids);
	const oldBlocks = doc.blocks;
	const firstIdx = oldBlocks.findIndex(b => idSet.has(b.id));
	if (firstIdx < 0) return { doc, ops: [], selection: null };

	let newBlocks = oldBlocks.filter(b => !idSet.has(b.id));
	let selection: Selection;
	if (newBlocks.length === 0) {
		const empty = createBlock('paragraph');
		newBlocks = [empty];
		selection = {
			anchor: { blockId: empty.id, offset: 0 },
			focus: { blockId: empty.id, offset: 0 },
		};
	} else {
		const caretBlock = newBlocks[Math.min(firstIdx, newBlocks.length - 1)]!;
		selection = {
			anchor: { blockId: caretBlock.id, offset: 0 },
			focus: { blockId: caretBlock.id, offset: 0 },
		};
	}

	const op: Operation = {
		type: 'replaceBlocks',
		parentId: null,
		oldBlocks,
		newBlocks,
	};
	return { doc: setContainer(doc, null, newBlocks), ops: [op], selection };
}

/**
 * Convert every given top-level block to `newType` in one reversible
 * `replaceBlocks` op. Mirrors single-block "Turn into": props are reset
 * to `{}` because block type fully determines rendering (heading level,
 * list kind, etc. are encoded in the type itself, not props). Blocks
 * already of `newType` are left untouched.
 *
 * Returns `selection: null` so the caller can keep the block selection
 * highlighted on the converted blocks (their IDs are unchanged).
 */
export function turnBlocksIntoOp(
	doc: EditorDocument,
	ids: string[],
	newType: BlockType,
): ApplyResult {
	const idSet = new Set(ids);
	const oldBlocks = doc.blocks;
	let changed = false;
	const newBlocks = oldBlocks.map(b => {
		if (!idSet.has(b.id) || b.type === newType) return b;
		changed = true;
		return { ...b, type: newType, props: {} };
	});
	if (!changed) return { doc, ops: [], selection: null };

	const op: Operation = {
		type: 'replaceBlocks',
		parentId: null,
		oldBlocks,
		newBlocks,
	};
	return { doc: setContainer(doc, null, newBlocks), ops: [op], selection: null };
}

/**
 * Deep-clone a block subtree, assigning fresh IDs to every node — so a
 * re-inserted copy never shares IDs with its source (which would otherwise
 * make edits/deletes hit both copies). Used by copy/paste and duplicate.
 */
export function cloneBlockWithFreshIds(block: Block): Block {
	return {
		...block,
		id: generateId(),
		content: block.content.map(span => ({ ...span })),
		children: block.children.map(cloneBlockWithFreshIds),
		props: { ...block.props },
	};
}

/**
 * Insert `blocks` immediately after the top-level block `afterId`, as one
 * reversible `replaceBlocks` op. If `afterId` is null or not a top-level
 * block, the blocks are appended at the end. Parks a caret at the end of the
 * last inserted block so the user can keep typing after a paste.
 */
export function insertBlocksAfterOp(
	doc: EditorDocument,
	afterId: string | null,
	blocks: Block[],
): ApplyResult {
	if (blocks.length === 0) return { doc, ops: [], selection: null };
	const oldBlocks = doc.blocks;
	const idx = afterId ? oldBlocks.findIndex(b => b.id === afterId) : -1;
	const at = idx < 0 ? oldBlocks.length : idx + 1;
	const newBlocks = [...oldBlocks.slice(0, at), ...blocks, ...oldBlocks.slice(at)];
	const op: Operation = {
		type: 'replaceBlocks',
		parentId: null,
		oldBlocks,
		newBlocks,
	};
	const last = blocks[blocks.length - 1]!;
	const offset = getTextLength(last.content);
	return {
		doc: setContainer(doc, null, newBlocks),
		ops: [op],
		selection: {
			anchor: { blockId: last.id, offset },
			focus: { blockId: last.id, offset },
		},
	};
}

/**
 * Duplicate the given top-level blocks: deep-clone each (fresh IDs) and insert
 * the clones in document order immediately after the last selected block, in
 * one reversible op. Mirrors single-block "Duplicate" for a whole-block
 * selection.
 */
export function duplicateBlocksOp(doc: EditorDocument, ids: string[]): ApplyResult {
	const idSet = new Set(ids);
	const selected = doc.blocks.filter(b => idSet.has(b.id));
	if (selected.length === 0) return { doc, ops: [], selection: null };
	const clones = selected.map(cloneBlockWithFreshIds);
	const lastId = selected[selected.length - 1]!.id;
	return insertBlocksAfterOp(doc, lastId, clones);
}

/**
 * Move the given contiguous top-level block selection up or down by one slot,
 * in one reversible op. No-op at the document edge or for a non-contiguous /
 * unknown selection. Returns `selection: null` so the block highlight survives
 * on the moved blocks (their IDs are unchanged).
 */
export function moveBlocksOp(doc: EditorDocument, ids: string[], dir: 'up' | 'down'): ApplyResult {
	const idSet = new Set(ids);
	const oldBlocks = doc.blocks;
	const indices = oldBlocks.map((b, i) => (idSet.has(b.id) ? i : -1)).filter(i => i >= 0);
	if (indices.length === 0) return { doc, ops: [], selection: null };
	const lo = indices[0]!;
	const hi = indices[indices.length - 1]!;
	// Selections are built from a contiguous range; bail if that invariant
	// doesn't hold rather than scramble the document.
	if (hi - lo + 1 !== indices.length) return { doc, ops: [], selection: null };

	const newBlocks = [...oldBlocks];
	if (dir === 'up') {
		if (lo === 0) return { doc, ops: [], selection: null };
		// Pull the block above the group out and drop it just past the group's end.
		const [above] = newBlocks.splice(lo - 1, 1);
		newBlocks.splice(hi, 0, above!);
	} else {
		if (hi === oldBlocks.length - 1) return { doc, ops: [], selection: null };
		// Pull the block below the group out and drop it just before the group.
		const [below] = newBlocks.splice(hi + 1, 1);
		newBlocks.splice(lo, 0, below!);
	}

	const op: Operation = {
		type: 'replaceBlocks',
		parentId: null,
		oldBlocks,
		newBlocks,
	};
	return { doc: setContainer(doc, null, newBlocks), ops: [op], selection: null };
}

/**
 * Replace the given top-level block selection with `replacement` blocks in one
 * reversible op (paste-over-selection). The replacements land where the first
 * selected block was; a caret parks at the end of the last one.
 */
export function replaceBlocksOp(
	doc: EditorDocument,
	ids: string[],
	replacement: Block[],
): ApplyResult {
	if (replacement.length === 0) return { doc, ops: [], selection: null };
	const idSet = new Set(ids);
	const oldBlocks = doc.blocks;
	const firstIdx = oldBlocks.findIndex(b => idSet.has(b.id));
	if (firstIdx < 0) return { doc, ops: [], selection: null };
	// Number of survivors before the first removed block = its insertion point
	// in the kept list.
	const before = oldBlocks.slice(0, firstIdx).filter(b => !idSet.has(b.id)).length;
	const kept = oldBlocks.filter(b => !idSet.has(b.id));
	const newBlocks = [...kept.slice(0, before), ...replacement, ...kept.slice(before)];
	const op: Operation = {
		type: 'replaceBlocks',
		parentId: null,
		oldBlocks,
		newBlocks,
	};
	const last = replacement[replacement.length - 1]!;
	const offset = getTextLength(last.content);
	return {
		doc: setContainer(doc, null, newBlocks),
		ops: [op],
		selection: {
			anchor: { blockId: last.id, offset },
			focus: { blockId: last.id, offset },
		},
	};
}
