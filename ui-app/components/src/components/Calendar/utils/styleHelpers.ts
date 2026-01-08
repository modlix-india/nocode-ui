import { CSSProperties, Dispatch, SetStateAction } from 'react';

/**
 * Creates a curried function for getting style objects based on component state.
 * Returns appropriate styles for normal, hover, or disabled states.
 */
export function getStyleObjectCurry(
	styles: Record<string, CSSProperties> | undefined,
	hoverStyles: Record<string, CSSProperties> | undefined,
	disabledStyles: Record<string, CSSProperties> | undefined,
) {
	return (key: string, hovers: Set<string>, disableds: Set<string>): CSSProperties => {
		if (hovers.has(key)) return hoverStyles?.[key] ?? {};
		if (disableds.has(key)) return disabledStyles?.[key] ?? {};
		return styles?.[key] ?? {};
	};
}

/**
 * Creates a callback to add a key to a Set state.
 * Used for tracking hover states on calendar elements.
 */
export function addToToggleSetCurry(
	set: Set<string>,
	setStateFunction: Dispatch<SetStateAction<Set<string>>>,
	key: string,
) {
	return () => {
		if (set.has(key)) return;
		setStateFunction(new Set([...Array.from(set), key]));
	};
}

/**
 * Creates a callback to remove a key from a Set state.
 * Used for clearing hover states on calendar elements.
 */
export function removeFromToggleSetCurry(
	set: Set<string>,
	setStateFunction: Dispatch<SetStateAction<Set<string>>>,
	key: string,
) {
	return () => {
		if (!set.has(key)) return;
		const newSet = new Set([...Array.from(set)]);
		newSet.delete(key);
		setStateFunction(newSet);
	};
}

export type StyleCurryFunction = ReturnType<typeof getStyleObjectCurry>;

