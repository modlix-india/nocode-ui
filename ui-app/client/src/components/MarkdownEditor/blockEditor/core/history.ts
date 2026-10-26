// ============================================================
// Undo/redo history — operation-based, not snapshot-based.
// Groups rapid typing into single undo steps via time-based
// batching (300ms window).
// ============================================================

import type { EditorDocument, Operation, Selection, Transaction } from './types';
import {
	insertTextInContent,
	deleteTextInContent,
	splitContent,
	updateBlock,
	insertBlockAfter,
	insertBlockAt,
	removeBlock,
	moveBlock as moveBlockInDoc,
	mergeAdjacentSpans,
	toggleMarkInContent,
	setContainer,
	getContainer,
	findBlock,
	nextVersion,
} from './document';
import { getTextLength } from './types';

const BATCH_WINDOW_MS = 300;
const MAX_HISTORY_SIZE = 200;

/** Result of an undo/redo — the reversed/reapplied doc, the selection to
 *  restore, and the transaction that moved (so a host can mirror it to a
 *  durable server-side journal). */
export interface HistoryStep {
	doc: EditorDocument;
	selection: Selection | null;
	transaction: Transaction;
}

export class History {
	private undoStack: Transaction[] = [];
	private redoStack: Transaction[] = [];

	// A transaction is "sealed" once it can no longer be merged into (a newer
	// transaction started, or the caller flushed on idle/blur/before-undo). The
	// seal handler lets a host persist one durable command per undo-step to the
	// server journal — matching the local batching granularity instead of one
	// per keystroke. Each transaction is sealed at most once (identity-deduped).
	private onSeal?: (tx: Transaction) => void;
	private lastSealed: Transaction | null = null;

	setSealHandler(fn: ((tx: Transaction) => void) | undefined): void {
		this.onSeal = fn;
	}

	private seal(tx: Transaction | undefined): void {
		if (!tx || tx === this.lastSealed) return;
		this.lastSealed = tx;
		this.onSeal?.(tx);
	}

	/** Seal the current top transaction now (call on idle/blur/before an undo so
	 *  the durable journal has it before anything references it). */
	flushSeal(): void {
		this.seal(this.undoStack[this.undoStack.length - 1]);
	}

	/** Record a transaction (batch of operations) */
	push(
		ops: Operation[],
		selectionBefore: Selection | null,
		selectionAfter: Selection | null,
	): void {
		const now = Date.now();
		const last = this.undoStack[this.undoStack.length - 1];

		// Try to merge with the last transaction if it was a recent text insert/delete
		if (last && now - last.timestamp < BATCH_WINDOW_MS && canMerge(last, ops)) {
			last.operations.push(...ops);
			last.selectionAfter = selectionAfter;
			last.timestamp = now;
		} else {
			// A new transaction begins — the previous top can no longer be merged
			// into, so seal it for the durable journal.
			this.seal(last);
			this.undoStack.push({
				operations: [...ops],
				selectionBefore,
				selectionAfter,
				timestamp: now,
			});

			// Trim history if too large
			if (this.undoStack.length > MAX_HISTORY_SIZE) {
				this.undoStack.shift();
			}
		}

		// Clear redo stack on new edit
		this.redoStack = [];
	}

	/** Undo the last transaction, returning the reversed document and selection */
	undo(doc: EditorDocument): HistoryStep | null {
		// Seal the top before undoing it so a mirroring host has appended the
		// command to the server before it issues the matching undo.
		this.flushSeal();
		const tx = this.undoStack.pop();
		if (!tx) return null;

		// Apply operations in reverse
		let newDoc = doc;
		for (let i = tx.operations.length - 1; i >= 0; i--) {
			newDoc = reverseOperation(newDoc, tx.operations[i]!);
		}

		this.redoStack.push(tx);
		return { doc: newDoc, selection: tx.selectionBefore, transaction: tx };
	}

