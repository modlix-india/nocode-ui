import React, { useCallback, useEffect, useRef, useState } from 'react';
import { STORE_PATH_SHORTCUT_ANNOUNCE, STORE_PATH_SHORTCUT_CHOOSER } from '../constants';
import { addListenerAndCallImmediately, setData } from '../context/StoreContext';
import Portal from '../components/Portal';
import { formatCombo } from './comboUtil';
import { shortcutRegistry, type ShortcutRegistration } from './shortcutRegistry';

interface ChooserOption {
	id: string;
	label: string;
	pageName: string;
	scopeLabel: string;
}

interface ChooserState {
	display?: string;
	options?: Array<ChooserOption>;
}

const SCOPE_LABELS: { [key: string]: string } = {
	LOCAL: 'Within component',
	PAGE: 'This page',
	GLOBAL: 'Whole app',
};

/** Open the chooser. Callbacks stay in the registry; only plain data reaches the store. */
function openChooser(candidates: ShortcutRegistration[]) {
	setData(STORE_PATH_SHORTCUT_CHOOSER, {
		display: formatCombo(candidates[0]?.spec),
		options: candidates.map(c => ({
			id: c.id,
			label: c.label,
			pageName: c.pageName,
			scopeLabel: SCOPE_LABELS[c.scope] ?? c.scope,
		})),
	});
}

function closeChooser() {
	setData(STORE_PATH_SHORTCUT_CHOOSER, undefined, undefined, true);
}

/**
 * Announce an action through the shared live region without opening the chooser.
 *
 * This lives on its own store path rather than under the chooser object: a plain
 * store listener fires for its own path and its parents, not for its children, so
 * nesting it would mean the region never re-rendered.
 */
let announceTimer: ReturnType<typeof setTimeout> | undefined = undefined;

export function announceShortcut(text: string) {
	setData(STORE_PATH_SHORTCUT_ANNOUNCE, text);
	if (announceTimer) clearTimeout(announceTimer);
	announceTimer = setTimeout(() => {
		announceTimer = undefined;
		setData(STORE_PATH_SHORTCUT_ANNOUNCE, undefined, undefined, true);
	}, 1200);
}

/**
 * The conflict chooser plus the app's single polite live region.
 *
 * Mounted once at the App root, driven from the store exactly like `Messages`.
 * It only appears when two registrations tie at the same priority, scope, level and
 * DOM position, which in practice means two siblings claiming the same combo.
 */
export function ShortcutChooser() {
	const [state, setState] = useState<ChooserState | undefined>(undefined);
	const [announce, setAnnounce] = useState<string>('');
	const [activeIndex, setActiveIndex] = useState(0);
	const panelRef = useRef<HTMLDivElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				(_, value) => setState(value),
				STORE_PATH_SHORTCUT_CHOOSER,
			),
		[],
	);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				(_, value) => setAnnounce(value ?? ''),
				STORE_PATH_SHORTCUT_ANNOUNCE,
			),
		[],
	);

	useEffect(() => {
		shortcutRegistry.setChooser(openChooser);
		return () => shortcutRegistry.setChooser(undefined);
	}, []);

	const options = state?.options ?? [];
	const isOpen = options.length > 1;

	useEffect(() => {
		if (!isOpen) return;
		returnFocusRef.current = document.activeElement as HTMLElement | null;
		setActiveIndex(0);
		panelRef.current?.focus();
		return () => returnFocusRef.current?.focus?.();
	}, [isOpen]);

	const choose = useCallback((id: string) => {
		closeChooser();
		shortcutRegistry.runById(id);
	}, []);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (!options.length) return;

			if (e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				closeChooser();
				return;
			}

			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				e.stopPropagation();
				const delta = e.key === 'ArrowDown' ? 1 : -1;
				setActiveIndex(i => (i + delta + options.length) % options.length);
				return;
			}

			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				e.stopPropagation();
				choose(options[activeIndex].id);
				return;
			}

			const digit = /^[1-9]$/.exec(e.key);
			if (digit) {
				const index = parseInt(digit[0], 10) - 1;
				if (index < options.length) {
					e.preventDefault();
					e.stopPropagation();
					choose(options[index].id);
				}
				return;
			}

			// Trap Tab inside the dialog: there is exactly one focusable node.
			if (e.key === 'Tab') e.preventDefault();
		},
		[options, activeIndex, choose],
	);

	const liveRegion = (
		<div className="_srOnly" role="status" aria-live="polite" aria-atomic="true">
			{announce}
		</div>
	);

	if (!isOpen) return <div className="comp compShortcutChooser">{liveRegion}</div>;

	return (
		<div className="comp compShortcutChooser">
			{liveRegion}
			<Portal>
				<div className="_shortcutBackdrop" onClick={closeChooser}>
					<div
						ref={panelRef}
						className="_shortcutPanel _shortcutChooserPanel"
						role="dialog"
						aria-modal="true"
						aria-label={`Choose an action for ${state?.display ?? 'this shortcut'}`}
						tabIndex={-1}
						onKeyDown={onKeyDown}
						onClick={e => e.stopPropagation()}
					>
						<div className="_shortcutPanelHeader">
							<span className="_shortcutKeyCap">{state?.display}</span>
							matches {options.length} actions
						</div>
						<div className="_shortcutOptions" role="listbox">
							{options.map((option, index) => (
								<button
									key={option.id}
									type="button"
									role="option"
									aria-selected={index === activeIndex}
									className={`_shortcutOption ${index === activeIndex ? '_active' : ''}`}
									onMouseEnter={() => setActiveIndex(index)}
									onClick={() => choose(option.id)}
								>
									<span className="_shortcutOptionIndex">{index + 1}</span>
									<span className="_shortcutOptionLabel">{option.label}</span>
									<span className="_shortcutOptionScope">{option.scopeLabel}</span>
								</button>
							))}
						</div>
						<div className="_shortcutPanelFooter">
							Press 1 to {Math.min(options.length, 9)}, or use the arrow keys and
							Enter. Escape cancels.
						</div>
					</div>
				</div>
			</Portal>
		</div>
	);
}

export default ShortcutChooser;
