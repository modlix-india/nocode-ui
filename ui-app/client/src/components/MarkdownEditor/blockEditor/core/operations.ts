// ============================================================
// Operations — the only way to mutate the document.
// Each function produces a new document and records operations
// for undo/redo. Never mutate the document directly.
// ============================================================

import type {
	Block,
	BlockLocation,
	BlockProps,
	BlockType,
	Direction,
	EditorDocument,
	Mark,
	MarkType,
	Operation,
	Selection,
	TextSpan,
} from './types';
import { createBlock, generateId, getPlainText, getTextLength } from './types';
import {
	deleteTextInContent,
	findBlock,
	findBlockLocation,
	getBlocksInOrder,
	getContainer,
	getDeletedText,
	insertBlockAfter,
	insertBlockAt,
	insertTextInContent,
	moveBlock as moveBlockInDoc,
	nextVersion,
	removeBlock,
	setBlockType as setBlockTypeInDoc,
	setContainer,
	splitContent,
	toggleMarkInContent,
	setMarkInContent,
	rangeHasMark,
	updateBlock,
	mergeAdjacentSpans,
} from './document';

export interface ApplyResult {
	doc: EditorDocument;
	ops: Operation[];
	selection: Selection | null;
}

// ---- Text Operations ----

/** Insert text at a position within a block */
export function insertText(
	doc: EditorDocument,
	blockId: string,
	offset: number,
	text: string,
): ApplyResult {
	const newDoc = updateBlock(doc, blockId, b => ({
		...b,
		content: insertTextInContent(b.content, offset, text),
	}));

	const op: Operation = { type: 'insertText', blockId, offset, text };
	const selection: Selection = {
		anchor: { blockId, offset: offset + text.length },
		focus: { blockId, offset: offset + text.length },
	};

	return { doc: newDoc, ops: [op], selection };
}

/** Delete text at a position within a block */
export function deleteText(
	doc: EditorDocument,
	blockId: string,
	offset: number,
	length: number,
): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };

	const deleted = getDeletedText(block.content, offset, length);
	const newDoc = updateBlock(doc, blockId, b => ({
		...b,
		content: deleteTextInContent(b.content, offset, length),
	}));

	const op: Operation = { type: 'deleteText', blockId, offset, length, deleted };
	const selection: Selection = {
		anchor: { blockId, offset },
		focus: { blockId, offset },
	};

	return { doc: newDoc, ops: [op], selection };
}

// ---- Block Structural Operations ----

/** Split a block at the given offset (Enter key behavior) */
export function splitBlock(doc: EditorDocument, blockId: string, offset: number): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };

	const [before, after] = splitContent(block.content, offset);
	const newBlockId = generateId();

	// Enter → fresh paragraph unless the source is a list-item kind, which
	// chains another item of the same kind until an empty one exits the
	// list. `toggle` chains too (Notion-style) so users can build a vertical
	// list of toggles without re-running the slash command for each one.
	const chainSameType: BlockType[] = ['bulletItem', 'numberItem', 'todoItem', 'toggle'];
	const newBlockType: BlockType = chainSameType.includes(block.type) ? block.type : 'paragraph';

	// Carry props only when the new block keeps the same type; checkbox items
	// always start fresh (unchecked), and toggles always start expanded with
	// no collapsed state inherited from the previous sibling.
	let newProps: BlockProps;
	if (newBlockType === block.type) {
		if (block.type === 'todoItem') newProps = { ...block.props, checked: false };
		else if (block.type === 'toggle') newProps = { ...block.props, collapsed: false };
		else newProps = { ...block.props };
	} else {
		newProps = {};
	}

	let newDoc = updateBlock(doc, blockId, b => ({
		...b,
		content: before,
	}));

	const newBlock: Block = {
		id: newBlockId,
		type: newBlockType,
		content: after,
		children: [],
		props: newProps,
	};

	newDoc = insertBlockAfter(newDoc, blockId, newBlock);

	const op: Operation = { type: 'splitBlock', blockId, offset, newBlockId };
	const selection: Selection = {
		anchor: { blockId: newBlockId, offset: 0 },
		focus: { blockId: newBlockId, offset: 0 },
	};

	return { doc: newDoc, ops: [op], selection };
}

