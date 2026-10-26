// ============================================================
// Document model — immutable operations on the block tree.
// The document is the single source of truth. Never mutate
// directly; always produce a new document via these helpers.
// ============================================================

import type {
	Block,
	BlockLocation,
	BlockProps,
	BlockType,
	EditorDocument,
	Mark,
	MarkType,
	TextSpan,
} from './types';
import { generateId, getPlainText, getTextLength } from './types';
import { migrateDocument } from './migrate';

/** Create an empty document */
export function createDocument(blocks?: Block[]): EditorDocument {
	return {
		blocks: blocks ?? [
			{ id: generateId(), type: 'paragraph', content: [], children: [], props: {} },
		],
		version: 0,
	};
}

/**
 * Ensure a document has at least one block. External callers can hand us a
 * document with blocks=[] (e.g. a page fetched from the server before any
 * edits were saved); without at least one block the caret has no landing
 * spot and beforeinput cannot translate typing into model updates.
 */
export function normalizeDocument(doc: EditorDocument | undefined | null): EditorDocument {
	if (!doc || doc.blocks.length === 0) {
		return createDocument();
	}
	return migrateDocument(doc);
}

/** Bump the version number */
export function nextVersion(doc: EditorDocument): EditorDocument {
	return { ...doc, version: doc.version + 1 };
}

// ---- Block lookup ----

/** Find a block by ID (recurses into children) */
export function findBlock(doc: EditorDocument, blockId: string): Block | undefined {
	return findBlockDeep(doc.blocks, blockId);
}

/** Recursively search blocks and their children for a block by ID */
function findBlockDeep(blocks: Block[], blockId: string): Block | undefined {
	for (const b of blocks) {
		if (b.id === blockId) return b;
		if (b.children.length > 0) {
			const found = findBlockDeep(b.children, blockId);
			if (found) return found;
		}
	}
	return undefined;
}

/** Find a block's location in the tree: parent id (or null for root) + index within that parent. */
export function findBlockLocation(doc: EditorDocument, blockId: string): BlockLocation | undefined {
	return findLocationIn(doc.blocks, blockId, null);
}

function findLocationIn(
	blocks: Block[],
	blockId: string,
	parentId: string | null,
): BlockLocation | undefined {
	for (let i = 0; i < blocks.length; i++) {
		const b = blocks[i]!;
		if (b.id === blockId) return { parentId, index: i };
		if (b.children.length > 0) {
			const nested = findLocationIn(b.children, blockId, b.id);
			if (nested) return nested;
		}
	}
	return undefined;
}

/** Get the container array (children array) holding a block — useful for sibling lookups. */
export function getContainer(doc: EditorDocument, parentId: string | null): Block[] | undefined {
	if (parentId === null) return doc.blocks;
	const parent = findBlock(doc, parentId);
	return parent?.children;
}

/** Index of a block within its parent container (-1 if not found). */
export function findBlockIndex(doc: EditorDocument, blockId: string): number {
	const loc = findBlockLocation(doc, blockId);
	return loc ? loc.index : -1;
}

/** Previous sibling within the same parent, or undefined. */
export function getPreviousBlock(doc: EditorDocument, blockId: string): Block | undefined {
	const loc = findBlockLocation(doc, blockId);
	if (!loc || loc.index === 0) return undefined;
	const container = getContainer(doc, loc.parentId);
	return container?.[loc.index - 1];
}

/** Next sibling within the same parent, or undefined. */
export function getNextBlock(doc: EditorDocument, blockId: string): Block | undefined {
	const loc = findBlockLocation(doc, blockId);
	if (!loc) return undefined;
	const container = getContainer(doc, loc.parentId);
	if (!container) return undefined;
	return loc.index < container.length - 1 ? container[loc.index + 1] : undefined;
}

/** Walk every block in document (pre-order, depth-first). */
export function walkBlocks(
	doc: EditorDocument,
	cb: (block: Block, parentId: string | null) => void,
): void {
	walkIn(doc.blocks, null, cb);
}

function walkIn(
	blocks: Block[],
	parentId: string | null,
	cb: (block: Block, parentId: string | null) => void,
): void {
	for (const b of blocks) {
		cb(b, parentId);
		if (b.children.length > 0) walkIn(b.children, b.id, cb);
	}
}

/** Flat list of blocks in document order (pre-order). */
export function getBlocksInOrder(doc: EditorDocument): Block[] {
	const out: Block[] = [];
	walkBlocks(doc, b => out.push(b));
	return out;
}

// ---- Text operations ----

