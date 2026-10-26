// ============================================================
// Transaction fingerprints for the durable undo journal's conflict guard.
//
// A command's fingerprint is a hash of the blocks it touched, captured at the
// moment the transaction sealed (i.e. their post-edit state). Before a
// server-driven undo/redo is applied (e.g. after a reload), the host re-hashes
// those same blocks in the *current* document and compares: a mismatch means
// someone else changed the region since, so the undo is skipped rather than
// clobbering their edit. Block leases already serialize same-block editing, so
// this mainly catches cross-session collaboration.
// ============================================================

import type { Block, EditorDocument, Transaction } from './types';
import { findBlock } from './document';

/** Collect every block id a transaction references. */
function affectedBlockIds(tx: Transaction): string[] {
	const ids = new Set<string>();
	const add = (id: string | null | undefined) => {
		if (id) ids.add(id);
	};
	for (const op of tx.operations) {
		switch (op.type) {
			case 'insertText':
			case 'deleteText':
			case 'toggleMark':
			case 'replaceContent':
			case 'setBlockProps':
			case 'setBlockType':
			case 'moveBlock':
				add(op.blockId);
				break;
			case 'splitBlock':
				add(op.blockId);
				add(op.newBlockId);
				break;
			case 'mergeBlock':
				add(op.blockId);
				add(op.prevBlockId);
				break;
			case 'insertBlock':
				add(op.block.id);
				add(op.parentId);
				break;
			case 'deleteBlock':
				add(op.blockId);
				add(op.parentId);
				break;
			case 'replaceBlocks':
				add(op.parentId);
				break;
			case 'wrapInColumns':
				add(op.columnsBlockId);
				add(op.targetBlockId);
				add(op.movedBlock.id);
				break;
			case 'unwrapColumns':
			case 'removeColumn':
				add(op.columnsBlockId);
				break;
		}
	}
	return [...ids].sort();
}

/** A compact, order-stable projection of a block's undoable state. */
function projectBlock(b: Block): string {
	return [
		b.type,
		JSON.stringify(b.content),
		JSON.stringify(b.props),
		b.children.map(c => c.id).join(','),
	].join('');
}

/** cyrb53 — fast, well-distributed non-cryptographic 53-bit string hash. */
function cyrb53(str: string, seed = 0): string {
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for (let i = 0; i < str.length; i++) {
		const ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * Hash the current state of the blocks a transaction touches. Deterministic
 * for a given (doc, tx). Missing blocks hash as a sentinel so a
 * present-vs-deleted difference still trips the guard.
 */
export function fingerprintTransaction(doc: EditorDocument, tx: Transaction): string {
	const parts: string[] = [];
	for (const id of affectedBlockIds(tx)) {
		const b = findBlock(doc, id);
		parts.push(id + '=' + (b ? projectBlock(b) : '∅'));
	}
	return cyrb53(parts.join(''));
}