/** Merge a block with its neighbor (Backspace at start / Delete at end) */
export function mergeBlock(
	doc: EditorDocument,
	blockId: string,
	direction: Direction,
): ApplyResult {
	const loc = findBlockLocation(doc, blockId);
	if (!loc) return { doc, ops: [], selection: null };
	const container = getContainer(doc, loc.parentId);
	if (!container) return { doc, ops: [], selection: null };

	const block = container[loc.index]!;

	if (direction === 'backward') {
		if (loc.index === 0) {
			// At the top of its parent — no previous sibling to merge into.
			if (block.type !== 'paragraph') {
				return setBlockTypeOp(doc, blockId, 'paragraph');
			}
			return { doc, ops: [], selection: null };
		}

		const prevBlock = container[loc.index - 1]!;

		if (prevBlock.type === 'divider' || prevBlock.type === 'image') {
			return deleteBlockOp(doc, prevBlock.id);
		}

		const mergeOffset = getTextLength(prevBlock.content);
		const mergedContent = mergeAdjacentSpans([...prevBlock.content, ...block.content]);

		let newDoc = updateBlock(doc, prevBlock.id, b => ({
			...b,
			content: mergedContent,
		}));
		newDoc = removeBlock(newDoc, blockId);

		const op: Operation = {
			type: 'mergeBlock',
			blockId,
			direction,
			mergedContent: block.content,
			mergedChildren: block.children,
			prevBlockId: prevBlock.id,
			blockType: block.type,
			blockProps: block.props,
		};

		const selection: Selection = {
			anchor: { blockId: prevBlock.id, offset: mergeOffset },
			focus: { blockId: prevBlock.id, offset: mergeOffset },
		};

		return { doc: newDoc, ops: [op], selection };
	} else {
		if (loc.index >= container.length - 1) return { doc, ops: [], selection: null };

		const nextBlock = container[loc.index + 1]!;

		if (nextBlock.type === 'divider' || nextBlock.type === 'image') {
			return deleteBlockOp(doc, nextBlock.id);
		}

		const mergeOffset = getTextLength(block.content);
		const mergedContent = mergeAdjacentSpans([...block.content, ...nextBlock.content]);

		let newDoc = updateBlock(doc, blockId, b => ({
			...b,
			content: mergedContent,
		}));
		newDoc = removeBlock(newDoc, nextBlock.id);

		const op: Operation = {
			type: 'mergeBlock',
			blockId: nextBlock.id,
			direction,
			mergedContent: nextBlock.content,
			mergedChildren: nextBlock.children,
			prevBlockId: blockId,
			blockType: nextBlock.type,
			blockProps: nextBlock.props,
		};

		const selection: Selection = {
			anchor: { blockId, offset: mergeOffset },
			focus: { blockId, offset: mergeOffset },
		};

		return { doc: newDoc, ops: [op], selection };
	}
}

/** Insert a new block as the next sibling of `afterBlockId` (or at the start of the root when null). */
export function insertBlockOp(
	doc: EditorDocument,
	afterBlockId: string | null,
	blockType: BlockType,
	text: string = '',
	props: BlockProps = {},
): ApplyResult {
	const block = createBlock(blockType, text, props);
	const newDoc = insertBlockAfter(doc, afterBlockId, block);

	let parentId: string | null = null;
	let index = 0;
	if (afterBlockId !== null) {
		const loc = findBlockLocation(doc, afterBlockId);
		if (loc) {
			parentId = loc.parentId;
			index = loc.index + 1;
		} else {
			// Fallback: appended to root in insertBlockAfter
			index = doc.blocks.length;
		}
	}

	const op: Operation = { type: 'insertBlock', parentId, index, block };
	const selection: Selection = {
		anchor: { blockId: block.id, offset: 0 },
		focus: { blockId: block.id, offset: 0 },
	};

	return { doc: newDoc, ops: [op], selection };
}

/** Insert a block at an explicit parent + index (used internally by structural ops). */
export function insertBlockAtOp(
	doc: EditorDocument,
	parentId: string | null,
	index: number,
	block: Block,
): ApplyResult {
	const newDoc = insertBlockAt(doc, parentId, index, block);
	const op: Operation = { type: 'insertBlock', parentId, index, block };
	const selection: Selection = {
		anchor: { blockId: block.id, offset: 0 },
		focus: { blockId: block.id, offset: 0 },
	};
	return { doc: newDoc, ops: [op], selection };
}

/** Delete a block (wherever it lives in the tree). */
export function deleteBlockOp(doc: EditorDocument, blockId: string): ApplyResult {
	const loc = findBlockLocation(doc, blockId);
	const block = findBlock(doc, blockId);
	if (!loc || !block) return { doc, ops: [], selection: null };

	let newDoc = removeBlock(doc, blockId);

	// Cascade: empty columns and empty columns-containers are pruned.
	newDoc = pruneEmptyColumns(newDoc);

	// Ensure at least one block remains at the document root.
	if (newDoc.blocks.length === 0) {
		const emptyBlock = createBlock('paragraph');
		newDoc = { ...newDoc, blocks: [emptyBlock] };
	}

	const op: Operation = {
		type: 'deleteBlock',
		blockId,
		block,
		parentId: loc.parentId,
		index: loc.index,
	};

	// Cursor placement: previous sibling within the same container, or first
	// top-level block as a final fallback.
	const targetBlock = pickCursorTarget(newDoc, loc) ?? newDoc.blocks[0]!;
	const offset = getTextLength(targetBlock.content);

	const selection: Selection = {
		anchor: { blockId: targetBlock.id, offset },
		focus: { blockId: targetBlock.id, offset },
	};

	return { doc: newDoc, ops: [op], selection };
}

