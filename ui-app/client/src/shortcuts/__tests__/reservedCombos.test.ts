import { checkReserved } from '../reservedCombos';

describe('checkReserved', () => {
	it('blocks combos the browser never hands over', () => {
		for (const spec of ['Mod+W', 'Mod+T', 'Mod+N', 'F11', 'F12', 'Mod+Shift+I']) {
			expect(checkReserved(spec, false)?.level).toBe('BLOCKED');
			expect(checkReserved(spec, true)?.level).toBe('BLOCKED');
		}
	});

	it('blocks the Apple only system combos on Apple alone', () => {
		expect(checkReserved('Mod+Q', true)?.level).toBe('BLOCKED');
		expect(checkReserved('Mod+Q', false)).toBeUndefined();
		expect(checkReserved('Mod+H', true)?.level).toBe('BLOCKED');
	});

	it('warns on combos that hijack a browser function but still work', () => {
		for (const spec of ['Mod+S', 'Mod+P', 'Mod+F', 'Mod+R', 'Mod+1']) {
			expect(checkReserved(spec, false)?.level).toBe('RISKY');
			expect(checkReserved(spec, true)?.level).toBe('RISKY');
		}
	});

	it('passes the idiomatic web app combos with no warning', () => {
		for (const spec of ['Mod+K', 'Mod+J', 'Mod+E', 'Mod+B', 'Mod+Enter', 'Mod+Shift+P', 'Alt+D', '/']) {
			expect(checkReserved(spec, false)).toBeUndefined();
			expect(checkReserved(spec, true)).toBeUndefined();
		}
	});

	it('blocks the combos the cheat sheet overlay claims for itself', () => {
		// The cheat sheet listens at window capture and stops propagation, so the
		// registry never sees these. Authors need to know before they ship.
		for (const spec of ['Mod+/', 'Shift+/', '?']) {
			expect(checkReserved(spec, false)?.level).toBe('BLOCKED');
			expect(checkReserved(spec, true)?.level).toBe('BLOCKED');
		}
	});

	it('gives a reason that reads as a full sentence', () => {
		expect(checkReserved('Mod+W', false)?.reason).toBe('The browser closes the tab.');
		expect(checkReserved('Mod+S', false)?.reason).toBe('The browser normally saves the page.');
	});

	it('expands Mod per platform before matching', () => {
		// Ctrl+W closes a tab on Windows. On a Mac, Control+W does not.
		expect(checkReserved('Ctrl+W', false)?.level).toBe('BLOCKED');
		expect(checkReserved('Ctrl+W', true)).toBeUndefined();
		expect(checkReserved('Cmd+W', true)?.level).toBe('BLOCKED');
	});

	it('returns undefined for an unparseable spec', () => {
		expect(checkReserved(undefined)).toBeUndefined();
		expect(checkReserved('')).toBeUndefined();
		expect(checkReserved('Ctrl+Shift')).toBeUndefined();
	});
});
