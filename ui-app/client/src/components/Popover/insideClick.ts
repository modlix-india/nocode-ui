// The controls whose click is an action that is done with the panel: a Button, a Menu item
// and a Link. Fields, toggles, radios, calendars and dropdowns are not in this list, so a
// filter or date panel stays open while it is being filled in.
const ACTION_SELECTOR = '.comp.compButton, .comp.compMenu, .comp.compLink';

/**
 * Whether a click on `target` inside a popover's panel should close that panel.
 *
 * The panel stops click propagation (a click inside must not reach the body listener that
 * closes on an outside click), so an action menu stayed open over the confirm screen one of
 * its buttons had just opened, until the next tap somewhere else. A click on an action
 * control closes it; anything else (a field, a toggle, padding) leaves it open.
 */
export function isPanelActionClick(
	target: EventTarget | null,
	panel: HTMLElement | null | undefined,
): boolean {
	if (!panel || !(target instanceof Element) || !panel.contains(target)) return false;

	const action = target.closest(ACTION_SELECTOR);
	if (!action || !panel.contains(action)) return false;

	// A popover nested in this panel owns its trigger: that click opens the inner panel and
	// must keep this one, the inner panel's anchor, open. The panel itself is a compPopover,
	// so the nearest compPopover above the action is the panel only when nothing is nested.
	if (action.closest('.compPopover') !== panel) return false;

	// A disabled menu item does nothing, and a menu item with a caret opens its sub menu.
	if (action.classList.contains('_disabled')) return false;
	if (action.classList.contains('compMenu') && action.querySelector('._caretIcon')) return false;

	return true;
}