function pickCursorTarget(doc: EditorDocument, deleted: BlockLocation): Block | undefined {
	const container = getContainer(doc, deleted.parentId);
	if (container && container.length > 0) {
		return container[Math.max(0, Math.min(deleted.index, container.length) - 1)];
	}
	// Container collapsed (was a column that got pruned). Fall back to root.
	return doc.blocks[0];
}

/**
 * Walk the tree and remove any "column" block whose children array is empty,
 * then any "columns" block that ends up with fewer than 2 columns. When a
 * columns container has exactly one column left we splice that column's
 * children up into the columns container's parent.
 */
export function pruneEmptyColumns(doc: EditorDocument): EditorDocument {
	let working = doc;
	let changed = true;
	// Iterate to a fixed point — pruning can cascade into the parent container.
	while (changed) {
		changed = false;
		const drained = collectColumnsBlocks(working);
		for (const { id, location } of drained) {
			const columnsBlock = findBlock(working, id);
			if (!columnsBlock) continue;

			// Drop empty columns first.
			const trimmedChildren = columnsBlock.children.filter(
				c => c.type !== 'column' || c.children.length > 0,
			);

			if (
				trimmedChildren.length === columnsBlock.children.length &&
				trimmedChildren.length >= 2
			) {
				continue;
			}

			if (trimmedChildren.length >= 2) {
				// Update widths if their count drifted.
				const widths = sanitizeWidths(columnsBlock.props.widths, trimmedChildren.length);
				working = updateBlock(working, id, b => ({
					...b,
					children: trimmedChildren,
					props: { ...b.props, widths },
				}));
				changed = true;
				continue;
			}

			// Fewer than 2 columns left → collapse the columns container.
			// Splice the remaining column's blocks up into the parent.
			const surviving = trimmedChildren[0];
			const innerBlocks: Block[] = surviving ? surviving.children : [];

			working = removeBlock(working, id);
			const targetContainer = getContainer(working, location.parentId);
			if (targetContainer) {
				const insertAt = Math.min(location.index, targetContainer.length);
				const next = [
					...targetContainer.slice(0, insertAt),
					...innerBlocks,
					...targetContainer.slice(insertAt),
				];
				working = setContainer(working, location.parentId, next);
			}
			changed = true;
			break; // restart — locations are invalidated.
		}
	}
	return working;
}

/** Collect every columns-block id + location in document order. */
function collectColumnsBlocks(doc: EditorDocument): Array<{ id: string; location: BlockLocation }> {
	const out: Array<{ id: string; location: BlockLocation }> = [];
	const visit = (blocks: Block[], parentId: string | null) => {
		for (let i = 0; i < blocks.length; i++) {
			const b = blocks[i]!;
			if (b.type === 'columns') out.push({ id: b.id, location: { parentId, index: i } });
			if (b.children.length > 0) visit(b.children, b.id);
		}
	};
	visit(doc.blocks, null);
	return out;
}

/** Normalize a widths array to N entries that sum to 1. */
export function sanitizeWidths(input: number[] | undefined, count: number): number[] {
	if (count <= 0) return [];
	if (!input || input.length !== count) {
		return Array.from({ length: count }, () => 1 / count);
	}
	const positives = input.map(n => (Number.isFinite(n) && n > 0 ? n : 1 / count));
	const total = positives.reduce((a, b) => a + b, 0);
	if (total <= 0) return Array.from({ length: count }, () => 1 / count);
	return positives.map(n => n / total);
}

/** Move a block to a target location (parent + index in the original-doc frame). */
export function moveBlockOp(doc: EditorDocument, blockId: string, to: BlockLocation): ApplyResult {
	const from = findBlockLocation(doc, blockId);
	if (!from) return { doc, ops: [], selection: null };
	if (from.parentId === to.parentId && from.index === to.index) {
		return { doc, ops: [], selection: null };
	}

	let newDoc = moveBlockInDoc(doc, blockId, to);
	newDoc = pruneEmptyColumns(newDoc);

	if (newDoc === doc) return { doc, ops: [], selection: null };

	const op: Operation = { type: 'moveBlock', blockId, from, to };
	return { doc: newDoc, ops: [op], selection: null };
}

function isListItemType(t: BlockType): boolean {
	return t === 'bulletItem' || t === 'numberItem' || t === 'todoItem';
}

