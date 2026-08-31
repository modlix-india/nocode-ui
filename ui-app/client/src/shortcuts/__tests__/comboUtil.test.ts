import {
	__setApplePlatformForTests,
	comboFromEvent,
	formatAriaKeyShortcuts,
	formatCombo,
	parseCombo,
	specFromEvent,
} from '../comboUtil';

afterEach(() => __setApplePlatformForTests(undefined));

function keyEvent(init: Partial<KeyboardEventInit & { code: string; keyCode: number }>) {
	return new KeyboardEvent('keydown', init as KeyboardEventInit);
}

describe('parseCombo', () => {
	it('normalises modifier order regardless of how it was written', () => {
		expect(parseCombo('Shift+Ctrl+K', false)).toBe('ctrl+shift+k');
		expect(parseCombo('Ctrl+Shift+K', false)).toBe('ctrl+shift+k');
	});

	it('is case and whitespace insensitive', () => {
		expect(parseCombo('  CTRL + shift + K ', false)).toBe('ctrl+shift+k');
		expect(parseCombo('ctrl-shift-k', false)).toBe('ctrl+shift+k');
	});

	it('accepts the modifier synonyms', () => {
		expect(parseCombo('Cmd+S', true)).toBe('meta+s');
		expect(parseCombo('Command+S', true)).toBe('meta+s');
		expect(parseCombo('Win+S', false)).toBe('meta+s');
		expect(parseCombo('Option+S', true)).toBe('alt+s');
		expect(parseCombo('Opt+S', true)).toBe('alt+s');
		expect(parseCombo('Control+S', false)).toBe('ctrl+s');
	});

	it('resolves Mod to Cmd on Apple and Ctrl elsewhere', () => {
		expect(parseCombo('Mod+S', true)).toBe('meta+s');
		expect(parseCombo('Mod+S', false)).toBe('ctrl+s');
		expect(parseCombo('CmdOrCtrl+S', true)).toBe('meta+s');
	});

	it('leaves an explicit Ctrl as real Control even on Apple', () => {
		// The escape hatch: an author who writes Ctrl means Ctrl.
		expect(parseCombo('Ctrl+S', true)).toBe('ctrl+s');
	});

	it('normalises named key aliases', () => {
		expect(parseCombo('Mod+Esc', false)).toBe('ctrl+escape');
		expect(parseCombo('Mod+Escape', false)).toBe('ctrl+escape');
		expect(parseCombo('Alt+Down', false)).toBe('alt+arrowdown');
		expect(parseCombo('Alt+ArrowDown', false)).toBe('alt+arrowdown');
		expect(parseCombo('Mod+Return', false)).toBe('ctrl+enter');
	});

	it('keeps a trailing plus or minus as the base key', () => {
		expect(parseCombo('Mod++', false)).toBe('ctrl++');
		expect(parseCombo('Mod+-', false)).toBe('ctrl+-');
	});

	it('returns undefined without a base key', () => {
		expect(parseCombo('')).toBeUndefined();
		expect(parseCombo(undefined)).toBeUndefined();
		expect(parseCombo('Ctrl+Shift')).toBeUndefined();
	});
});

describe('comboFromEvent', () => {
	it('uses the physical code so non-US layouts still match', () => {
		// German keyboard: Cmd+S reports key 'ß' but code 'KeyS'.
		expect(comboFromEvent(keyEvent({ key: 'ß', code: 'KeyS', metaKey: true }))).toBe('meta+s');
	});

	it('falls back to key for punctuation, which has no stable code', () => {
		expect(comboFromEvent(keyEvent({ key: '/', code: 'Slash', ctrlKey: true }))).toBe('ctrl+/');
	});

	it('maps digits and named codes', () => {
		expect(comboFromEvent(keyEvent({ key: '1', code: 'Digit1', ctrlKey: true }))).toBe('ctrl+1');
		expect(comboFromEvent(keyEvent({ key: 'ArrowDown', code: 'ArrowDown', altKey: true }))).toBe(
			'alt+arrowdown',
		);
	});

	it('ignores bare modifier presses', () => {
		expect(comboFromEvent(keyEvent({ key: 'Meta', code: 'MetaLeft', metaKey: true }))).toBeUndefined();
		expect(comboFromEvent(keyEvent({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }))).toBeUndefined();
		expect(comboFromEvent(keyEvent({ key: 'Control', code: 'ControlLeft', ctrlKey: true }))).toBeUndefined();
		expect(comboFromEvent(keyEvent({ key: 'Alt', code: 'AltLeft', altKey: true }))).toBeUndefined();
	});

	it('ignores a key that is mid IME composition', () => {
		expect(comboFromEvent(keyEvent({ key: 'a', code: 'KeyA', keyCode: 229 }))).toBeUndefined();
	});

	it('produces the canonical order for a fully loaded combo', () => {
		expect(
			comboFromEvent(
				keyEvent({
					key: 'k',
					code: 'KeyK',
					ctrlKey: true,
					metaKey: true,
					altKey: true,
					shiftKey: true,
				}),
			),
		).toBe('ctrl+meta+alt+shift+k');
	});
});

describe('formatCombo', () => {
	it('uses glyphs in the conventional order on Apple', () => {
		expect(formatCombo('Mod+S', true)).toBe('⌘S');
		expect(formatCombo('Mod+Shift+K', true)).toBe('⇧⌘K');
		expect(formatCombo('Alt+ArrowDown', true)).toBe('⌥↓');
	});

	it('uses plus joined words elsewhere', () => {
		expect(formatCombo('Mod+S', false)).toBe('Ctrl+S');
		expect(formatCombo('Mod+Shift+K', false)).toBe('Ctrl+Shift+K');
		expect(formatCombo('Alt+ArrowDown', false)).toBe('Alt+Down');
	});

	it('returns undefined for an unparseable spec', () => {
		expect(formatCombo(undefined)).toBeUndefined();
		expect(formatCombo('Ctrl+Shift')).toBeUndefined();
	});
});

describe('formatAriaKeyShortcuts', () => {
	it('emits W3C tokens for the binding live on this platform only', () => {
		expect(formatAriaKeyShortcuts('Mod+K', true)).toBe('Meta+K');
		expect(formatAriaKeyShortcuts('Mod+K', false)).toBe('Control+K');
		expect(formatAriaKeyShortcuts('Alt+ArrowDown', false)).toBe('Alt+ArrowDown');
	});
});

describe('specFromEvent', () => {
	it('records the primary modifier as Mod so the spec stays portable', () => {
		expect(specFromEvent(keyEvent({ key: 's', code: 'KeyS', metaKey: true }), true)).toBe(
			'Mod+S',
		);
		expect(specFromEvent(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }), false)).toBe(
			'Mod+S',
		);
	});

	it('records a non primary modifier literally', () => {
		// Control on a Mac is not the primary modifier, so the author meant Control.
		expect(specFromEvent(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }), true)).toBe(
			'Ctrl+S',
		);
	});
});
