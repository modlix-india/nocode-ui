import { CSSProperties, useCallback, useMemo, useState } from 'react';
import {
	getStyleObjectCurry,
	addToToggleSetCurry,
	removeFromToggleSetCurry,
	StyleCurryFunction,
} from '../utils/styleHelpers';

export interface UseCalendarStylesResult {
	/** Function to get style object based on component name and state */
	curry: StyleCurryFunction;
	/** Set of currently hovered component names */
	hovers: Set<string>;
	/** Set of currently disabled component names */
	disableds: Set<string>;
	/** Add a component name to hover state */
	addHover: (key: string) => () => void;
	/** Remove a component name from hover state */
	removeHover: (key: string) => () => void;
	/** Set hovers state directly */
	setHovers: React.Dispatch<React.SetStateAction<Set<string>>>;
	/** Set disableds state directly */
	setDisableds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Hook for managing calendar component styles with hover and disabled states.
 * Consolidates the pattern of using getStyleObjectCurry with hover/disabled state management.
 *
 * @param styles - Normal styles object
 * @param hoverStyles - Styles to apply on hover
 * @param disabledStyles - Styles to apply when disabled
 * @returns Style management utilities
 */
export function useCalendarStyles(
	styles: Record<string, CSSProperties> | undefined,
	hoverStyles: Record<string, CSSProperties> | undefined,
	disabledStyles: Record<string, CSSProperties> | undefined,
): UseCalendarStylesResult {
	const [hovers, setHovers] = useState<Set<string>>(() => new Set());
	const [disableds, setDisableds] = useState<Set<string>>(() => new Set());

	const curry = useMemo(
		() => getStyleObjectCurry(styles, hoverStyles, disabledStyles),
		[styles, hoverStyles, disabledStyles],
	);

	const addHover = useCallback(
		(key: string) => addToToggleSetCurry(hovers, setHovers, key),
		[hovers],
	);

	const removeHover = useCallback(
		(key: string) => removeFromToggleSetCurry(hovers, setHovers, key),
		[hovers],
	);

	return {
		curry,
		hovers,
		disableds,
		addHover,
		removeHover,
		setHovers,
		setDisableds,
	};
}