/** Container types a block can be nested under via Tab (list items + toggles). */
function isIndentContainerType(t: BlockType): boolean {
	return (
		isListItemType(t) ||
		t === 'toggle' ||
		t === 'toggleHeading1' ||
		t === 'toggleHeading2' ||
		t === 'toggleHeading3'
	);
}

/**
 * Indent ("in") or outdent ("out") a set of list-item blocks as a group, in a
 * single reversible transaction. Powers multi-item Tab / Shift+Tab across both
 * a text-range selection and a whole-block selection.
 *
 * `ids` may be any set of block IDs. Non-list-items are ignored, and a selected
 * item whose ancestor is also selected is skipped (the ancestor already carries
 * its subtree, so the descendant must not move on its own). The surviving
 * "root" items are the ones actually moved.
 *
 * Indent: each maximal run of consecutive selected siblings nests into the
 * sibling immediately before the run's head — but only when that sibling is a
 * list item. A run whose head is already the first child (nothing to nest
 * under) is left in place, so the group keeps its relative structure.
 *
 * Outdent: each root that lives inside a container block moves out to become a
 * sibling directly after its parent. Roots already at the top level (or not
 * under a container) are left in place. Items are processed in reverse document
 * order so a sibling run stays contiguous and correctly ordered after moving.
 *
 * Returns a no-op result (`ops: []`, `doc` unchanged) when nothing can move.
 * `selection` is always null — the caller preserves whatever selection makes
 * sense for its entry point (the text range, or the block highlight).
 */
export function indentBlocksOp(
	doc: EditorDocument,
	ids: string[],
	direction: 'in' | 'out',
): ApplyResult {
	const idSet = new Set(ids);

	// Root list-items, in document order: selected list items whose parent is
	// not itself selected.
	const roots: Block[] = [];
	for (const b of getBlocksInOrder(doc)) {
		if (!idSet.has(b.id) || !isListItemType(b.type)) continue;
		const loc = findBlockLocation(doc, b.id);
		if (loc && loc.parentId && idSet.has(loc.parentId)) continue;
		roots.push(b);
	}
	if (roots.length === 0) return { doc, ops: [], selection: null };

	let working = doc;
	const ops: Operation[] = [];

	if (direction === 'in') {
		// Group roots into maximal runs of consecutive same-parent siblings.
		const runs: Block[][] = [];
		for (const r of roots) {
			const loc = findBlockLocation(doc, r.id);
			if (!loc) continue;
			const run = runs[runs.length - 1];
			const prevItem = run?.[run.length - 1];
			const prevLoc = prevItem ? findBlockLocation(doc, prevItem.id) : null;
			if (
				run &&
				prevLoc &&
				prevLoc.parentId === loc.parentId &&
				loc.index === prevLoc.index + 1
			) {
				run.push(r);
			} else {
				runs.push([r]);
			}
		}

		for (const run of runs) {
			const headLoc = findBlockLocation(working, run[0]!.id);
			if (!headLoc || headLoc.index === 0) continue; // no previous sibling to nest under
			const siblings = getContainer(working, headLoc.parentId);
			const prev = siblings?.[headLoc.index - 1];
			if (!prev || !isListItemType(prev.type)) continue;
			for (const item of run) {
				const target = findBlock(working, prev.id);
				if (!target) break;
				const res = moveBlockOp(working, item.id, {
					parentId: prev.id,
					index: target.children.length,
				});
				if (res.ops.length > 0) {
					working = res.doc;
					ops.push(...res.ops);
				}
			}
		}
	} else {
		for (let i = roots.length - 1; i >= 0; i--) {
			const item = roots[i]!;
			const loc = findBlockLocation(working, item.id);
			if (!loc || loc.parentId === null) continue;
			const parent = findBlock(working, loc.parentId);
			if (!parent || !isIndentContainerType(parent.type)) continue;
			const parentLoc = findBlockLocation(working, loc.parentId);
			if (!parentLoc) continue;
			const res = moveBlockOp(working, item.id, {
				parentId: parentLoc.parentId,
				index: parentLoc.index + 1,
			});
			if (res.ops.length > 0) {
				working = res.doc;
				ops.push(...res.ops);
			}
		}
	}

	if (ops.length === 0) return { doc, ops: [], selection: null };
	return { doc: working, ops, selection: null };
}