	/** Redo the last undone transaction */
	redo(doc: EditorDocument): HistoryStep | null {
		const tx = this.redoStack.pop();
		if (!tx) return null;

		// Re-apply operations in order
		let newDoc = doc;
		for (const op of tx.operations) {
			newDoc = applyOperation(newDoc, op);
		}

		this.undoStack.push(tx);
		return { doc: newDoc, selection: tx.selectionAfter, transaction: tx };
	}

	/** Check if undo is available */
	canUndo(): boolean {
		return this.undoStack.length > 0;
	}

	/** Check if redo is available */
	canRedo(): boolean {
		return this.redoStack.length > 0;
	}

	/** Clear all history */
	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
	}
}

/** Check if ops can be merged into the previous transaction (consecutive typing) */
function canMerge(last: Transaction, ops: Operation[]): boolean {
	if (ops.length !== 1) return false;
	const op = ops[0]!;
	const lastOp = last.operations[last.operations.length - 1];
	if (!lastOp) return false;

	// Merge consecutive single-char inserts in the same block
	if (op.type === 'insertText' && lastOp.type === 'insertText') {
		return (
			op.blockId === lastOp.blockId &&
			op.text.length === 1 &&
			op.offset === lastOp.offset + lastOp.text.length &&
			!/\s/.test(op.text) // Don't merge across word boundaries
		);
	}

	// Merge consecutive single-char deletes in the same block
	if (op.type === 'deleteText' && lastOp.type === 'deleteText') {
		return (
			op.blockId === lastOp.blockId &&
			op.length === 1 &&
			(op.offset === lastOp.offset || op.offset === lastOp.offset - 1)
		);
	}

	return false;
}

/** Apply an operation forward to a document */
function applyOperation(doc: EditorDocument, op: Operation): EditorDocument {
	switch (op.type) {
		case 'insertText':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({
					...b,
					content: insertTextInContent(b.content, op.offset, op.text),
				})),
			);

		case 'deleteText':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({
					...b,
					content: deleteTextInContent(b.content, op.offset, op.length),
				})),
			);

		case 'splitBlock': {
			const block = findBlock(doc, op.blockId);
			if (!block) return doc;
			const [before, after] = splitContent(block.content, op.offset);
			const newDoc = updateBlock(doc, op.blockId, b => ({ ...b, content: before }));
			const newBlock = {
				id: op.newBlockId,
				type: block.type as any,
				content: after,
				children: [] as any[],
				props: {},
			};
			return nextVersion(insertBlockAfter(newDoc, op.blockId, newBlock));
		}

		case 'mergeBlock': {
			const block = findBlock(doc, op.blockId);
			const prevBlock = findBlock(doc, op.prevBlockId);
			if (!block || !prevBlock) return doc;
			const merged = mergeAdjacentSpans([...prevBlock.content, ...block.content]);
			const newDoc = updateBlock(doc, prevBlock.id, b => ({ ...b, content: merged }));
			return nextVersion(removeBlock(newDoc, op.blockId));
		}

		case 'insertBlock':
			return nextVersion(insertBlockAt(doc, op.parentId, op.index, op.block));

		case 'deleteBlock':
			return nextVersion(removeBlock(doc, op.blockId));

		case 'moveBlock':
			return nextVersion(moveBlockInDoc(doc, op.blockId, op.to));

		case 'setBlockType':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({ ...b, type: op.newType, props: op.newProps })),
			);

		case 'setBlockProps':
			return nextVersion(updateBlock(doc, op.blockId, b => ({ ...b, props: op.newProps })));

		case 'toggleMark':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({
					...b,
					content: toggleMarkInContent(b.content, op.from, op.to, op.mark),
				})),
			);

		case 'replaceContent':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({ ...b, content: op.newContent })),
			);

		case 'replaceBlocks':
			return nextVersion(setContainer(doc, op.parentId, op.newBlocks));

		case 'wrapInColumns': {
			// Redo: remove `movedBlock` from its current home, remove `targetBlock`,
			// insert a fresh columns container that holds both as sole children.
			let working = removeBlock(doc, op.movedBlock.id);
			const targetBlock = findBlock(working, op.targetBlockId);
			if (!targetBlock) return doc;
			working = removeBlock(working, op.targetBlockId);
			const leftBlock = op.side === 'left' ? op.movedBlock : { ...targetBlock };
			const rightBlock = op.side === 'left' ? { ...targetBlock } : op.movedBlock;
			const columnsBlock = {
				id: op.columnsBlockId,
				type: 'columns' as const,
				content: [],
				children: [
					{
						id: op.firstColumnId,
						type: 'column' as const,
						content: [],
						children: [leftBlock],
						props: {},
					},
					{
						id: op.secondColumnId,
						type: 'column' as const,
						content: [],
						children: [rightBlock],
						props: {},
					},
				],
				props: { widths: [0.5, 0.5] },
			};
			const container = getContainer(working, op.targetLocation.parentId);
			if (!container) return doc;
			working = insertBlockAt(
				working,
				op.targetLocation.parentId,
				Math.min(op.targetLocation.index, container.length),
				columnsBlock,
			);
			return nextVersion(working);
		}

		case 'unwrapColumns': {
			return nextVersion(removeBlock(doc, op.columnsBlockId));
		}

		case 'removeColumn': {
			// Redo: remove the column from its containing columns block.
			const columnsBlock = findBlock(doc, op.columnsBlockId);
			if (!columnsBlock) return doc;
			const nextChildren = columnsBlock.children.filter(c => c.id !== op.column.id);
			const widths =
				op.newWidths ??
				Array.from(
					{ length: nextChildren.length },
					() => 1 / Math.max(1, nextChildren.length),
				);
			return nextVersion(
				updateBlock(doc, op.columnsBlockId, b => ({
					...b,
					children: nextChildren,
					props: { ...b.props, widths },
				})),
			);
		}
	}
}