/** Split text spans at an offset, returning [before, after] */
export function splitContent(content: TextSpan[], offset: number): [TextSpan[], TextSpan[]] {
	const before: TextSpan[] = [];
	const after: TextSpan[] = [];
	let pos = 0;

	for (const span of content) {
		const spanEnd = pos + span.text.length;

		if (spanEnd <= offset) {
			// Entirely before the split point
			before.push(span);
		} else if (pos >= offset) {
			// Entirely after the split point
			after.push(span);
		} else {
			// This span is split
			const splitAt = offset - pos;
			if (splitAt > 0) {
				before.push({
					text: span.text.slice(0, splitAt),
					marks: span.marks ? [...span.marks] : undefined,
				});
			}
			if (splitAt < span.text.length) {
				after.push({
					text: span.text.slice(splitAt),
					marks: span.marks ? [...span.marks] : undefined,
				});
			}
		}

		pos = spanEnd;
	}

	return [before, after];
}

/** Insert text into content spans at a given offset.
 *
 * Mention spans are treated as atomic: typing at either boundary of a
 * mention emits a new plain span next to the chip instead of folding the
 * characters into the chip's text. Without this, a chip "@Kiran" grows
 * into "@Kiran X" (carrying the mention mark) when the user types after
 * it, and Backspace later deletes the whole oversized chip. */
export function insertTextInContent(content: TextSpan[], offset: number, text: string): TextSpan[] {
	if (content.length === 0) {
		return [{ text }];
	}

	const result: TextSpan[] = [];
	let pos = 0;
	let inserted = false;

	for (const span of content) {
		const spanEnd = pos + span.text.length;
		const isMention = span.marks?.some(m => m.type === 'mention');

		if (!inserted && offset >= pos && offset <= spanEnd) {
			if (isMention && offset === pos) {
				// Inserting at the left edge of a chip — emit text first, then chip.
				result.push({ text });
				result.push(span);
				inserted = true;
			} else if (isMention && offset === spanEnd) {
				// Inserting at the right edge of a chip — emit chip first, then text.
				result.push(span);
				result.push({ text });
				inserted = true;
			} else {
				// Inside a non-mention span (or interior of a chip, which shouldn't
				// happen but fold anyway as a safety net).
				const splitAt = offset - pos;
				const newText = span.text.slice(0, splitAt) + text + span.text.slice(splitAt);
				result.push({ text: newText, marks: span.marks ? [...span.marks] : undefined });
				inserted = true;
			}
		} else {
			result.push(span);
		}

		pos = spanEnd;
	}

	// If offset is at the very end and we haven't inserted
	if (!inserted) {
		const lastSpan = result[result.length - 1];
		if (lastSpan) {
			const lastIsMention = lastSpan.marks?.some(m => m.type === 'mention');
			if (lastIsMention) {
				// Don't fold into a trailing chip — append a new plain span.
				result.push({ text });
			} else {
				result[result.length - 1] = {
					text: lastSpan.text + text,
					marks: lastSpan.marks ? [...lastSpan.marks] : undefined,
				};
			}
		} else {
			result.push({ text });
		}
	}

	return result;
}

/** Delete text from content spans at a given offset+length */
export function deleteTextInContent(
	content: TextSpan[],
	offset: number,
	length: number,
): TextSpan[] {
	const [before] = splitContent(content, offset);
	const [, after] = splitContent(content, offset + length);
	return mergeAdjacentSpans([...before, ...after]);
}

/** Get the substring of text deleted (for undo) */
export function getDeletedText(content: TextSpan[], offset: number, length: number): string {
	const plainText = getPlainText(content);
	return plainText.slice(offset, offset + length);
}

/** Merge adjacent spans with identical marks */
export function mergeAdjacentSpans(content: TextSpan[]): TextSpan[] {
	if (content.length <= 1) return content;

	const result: TextSpan[] = [content[0]!];
	for (let i = 1; i < content.length; i++) {
		const prev = result[result.length - 1]!;
		const curr = content[i]!;

		if (marksEqual(prev.marks, curr.marks)) {
			result[result.length - 1] = { text: prev.text + curr.text, marks: prev.marks };
		} else {
			result.push(curr);
		}
	}

	// Filter out empty spans
	return result.filter(s => s.text.length > 0);
}

/** Compare two attr maps for equality (order-independent). */
function attrsEqual(
	a: Record<string, string> | undefined,
	b: Record<string, string> | undefined,
): boolean {
	if (a === b) return true;
	const ka = a ? Object.keys(a) : [];
	const kb = b ? Object.keys(b) : [];
	if (ka.length !== kb.length) return false;
	for (const k of ka) {
		if (a![k] !== b?.[k]) return false;
	}
	return true;
}

/**
 * Compare two mark arrays for equality — used to decide whether two adjacent
 * spans may be coalesced. Must compare `attrs`, not just `type`: otherwise a
 * red run and a blue run (both `type: "color"`) look equal and merge back into
 * one, silently dropping the second color. Same hazard for fontFamily and link
 * href. Assumes marks are index-aligned (they are, by how spans are built).
 */
