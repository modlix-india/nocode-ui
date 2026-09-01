/**
 * The whole per-component shortcut API.
 *
 * A component supplies its authored spec, a label, its identity, and what to do.
 * It gets back the aria token and a tooltip suffix. The hold-to-reveal overlay and
 * the cheat sheet read the registry directly, so a component that calls this gets
 * both without rendering anything of its own.
 *
 * Deliberately kept to four hook slots, because this runs on every instance of every
 * interactive component whether or not a shortcut is configured.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { STORE_PATH_SHORTCUTS } from '../constants';
import { setData } from '../context/StoreContext';
import { flattenUUID } from '../components/util/uuid';
import { formatAriaKeyShortcuts, formatCombo, parseCombo, type Combo } from './comboUtil';
import { currentLayer } from './layerStack';
import {
	shortcutRegistry,
	type ShortcutRegistration,
	type ShortcutScope,
} from './shortcutRegistry';

export interface UseShortcutOptions {
	/** Authored form, e.g. 'Mod+S'. Nothing registers when this is empty. */
	spec?: string;
	label: string;
	group?: string;
	pageName: string;
	componentKey: string;
	/** The component's authored name. Keys the store mirror an author binds to. */
	name?: string;
	/** RenderContext.level. Deeper nesting wins a tie. */
	level: number;
	scope?: ShortcutScope;
	priority?: number;
	disabled?: boolean;
	allowInInput?: boolean;
	preventDefault?: boolean;
	elementRef?: React.RefObject<HTMLElement | null>;
	onTrigger: (e: KeyboardEvent) => void;
}

export interface UseShortcutResult {
	combo?: Combo;
	/** Ready to render: '⌘S' on a Mac, 'Ctrl+S' elsewhere. */
	display?: string;
	/** W3C aria-keyshortcuts token, e.g. 'Meta+S'. */
	aria?: string;
	/** ' (Ctrl+S)', ready to append to an existing title attribute. */
	titleSuffix?: string;
	/** True only in the page editor, when another component claims the same combo. */
	conflicting: boolean;
}

/** Everything that changes per render, held in one ref so it costs one hook slot. */
interface LiveValues {
	onTrigger: (e: KeyboardEvent) => void;
	disabled: boolean;
	label: string;
	elementRef?: React.RefObject<HTMLElement | null>;
}

export function useShortcut(opts: UseShortcutOptions): UseShortcutResult {
	const {
		spec,
		label,
		group,
		pageName,
		componentKey,
		name,
		level,
		scope = 'PAGE',
		priority = 0,
		disabled = false,
		allowInInput,
		preventDefault,
		elementRef,
		onTrigger,
	} = opts;

	// One ref for every per-render value. The registration reads through it, so the
	// registration object itself stays stable and the effect deps stay identity-only.
	const live = useRef<LiveValues>({ onTrigger, disabled, label, elementRef });
	live.current.onTrigger = onTrigger;
	live.current.disabled = disabled;
	live.current.label = label;
	live.current.elementRef = elementRef;

	const [conflicting, setConflicting] = useState(false);

	// All three derived strings are a pure function of the spec, so one memo covers them.
	const derived = useMemo(
		() => ({
			combo: parseCombo(spec),
			display: formatCombo(spec),
			aria: formatAriaKeyShortcuts(spec),
		}),
		[spec],
	);

	const { combo, display, aria } = derived;

	useEffect(() => {
		if (!combo || !spec) return;

		const id = `${pageName}|${flattenUUID(componentKey)}|${combo}`;

		const registration: ShortcutRegistration = {
			id,
			combo,
			spec,
			get label() {
				return live.current.label;
			},
			group,
			scope,
			pageName,
			componentKey,
			level,
			layer: currentLayer(),
			priority,
			allowInInput,
			preventDefault,
			enabled: () => !live.current.disabled,
			element: () => live.current.elementRef?.current ?? null,
			run: e => live.current.onTrigger(e),
		};

		const unregister = shortcutRegistry.register(registration);

		// Mirror the resolved key into the store so a page can render its own hint.
		// There is no built-in chip: an author binds a Text component to
		// Store.shortcuts.<page>.<component name>.display and gets '⌘K' on a Mac and
		// 'Ctrl+K' elsewhere, placed and styled however the page needs.
		const mirrorPath = name ? `${STORE_PATH_SHORTCUTS}.${pageName}.${name}` : undefined;
		if (mirrorPath) setData(mirrorPath, { spec, display, aria, label: live.current.label });

		if (globalThis.designMode === 'PAGE') setConflicting(shortcutRegistry.isConflicting(id));

		return () => {
			unregister();
			if (mirrorPath) setData(mirrorPath, undefined, undefined, true);
			setConflicting(false);
		};
	}, [
		combo,
		spec,
		display,
		aria,
		name,
		group,
		scope,
		priority,
		pageName,
		componentKey,
		level,
		allowInInput,
		preventDefault,
	]);

	return {
		combo,
		display,
		aria,
		titleSuffix: display ? ` (${display})` : undefined,
		conflicting,
	};
}
