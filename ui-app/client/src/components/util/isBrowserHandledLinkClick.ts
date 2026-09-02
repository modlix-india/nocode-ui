import { MouseEvent } from 'react';

/*
 * Cmd/Ctrl + click, Shift + click, Alt + click and non primary buttons are the browser's own
 * gestures on an anchor: open in a new tab, open in a new window, download. Components that
 * hijack an anchor's click to do their own routing must leave these alone, because a
 * preventDefault kills the gesture and the click looks like it did nothing.
 *
 * Same check react-router's shouldProcessLinkClick makes before it routes internally.
 */
export function isBrowserHandledLinkClick(e: MouseEvent<HTMLElement>): boolean {
	return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
