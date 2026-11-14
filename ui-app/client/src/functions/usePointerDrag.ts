import React, { useEffect, useRef } from 'react';

/**
 * Move a fixed element by dragging it, with mouse, touch or pen (Pointer Events).
 *
 * The same rules as the draft agent's floating button (DraftAgent's FloatingButton):
 * a press that moves less than DRAG_THRESHOLD pixels is a tap and passes through to
 * whatever was pressed, untouched; past it the press is a drag, the element follows the
 * pointer and is kept `inset` pixels inside the window. From the moment a drag starts
 * until the turn after its release, the element swallows the pointer and mouse events
 * in the CAPTURE phase (moves, the release, the click the browser fires after it, a
 * long-press context menu), so nothing inside it (a Button, a link) reacts to a drag.
 * Keyboard events always pass. Used by Grid's `dragToMove`.
 *
 * Positions are kept as distances from the RIGHT and BOTTOM edges of the window, so an
 * element parked bottom right stays bottom right when the window is resized, turned or
 * opened on another device.
 */

export const DRAG_THRESHOLD = 5;

export interface EdgeOffsets {
	right: number;
	bottom: number;
}

export interface Size {
	width: number;
	height: number;
}

/**
 * Where each remembered element was last dragged on this visit, by its personalization
 * path. Saves are debounced, so an element shown again right after a drag (a panel it
 * opened closed within the debounce) would read the older saved spot and jump back;
 * this one wins for the rest of the visit.
 */
export const draggedThisVisit = new Map<string, EdgeOffsets>();

/** Events a drag keeps from the element's children, from its start to its release. */
export const SWALLOWED_WHILE_DRAGGING = [
	'pointermove',
	'pointerup',
	'pointercancel',
	'mousemove',
	'mouseup',
	'click',
	'auxclick',
	'dblclick',
	'contextmenu',
	'touchmove',
	'touchend',
] as const;

export function clamp(v: number, lo: number, hi: number): number {
	// A window narrower than the element plus its insets: hug the low edge.
	if (hi < lo) return lo;
	return Math.min(hi, Math.max(lo, v));
}

/** The window an element with `position: fixed` is placed in, without a scrollbar. */
export function viewportSize(): Size {
	const de = typeof document !== 'undefined' ? document.documentElement : undefined;
	return {
		width: de?.clientWidth || window.innerWidth,
		height: de?.clientHeight || window.innerHeight,
	};
}

/** Keep an element of `size` at least `inset` pixels inside the window. */
export function clampOffsets(
	offsets: EdgeOffsets,
	size: Size,
	inset: number,
	viewport: Size,
): EdgeOffsets {
	return {
		right: clamp(offsets.right, inset, viewport.width - size.width - inset),
		bottom: clamp(offsets.bottom, inset, viewport.height - size.height - inset),
	};
}

/** Whether a stored value is a usable position. */
export function isEdgeOffsets(v: any): v is EdgeOffsets {
	return !!v && typeof v === 'object' && Number.isFinite(v.right) && Number.isFinite(v.bottom);
}

export interface PointerDragOptions {
	/** Keep the element this many pixels inside the window. */
	inset: number;
	/** Once, when the press moves past the threshold. */
	onStart?: () => void;
	/** Every move past the threshold, already kept inside the window. */
	onMove: (offsets: EdgeOffsets) => void;
	/** Once, at the release of a drag (not of a tap). */
	onEnd: (offsets: EdgeOffsets) => void;
	viewport?: () => Size;
}

/**
 * Starts tracking a press on `el`. The moves and the release are followed on the
 * window in the capture phase, so they are seen before anything can stop them and
 * even when the pointer leaves the element. No pointer capture is taken: a tap's
 * click must still reach the child that was pressed.
 *
 * Returns a function that tells whether the press turned into a drag.
 */
export function startPointerDrag(
	el: HTMLElement,
	e: { button: number; clientX: number; clientY: number; isPrimary?: boolean },
	{ inset, onStart, onMove, onEnd, viewport = viewportSize }: PointerDragOptions,
): () => boolean {
	let moved = false;
	if (e.button !== 0 || e.isPrimary === false) return () => moved;

	const rect = el.getBoundingClientRect();
	const startX = e.clientX;
	const startY = e.clientY;
	let last: EdgeOffsets | undefined;

	const at = (ev: { clientX: number; clientY: number }): EdgeOffsets => {
		const vp = viewport();
		const left = clamp(rect.left + ev.clientX - startX, inset, vp.width - rect.width - inset);
		const top = clamp(rect.top + ev.clientY - startY, inset, vp.height - rect.height - inset);
		// Whole pixels: what is saved and shown is the same on every screen density.
		return {
			right: Math.round(vp.width - left - rect.width),
			bottom: Math.round(vp.height - top - rect.height),
		};
	};

	const move = (ev: PointerEvent) => {
		const dx = ev.clientX - startX;
		const dy = ev.clientY - startY;
		if (!moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
		if (!moved) {
			moved = true;
			onStart?.();
		}
		last = at(ev);
		onMove(last);
	};
	const up = () => {
		window.removeEventListener('pointermove', move, true);
		window.removeEventListener('pointerup', up, true);
		window.removeEventListener('pointercancel', up, true);
		if (moved && last) onEnd(last);
	};
	window.addEventListener('pointermove', move, true);
	window.addEventListener('pointerup', up, true);
	window.addEventListener('pointercancel', up, true);
	return () => moved;
}

/**
 * Makes the element in `ref` draggable while `enabled`. Off: no listener at all.
 * The element's own styles place it (position fixed); the caller applies the offsets.
 */
export function usePointerDrag(
	ref: React.RefObject<HTMLElement | null>,
	enabled: boolean,
	options: PointerDragOptions,
): void {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const el = ref.current;
		if (!enabled || !el) return;

		let dragging = false;
		let releaseTimer: ReturnType<typeof setTimeout> | undefined;

		const swallow = (e: Event) => {
			if (!dragging) return;
			e.stopPropagation();
			if (e.cancelable) e.preventDefault();
		};

		const onDown = (e: PointerEvent) => {
			if (releaseTimer) clearTimeout(releaseTimer);
			dragging = false;
			startPointerDrag(el, e, {
				inset: optionsRef.current.inset,
				viewport: optionsRef.current.viewport,
				onStart: () => {
					dragging = true;
					optionsRef.current.onStart?.();
				},
				onMove: o => optionsRef.current.onMove(o),
				onEnd: o => {
					// The release, and the click the browser fires right after it, are the
					// drag's; a touch drag may fire no click, so this ends with the turn.
					releaseTimer = setTimeout(() => (dragging = false), 0);
					optionsRef.current.onEnd(o);
				},
			});
		};

		el.addEventListener('pointerdown', onDown, true);
		SWALLOWED_WHILE_DRAGGING.forEach(t => el.addEventListener(t, swallow, true));
		return () => {
			if (releaseTimer) clearTimeout(releaseTimer);
			el.removeEventListener('pointerdown', onDown, true);
			SWALLOWED_WHILE_DRAGGING.forEach(t => el.removeEventListener(t, swallow, true));
		};
	}, [enabled, ref]);
}
