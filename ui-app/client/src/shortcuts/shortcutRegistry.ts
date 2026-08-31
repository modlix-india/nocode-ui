/**
 * The central shortcut registry.
 *
 * A plain module singleton, in the mould of `App/usedComponents` and
 * `components/Page/pageHistory`. Registrations hold live callbacks and DOM ref
 * getters, which do not belong in `Store`: that is deep cloned, diffed, and
 * readable from KIRun expressions.
 *
 * Because this one object knows every live shortcut and the element behind it,
 * the reveal overlay, the cheat sheet and the conflict chooser all read from here
 * and need no cooperation from the components themselves.
 */

import { comboFromEvent, type Combo } from './comboUtil';
import { currentLayer } from './layerStack';
import { checkReserved } from './reservedCombos';

export type ShortcutScope = 'GLOBAL' | 'PAGE' | 'LOCAL';

const SCOPE_RANK: { [key in ShortcutScope]: number } = { LOCAL: 3, PAGE: 2, GLOBAL: 1 };

export interface ShortcutRegistration {
	/** Stable across re-renders: page, component key, location suffix, combo. */
	id: string;
	combo: Combo;
	/** The authored form, kept for display. */
	spec: string;
	/** Shown in the chooser, the cheat sheet and the live region. */
	label: string;
	/** Cheat sheet heading. */
	group?: string;
	scope: ShortcutScope;
	pageName: string;
	componentKey?: string;
	/** RenderContext.level. Deeper nesting wins a tie. */
	level: number;
	layer: number;
	priority: number;
	/** Defaults to true when the combo carries ctrl or meta. */
	allowInInput?: boolean;
	preventDefault?: boolean;
	enabled: () => boolean;
	element?: () => HTMLElement | null;
	run: (e: KeyboardEvent) => void | Promise<void>;
}

export type ChooserFn = (candidates: ShortcutRegistration[], e: KeyboardEvent) => void;

const byCombo = new Map<Combo, Map<string, ShortcutRegistration>>();
const comboById = new Map<string, Combo>();
const changeListeners = new Set<() => void>();

let chooser: ChooserFn | undefined = undefined;
let listenerInstalled = false;

/** Combos already warned about in design mode, so the console stays readable. */
const warnedReserved = new Set<string>();
const warnedConflicts = new Set<string>();

const EDITABLE_SELECTOR =
	'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

function notifyChange() {
	for (const listener of changeListeners) {
		try {
			listener();
		} catch (err) {
			console.error('Shortcut registry listener failed', err);
		}
	}
}

function comboHasPrimaryModifier(combo: Combo): boolean {
	// Canonical order puts ctrl first and meta second, so a leading test is enough.
	return combo.startsWith('ctrl+') || combo.startsWith('meta+');
}

function isEditableTarget(e: KeyboardEvent): boolean {
	const path = typeof e.composedPath === 'function' ? e.composedPath() : undefined;
	const target = (path?.[0] ?? e.target) as HTMLElement | null;
	if (!target) return false;
	if (target.isContentEditable) return true;
	return typeof target.closest === 'function' ? !!target.closest(EDITABLE_SELECTOR) : false;
}

/**
 * Precedence, highest wins, compared in order:
 *   1. author priority
 *   2. scope, innermost first
 *   3. render level, deeper first
 *   4. DOM order, later first
 * A remaining tie means two siblings claim the same combo, which is what the
 * chooser exists for.
 */
function compareRegistrations(a: ShortcutRegistration, b: ShortcutRegistration): number {
	if (a.priority !== b.priority) return b.priority - a.priority;

	const scopeDiff = SCOPE_RANK[b.scope] - SCOPE_RANK[a.scope];
	if (scopeDiff !== 0) return scopeDiff;

	if (a.level !== b.level) return b.level - a.level;

	const elA = a.element?.();
	const elB = b.element?.();
	if (elA && elB && elA !== elB) {
		const position = elA.compareDocumentPosition(elB);
		// eslint-disable-next-line no-bitwise
		if (position & Node.DOCUMENT_POSITION_FOLLOWING) return 1;
		// eslint-disable-next-line no-bitwise
		if (position & Node.DOCUMENT_POSITION_PRECEDING) return -1;
	}

	return 0;
}

function candidatesFor(combo: Combo, inEditable: boolean): ShortcutRegistration[] {
	const bucket = byCombo.get(combo);
	if (!bucket?.size) return [];

	const layer = currentLayer();
	const out: ShortcutRegistration[] = [];

	for (const reg of bucket.values()) {
		if (reg.layer !== layer) continue;

		let enabled = false;
		try {
			enabled = reg.enabled();
		} catch (err) {
			console.error('Shortcut enabled() failed', err);
		}
		if (!enabled) continue;

		const allowInInput = reg.allowInInput ?? comboHasPrimaryModifier(combo);
		if (inEditable && !allowInInput) continue;

		if (reg.scope === 'LOCAL') {
			const el = reg.element?.();
			if (!el || !el.contains(document.activeElement)) continue;
		}

		out.push(reg);
	}

	return out;
}

function handleKeyDown(e: KeyboardEvent) {
	if (e.defaultPrevented) return;

	// Do not steal keys inside the page editor iframe. A Ctrl+K yanking focus while
	// a developer edits is worse than losing preview fidelity. Registration still
	// happens, so design-time conflict detection keeps working.
	if (globalThis.designMode === 'PAGE') return;

	if (e.isComposing || e.keyCode === 229) return;
	if (e.repeat) return;

	const combo = comboFromEvent(e);
	if (!combo) return;

	const candidates = candidatesFor(combo, isEditableTarget(e));

	// Never swallow a key nobody asked for.
	if (!candidates.length) return;

	candidates.sort(compareRegistrations);

	const winner = candidates[0];
	const tied = candidates.filter(c => compareRegistrations(winner, c) === 0);

	if (winner.preventDefault !== false) e.preventDefault();
	e.stopPropagation();

	if (tied.length > 1 && chooser) {
		chooser(tied, e);
		return;
	}

	runRegistration(winner, e);
}