/** Wrap an existing target block plus a moved block side-by-side inside a new columns container. */
export function wrapInColumnsOp(
	doc: EditorDocument,
	targetBlockId: string,
	movedBlockId: string,
	side: 'left' | 'right',
): ApplyResult {
	if (targetBlockId === movedBlockId) return { doc, ops: [], selection: null };

	const targetLoc = findBlockLocation(doc, targetBlockId);
	const movedLoc = findBlockLocation(doc, movedBlockId);
	const targetBlock = findBlock(doc, targetBlockId);
	const movedBlock = findBlock(doc, movedBlockId);
	if (!targetLoc || !movedLoc || !targetBlock || !movedBlock) {
		return { doc, ops: [], selection: null };
	}

	// Dropping on a column block directly (rare — outer band) → add a new
	// sibling column at the leading/trailing edge.
	if (targetBlock.type === 'column') {
		const columnsParentLoc = findBlockLocation(doc, targetLoc.parentId ?? '');
		const columnsParent = targetLoc.parentId ? findBlock(doc, targetLoc.parentId) : null;
		if (columnsParent && columnsParent.type === 'columns' && columnsParentLoc) {
			return addAdjacentColumnOp(doc, columnsParent.id, targetLoc.index, movedBlock, side);
		}
		return { doc, ops: [], selection: null };
	}

	// If the target is *already* inside a columns container (i.e. a block in
	// some column's children), add the moved block as a new sibling column
	// adjacent to that column rather than nesting another columns container.
	const targetParent = targetLoc.parentId ? findBlock(doc, targetLoc.parentId) : null;
	if (targetParent && targetParent.type === 'column') {
		const columnsParentLoc = findBlockLocation(doc, targetParent.id);
		const columnsContainer = columnsParentLoc?.parentId
			? findBlock(doc, columnsParentLoc.parentId)
			: null;
		if (columnsContainer && columnsContainer.type === 'columns' && columnsParentLoc) {
			return addAdjacentColumnOp(
				doc,
				columnsContainer.id,
				columnsParentLoc.index,
				movedBlock,
				side,
			);
		}
	}
	if (targetParent && targetParent.type === 'columns') {
		return addAdjacentColumnOp(doc, targetParent.id, targetLoc.index, movedBlock, side);
	}

	// Target itself is a `columns` block (outer band of the whole row) — add
	// the moved block as a new column on the leading/trailing edge.
	if (targetBlock.type === 'columns') {
		const insertNeighborIdx = side === 'left' ? 0 : targetBlock.children.length - 1;
		if (insertNeighborIdx < 0) return { doc, ops: [], selection: null };
		return addAdjacentColumnOp(doc, targetBlock.id, insertNeighborIdx, movedBlock, side);
	}

	const movedClone: Block = { ...movedBlock, children: movedBlock.children };

	// Remove the moved block from its original location.
	let working = removeBlock(doc, movedBlockId);

	// Re-locate the target after the removal (its index may have shifted within the same parent).
	const targetLocAfter = findBlockLocation(working, targetBlockId) ?? targetLoc;
	const targetBlockAfter = findBlock(working, targetBlockId);
	if (!targetBlockAfter) return { doc, ops: [], selection: null };

	// Build the wrapper.
	const firstColumnId = generateId();
	const secondColumnId = generateId();
	const leftBlock = side === 'left' ? movedClone : { ...targetBlockAfter };
	const rightBlock = side === 'left' ? { ...targetBlockAfter } : movedClone;

	const columnsBlock: Block = {
		id: generateId(),
		type: 'columns',
		content: [],
		children: [
			{ id: firstColumnId, type: 'column', content: [], children: [leftBlock], props: {} },
			{ id: secondColumnId, type: 'column', content: [], children: [rightBlock], props: {} },
		],
		props: { widths: [0.5, 0.5] },
	};

	// Remove the target from its place, then insert the columns block there.
	working = removeBlock(working, targetBlockId);
	const targetContainer = getContainer(working, targetLocAfter.parentId);
	if (!targetContainer) return { doc, ops: [], selection: null };
	working = insertBlockAt(
		working,
		targetLocAfter.parentId,
		Math.min(targetLocAfter.index, targetContainer.length),
		columnsBlock,
	);

	const op: Operation = {
		type: 'wrapInColumns',
		columnsBlockId: columnsBlock.id,
		firstColumnId,
		secondColumnId,
		targetBlockId,
		targetLocation: targetLoc,
		movedBlock: movedClone,
		movedFrom: movedLoc,
		side,
	};

	// Cursor lands on the moved block.
	const selection: Selection = {
		anchor: { blockId: movedClone.id, offset: 0 },
		focus: { blockId: movedClone.id, offset: 0 },
	};

	return { doc: nextVersion(working), ops: [op], selection };
}

