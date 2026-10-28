// ============================================================
// Escape that closes an editor menu must not also close the popup
// around the editor.
//
// A Modlix popup closes on the Escape KEYUP (listener on document.body),
// so stopping the keydown is not enough: an editor menu that used the
// Escape keydown to close itself also swallows the matching keyup. Before
// this, Escape in the block menu inside LoopZump's New item popup closed
// the whole popup and lost the draft.
// ============================================================

let disarmPending: (() => void) | null = null;

/** Mark an Escape keydown as used by an editor menu: stop the keydown and
 *  swallow the next Escape keyup (window, capture phase) before anything
 *  around the editor sees it. Gives up after `timeoutMs` if no keyup comes. */
export function consumeEscape(
	keydown?: { preventDefault(): void; stopPropagation(): void },
	timeoutMs = 2000,
): void {
	if (keydown) {
		keydown.preventDefault();
		keydown.stopPropagation();
	}
	if (typeof window === 'undefined' || disarmPending) return;

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.key !== 'Escape') return;
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		disarm();
	};
	const timer = setTimeout(() => disarm(), timeoutMs);
	function disarm() {
		window.removeEventListener('keyup', onKeyUp, true);
		clearTimeout(timer);
		disarmPending = null;
	}
	disarmPending = disarm;
	window.addEventListener('keyup', onKeyUp, true);
}