/** Reverse an operation (for undo) */
function reverseOperation(doc: EditorDocument, op: Operation): EditorDocument {
	switch (op.type) {
		case 'insertText':
			// Reverse: delete the inserted text
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({
					...b,
					content: deleteTextInContent(b.content, op.offset, op.text.length),
				})),
			);

		case 'deleteText':
			// Reverse: re-insert the deleted text
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({
					...b,
					content: insertTextInContent(b.content, op.offset, op.deleted),
				})),
			);

		case 'splitBlock': {
			// Reverse: merge the two blocks back together
			const block = findBlock(doc, op.blockId);
			const newBlock = findBlock(doc, op.newBlockId);
			if (!block || !newBlock) return doc;
			const merged = mergeAdjacentSpans([...block.content, ...newBlock.content]);
			const newDoc = updateBlock(doc, op.blockId, b => ({ ...b, content: merged }));
			return nextVersion(removeBlock(newDoc, op.newBlockId));
		}

		case 'mergeBlock': {
			const prevBlock = findBlock(doc, op.prevBlockId);
			if (!prevBlock) return doc;
			const prevTextLen = getTextLength(prevBlock.content) - getTextLength(op.mergedContent);
			const [before, after] = splitContent(prevBlock.content, prevTextLen);
			const newDoc = updateBlock(doc, prevBlock.id, b => ({ ...b, content: before }));
			const restoredBlock = {
				id: op.blockId,
				// Restore the block's original type/props so undoing a list-item or
				// checkbox delete brings back the same list item — not a bare
				// paragraph. Older ops (recorded before these fields existed) fall
				// back to paragraph.
				type: op.blockType ?? ('paragraph' as const),
				content: after,
				children: op.mergedChildren,
				props: op.blockProps ?? {},
			};
			return nextVersion(insertBlockAfter(newDoc, prevBlock.id, restoredBlock));
		}

		case 'insertBlock':
			return nextVersion(removeBlock(doc, op.block.id));

		case 'deleteBlock': {
			return nextVersion(insertBlockAt(doc, op.parentId, op.index, op.block));
		}

		case 'moveBlock':
			return nextVersion(moveBlockInDoc(doc, op.blockId, op.from));

		case 'setBlockType':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({ ...b, type: op.oldType, props: op.oldProps })),
			);

		case 'setBlockProps':
			return nextVersion(updateBlock(doc, op.blockId, b => ({ ...b, props: op.oldProps })));

		case 'toggleMark':
			// Toggle is its own inverse
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({
					...b,
					content: toggleMarkInContent(b.content, op.from, op.to, op.mark),
				})),
			);

		case 'replaceContent':
			return nextVersion(
				updateBlock(doc, op.blockId, b => ({ ...b, content: op.oldContent })),
			);

		case 'replaceBlocks':
			return nextVersion(setContainer(doc, op.parentId, op.oldBlocks));

		case 'wrapInColumns': {
			// Undo: tear the columns container back out, restore the target where
			// it lived, and put the moved block back in its original spot.
			let working = removeBlock(doc, op.columnsBlockId);
			const targetContainer = getContainer(working, op.targetLocation.parentId);
			if (targetContainer) {
				working = insertBlockAt(
					working,
					op.targetLocation.parentId,
					Math.min(op.targetLocation.index, targetContainer.length),
					findBlock(doc, op.targetBlockId) ?? {
						id: op.targetBlockId,
						type: 'paragraph' as const,
						content: [],
						children: [],
						props: {},
					},
				);
			}
			const movedContainer = getContainer(working, op.movedFrom.parentId);
			if (movedContainer) {
				working = insertBlockAt(
					working,
					op.movedFrom.parentId,
					Math.min(op.movedFrom.index, movedContainer.length),
					op.movedBlock,
				);
			}
			return nextVersion(working);
		}

		case 'unwrapColumns': {
			const container = getContainer(doc, op.location.parentId);
			if (!container) return doc;
			return nextVersion(
				insertBlockAt(
					doc,
					op.location.parentId,
					Math.min(op.location.index, container.length),
					op.columnsBlock,
				),
			);
		}

		case 'removeColumn': {
			// Undo: re-insert the column at its original index.
			const columnsBlock = findBlock(doc, op.columnsBlockId);
			if (!columnsBlock) return doc;
			const nextChildren = [
				...columnsBlock.children.slice(0, op.columnIndex),
				op.column,
				...columnsBlock.children.slice(op.columnIndex),
			];
			const widths =
				op.oldWidths ??
				Array.from({ length: nextChildren.length }, () => 1 / nextChildren.length);
			return nextVersion(
				updateBlock(doc, op.columnsBlockId, b => ({
					...b,
					children: nextChildren,
					props: { ...b.props, widths },
				})),
			);
		}
	}
}

// ---- Server-driven apply (durable journal) ----
// When the in-memory stack is empty (e.g. after a reload) a host drives
// undo/redo from the server journal instead. These apply a stored transaction
// against the current document without touching the local stacks.

/** Apply the INVERSE of a transaction — serves undo from the durable journal
 *  after the local stack is gone. */
export function applyTransactionInverse(
	doc: EditorDocument,
	tx: Transaction,
): { doc: EditorDocument; selection: Selection | null } {
	let newDoc = doc;
	for (let i = tx.operations.length - 1; i >= 0; i--) {
		newDoc = reverseOperation(newDoc, tx.operations[i]!);
	}
	return { doc: newDoc, selection: tx.selectionBefore };
}

/** Apply the FORWARD operations of a transaction — serves redo from the
 *  durable journal after the local stack is gone. */
export function applyTransactionForward(
	doc: EditorDocument,
	tx: Transaction,
): { doc: EditorDocument; selection: Selection | null } {
	let newDoc = doc;
	for (const op of tx.operations) {
		newDoc = applyOperation(newDoc, op);
	}
	return { doc: newDoc, selection: tx.selectionAfter };
}