/** Add a new sibling column adjacent to an existing column inside a columns container. */
export function addAdjacentColumnOp(
	doc: EditorDocument,
	columnsBlockId: string,
	neighborColumnIndex: number,
	payload: Block,
	side: 'left' | 'right',
): ApplyResult {
	const columnsBlock = findBlock(doc, columnsBlockId);
	if (!columnsBlock || columnsBlock.type !== 'columns') {
		return { doc, ops: [], selection: null };
	}

	const insertIndex = side === 'left' ? neighborColumnIndex : neighborColumnIndex + 1;
	const newColumnId = generateId();
	const newColumn: Block = {
		id: newColumnId,
		type: 'column',
		content: [],
		children: [payload],
		props: {},
	};

	let working = removeBlock(doc, payload.id);
	const targetCols = findBlock(working, columnsBlockId);
	if (!targetCols) return { doc, ops: [], selection: null };
	const nextChildren = [
		...targetCols.children.slice(0, insertIndex),
		newColumn,
		...targetCols.children.slice(insertIndex),
	];
	const newWidths = sanitizeWidths(undefined, nextChildren.length);
	working = updateBlock(working, columnsBlockId, b => ({
		...b,
		children: nextChildren,
		props: { ...b.props, widths: newWidths },
	}));

	const op: Operation = {
		type: 'insertBlock',
		parentId: columnsBlockId,
		index: insertIndex,
		block: newColumn,
	};

	const selection: Selection = {
		anchor: { blockId: payload.id, offset: 0 },
		focus: { blockId: payload.id, offset: 0 },
	};

	return { doc: nextVersion(working), ops: [op], selection };
}

/** Persist a new widths array on a columns block. */
export function setColumnWidthsOp(
	doc: EditorDocument,
	columnsBlockId: string,
	widths: number[],
): ApplyResult {
	const block = findBlock(doc, columnsBlockId);
	if (!block || block.type !== 'columns') return { doc, ops: [], selection: null };
	const oldProps = { ...block.props };
	const sanitized = sanitizeWidths(widths, block.children.length);
	const newProps = { ...block.props, widths: sanitized };
	const newDoc = updateBlock(doc, columnsBlockId, b => ({ ...b, props: newProps }));
	const op: Operation = { type: 'setBlockProps', blockId: columnsBlockId, oldProps, newProps };
	return { doc: newDoc, ops: [op], selection: null };
}

/**
 * Set a block's props wholesale, recorded as a reversible `setBlockProps` op.
 * This is the single funnel every custom-block prop edit (table data, image
 * crop/resize, checkbox, toggle-collapse, callout color, embed props, block
 * background/color) should
 * route through so the change lands in undo history instead of bypassing it.
 */
export function setBlockPropsOp(
	doc: EditorDocument,
	blockId: string,
	newProps: BlockProps,
): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };
	const oldProps = { ...block.props };
	const newDoc = updateBlock(doc, blockId, b => ({ ...b, props: newProps }));
	if (newDoc === doc) return { doc, ops: [], selection: null };
	const op: Operation = { type: 'setBlockProps', blockId, oldProps, newProps };
	return { doc: newDoc, ops: [op], selection: null };
}

/**
 * Replace a container's children wholesale, recorded as a reversible
 * `replaceBlocks` op. `parentId` is the container block's id (or null for the
 * document root). Used for structural custom-block edits that mutate a
 * container's child list — tab add/delete/rename, toggle "add child" — so they
 * become single, trivially-reversible undo steps.
 */
export function setChildrenOp(
	doc: EditorDocument,
	parentId: string | null,
	newBlocks: Block[],
): ApplyResult {
	const container = getContainer(doc, parentId);
	if (!container) return { doc, ops: [], selection: null };
	const oldBlocks = container;
	const newDoc = setContainer(doc, parentId, newBlocks);
	if (newDoc === doc) return { doc, ops: [], selection: null };
	const op: Operation = { type: 'replaceBlocks', parentId, oldBlocks, newBlocks };
	return { doc: newDoc, ops: [op], selection: null };
}

/** Change a block's type */
export function setBlockTypeOp(
	doc: EditorDocument,
	blockId: string,
	newType: BlockType,
	newProps?: BlockProps,
): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };

	const oldType = block.type;
	const oldProps = { ...block.props };
	const resolvedProps = newProps ?? {};

	const newDoc = setBlockTypeInDoc(doc, blockId, newType, resolvedProps);
	const op: Operation = {
		type: 'setBlockType',
		blockId,
		oldType,
		newType,
		oldProps,
		newProps: resolvedProps,
	};

	return { doc: newDoc, ops: [op], selection: null };
}

/** Toggle a mark on a selection range */
export function toggleMark(
	doc: EditorDocument,
	blockId: string,
	from: number,
	to: number,
	mark: Mark,
): ApplyResult {
	const newDoc = updateBlock(doc, blockId, b => ({
		...b,
		content: toggleMarkInContent(b.content, from, to, mark),
	}));

	const op: Operation = { type: 'toggleMark', blockId, from, to, mark };
	return { doc: newDoc, ops: [op], selection: null };
}