export function marksEqual(a: Mark[] | undefined, b: Mark[] | undefined): boolean {
	const ma = a ?? [];
	const mb = b ?? [];
	if (ma.length !== mb.length) return false;
	for (let i = 0; i < ma.length; i++) {
		if (ma[i]!.type !== mb[i]!.type) return false;
		if (!attrsEqual(ma[i]!.attrs, mb[i]!.attrs)) return false;
	}
	return true;
}

// ---- Block-level operations ----

/** Replace a block in the document by ID (recurses through children). */
export function updateBlock(
	doc: EditorDocument,
	blockId: string,
	updater: (b: Block) => Block,
): EditorDocument {
	const next = mapBlocks(doc.blocks, blockId, updater);
	if (next === doc.blocks) return doc;
	return nextVersion({ ...doc, blocks: next });
}

function mapBlocks(blocks: Block[], blockId: string, updater: (b: Block) => Block): Block[] {
	let changed = false;
	const out = blocks.map(b => {
		if (b.id === blockId) {
			changed = true;
			return updater(b);
		}
		if (b.children.length > 0) {
			const nextChildren = mapBlocks(b.children, blockId, updater);
			if (nextChildren !== b.children) {
				changed = true;
				return { ...b, children: nextChildren };
			}
		}
		return b;
	});
	return changed ? out : blocks;
}

/** Replace the children of a block (or the root if parentId is null). */
export function setContainer(
	doc: EditorDocument,
	parentId: string | null,
	container: Block[],
): EditorDocument {
	if (parentId === null) {
		return nextVersion({ ...doc, blocks: container });
	}
	return updateBlock(doc, parentId, b => ({ ...b, children: container }));
}

/**
 * Insert a block as the next sibling of `afterBlockId` (wherever it lives).
 * When `afterBlockId` is null the block is inserted at the start of the root.
 */
export function insertBlockAfter(
	doc: EditorDocument,
	afterBlockId: string | null,
	block: Block,
): EditorDocument {
	if (afterBlockId === null) {
		return nextVersion({ ...doc, blocks: [block, ...doc.blocks] });
	}
	const loc = findBlockLocation(doc, afterBlockId);
	if (!loc) {
		return nextVersion({ ...doc, blocks: [...doc.blocks, block] });
	}
	return insertBlockAt(doc, loc.parentId, loc.index + 1, block);
}

/** Insert a block at an explicit container + index (parentId null = root). */
export function insertBlockAt(
	doc: EditorDocument,
	parentId: string | null,
	index: number,
	block: Block,
): EditorDocument {
	const container = getContainer(doc, parentId);
	if (!container) return doc;
	const clamped = Math.max(0, Math.min(index, container.length));
	const next = [...container.slice(0, clamped), block, ...container.slice(clamped)];
	return setContainer(doc, parentId, next);
}

/** Remove a block by ID (wherever it lives in the tree). */
export function removeBlock(doc: EditorDocument, blockId: string): EditorDocument {
	const next = filterBlocks(doc.blocks, blockId);
	if (next === doc.blocks) return doc;
	return nextVersion({ ...doc, blocks: next });
}

function filterBlocks(blocks: Block[], blockId: string): Block[] {
	let changed = false;
	const out: Block[] = [];
	for (const b of blocks) {
		if (b.id === blockId) {
			changed = true;
			continue;
		}
		if (b.children.length > 0) {
			const nextChildren = filterBlocks(b.children, blockId);
			if (nextChildren !== b.children) {
				changed = true;
				out.push({ ...b, children: nextChildren });
				continue;
			}
		}
		out.push(b);
	}
	return changed ? out : blocks;
}

/**
 * Move a block from one location to another. Locations are `{ parentId, index }`.
 * Indices refer to the source/destination containers in the *current* document
 * (the helper handles index shift when moving within the same container).
 */
export function moveBlock(doc: EditorDocument, blockId: string, to: BlockLocation): EditorDocument {
	const block = findBlock(doc, blockId);
	if (!block) return doc;
	const removed = removeBlock(doc, blockId);
	const targetContainer = getContainer(removed, to.parentId);
	if (!targetContainer) return doc;
	// If moving forward within the same container, the index shifts down by one
	// after the removal. Caller passes indices in the original-doc frame.
	const from = findBlockLocation(doc, blockId);
	let targetIndex = to.index;
	if (from && from.parentId === to.parentId && from.index < to.index) {
		targetIndex = to.index - 1;
	}
	targetIndex = Math.max(0, Math.min(targetIndex, targetContainer.length));
	return insertBlockAt(removed, to.parentId, targetIndex, block);
}

/** Change a block's type */
export function setBlockType(
	doc: EditorDocument,
	blockId: string,
	newType: BlockType,
	newProps?: BlockProps,
): EditorDocument {
	return updateBlock(doc, blockId, b => ({
		...b,
		type: newType,
		props: newProps ?? b.props,
	}));
}

