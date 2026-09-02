/**
 * Keyboard combo parsing, normalisation and display formatting.
 *
 * A "spec" is what an app author writes: 'Mod+S', 'Ctrl+Shift+K', 'Alt+ArrowDown'.
 * A "combo" is the canonical internal form: 'meta+s', 'ctrl+shift+k', 'alt+arrowdown'.
 *
 * Canonical modifier order is fixed as ctrl, meta, alt, shift so that two specs
 * that mean the same thing always produce the same string and can be map keys.
 */

export type Combo = string;

/**
 * `navigator.platform` is deprecated and `userAgentData` is not everywhere, so try
 * the modern hint, then the legacy field, then the user agent string.
 */
function detectApplePlatform(): boolean {
	if (typeof navigator === 'undefined') return false;

	const uaDataPlatform = (navigator as any).userAgentData?.platform;
	if (uaDataPlatform) return /mac|iphone|ipad|ipod/i.test(uaDataPlatform);

	if (navigator.platform) return /mac|iphone|ipad|ipod/i.test(navigator.platform);

	return /Mac OS X|iPhone|iPad|iPod/i.test(navigator.userAgent ?? '');
}

let applePlatformOverride: boolean | undefined = undefined;

export function isApplePlatform(): boolean {
	return applePlatformOverride ?? detectApplePlatform();
}

/** Test seam. Pass undefined to go back to real platform detection. */
export function __setApplePlatformForTests(value: boolean | undefined): void {
	applePlatformOverride = value;
}

const MODIFIER_SYNONYMS: { [key: string]: 'ctrl' | 'meta' | 'alt' | 'shift' | 'mod' } = {
	mod: 'mod',
	cmdorctrl: 'mod',
	commandorcontrol: 'mod',
	cmd: 'meta',
	command: 'meta',
	meta: 'meta',
	win: 'meta',
	windows: 'meta',
	super: 'meta',
	ctrl: 'ctrl',
	control: 'ctrl',
	alt: 'alt',
	opt: 'alt',
	option: 'alt',
	shift: 'shift',
};

/**
 * Codes we accept verbatim (lowercased). Anything outside this list and the
 * `KeyX` / `DigitN` patterns falls back to `event.key`, which covers punctuation.
 */
const NAMED_CODES = new Set([
	'arrowup',
	'arrowdown',
	'arrowleft',
	'arrowright',
	'enter',
	'numpadenter',
	'escape',
	'tab',
	'space',
	'backspace',
	'delete',
	'insert',
	'home',
	'end',
	'pageup',
	'pagedown',
	'f1',
	'f2',
	'f3',
	'f4',
	'f5',
	'f6',
	'f7',
	'f8',
	'f9',
	'f10',
	'f11',
	'f12',
]);

/** Author-facing aliases for named keys, so 'Mod+Esc' and 'Mod+Escape' agree. */
const KEY_ALIASES: { [key: string]: string } = {
	esc: 'escape',
	del: 'delete',
	ins: 'insert',
	spacebar: 'space',
	' ': 'space',
	up: 'arrowup',
	down: 'arrowdown',
	left: 'arrowleft',
	right: 'arrowright',
	return: 'enter',
	numpadenter: 'enter',
	pgup: 'pageup',
	pgdn: 'pagedown',
	pagedn: 'pagedown',
	plus: '+',
	minus: '-',
	hyphen: '-',
};

function normaliseBase(raw: string): string {
	const lower = raw.toLowerCase();
	return KEY_ALIASES[lower] ?? lower;
}

function buildCombo(
	mods: { ctrl: boolean; meta: boolean; alt: boolean; shift: boolean },
	base: string,
): Combo {
	let combo = '';
	if (mods.ctrl) combo += 'ctrl+';
	if (mods.meta) combo += 'meta+';
	if (mods.alt) combo += 'alt+';
	if (mods.shift) combo += 'shift+';
	return combo + base;
}

/**
 * Parse an authored spec into a canonical combo.
 *
 * Only `Mod` adapts to the OS. An author who writes `Ctrl+S` gets real Control
 * even on a Mac, which keeps the escape hatch open for genuinely Ctrl-specific
 * bindings.
 *
 * Returns undefined for empty input or a spec with no base key.
 */
