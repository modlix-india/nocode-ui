/**
 * The floating panels that are open right now (Popover, Dropdown).
 *
 * Opening one closes every other that does not contain it. Two sibling panels never stack
 * up (the next row's action menu used to open while the previous one sat out its leave
 * delay), yet a panel opened from inside another one, a dropdown in a popover's panel, keeps
 * its parent open.
 */
export type FloatingPanel = {
	/** Close this panel. */
	close: () => void;
	/** Whether the element is part of this panel: its trigger or its (portalled) body. */
	contains: (el: Element) => boolean;
	/** The element this panel opened from. */
	anchor: () => Element | null | undefined;
};

const openPanels = new Set<FloatingPanel>();

/** Registers an opened panel, closing the unrelated ones. Returns the deregistration. */
export function openFloating(panel: FloatingPanel): () => void {
	const anchor = panel.anchor();
	for (const other of Array.from(openPanels)) {
		if (other === panel) continue;
		if (anchor && other.contains(anchor)) continue;
		openPanels.delete(other);
		other.close();
	}
	openPanels.add(panel);
	return () => {
		openPanels.delete(panel);
	};
}

/**
 * Grace period before a leave-to-close panel closes: enough to cross the gap between a
 * trigger and its panel. Shared so Popover and Dropdown treat the gesture alike.
 */
export const MOUSE_LEAVE_CLOSE_DELAY = 400;
