import React from 'react';

/**
 * The attributes that make a clickable grid usable from the keyboard and by screen readers (the opt-in
 * `keyboardClickable` property). Nothing is added unless it is on AND the grid has a click handler: a plain
 * grid stays a plain container.
 */
export function gridKeyboardProps(
	keyboardClickable: boolean | undefined,
	handleClick: (() => void) | undefined,
	accessibleName: string | undefined,
	pressed: boolean | undefined,
): Record<string, any> {
	const out: Record<string, any> = {};
	if (accessibleName) out['aria-label'] = accessibleName;
	if (!keyboardClickable || !handleClick) return out;
	out.role = 'button';
	out.tabIndex = 0;
	if (pressed !== undefined && pressed !== null) out['aria-pressed'] = !!pressed;
	out.onKeyDown = (ev: React.KeyboardEvent) => {
		// only the grid's own key presses: a field inside it keeps its Enter and Space
		if (ev.target !== ev.currentTarget) return;
		if (ev.key !== 'Enter' && ev.key !== ' ') return;
		ev.preventDefault();
		handleClick();
	};
	return out;
}