export function parseCombo(spec: string | undefined | null, apple?: boolean): Combo | undefined {
	if (!spec) return undefined;

	const trimmed = String(spec).trim();
	if (!trimmed) return undefined;

	const useApple = apple ?? isApplePlatform();

	// Split on + or -, but keep a trailing lone '+' or '-' as the base key so that
	// 'Mod++' and 'Mod+-' (zoom style bindings) survive.
	const parts: string[] = [];
	let current = '';
	for (let i = 0; i < trimmed.length; i++) {
		const ch = trimmed[i];
		if ((ch === '+' || ch === '-') && current.length && i !== trimmed.length - 1) {
			parts.push(current);
			current = '';
		} else if ((ch === '+' || ch === '-') && !current.length && i === trimmed.length - 1) {
			current = ch;
		} else {
			current += ch;
		}
	}
	if (current.length) parts.push(current);

	const mods = { ctrl: false, meta: false, alt: false, shift: false };
	let base: string | undefined = undefined;

	for (const part of parts) {
		const token = part.trim();
		if (!token) continue;

		const asModifier = MODIFIER_SYNONYMS[token.toLowerCase()];
		if (asModifier) {
			if (asModifier === 'mod') {
				if (useApple) mods.meta = true;
				else mods.ctrl = true;
			} else {
				mods[asModifier] = true;
			}
			continue;
		}

		// Last non-modifier token wins as the base key.
		base = normaliseBase(token);
	}

	if (!base) return undefined;

	return buildCombo(mods, base);
}

/**
 * Turn a live KeyboardEvent into a canonical combo.
 *
 * Uses `event.code` for the base key wherever it is meaningful. Under Cmd or Ctrl
 * on a non-US layout `event.key` yields alternate glyphs (German Cmd+S reports 'ß'),
 * while `KeyS` is layout stable. Punctuation has no stable code across layouts, so
 * it falls back to `event.key`.
 *
 * Returns undefined for bare modifier presses and while an IME is composing.
 */
export function comboFromEvent(e: KeyboardEvent): Combo | undefined {
	if (e.isComposing || e.keyCode === 229) return undefined;

	const key = e.key;
	if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return undefined;

	const code = e.code ?? '';
	let base: string | undefined = undefined;

	const letter = /^Key([A-Z])$/.exec(code);
	if (letter) base = letter[1].toLowerCase();

	if (!base) {
		const digit = /^(?:Digit|Numpad)([0-9])$/.exec(code);
		if (digit) base = digit[1];
	}

	if (!base && NAMED_CODES.has(code.toLowerCase())) base = normaliseBase(code);

	if (!base && key) base = normaliseBase(key);

	if (!base) return undefined;

	return buildCombo(
		{ ctrl: e.ctrlKey, meta: e.metaKey, alt: e.altKey, shift: e.shiftKey },
		base,
	);
}

const APPLE_MODIFIER_GLYPHS: Array<[string, string]> = [
	['ctrl', '⌃'],
	['alt', '⌥'],
	['shift', '⇧'],
	['meta', '⌘'],
];

const APPLE_KEY_GLYPHS: { [key: string]: string } = {
	arrowup: '↑',
	arrowdown: '↓',
	arrowleft: '←',
	arrowright: '→',
	enter: '⏎',
	escape: 'esc',
	backspace: '⌫',
	delete: '⌦',
	tab: '⇥',
	space: 'space',
	pageup: '⇞',
	pagedown: '⇟',
	home: '↖',
	end: '↘',
};

const OTHER_KEY_LABELS: { [key: string]: string } = {
	arrowup: 'Up',
	arrowdown: 'Down',
	arrowleft: 'Left',
	arrowright: 'Right',
	enter: 'Enter',
	escape: 'Esc',
	backspace: 'Backspace',
	delete: 'Del',
	tab: 'Tab',
	space: 'Space',
	pageup: 'PgUp',
	pagedown: 'PgDn',
	home: 'Home',
	end: 'End',
};

function splitCombo(combo: Combo): {
	mods: { ctrl: boolean; meta: boolean; alt: boolean; shift: boolean };
	base: string;
} {
	const mods = { ctrl: false, meta: false, alt: false, shift: false };
	let rest = combo;

	// The canonical prefixes only ever appear at the front and in a fixed order.
	for (const name of ['ctrl', 'meta', 'alt', 'shift'] as const) {
		if (rest.startsWith(name + '+')) {
			mods[name] = true;
			rest = rest.substring(name.length + 1);
		}
	}

	return { mods, base: rest };
}

