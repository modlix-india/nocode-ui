// ============================================================
// Selection management — bridges browser Selection API with
// our document model positions. The document model uses
// { blockId, offset } pairs; the DOM uses Node + offset.
// ============================================================

import type { EditorDocument, Position, Selection } from './types';
import { getTextLength } from './types';
import { findBlock, getBlocksInOrder } from './document';

const BLOCK_ATTR = 'data-block-id';

/**
 * Is this DOM node a mention chip we should treat as atomic? Chips have
 * `data-mention="true"`. The model stores a single TextSpan for the chip
 * whose `text` is the *snapshot* label captured at insert time; the chip's
 * DOM body shows the *resolved* label (e.g. dates relabel "Today" / "Apr 12"
 * depending on the current date) which may have a different character count.
 * That mismatch means we cannot count chip text by walking its DOM text
 * nodes — we must use the stored label length (`data-mention-label`).
 */
function isChip(node: Node): node is HTMLElement {
	return node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).dataset?.mention === 'true';
}

/** Stored model text length for a chip — sourced from data-mention-label. */
function chipModelLength(el: HTMLElement): number {
	return el.dataset.mentionLabel?.length ?? 0;
}

/**
 * Should this node be skipped entirely during offset traversal? Covers the
 * affordances TextContent renders that aren't part of the model: the X-button
 * inside chips, the "(deleted)" suffix, and ZWSP-only text nodes (empty-block
 * placeholder + trailing-chip caret pad).
 */
function isOffsetSkippable(node: Node): boolean {
	if (node.nodeType === Node.TEXT_NODE) {
		const text = node.textContent ?? '';
		return text.length > 0 && text.replaceAll('​', '') === '';
	}
	if (node.nodeType === Node.ELEMENT_NODE) {
		const el = node as HTMLElement;
		return (
			el.classList?.contains('mde-mention-remove') ||
			el.classList?.contains('mde-mention-deleted-suffix')
		);
	}
	return false;
}

/** Read the current browser selection and convert to model coordinates */
export function readSelection(root: HTMLElement): Selection | null {
	const domSel = window.getSelection();
	if (!domSel || domSel.rangeCount === 0) return null;

	const anchor = domToModel(root, domSel.anchorNode, domSel.anchorOffset);
	const focus = domToModel(root, domSel.focusNode, domSel.focusOffset);

	if (!anchor || !focus) return null;

	return { anchor, focus };
}

/** Write a model selection back to the DOM */
export function writeSelection(root: HTMLElement, sel: Selection): void {
	const domSel = window.getSelection();
	if (!domSel) return;

	// Skip selection write for self-managed blocks (table, list) that handle their own focus
	const focusBlockEl = root.querySelector(`[data-block-id="${sel.focus.blockId}"]`);
	if (focusBlockEl?.querySelector('[data-list-block], [data-table-block]')) {
		return;
	}

	const anchorResult = modelToDom(root, sel.anchor);
	const focusResult = modelToDom(root, sel.focus);

	if (!anchorResult || !focusResult) return;

	try {
		const range = document.createRange();
		range.setStart(anchorResult.node, anchorResult.offset);
		range.setEnd(focusResult.node, focusResult.offset);

		domSel.removeAllRanges();

		if (sel.anchor.blockId === sel.focus.blockId && sel.anchor.offset === sel.focus.offset) {
			// Collapsed — just set the range
			domSel.addRange(range);
		} else if (
			sel.anchor.blockId === sel.focus.blockId
				? sel.anchor.offset <= sel.focus.offset
				: compareBlockOrder(root, sel.anchor.blockId, sel.focus.blockId) <= 0
		) {
			// Forward selection
			domSel.addRange(range);
		} else {
			// Backward selection — use setBaseAndExtent
			domSel.setBaseAndExtent(
				anchorResult.node,
				anchorResult.offset,
				focusResult.node,
				focusResult.offset,
			);
		}
	} catch {
		// Selection API can throw in edge cases; silently ignore
	}
}

/** Convert a DOM position (node + offset) to a model Position */
function domToModel(root: HTMLElement, node: Node | null, domOffset: number): Position | null {
	if (!node) return null;

	// Walk up to find the block element
	const blockEl = findBlockElement(root, node);
	if (!blockEl) return null;

	const blockId = blockEl.getAttribute(BLOCK_ATTR);
	if (!blockId) return null;

	// Find the content container within the block
	const contentEl = blockEl.querySelector('[data-content]') ?? blockEl;

	// Calculate the text offset by walking through text nodes
	const offset = getTextOffset(contentEl, node, domOffset);

	return { blockId, offset };
}

/** Convert a model Position to a DOM position (node + offset) */
function modelToDom(root: HTMLElement, pos: Position): { node: Node; offset: number } | null {
	const blockEl = root.querySelector(`[${BLOCK_ATTR}="${pos.blockId}"]`);
	if (!blockEl) return null;

	const contentEl = blockEl.querySelector('[data-content]') ?? blockEl;

	// Walk through text nodes to find the one containing our offset
	return findDomPosition(contentEl, pos.offset);
}