/**
 * Set (or clear) a single-value mark over a range — e.g. `fontFamily`. Unlike
 * `toggleMark`, re-applying replaces the value instead of toggling it off; a
 * missing `attrs` clears it. Emitted as a `replaceContent` op so it's a single,
 * undo-safe step. Used by the toolbar font picker.
 */
export function setMark(
	doc: EditorDocument,
	blockId: string,
	from: number,
	to: number,
	markType: MarkType,
	attrs?: Record<string, string>,
): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };
	const newContent = setMarkInContent(block.content, from, to, markType, attrs);
	return replaceContent(doc, blockId, newContent);
}

// ---- Marks over a selection that can span several blocks ----

/** The selected part of one block's text: [from, to) in that block. */
export interface BlockTextRange {
	blockId: string;
	from: number;
	to: number;
}

/** Block types whose inline text takes marks (bold, italic, links...). Code
 *  blocks are left out: their text is literal and marks cannot be stored. */
const MARKABLE_BLOCK_TYPES = new Set<BlockType>([
	'paragraph',
	'heading1',
	'heading2',
	'heading3',
	'heading4',
	'heading5',
	'heading6',
	'toggleHeading1',
	'toggleHeading2',
	'toggleHeading3',
	'todo',
	'bulletItem',
	'numberItem',
	'todoItem',
	'quote',
	'callout',
	'toggle',
]);

export function isMarkableBlock(block: Block): boolean {
	return MARKABLE_BLOCK_TYPES.has(block.type);
}

/**
 * The per-block text ranges a text selection covers, in document order. A
 * selection inside one block gives one range; a selection across blocks gives
 * the tail of the first block, every block in between and the head of the
 * last. Blocks whose text cannot take marks, and empty ranges (a selection
 * that ends at offset 0 of the next block), are left out.
 */
export function selectionTextRanges(doc: EditorDocument, sel: Selection): BlockTextRange[] {
	const flat = getBlocksInOrder(doc);
	const startIdx0 = flat.findIndex(b => b.id === sel.anchor.blockId);
	const endIdx0 = flat.findIndex(b => b.id === sel.focus.blockId);
	if (startIdx0 < 0 || endIdx0 < 0) return [];
	const forward =
		startIdx0 < endIdx0 || (startIdx0 === endIdx0 && sel.anchor.offset <= sel.focus.offset);
	const start = forward ? sel.anchor : sel.focus;
	const end = forward ? sel.focus : sel.anchor;
	const startIdx = Math.min(startIdx0, endIdx0);
	const endIdx = Math.max(startIdx0, endIdx0);

	const out: BlockTextRange[] = [];
	for (let i = startIdx; i <= endIdx; i++) {
		const block = flat[i]!;
		if (!isMarkableBlock(block)) continue;
		const len = getTextLength(block.content);
		const from = Math.max(0, Math.min(len, block.id === start.blockId ? start.offset : 0));
		const to = Math.max(0, Math.min(len, block.id === end.blockId ? end.offset : len));
		if (from < to) out.push({ blockId: block.id, from, to });
	}
	return out;
}

/** Full-text ranges for a whole-block selection: every selected block and
 *  every block nested inside it, in document order. */
export function blockSelectionTextRanges(
	doc: EditorDocument,
	blockIds: string[],
): BlockTextRange[] {
	const out: BlockTextRange[] = [];
	const seen = new Set<string>();
	const visit = (block: Block) => {
		if (seen.has(block.id)) return;
		seen.add(block.id);
		const len = getTextLength(block.content);
		if (isMarkableBlock(block) && len > 0) out.push({ blockId: block.id, from: 0, to: len });
		block.children.forEach(visit);
	};
	const wanted = new Set(blockIds);
	for (const block of getBlocksInOrder(doc)) {
		if (wanted.has(block.id)) visit(block);
	}
	return out;
}

/** Mark types that EVERY selected character has, across all the ranges.
 *  Empty when nothing is selected. */
export function activeMarksInRanges(doc: EditorDocument, ranges: BlockTextRange[]): MarkType[] {
	let common: Set<MarkType> | null = null;
	for (const r of ranges) {
		const block = findBlock(doc, r.blockId);
		if (!block) continue;
		let pos = 0;
		for (const span of block.content) {
			const spanEnd = pos + span.text.length;
			if (Math.max(pos, r.from) < Math.min(spanEnd, r.to)) {
				const types = new Set((span.marks ?? []).map(m => m.type));
				if (common === null) common = types;
				else for (const t of [...common]) if (!types.has(t)) common.delete(t);
				if (common.size === 0) return [];
			}
			pos = spanEnd;
		}
	}
	return common ? [...common] : [];
}

/**
 * Toggle a mark over every range as ONE edit: when all selected text already
 * has the mark it is removed everywhere, otherwise it is added where missing.
 * Recorded as one `replaceContent` op per changed block, so undo restores each
 * block's exact previous spans (including partial marks).
 */
