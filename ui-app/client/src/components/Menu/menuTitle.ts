/**
 * The hover title and the accessible name of a menu item's link.
 *
 * - `title`: only the `tooltip` property (empty: none), so nothing changes for menus that do not set it.
 * - `ariaLabel`: the label, but only while the item shows its icon alone (Only Icon Menu). The label is not
 *   rendered then, so without it a screen reader announces an unnamed link.
 */
export function menuTitle(
	label: string | undefined,
	onlyIconMenu: boolean | undefined,
	tooltip: string | undefined,
): { title?: string; ariaLabel?: string } {
	const out: { title?: string; ariaLabel?: string } = {};
	if (tooltip) out.title = tooltip;
	if (onlyIconMenu && label) out.ariaLabel = label;
	return out;
}