/**
 * Walk up the DOM looking for the nearest mention-chip ancestor. Returns
 * the chip element if `node` lies inside one, else null. Used by getTextOffset
 * to treat carets that land inside a chip's interior as "at the chip's right
 * edge" in the model.
 */
function closestChipAncestor(node: Node): HTMLElement | null {
	let current: Node | null = node.parentNode;
	while (current && current.nodeType === Node.ELEMENT_NODE) {
		if (isChip(current)) return current as HTMLElement;
		current = current.parentNode;
	}
	return null;
}

/**
 * Walk forward from `start` looking for the ZWSP caret-pad text node
 * TextContent renders after a paragraph-ending chip. Returns it if found,
 * otherwise null. The pad lets the browser place a real-text-node caret
 * after a contentEditable=false chip — element-offset positions past such
 * a chip are unreliable for input across browsers.
 */
function findTrailingPadTextNode(start: Node | null): Text | null {
	if (start?.nodeType !== Node.TEXT_NODE) return null;
	const text = start.textContent ?? '';
	if (text.length === 0 || text.replaceAll('​', '') !== '') return null;
	return start as Text;
}

/** Walk up the DOM tree to find the block element */
function findBlockElement(root: HTMLElement, node: Node): HTMLElement | null {
	let current: Node | null = node;
	while (current && current !== root) {
		if (current instanceof HTMLElement && current.hasAttribute(BLOCK_ATTR)) {
			return current;
		}
		current = current.parentNode;
	}
	return null;
}

/**
 * Calculate the model text offset from the start of `container` to the given
 * DOM position. The traversal is manual (not TreeWalker SHOW_TEXT) because:
 *
 * 1. Mention chips must be counted using their **stored** label length
 *    (data-mention-label), not the displayed text inside them — the date
 *    resolver re-labels chips dynamically so DOM text and model text can
 *    diverge.
 * 2. Carets that land inside a chip's interior (browser ambiguity when
 *    clicking near a contentEditable=false atom) should map to the chip's
 *    right edge rather than fractional offsets inside the chip's stored text.
 */
function getTextOffset(container: Node, targetNode: Node, targetOffset: number): number {
	// If the target itself lies inside a chip, snap to the chip's right edge.
	// walk() below stops at the chip boundary and never descends into chip text.
	const enclosingChip = closestChipAncestor(targetNode);

	let offset = 0;
	let found = false;
	let result = 0;

	const walk = (node: Node): void => {
		if (found) return;

		// If the target is an element node, targetOffset is a child index of it.
		if (node === targetNode && targetNode.nodeType === Node.ELEMENT_NODE) {
			// If the target IS a chip, snap to its left/right edge rather than
			// descending — the chip is atomic in the model.
			if (isChip(node)) {
				result = targetOffset > 0 ? offset + chipModelLength(node) : offset;
				found = true;
				return;
			}
			// Walk children up to child index `targetOffset`.
			const children = Array.from(node.childNodes);
			for (let i = 0; i < Math.min(targetOffset, children.length); i++) {
				walk(children[i]!);
				if (found) return;
			}
			result = offset;
			found = true;
			return;
		}

		// If the target text node is this node, fold in its in-node offset.
		if (node === targetNode && targetNode.nodeType === Node.TEXT_NODE) {
			result = offset + targetOffset;
			found = true;
			return;
		}

		if (isOffsetSkippable(node)) return;

		if (isChip(node)) {
			// If the target lives inside this chip, snap to the chip's right edge.
			if (enclosingChip === node) {
				result = offset + chipModelLength(node);
				found = true;
				return;
			}
			offset += chipModelLength(node);
			return;
		}

		if (node.nodeType === Node.TEXT_NODE) {
			offset += node.textContent?.length ?? 0;
			return;
		}

		if (node.nodeType === Node.ELEMENT_NODE) {
			const children = Array.from(node.childNodes);
			for (let i = 0; i < children.length; i++) {
				walk(children[i]!);
				if (found) return;
			}
		}
	};

	// Special-case: targetNode IS the container, targetOffset is its child index.
	if (targetNode === container) {
		if (container.nodeType === Node.ELEMENT_NODE) {
			const children = Array.from(container.childNodes);
			for (let i = 0; i < Math.min(targetOffset, children.length); i++) {
				walk(children[i]!);
				if (found) return result;
			}
			return offset;
		}
	}

	const children = Array.from(container.childNodes);
	for (let i = 0; i < children.length; i++) {
		walk(children[i]!);
		if (found) break;
	}

	if (found) return result;
	// Fallback (target not found inside container): return accumulated offset.
	return offset;
}