// ---- Mark operations ----

/** Toggle a mark on a range within a block's content */
export function toggleMarkInContent(
	content: TextSpan[],
	from: number,
	to: number,
	mark: Mark,
): TextSpan[] {
	if (from === to) return content;

	// Check if the entire range already has this mark
	const hasMarkEverywhere = rangeHasMark(content, from, to, mark.type);

	const result: TextSpan[] = [];
	let pos = 0;

	for (const span of content) {
		const spanEnd = pos + span.text.length;

		// No overlap with the range
		if (spanEnd <= from || pos >= to) {
			result.push(span);
			pos = spanEnd;
			continue;
		}

		// Compute the overlap
		const overlapStart = Math.max(pos, from);
		const overlapEnd = Math.min(spanEnd, to);

		// Part before overlap
		if (pos < overlapStart) {
			result.push({
				text: span.text.slice(0, overlapStart - pos),
				marks: span.marks ? [...span.marks] : undefined,
			});
		}

		// The overlapping part — add or remove the mark
		const overlapText = span.text.slice(overlapStart - pos, overlapEnd - pos);
		const existingMarks = span.marks ?? [];
		let newMarks: Mark[];

		if (hasMarkEverywhere) {
			// Remove the mark
			newMarks = existingMarks.filter(m => m.type !== mark.type);
		} else {
			// Add the mark (if not already present)
			if (existingMarks.some(m => m.type === mark.type)) {
				newMarks = [...existingMarks];
			} else {
				newMarks = [...existingMarks, mark];
			}
		}

		result.push({
			text: overlapText,
			marks: newMarks.length > 0 ? newMarks : undefined,
		});

		// Part after overlap
		if (spanEnd > overlapEnd) {
			result.push({
				text: span.text.slice(overlapEnd - pos),
				marks: span.marks ? [...span.marks] : undefined,
			});
		}

		pos = spanEnd;
	}

	return mergeAdjacentSpans(result);
}

/**
 * Set (replace) or clear a single-value mark (color, fontFamily, …) over a
 * range. Unlike `toggleMarkInContent`, this always removes any existing mark
 * of the same type in the range first, then — when `attrs` is provided — adds
 * the new one. Passing `attrs = undefined` clears the mark. Use this for
 * "pick a value" marks where re-picking must replace, not toggle off.
 */
export function setMarkInContent(
	content: TextSpan[],
	from: number,
	to: number,
	markType: MarkType,
	attrs?: Record<string, string>,
): TextSpan[] {
	if (from === to) return content;

	const result: TextSpan[] = [];
	let pos = 0;

	for (const span of content) {
		const spanEnd = pos + span.text.length;

		if (spanEnd <= from || pos >= to) {
			result.push(span);
			pos = spanEnd;
			continue;
		}

		const overlapStart = Math.max(pos, from);
		const overlapEnd = Math.min(spanEnd, to);

		if (pos < overlapStart) {
			result.push({
				text: span.text.slice(0, overlapStart - pos),
				marks: span.marks ? [...span.marks] : undefined,
			});
		}

		const overlapText = span.text.slice(overlapStart - pos, overlapEnd - pos);
		const kept = (span.marks ?? []).filter(m => m.type !== markType);
		const newMarks = attrs ? [...kept, { type: markType, attrs }] : kept;
		result.push({
			text: overlapText,
			marks: newMarks.length > 0 ? newMarks : undefined,
		});

		if (spanEnd > overlapEnd) {
			result.push({
				text: span.text.slice(overlapEnd - pos),
				marks: span.marks ? [...span.marks] : undefined,
			});
		}

		pos = spanEnd;
	}

	return mergeAdjacentSpans(result);
}

/** Check if every character in a range has a specific mark */
function rangeHasMark(content: TextSpan[], from: number, to: number, markType: string): boolean {
	let pos = 0;
	for (const span of content) {
		const spanEnd = pos + span.text.length;
		const overlapStart = Math.max(pos, from);
		const overlapEnd = Math.min(spanEnd, to);

		if (overlapStart < overlapEnd) {
			const hasMark = (span.marks ?? []).some(m => m.type === markType);
			if (!hasMark) return false;
		}

		pos = spanEnd;
	}
	return true;
}

/** Get the marks active at a specific offset */
export function getMarksAtOffset(content: TextSpan[], offset: number): Mark[] {
	let pos = 0;
	for (const span of content) {
		const spanEnd = pos + span.text.length;
		if (offset >= pos && offset < spanEnd) {
			return span.marks ?? [];
		}
		// If offset is at the end of a span, use that span's marks
		if (offset === spanEnd && offset === getTextLength(content)) {
			return span.marks ?? [];
		}
		pos = spanEnd;
	}
	return [];
}
