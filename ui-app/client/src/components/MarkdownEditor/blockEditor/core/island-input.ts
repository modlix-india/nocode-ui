// ============================================================
// Form boxes inside contentEditable=false islands (an image's W and H).
//
// A mouse click on such a box focuses it, but Chrome leaves the document
// selection where the click landed in the editing host: a caret in the
// island's text beside the box ("W|"). Keys then go to that caret, which is
// not editable, and nothing is typed until the box's own text is selected.
// The editor must also leave the selection alone while the box has focus:
// reading it would move the editor's caret into the island, and writing the
// caret back would take the keys from the box.
// ============================================================

import type React from 'react';

/** Bubbled from a box to its editor: put the caret back where it was in the text. */
export const RETURN_TO_TEXT_EVENT = 'mde-return-to-text';

const FORM_CONTROL = /^(INPUT|TEXTAREA|SELECT)$/;

/** True when a form box inside the editor root has focus: the selection is the box's. */
export function isFormControlFocusedIn(root: HTMLElement | null): boolean {
	const ae = typeof document === 'undefined' ? null : document.activeElement;
	return !!root && !!ae && FORM_CONTROL.test(ae.tagName) && root.contains(ae);
}

/**
 * onMouseDown for a box in an island. A first click focuses the box from code, which puts the
 * selection in it (the click's own default would leave it in the island text), and selects its
 * text so typing replaces it. Once the box has focus, clicks place the caret as usual.
 */
export function focusIslandInput(e: React.MouseEvent<HTMLInputElement>): void {
	e.stopPropagation();
	if (e.button !== 0) return;
	const input = e.currentTarget;
	if (document.activeElement === input) return;
	e.preventDefault();
	input.focus();
	input.select();
}

/** Leave a box for the text: the editor focuses itself at the caret it had. */
export function returnToText(from: HTMLElement): void {
	from.dispatchEvent(new CustomEvent(RETURN_TO_TEXT_EVENT, { bubbles: true }));
}
