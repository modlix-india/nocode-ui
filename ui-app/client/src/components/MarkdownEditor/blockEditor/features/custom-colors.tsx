// ============================================================
// Custom colors — user-defined swatches that extend the built-in
// palettes (text color, highlight, table cell, table templates).
//
// The editor stays host-agnostic: the host passes in the current
// swatch lists + optional add/remove callbacks. When callbacks are
// omitted, edit affordances (+ button, hover ×) are hidden so the
// same config can back an admin-editable and a read-only view of
// the same workspace swatches.
// ============================================================

import React, { createContext, useContext, useMemo } from 'react';

/** Shape of a user-added table color template. Matches the built-in
 *  COLOR_TEMPLATES tiles — a named preset with header + alternating row
 *  colors that can be applied via the block menu. */
export interface CustomTableTemplate {
	name: string;
	header: string;
	row: string;
}

/** Single-swatch kinds share the same shape (a flat list of hex strings). */
export type CustomSwatchKind = 'text' | 'highlight' | 'cell';

export interface CustomColorsConfig {
	text?: string[];
	highlight?: string[];
	cell?: string[];
	tableTemplates?: CustomTableTemplate[];
	/** When undefined, the swatch "+" affordance is hidden. */
	onAddCustom?: (kind: CustomSwatchKind, hex: string) => void;
	/** When undefined, the hover "×" remove affordance is hidden. */
	onRemoveCustom?: (kind: CustomSwatchKind, hex: string) => void;
	/** When undefined, the template-list "+" affordance is hidden. */
	onAddTemplate?: (t: CustomTableTemplate) => void;
	/** When undefined, the template-list hover "×" affordance is hidden. */
	onRemoveTemplate?: (name: string) => void;
}

const CustomColorsContext = createContext<CustomColorsConfig | null>(null);

interface ProviderProps {
	value: CustomColorsConfig | undefined;
	children: React.ReactNode;
}

export function CustomColorsProvider({ value, children }: Readonly<ProviderProps>) {
	// Stabilize the reference across renders when the parent hasn't changed
	// actual values — avoids re-rendering every block on unrelated prop churn.
	const memo = useMemo<CustomColorsConfig>(
		() => ({
			text: value?.text ?? [],
			highlight: value?.highlight ?? [],
			cell: value?.cell ?? [],
			tableTemplates: value?.tableTemplates ?? [],
			onAddCustom: value?.onAddCustom,
			onRemoveCustom: value?.onRemoveCustom,
			onAddTemplate: value?.onAddTemplate,
			onRemoveTemplate: value?.onRemoveTemplate,
		}),
		[
			value?.text,
			value?.highlight,
			value?.cell,
			value?.tableTemplates,
			value?.onAddCustom,
			value?.onRemoveCustom,
			value?.onAddTemplate,
			value?.onRemoveTemplate,
		],
	);
	return <CustomColorsContext.Provider value={memo}>{children}</CustomColorsContext.Provider>;
}

/** Safe to call from any descendant of BlockEditor; returns empty lists
 *  and undefined callbacks when no provider is mounted. */
export function useCustomColors(): CustomColorsConfig {
	const ctx = useContext(CustomColorsContext);
	return (
		ctx ?? {
			text: [],
			highlight: [],
			cell: [],
			tableTemplates: [],
		}
	);
}
