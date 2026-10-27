// ============================================================
// useMentionBridge — small contract that lets self-managed cells (list
// items, table cells) drive the editor's shared MentionPicker without
// going through the regular TextSpan pipeline.
//
// Cells call `refresh(cellElement, getPlainText)` after every input event;
// the hook scans for a fresh `@filter` token near the caret and fires a
// window event the editor listens for. On user selection, the editor
// dispatches `mde-mention-fill` back to the cell with the picked item;
// the cell does its own splice (text or TextSpan[]) and commits.
// ============================================================

import { useCallback, useEffect, useRef } from 'react';
import type { MentionItem } from './mention-types';

export interface MentionBridgeArgs {
	/** Stable id for this cell. Used to route the `mde-mention-fill` event
	 *  back to the right cell. Must not collide with other open cells. */
	source: string;
	/** Skip detection when the cell is read-only or providers aren't wired. */
	enabled: boolean;
	/** Called when the user picks an item.
	 *  - `triggerOffset` is the index of "@" in the cell's plain text.
	 *  - `cursorOffset` is the caret position when the picker opened.
	 *  Cells use this range to splice the chip into their model. */
	onInsert: (item: MentionItem, triggerOffset: number, cursorOffset: number) => void;
}

interface PendingTrigger {
	triggerOffset: number;
	cursorOffset: number;
}

/**
 * Read the cell's plain text length up to the caret. Walks the DOM and
 * sums text-node lengths until the caret's container, then adds the
 * caret offset within that container. Chip elements are atomic — they
 * contribute their `data-mention-label` length (or the chip's textContent
 * length as a fallback).
 */
function getCaretPlainOffset(root: HTMLElement): number {
	const sel = globalThis.getSelection?.();
	if (!sel || sel.rangeCount === 0) return -1;
	const range = sel.getRangeAt(0);
	if (!root.contains(range.endContainer)) return -1;

	let offset = 0;
	let stop = false;
	const walk = (node: Node) => {
		if (stop) return;
		if (node === range.endContainer) {
			if (node.nodeType === Node.TEXT_NODE) {
				offset += range.endOffset;
			} else {
				for (let i = 0; i < range.endOffset; i++) {
					const child = node.childNodes[i];
					offset += childLength(child);
				}
			}
			stop = true;
			return;
		}
		if (node.nodeType === Node.TEXT_NODE) {
			offset += node.textContent?.length ?? 0;
			return;
		}
		if (node instanceof HTMLElement && node.dataset.mention === 'true') {
			offset += chipTextLength(node);
			return;
		}
		for (const child of Array.from(node.childNodes)) walk(child);
	};
	walk(root);
	return offset;
}

function childLength(node: Node): number {
	if (node.nodeType === Node.TEXT_NODE) return node.textContent?.length ?? 0;
	if (node instanceof HTMLElement && node.dataset.mention === 'true') {
		return chipTextLength(node);
	}
	return node.textContent?.length ?? 0;
}

function chipTextLength(el: HTMLElement): number {
	return el.dataset.mentionLabel?.length ?? el.textContent?.length ?? 0;
}

/**
 * Returns the chip element immediately before the current caret position
 * inside `root`, or null. Used by surfaces that want to delete the chip on
 * Backspace at its right edge — the browser's atomic-delete on
 * contentEditable=false is unreliable when the chip has interactive children
 * (e.g. the hover-X button), so cells take the deletion into their own hands.
 */
export function chipBeforeCaret(root: HTMLElement): HTMLElement | null {
	const sel = globalThis.getSelection?.();
	if (!sel || sel.rangeCount === 0) return null;
	if (!sel.isCollapsed) return null;
	const range = sel.getRangeAt(0);
	if (!root.contains(range.endContainer)) return null;
	// Walk backward from the caret. The chip is the element node immediately
	// to the left of the caret. ZWSP padding (the caret-affordance we inject
	// after a trailing chip) is treated as transparent — caret sitting at
	// its right edge is logically "right after the chip".
	let node: Node | null;
	const container = range.endContainer;
	if (container.nodeType === Node.TEXT_NODE) {
		const before = (container.textContent ?? '').slice(0, range.endOffset);
		if (before.replaceAll('​', '') !== '') return null;
		node = container.previousSibling;
	} else {
		if (range.endOffset === 0) return null;
		node = container.childNodes[range.endOffset - 1] ?? null;
	}
	// Skip empty / ZWSP-only text nodes that sit between caret and the chip.
	while (node && node.nodeType === Node.TEXT_NODE) {
		const visible = (node.textContent ?? '').replaceAll('​', '');
		if (visible !== '') return null;
		node = node.previousSibling;
	}
	if (node instanceof HTMLElement && node.dataset.mention === 'true') {
		return node;
	}
	return null;
}

