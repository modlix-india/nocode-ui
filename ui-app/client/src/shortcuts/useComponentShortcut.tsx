import { useCallback } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../constants';
import { getDataFromPath, PageStoreExtractor } from '../context/StoreContext';
import { getTranslations } from '../components/util/getTranslations';
import { runEvent } from '../components/util/runEvent';
import { flattenUUID } from '../components/util/uuid';
import { ComponentProps } from '../types/common';
import { announceShortcut } from './ShortcutChooser';
import { useShortcut } from './useShortcut';
import type { ShortcutScope } from './shortcutRegistry';

export interface ComponentShortcutOptions {
	/** The component's own props, for page name, definition and location history. */
	props: Readonly<ComponentProps>;
	/** The resolved key from useDefinition. */
	componentKey: string;

	shortcutKey?: string;
	shortcutScope?: string;
	shortcutPriority?: number;
	shortcutGroup?: string;
	/** Fire even while focus is in a text field. Defaults on for ctrl/meta combos. */
	allowInInput?: boolean;
	/** 'FOCUS' | 'FOCUS_SELECT' | 'EVENT'. Ignored when onActivate is supplied. */
	shortcutAction?: string;
	/** Event key into pageDefinition.eventFunctions, for the EVENT action. */
	onShortcut?: string;

	/** The component's visible label. Names the action in the chooser and cheat sheet. */
	label?: string;
	/** Fallback name when the component has no label. */
	fallbackLabel?: string;
	disabled?: boolean;

	/** The focusable or clickable element. Also anchors the hold-to-reveal chip. */
	elementRef?: React.RefObject<any>;
	/** Supplied by clickable components. Takes precedence over shortcutAction. */
	onActivate?: (e: KeyboardEvent) => void;
}

export interface ComponentShortcutResult {
	display?: string;
	aria?: string;
	/** ' (Ctrl+S)', ready to append to a title attribute. Undefined when no shortcut. */
	titleSuffix?: string;
	conflicting: boolean;
}

const NATIVELY_FOCUSABLE = 'input, textarea, select, button, a[href], [tabindex]';

/**
 * Where a FOCUS shortcut should actually land.
 *
 * A component that wraps a real control (Otp, Tags, FileUpload) hands us its root
 * div, and focusing that does nothing useful, so prefer the first visible focusable
 * descendant. A component that IS the control keeps the element it gave us.
 */
function resolveFocusTarget(el: HTMLElement | null | undefined): HTMLElement | undefined {
	if (!el) return undefined;

	const tag = el.tagName?.toLowerCase();
	const isNativelyFocusable =
		tag === 'input' ||
		tag === 'textarea' ||
		tag === 'select' ||
		tag === 'button' ||
		(tag === 'a' && el.hasAttribute('href'));
	if (isNativelyFocusable) return el;

	const candidates = el.querySelectorAll?.<HTMLElement>(NATIVELY_FOCUSABLE);
	for (const candidate of Array.from(candidates ?? [])) {
		if ((candidate as HTMLInputElement).disabled) continue;
		if (candidate.getAttribute('tabindex') === '-1') continue;
		// A file input and the like are hidden on purpose; focus does nothing there.
		if (!candidate.offsetParent && candidate.offsetWidth === 0 && candidate.offsetHeight === 0)
			continue;
		return candidate;
	}

	// Nothing inside to focus, so fall back to the root. It carries tabIndex={-1}
	// whenever a shortcut is configured, which makes this reachable.
	return typeof el.focus === 'function' ? el : undefined;
}

/**
 * One call wires a component into the shortcut system: registration, the focus or
 * activate behaviour, the aria token and the tooltip suffix.
 *
 * The hold-to-reveal overlay and the cheat sheet read the registry directly, so a
 * component that calls this gets both without rendering anything extra. There is no
 * inline chip by design: an author who wants the key shown on screen adds a Text
 * component, which they can place and style however the page needs.
 */
export function useComponentShortcut(opts: ComponentShortcutOptions): ComponentShortcutResult {
	const {
		props,
		componentKey,
		shortcutKey,
		shortcutScope,
		shortcutPriority,
		shortcutGroup,
		allowInInput,
		shortcutAction = 'FOCUS',
		onShortcut,
		label,
		fallbackLabel,
		disabled,
		elementRef,
		onActivate,
	} = opts;

	const { definition, pageDefinition, locationHistory, context } = props;
	const translations = pageDefinition?.translations;

	// A component rendered inside a repeater never registers. A table with 100 rows
	// would otherwise put 100 identical registrations on the same combo, which is both
	// a guaranteed conflict and a pointless cost: there is no way for a single key to
	// say WHICH row it meant. Put the shortcut on something outside the repeat instead.
	const insideRepeater = !!locationHistory?.length;
	const effectiveSpec = insideRepeater ? undefined : shortcutKey;

	// Almost every instance of these components has no shortcut, and this hook runs on
	// each of them. getTranslations does a store read per call, so gate the label work
	// on there actually being a live shortcut.
	const hasShortcut = !!effectiveSpec;

	const actionLabel = hasShortcut
		? getTranslations(label, translations) ||
			fallbackLabel ||
			definition?.name ||
			definition?.type ||
			'Action'
		: '';

	const group = hasShortcut ? getTranslations(shortcutGroup, translations) : undefined;

	const onTrigger = useCallback(
		(e: KeyboardEvent) => {
			if (onActivate) {
				announceShortcut(actionLabel);
				onActivate(e);
				return;
			}

			if (shortcutAction === 'EVENT') {
				const eventFunction = onShortcut
					? pageDefinition?.eventFunctions?.[onShortcut]
					: undefined;
				if (!eventFunction) return;

				// Same guard the page onLoad uses, so a key cannot stack executions.
				const functionKey = `shortcut_${flattenUUID(definition.key)}`;
				const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
				if (
					getDataFromPath(
						`${STORE_PATH_FUNCTION_EXECUTION}.${context.pageName}.${functionKey}.isRunning`,
						locationHistory,
						pageExtractor,
					)
				)
					return;

				announceShortcut(actionLabel);
				(async () =>
					runEvent(
						eventFunction,
						functionKey,
						context.pageName,
						locationHistory,
						pageDefinition,
					))();
				return;
			}

			const target = resolveFocusTarget(elementRef?.current);
			if (!target) return;

			target.focus();
			if (shortcutAction === 'FOCUS_SELECT' && typeof (target as any).select === 'function')
				(target as any).select();
			announceShortcut(`Focused ${actionLabel}`);
		},
		[
			onActivate,
			shortcutAction,
			onShortcut,
			pageDefinition,
			definition,
			context.pageName,
			locationHistory,
			elementRef,
			actionLabel,
		],
	);

	return useShortcut({
		spec: effectiveSpec,
		label: actionLabel,
		group,
		pageName: context.pageName,
		componentKey,
		name: definition?.name,
		level: context.level,
		scope: (shortcutScope as ShortcutScope) ?? 'PAGE',
		priority: shortcutPriority ?? 0,
		allowInInput,
		disabled: disabled ?? false,
		elementRef,
		onTrigger,
	});
}
