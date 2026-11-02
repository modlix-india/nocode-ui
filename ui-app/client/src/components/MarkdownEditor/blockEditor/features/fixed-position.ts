import { useLayoutEffect, useState, type RefObject } from 'react';

// ============================================================
// Placing `position: fixed` popovers (block menu, format toolbar)
// from viewport coordinates.
//
// `fixed` is NOT always relative to the viewport: an ancestor with a
// transform, filter, backdrop-filter, perspective, contain or will-change
// becomes the containing block, and if that ancestor scrolls, the popover
// scrolls with its content. A Modlix popup's backdrop (blur) is such an
// ancestor, so an editor inside a scrolled popup put its menus off by the
// popup's scroll offset. These helpers measure that offset and convert.
// ============================================================

export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

/** The box a fixed element placed inside `host` is laid out against, in
 *  viewport coordinates: the viewport itself unless an ancestor changes the
 *  containing block. */
export interface FixedBox {
	x: number;
	y: number;
	right: number;
	bottom: number;
}

function viewportBox(): FixedBox {
	const w = typeof window === 'undefined' ? 0 : window.innerWidth;
	const h = typeof window === 'undefined' ? 0 : window.innerHeight;
	return { x: 0, y: 0, right: w, bottom: h };
}

/** Measure the containing block of `position: fixed` inside `host` with a
 *  stretched, invisible probe that is removed straight away. */
export function fixedContainingBlockBox(host: Element | null | undefined): FixedBox {
	if (!host || typeof document === 'undefined') return viewportBox();
	const probe = document.createElement('div');
	probe.style.cssText =
		'position:fixed;left:0;top:0;right:0;bottom:0;visibility:hidden;pointer-events:none;';
	host.appendChild(probe);
	const rect = probe.getBoundingClientRect();
	probe.remove();
	return { x: rect.left, y: rect.top, right: rect.right, bottom: rect.bottom };
}

/** Where `left: 0; top: 0` of a fixed element placed inside `host` really
 *  lands in the viewport. (0, 0) when nothing above it changes the
 *  containing block. */
export function fixedContainingBlockOffset(host: Element | null | undefined): Point {
	if (!host) return { x: 0, y: 0 };
	const box = fixedContainingBlockBox(host);
	return { x: box.x, y: box.y };
}

/** The containing block for a fixed element, re-measured whenever `deps`
 *  change (before paint). Measures against the element's parent. */
export function useFixedContainingBlock(
	ref: RefObject<HTMLElement | null>,
	deps: unknown[],
): FixedBox {
	const [box, setBox] = useState<FixedBox>(viewportBox);
	useLayoutEffect(() => {
		const next = fixedContainingBlockBox(ref.current?.parentElement);
		setBox(prev =>
			prev.x === next.x &&
			prev.y === next.y &&
			prev.right === next.right &&
			prev.bottom === next.bottom
				? prev
				: next,
		);
		// eslint-disable-next-line @eslint-react/exhaustive-deps
	}, deps);
	return box;
}

/**
 * Style for a caret popover (slash menu, mention picker, emoji picker) anchored
 * at the caret's viewport position: below the caret, or flipped up (anchored
 * by its bottom edge 8px above the caret) when `estimatedHeight` would run
 * past the bottom of the viewport. Converted for the containing block `box`.
 */
export function caretPopoverPlacement(
	position: Point,
	estimatedHeight: number,
	box: FixedBox,
	viewportHeight: number,
): { left: number; top?: number; bottom?: number } {
	const flipUp = position.y + estimatedHeight > viewportHeight - 20;
	return flipUp
		? { left: position.x - box.x, bottom: box.bottom - (position.y - 8) }
		: { left: position.x - box.x, top: position.y - box.y };
}

/** Convert a viewport position into the `left` / `top` to set on a fixed
 *  element whose containing block starts at `offset`. */
export function toFixedCoords(viewportPos: Point, offset: Point): Point {
	return { x: viewportPos.x - offset.x, y: viewportPos.y - offset.y };
}

/**
 * Viewport position for a menu whose top-left corner is anchored at `anchor`:
 * kept `margin` inside the viewport horizontally; when it would run off the
 * bottom it flips to sit above the anchor, and when it fits neither way it is
 * pinned as low as it can go while staying fully visible.
 */
export function placeInViewport(
	anchor: Point,
	size: Size,
	viewport: Size,
	margin = 8,
	gap = 8,
): Point {
	let x = anchor.x;
	let y = anchor.y;
	if (x + size.width > viewport.width - margin) x = viewport.width - size.width - margin;
	if (x < margin) x = margin;
	if (y + size.height > viewport.height - margin) {
		const above = anchor.y - size.height - gap;
		y = above >= margin ? above : Math.max(margin, viewport.height - size.height - margin);
	}
	if (y < margin) y = margin;
	return { x, y };
}

/** The anchor after the block it belongs to has moved (scroll, layout):
 *  shifted by however far the block moved since the menu opened. */
export function followAnchor(anchor: Point, blockAtOpen: Point, blockNow: Point): Point {
	return {
		x: anchor.x + (blockNow.x - blockAtOpen.x),
		y: anchor.y + (blockNow.y - blockAtOpen.y),
	};
}