/** Plain-text view of the cell, treating chips atomically. */
export function readCellPlainText(root: HTMLElement): string {
	let out = '';
	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			out += node.textContent ?? '';
			return;
		}
		if (node instanceof HTMLElement && node.dataset.mention === 'true') {
			out += node.dataset.mentionLabel ?? node.textContent ?? '';
			return;
		}
		for (const child of Array.from(node.childNodes)) walk(child);
	};
	walk(root);
	return out;
}

/**
 * Hook that detects `@filter` patterns near the caret in a self-managed
 * cell and bridges to the editor's MentionPicker via window events.
 */
export function useMentionBridge({ source, enabled, onInsert }: MentionBridgeArgs) {
	const pendingRef = useRef<PendingTrigger | null>(null);
	// Anchors a dismissed "@" so the picker doesn't re-open immediately when
	// the user presses Escape and continues typing the same prefix.
	const dismissedAtRef = useRef<number | null>(null);

	const close = useCallback(() => {
		if (pendingRef.current) {
			globalThis.dispatchEvent(new CustomEvent('mde-mention-close', { detail: { source } }));
			pendingRef.current = null;
		}
	}, [source]);

	const refresh = useCallback(
		(cellEl: HTMLElement | null) => {
			if (!enabled || !cellEl) {
				close();
				return;
			}
			const cursorOffset = getCaretPlainOffset(cellEl);
			if (cursorOffset < 0) {
				close();
				return;
			}
			const text = readCellPlainText(cellEl);
			const before = text.slice(0, cursorOffset);
			const atIdx = before.lastIndexOf('@');
			if (atIdx === -1) {
				close();
				return;
			}
			if (atIdx !== 0 && !/\s/.test(text[atIdx - 1])) {
				close();
				return;
			}
			const dismissed = dismissedAtRef.current;
			if (dismissed !== null && dismissed === atIdx) {
				close();
				return;
			}

			const filter = before.slice(atIdx + 1);
			if (filter.length > 40 || /\n/.test(filter)) {
				close();
				return;
			}

			const sel = globalThis.getSelection?.();
			const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
			const rect = range?.getBoundingClientRect();
			const x = rect?.left ?? 0;
			const y = (rect?.bottom ?? 0) + 4;

			pendingRef.current = { triggerOffset: atIdx, cursorOffset };
			globalThis.dispatchEvent(
				new CustomEvent('mde-mention-trigger', {
					detail: { source, filter, position: { x, y } },
				}),
			);
		},
		[enabled, source, close],
	);

	// Listen for picker outcomes addressed to this source.
	useEffect(() => {
		if (!enabled) return;
		const onFill = (e: Event) => {
			const detail = (e as CustomEvent).detail as { source: string; item: MentionItem };
			if (detail.source !== source) return;
			const pending = pendingRef.current;
			if (!pending) return;
			pendingRef.current = null;
			dismissedAtRef.current = null;
			onInsert(detail.item, pending.triggerOffset, pending.cursorOffset);
		};
		const onDismiss = (e: Event) => {
			const detail = (e as CustomEvent).detail as { source: string };
			if (detail.source !== source) return;
			if (pendingRef.current) {
				dismissedAtRef.current = pendingRef.current.triggerOffset;
			}
			pendingRef.current = null;
		};
		globalThis.addEventListener('mde-mention-fill', onFill as EventListener);
		globalThis.addEventListener('mde-mention-dismiss', onDismiss as EventListener);
		return () => {
			globalThis.removeEventListener('mde-mention-fill', onFill as EventListener);
			globalThis.removeEventListener('mde-mention-dismiss', onDismiss as EventListener);
		};
	}, [enabled, source, onInsert]);

	// Reset dismissal anchor whenever the source changes (different cell).
	useEffect(() => {
		dismissedAtRef.current = null;
		pendingRef.current = null;
	}, [source]);

	return { refresh, close } as const;
}