export function toggleMarkInRanges(
	doc: EditorDocument,
	ranges: BlockTextRange[],
	mark: Mark,
): ApplyResult {
	const live = ranges.filter(r => r.from < r.to && findBlock(doc, r.blockId));
	if (live.length === 0) return { doc, ops: [], selection: null };
	const hasEverywhere = live.every(r =>
		rangeHasMark(findBlock(doc, r.blockId)!.content, r.from, r.to, mark.type),
	);
	return rewriteRanges(doc, live, (content, r) => {
		// Adding: a block whose part already has the mark keeps it as it is
		// (toggling it there would REMOVE the mark).
		if (!hasEverywhere && rangeHasMark(content, r.from, r.to, mark.type)) return content;
		return toggleMarkInContent(content, r.from, r.to, mark);
	});
}

/** Set (or clear, with no `attrs`) a single-value mark (color, highlight,
 *  font) over every range as one edit. */
export function setMarkInRanges(
	doc: EditorDocument,
	ranges: BlockTextRange[],
	markType: MarkType,
	attrs?: Record<string, string>,
): ApplyResult {
	const live = ranges.filter(r => r.from < r.to && findBlock(doc, r.blockId));
	return rewriteRanges(doc, live, (content, r) =>
		setMarkInContent(content, r.from, r.to, markType, attrs),
	);
}

function rewriteRanges(
	doc: EditorDocument,
	ranges: BlockTextRange[],
	rewrite: (content: TextSpan[], r: BlockTextRange) => TextSpan[],
): ApplyResult {
	let newDoc = doc;
	const ops: Operation[] = [];
	for (const r of ranges) {
		const block = findBlock(newDoc, r.blockId);
		if (!block) continue;
		const oldContent = block.content;
		const newContent = rewrite(oldContent, r);
		if (newContent === oldContent || JSON.stringify(newContent) === JSON.stringify(oldContent))
			continue;
		newDoc = updateBlock(newDoc, r.blockId, b => ({ ...b, content: newContent }));
		ops.push({ type: 'replaceContent', blockId: r.blockId, oldContent, newContent });
	}
	return ops.length > 0
		? { doc: newDoc, ops, selection: null }
		: { doc, ops: [], selection: null };
}

/** Replace the entire content of a block */
/**
 * Replace the range [from, to) with an inline mention pill. Used by the
 * mention picker to turn the typed "@filter" into an atomic mention span.
 *
 * The inserted span carries a single "mention" mark; its text is the
 * rendered label (e.g. "@Kiran" or "Tomorrow") so plain-text reads, search
 * indexing, and offset arithmetic keep working without special-casing.
 *
 * Returned selection sits immediately after the inserted span.
 */
export function insertMention(
	doc: EditorDocument,
	blockId: string,
	from: number,
	to: number,
	label: string,
	kind: string,
	id: string,
): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };

	const [before] = splitContent(block.content, from);
	const [, after] = splitContent(block.content, to);

	// Store only `kind` and `id` — the label is the chip's TextSpan.text, kept
	// in sync with the live resolver output by MentionPill's sync effect. We
	// no longer write the legacy `attrs.label` snapshot (date chips would drift
	// stale, page renames wouldn't propagate). Old data with `attrs.label` is
	// tolerated on read but ignored.
	const mentionSpan: TextSpan = {
		text: label,
		marks: [{ type: 'mention', attrs: { kind, id } }],
	};
	// A space after the pill, unless one follows already, so typing goes on as text.
	const spaced = /^\s/.test(getPlainText(after)) ? 0 : 1;
	const newContent = mergeAdjacentSpans([
		...before,
		mentionSpan,
		...(spaced ? [{ text: ' ' }] : []),
		...after,
	]);

	const oldContent = block.content;
	const newDoc = updateBlock(doc, blockId, b => ({
		...b,
		content: newContent,
	}));

	const op: Operation = { type: 'replaceContent', blockId, oldContent, newContent };
	const caret = from + label.length + spaced;
	const selection: Selection = {
		anchor: { blockId, offset: caret },
		focus: { blockId, offset: caret },
	};

	return { doc: newDoc, ops: [op], selection };
}

export function replaceContent(
	doc: EditorDocument,
	blockId: string,
	newContent: TextSpan[],
): ApplyResult {
	const block = findBlock(doc, blockId);
	if (!block) return { doc, ops: [], selection: null };

	const oldContent = block.content;
	const newDoc = updateBlock(doc, blockId, b => ({
		...b,
		content: newContent,
	}));

	const op: Operation = { type: 'replaceContent', blockId, oldContent, newContent };
	return { doc: newDoc, ops: [op], selection: null };
}
