import { LayoutItem } from './reportTypes';

/**
 * The dashboard's tile grid: 12 columns, rows of a fixed height, tiles placed by whole cells.
 * Pure functions; the Dashboard turns pointer pixels into cells and calls these.
 *
 * Collisions are settled the same way every time: the tile being moved or resized is pinned
 * where the user put it, every other tile (in reading order) drops into the highest free
 * spot in its own columns, and the result is packed upwards. So a drag onto another tile
 * swaps them, and no gaps are left behind.
 */

export const COLS = 12;
export const MIN_W = 2;
export const MIN_H = 1;
export const MAX_H = 12;

export function clampItem(it: LayoutItem): LayoutItem {
	const w = Math.max(MIN_W, Math.min(COLS, Math.round(it.w) || MIN_W));
	const h = Math.max(MIN_H, Math.min(MAX_H, Math.round(it.h) || MIN_H));
	const x = Math.max(0, Math.min(COLS - w, Math.round(it.x) || 0));
	const y = Math.max(0, Math.round(it.y) || 0);
	return it.isNew ? { id: it.id, x, y, w, h, isNew: true } : { id: it.id, x, y, w, h };
}

export function collides(a: LayoutItem, b: LayoutItem): boolean {
	if (a.id === b.id) return false;
	return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** Reading order: top to bottom, then left to right. This is also the phone's one column. */
export function sortLayout(layout: LayoutItem[]): LayoutItem[] {
	return [...layout].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id));
}

function lowestFreeY(item: LayoutItem, placed: LayoutItem[]): number {
	let y = 0;
	for (;;) {
		const probe = { ...item, y };
		const hit = placed.find(p => collides(probe, p));
		if (!hit) return y;
		y = hit.y + hit.h;
	}
}

/** Settles overlaps with `pinned` fixed, then packs everything upwards. */
export function resolveLayout(layout: LayoutItem[], pinnedId?: string): LayoutItem[] {
	const items = layout.map(clampItem);
	const pinned = pinnedId ? items.find(i => i.id === pinnedId) : undefined;
	const placed: LayoutItem[] = pinned ? [pinned] : [];
	for (const it of sortLayout(items)) {
		if (it.id === pinned?.id) continue;
		placed.push({ ...it, y: lowestFreeY(it, placed) });
	}
	return compact(placed);
}

/** Moves every tile up as far as it goes, in reading order. */
export function compact(layout: LayoutItem[]): LayoutItem[] {
	const out: LayoutItem[] = [];
	for (const it of sortLayout(layout)) out.push({ ...it, y: lowestFreeY(it, out) });
	return out;
}

/** The first spot (top to bottom, left to right) where a w x h tile fits. */
export function firstFit(layout: LayoutItem[], w: number, h: number): { x: number; y: number } {
	const cw = Math.max(MIN_W, Math.min(COLS, w));
	const bottom = layout.reduce((m, i) => Math.max(m, i.y + i.h), 0);
	for (let y = 0; y <= bottom; y++) {
		for (let x = 0; x + cw <= COLS; x++) {
			const probe = { id: '\u0000', x, y, w: cw, h };
			if (!layout.some(i => collides(probe, i))) return { x, y };
		}
	}
	return { x: 0, y: bottom };
}

export function addItem(layout: LayoutItem[], id: string, w: number, h: number): LayoutItem[] {
	const size = clampItem({ id, x: 0, y: 0, w, h });
	const at = firstFit(layout, size.w, size.h);
	return [...layout, { ...size, ...at }];
}

export function moveItem(layout: LayoutItem[], id: string, x: number, y: number): LayoutItem[] {
	return resolveLayout(
		layout.map(i => (i.id === id ? { ...i, x, y } : i)),
		id,
	);
}

export function resizeItem(layout: LayoutItem[], id: string, w: number, h: number): LayoutItem[] {
	return resolveLayout(
		layout.map(i => {
			if (i.id !== id) return i;
			const cw = Math.max(MIN_W, Math.min(COLS - i.x, Math.round(w)));
			return { ...i, w: cw, h };
		}),
		id,
	);
}

/**
 * Phone: one column in reading order; "move up" / "move down" swaps a tile with its
 * neighbour in that order (their grid spots are swapped, so the wide layout follows).
 */
export function moveInOrder(layout: LayoutItem[], id: string, dir: -1 | 1): LayoutItem[] {
	const order = sortLayout(layout);
	const i = order.findIndex(e => e.id === id);
	const j = i + dir;
	if (i < 0 || j < 0 || j >= order.length) return layout;
	const a = order[i];
	const b = order[j];
	// Place the moving tile at the neighbour's spot, the neighbour right after it.
	const moved = order.map(e => {
		if (e.id === a.id) return { ...e, x: Math.min(b.x, COLS - e.w), y: b.y };
		if (e.id === b.id) return { ...e, x: Math.min(a.x, COLS - e.w), y: a.y };
		return e;
	});
	const settled = resolveLayout(moved, a.id);
	const wanted = order.map(e => e.id);
	wanted[i] = b.id;
	wanted[j] = a.id;
	if (sortLayout(settled).every((e, k) => e.id === wanted[k])) return settled;
	// Tiles of different sizes can pack back into the old order: flow them in the new one.
	const byId = new Map(layout.map(e => [e.id, e]));
	return flowLayout(wanted.map(k => byId.get(k)!));
}

/**
 * Places tiles in exactly this reading order: each one at the first spot that fits at or
 * after the previous tile's spot.
 */
export function flowLayout(ordered: LayoutItem[]): LayoutItem[] {
	const out: LayoutItem[] = [];
	let cx = 0;
	let cy = 0;
	for (const raw of ordered) {
		const it = clampItem(raw);
		let placed: LayoutItem | undefined;
		let y = cy;
		while (!placed) {
			for (let x = y === cy ? cx : 0; x + it.w <= COLS; x++) {
				const probe = { ...it, x, y };
				if (!out.some(o => collides(probe, o))) {
					placed = probe;
					break;
				}
			}
			y++;
		}
		out.push(placed);
		cx = placed.x + placed.w;
		cy = placed.y;
	}
	return out;
}

/** A tile this wide or narrower takes half the width on a tablet; wider ones take all of it. */
export const TABLET_HALF_MAX_W = 4;

/**
 * Tablet: the saved layout squeezed to a tablet's width made small tiles unreadable (a KPI
 * sized 2 or 3 of 12 cut its number to "₹162…" and its label off). So the tiles stack in
 * reading order in two columns: small ones side by side at half the width, the rest full
 * width. Only the view changes; the saved layout stays the desktop one.
 */
export function tabletLayout(ordered: LayoutItem[]): LayoutItem[] {
	return flowLayout(
		ordered.map(it => ({ ...it, w: it.w <= TABLET_HALF_MAX_W ? COLS / 2 : COLS })),
	);
}

/**
 * Puts new tiles at the top (a default shipped later, CONTRACT section 5): they flow into
 * rows from the top left, and every existing tile moves down by the height they take.
 */
export function placeAtTop(layout: LayoutItem[], items: LayoutItem[]): LayoutItem[] {
	if (!items.length) return layout;
	const top = flowLayout(items);
	const height = top.reduce((m, i) => Math.max(m, i.y + i.h), 0);
	return [...top, ...layout.map(i => ({ ...i, y: i.y + height }))];
}

/** Pixels to cells for a drag or a resize. */
export function pixelsToCells(px: number, cellPx: number): number {
	if (!cellPx || !Number.isFinite(px)) return 0;
	return Math.round(px / cellPx);
}