/**
 * Human readable form for the hint chip and the cheat sheet.
 * Apple: glyphs in the conventional order with no separator, so 'shift+meta+k' reads
 * as the familiar Shift-Command-K. Elsewhere: plus joined words.
 */
export function formatCombo(spec: string | undefined, apple?: boolean): string | undefined {
	const useApple = apple ?? isApplePlatform();
	const combo = parseCombo(spec, useApple);
	if (!combo) return undefined;

	const { mods, base } = splitCombo(combo);

	if (useApple) {
		let out = '';
		for (const [name, glyph] of APPLE_MODIFIER_GLYPHS) {
			if (mods[name as keyof typeof mods]) out += glyph;
		}
		const label = APPLE_KEY_GLYPHS[base] ?? base;
		return out + (label.length === 1 ? label.toUpperCase() : label);
	}

	const parts: string[] = [];
	if (mods.ctrl) parts.push('Ctrl');
	if (mods.meta) parts.push('Win');
	if (mods.alt) parts.push('Alt');
	if (mods.shift) parts.push('Shift');

	const label = OTHER_KEY_LABELS[base] ?? base;
	parts.push(label.length === 1 ? label.toUpperCase() : label);

	return parts.join('+');
}

/**
 * Classes the hold-to-reveal CSS matches on, one per modifier the combo uses.
 *
 * `ShortcutModifierHold` puts `_modMeta`, `_modCtrl` or `_modAlt` on the body while
 * that modifier is held, and the rule in `ShortcutStyle` shows a chip carrying the
 * matching `_needs*` class. A combo with two modifiers gets both, so '⇧⌘O' reveals
 * under Cmd. A combo with no modifier gets nothing: there is nothing to hold.
 */
export function hintClassesForCombo(combo: Combo | undefined): string | undefined {
	if (!combo) return undefined;

	const { mods } = splitCombo(combo);

	let out = '';
	if (mods.ctrl) out += '_needsCtrl ';
	if (mods.meta) out += '_needsMeta ';
	if (mods.alt) out += '_needsAlt';

	const trimmed = out.trim();
	return trimmed || undefined;
}

const ARIA_KEY_NAMES: { [key: string]: string } = {
	arrowup: 'ArrowUp',
	arrowdown: 'ArrowDown',
	arrowleft: 'ArrowLeft',
	arrowright: 'ArrowRight',
	enter: 'Enter',
	escape: 'Escape',
	backspace: 'Backspace',
	delete: 'Delete',
	tab: 'Tab',
	space: 'Space',
	pageup: 'PageUp',
	pagedown: 'PageDown',
	home: 'Home',
	end: 'End',
};

/**
 * W3C `aria-keyshortcuts` token syntax, which is not the display syntax.
 * Only the binding actually live on this OS is emitted; the other one is not bound.
 */
export function formatAriaKeyShortcuts(
	spec: string | undefined,
	apple?: boolean,
): string | undefined {
	const useApple = apple ?? isApplePlatform();
	const combo = parseCombo(spec, useApple);
	if (!combo) return undefined;

	const { mods, base } = splitCombo(combo);

	const parts: string[] = [];
	if (mods.ctrl) parts.push('Control');
	if (mods.meta) parts.push('Meta');
	if (mods.alt) parts.push('Alt');
	if (mods.shift) parts.push('Shift');

	const label = ARIA_KEY_NAMES[base] ?? base;
	parts.push(label.length === 1 ? label.toUpperCase() : label);

	return parts.join('+');
}

/**
 * Build an authored spec from a live event, used by the property editor's recorder.
 * Writes 'Mod' when the pressed modifier is this platform's primary one, so the
 * recorded spec stays portable.
 */
export function specFromEvent(e: KeyboardEvent, apple?: boolean): string | undefined {
	const useApple = apple ?? isApplePlatform();
	const combo = comboFromEvent(e);
	if (!combo) return undefined;

	const { mods, base } = splitCombo(combo);

	const parts: string[] = [];
	const primaryPressed = useApple ? mods.meta : mods.ctrl;
	if (primaryPressed) parts.push('Mod');
	if (mods.ctrl && !primaryPressed) parts.push('Ctrl');
	if (mods.meta && !primaryPressed) parts.push('Cmd');
	if (mods.alt) parts.push('Alt');
	if (mods.shift) parts.push('Shift');

	parts.push(ARIA_KEY_NAMES[base] ?? (base.length === 1 ? base.toUpperCase() : base));

	return parts.join('+');
}
