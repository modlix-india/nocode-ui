/**
 * Keyboard model of the Tabs component (WAI-ARIA tabs pattern, automatic activation).
 *
 * `current` is the position, in the tab list, of the tab that has the focus. `present` lists the
 * positions that really hold a tab (a null entry in the list is skipped). Returns the position to
 * select and focus, or -1 when the key is not a tab key or there is nothing to move to.
 *
 * Left and Right always move (wrapping at the ends); Up and Down move too when the tabs are laid
 * out vertically; Home and End jump to the first and the last tab.
 */
export function tabKeyTarget(
	key: string,
	current: number,
	present: number[],
	vertical: boolean,
): number {
	if (!present.length) return -1;
	const at = present.indexOf(current);
	const from = at === -1 ? 0 : at;
	const last = present.length - 1;
	switch (key) {
		case 'ArrowRight':
			return present[from === last ? 0 : from + 1];
		case 'ArrowLeft':
			return present[from === 0 ? last : from - 1];
		case 'ArrowDown':
			return vertical ? present[from === last ? 0 : from + 1] : -1;
		case 'ArrowUp':
			return vertical ? present[from === 0 ? last : from - 1] : -1;
		case 'Home':
			return present[0];
		case 'End':
			return present[last];
		default:
			return -1;
	}
}