function runRegistration(reg: ShortcutRegistration, e: KeyboardEvent) {
	try {
		const result = reg.run(e);
		if (result && typeof (result as Promise<void>).catch === 'function') {
			(result as Promise<void>).catch(err => console.error('Shortcut handler failed', err));
		}
	} catch (err) {
		console.error('Shortcut handler failed', err);
	}
}

function installListener() {
	if (listenerInstalled || typeof document === 'undefined') return;
	// Capture phase: this must run before CommonInputText's maxChars keydown guard,
	// Popup's Escape handler and Monaco, all of which can stop propagation, and
	// preventDefault has to reach the browser in time to swallow Ctrl+S.
	document.addEventListener('keydown', handleKeyDown, true);
	listenerInstalled = true;
}

function removeListenerIfEmpty() {
	if (!listenerInstalled || comboById.size) return;
	document.removeEventListener('keydown', handleKeyDown, true);
	listenerInstalled = false;
}

function warnAtDesignTime(reg: ShortcutRegistration) {
	if (!globalThis.isDesignMode && globalThis.designMode !== 'PAGE') return;

	const reserved = checkReserved(reg.spec);
	if (reserved?.level === 'BLOCKED' && !warnedReserved.has(reg.spec)) {
		warnedReserved.add(reg.spec);
		console.warn(
			`Shortcut "${reg.spec}" (${reg.label}) will never fire: the browser ${reserved.reason}.`,
		);
	}
}

function detectConflict(reg: ShortcutRegistration): boolean {
	const bucket = byCombo.get(reg.combo);
	if (!bucket) return false;

	for (const other of bucket.values()) {
		if (other.id === reg.id) continue;
		if (other.componentKey && other.componentKey === reg.componentKey) continue;
		if (other.layer !== reg.layer) continue;
		if (other.scope !== reg.scope) continue;
		if (other.priority !== reg.priority) continue;
		return true;
	}

	return false;
}

export const shortcutRegistry = {
	/** Returns the unregister function, meant to be a useEffect cleanup. */
	register(reg: ShortcutRegistration): () => void {
		// Replacing an existing id makes StrictMode's double effects harmless.
		const previousCombo = comboById.get(reg.id);
		if (previousCombo && previousCombo !== reg.combo) {
			byCombo.get(previousCombo)?.delete(reg.id);
		}

		let bucket = byCombo.get(reg.combo);
		if (!bucket) {
			bucket = new Map();
			byCombo.set(reg.combo, bucket);
		}
		bucket.set(reg.id, reg);
		comboById.set(reg.id, reg.combo);

		installListener();
		warnAtDesignTime(reg);
		notifyChange();

		return () => shortcutRegistry.unregister(reg.id);
	},

	unregister(id: string): void {
		const combo = comboById.get(id);
		if (!combo) return;

		const bucket = byCombo.get(combo);
		bucket?.delete(id);
		if (bucket && !bucket.size) byCombo.delete(combo);
		comboById.delete(id);

		removeListenerIfEmpty();
		notifyChange();
	},

	listFor(combo: Combo): ShortcutRegistration[] {
		const bucket = byCombo.get(combo);
		return bucket ? Array.from(bucket.values()) : [];
	},

	all(): ShortcutRegistration[] {
		const out: ShortcutRegistration[] = [];
		for (const bucket of byCombo.values()) out.push(...bucket.values());
		return out;
	},

	/** Enabled, on the current layer, and backed by an element with a real box. */
	visible(): ShortcutRegistration[] {
		const layer = currentLayer();
		const out: ShortcutRegistration[] = [];

		for (const bucket of byCombo.values()) {
			for (const reg of bucket.values()) {
				if (reg.layer !== layer) continue;
				try {
					if (!reg.enabled()) continue;
				} catch {
					continue;
				}
				out.push(reg);
			}
		}

		return out;
	},

	/** True when another component on the same layer and scope claims this combo. */
	isConflicting(id: string): boolean {
		const combo = comboById.get(id);
		if (!combo) return false;
		const reg = byCombo.get(combo)?.get(id);
		if (!reg) return false;

		const conflicting = detectConflict(reg);
		if (conflicting && globalThis.designMode === 'PAGE' && !warnedConflicts.has(combo)) {
			warnedConflicts.add(combo);
			console.warn(`Shortcut "${reg.spec}" is claimed by more than one component.`);
		}
		return conflicting;
	},

	runById(id: string): void {
		const combo = comboById.get(id);
		if (!combo) return;
		const reg = byCombo.get(combo)?.get(id);
		if (!reg) return;
		runRegistration(reg, new KeyboardEvent('keydown'));
	},

	setChooser(fn: ChooserFn | undefined): void {
		chooser = fn;
	},

	subscribe(listener: () => void): () => void {
		changeListeners.add(listener);
		return () => changeListeners.delete(listener);
	},

	/** Exported for tests. Returns true when a registration was dispatched. */
	dispatch(e: KeyboardEvent): boolean {
		const before = e.defaultPrevented;
		handleKeyDown(e);
		return e.defaultPrevented !== before;
	},

	__resetForTests(): void {
		byCombo.clear();
		comboById.clear();
		changeListeners.clear();
		warnedReserved.clear();
		warnedConflicts.clear();
		chooser = undefined;
		removeListenerIfEmpty();
	},
};