/**
 * Find the DOM position (node + offset) corresponding to a model text offset
 * within `container`. Mirrors getTextOffset's chip-aware traversal: chips are
 * atomic units sized by their stored label, never descended into.
 *
 * Caret placement rules at chip boundaries:
 *  - Target at chip start → (parent, chipChildIndex)
 *  - Target at chip end → anchor inside trailing-pad ZWSP if one exists,
 *    else (parent, chipChildIndex + 1). Real text-node anchors are required
 *    for typing past a trailing chip — element-offset positions after a
 *    contentEditable=false sibling are unreliable across browsers.
 */
function findDomPosition(
	container: Node,
	targetOffset: number,
): { node: Node; offset: number } | null {
	let offset = 0;
	let result: { node: Node; offset: number } | null = null;

	const walk = (node: Node, parent: Node, childIdx: number): void => {
		if (result) return;

		if (isOffsetSkippable(node)) return;

		if (isChip(node)) {
			const chipLen = chipModelLength(node as HTMLElement);
			const chipEnd = offset + chipLen;

			if (targetOffset === offset) {
				result = { node: parent, offset: childIdx };
				return;
			}
			if (targetOffset > offset && targetOffset <= chipEnd) {
				// Target is at the chip's right edge (or, defensively, inside its
				// model range — clamp to the right edge).
				const padTextNode = findTrailingPadTextNode(node.nextSibling);
				if (padTextNode) {
					result = { node: padTextNode, offset: 0 };
					return;
				}
				result = { node: parent, offset: childIdx + 1 };
				return;
			}
			offset = chipEnd;
			return;
		}

		if (node.nodeType === Node.TEXT_NODE) {
			const len = node.textContent?.length ?? 0;
			if (offset + len >= targetOffset) {
				const localOffset = targetOffset - offset;
				result = { node, offset: localOffset };
				return;
			}
			offset += len;
			return;
		}

		if (node.nodeType === Node.ELEMENT_NODE) {
			const children = Array.from(node.childNodes);
			for (let i = 0; i < children.length; i++) {
				walk(children[i]!, node, i);
				if (result) return;
			}
		}
	};

	const children = Array.from(container.childNodes);
	for (let i = 0; i < children.length; i++) {
		walk(children[i]!, container, i);
		if (result) break;
	}

	if (result) return result;

	// Target offset is at or past the end of all model content.
	if (targetOffset === 0) {
		return { node: container, offset: 0 };
	}

	// Past the end — anchor at the end of the last real text node so the
	// browser can place a visible caret.
	const lastNode = getLastTextNode(container);
	if (lastNode) {
		return { node: lastNode, offset: lastNode.textContent?.length ?? 0 };
	}

	return { node: container, offset: 0 };
}

/** Compare the DOM order of two blocks by their data-block-id attributes.
 *  Returns negative if a is before b, 0 if same, positive if a is after b. */
function compareBlockOrder(root: HTMLElement, blockIdA: string, blockIdB: string): number {
	const elA = root.querySelector(`[${BLOCK_ATTR}="${blockIdA}"]`);
	const elB = root.querySelector(`[${BLOCK_ATTR}="${blockIdB}"]`);
	if (!elA || !elB) return 0;
	const pos = elA.compareDocumentPosition(elB);
	if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1; // A before B
	if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1; // A after B
	return 0;
}

/** Get the last text node in a subtree */
function getLastTextNode(node: Node): Text | null {
	if (node.nodeType === Node.TEXT_NODE) return node as Text;
	for (let i = node.childNodes.length - 1; i >= 0; i--) {
		const found = getLastTextNode(node.childNodes[i]!);
		if (found) return found;
	}
	return null;
}

// ---- Selection helpers ----

/** Get the ordered selection (start always before end) — uses document order across any nesting depth. */
export function getOrderedSelection(
	doc: EditorDocument,
	sel: Selection,
): { start: Position; end: Position } {
	const flatOrder = getBlocksInOrder(doc);
	const indexOf = (id: string) => flatOrder.findIndex(b => b.id === id);
	const anchorIdx = indexOf(sel.anchor.blockId);
	const focusIdx = indexOf(sel.focus.blockId);

	if (anchorIdx < focusIdx || (anchorIdx === focusIdx && sel.anchor.offset <= sel.focus.offset)) {
		return { start: sel.anchor, end: sel.focus };
	}
	return { start: sel.focus, end: sel.anchor };
}

/** Clamp a selection so all positions are valid */
export function clampSelection(doc: EditorDocument, sel: Selection): Selection {
	return {
		anchor: clampPosition(doc, sel.anchor),
		focus: clampPosition(doc, sel.focus),
	};
}

function clampPosition(doc: EditorDocument, pos: Position): Position {
	const block = findBlock(doc, pos.blockId);
	if (!block) {
		// Block was deleted — move to first block
		const first = doc.blocks[0];
		if (!first) return pos;
		return { blockId: first.id, offset: 0 };
	}
	const maxOffset = getTextLength(block.content);
	return {
		blockId: pos.blockId,
		offset: Math.min(pos.offset, maxOffset),
	};
}
