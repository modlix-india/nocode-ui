// Immutable helpers for mutating a block list. Ids come from the platform's shortUUID.

import { shortUUID } from '../../../util/shortUUID';
import { Block, BlockType, BLOCK_TYPES } from './blockTypes';

export function createBlock(type: BlockType): Block {
	return { id: shortUUID(), type, props: { ...BLOCK_TYPES[type].defaults } };
}

export function insertBlock(blocks: Block[], block: Block, index: number): Block[] {
	const next = [...(blocks ?? [])];
	next.splice(Math.max(0, Math.min(index, next.length)), 0, block);
	return next;
}

export function moveBlock(blocks: Block[], id: string, toIndex: number): Block[] {
	const list = blocks ?? [];
	const from = list.findIndex(b => b.id === id);
	if (from === -1) return list;
	const next = [...list];
	const [moved] = next.splice(from, 1);
	// The removal shifts indices after `from` left by one.
	const idx = from < toIndex ? toIndex - 1 : toIndex;
	next.splice(Math.max(0, Math.min(idx, next.length)), 0, moved);
	return next;
}

export function removeBlock(blocks: Block[], id: string): Block[] {
	return (blocks ?? []).filter(b => b.id !== id);
}

export function duplicateBlock(blocks: Block[], id: string): Block[] {
	const list = blocks ?? [];
	const idx = list.findIndex(b => b.id === id);
	if (idx === -1) return list;
	const copy: Block = { ...list[idx], id: shortUUID(), props: { ...list[idx].props } };
	const next = [...list];
	next.splice(idx + 1, 0, copy);
	return next;
}

export function updateBlockProps(blocks: Block[], id: string, props: Record<string, any>): Block[] {
	return (blocks ?? []).map(b => (b.id === id ? { ...b, props: { ...b.props, ...props } } : b));
}
