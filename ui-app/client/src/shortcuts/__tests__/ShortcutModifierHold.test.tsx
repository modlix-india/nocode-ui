import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { ShortcutModifierHold } from '../ShortcutModifierHold';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const classes = () => Array.from(document.body.classList).filter(c => c.startsWith('_mod'));

function keyDown(init: KeyboardEventInit) {
	act(() => {
		window.dispatchEvent(new KeyboardEvent('keydown', init));
	});
}

function keyUp(init: KeyboardEventInit) {
	act(() => {
		window.dispatchEvent(new KeyboardEvent('keyup', init));
	});
}

/** The hold is armed on a timer, so nothing appears until it elapses. */
function elapseHold() {
	act(() => {
		jest.advanceTimersByTime(600);
	});
}

beforeEach(() => {
	jest.useFakeTimers();
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
	act(() => root.render(<ShortcutModifierHold />));
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	document.body.className = '';
	jest.useRealTimers();
});

describe('holding a modifier', () => {
	it('shows nothing before the hold elapses', () => {
		keyDown({ key: 'Meta', metaKey: true });
		act(() => {
			jest.advanceTimersByTime(300);
		});
		expect(classes()).toEqual([]);
	});

	it('marks the body with the held modifier and nothing else', () => {
		keyDown({ key: 'Meta', metaKey: true });
		elapseHold();
		expect(classes()).toEqual(['_modMeta']);
	});

	it('marks Alt, which no reveal reached before', () => {
		keyDown({ key: 'Alt', altKey: true });
		elapseHold();
		expect(classes()).toEqual(['_modAlt']);
	});

	it('marks Control', () => {
		keyDown({ key: 'Control', ctrlKey: true });
		elapseHold();
		expect(classes()).toEqual(['_modCtrl']);
	});

	it('clears on the modifier going up', () => {
		keyDown({ key: 'Meta', metaKey: true });
		elapseHold();
		keyUp({ key: 'Meta' });
		expect(classes()).toEqual([]);
	});

	it('clears when the window loses focus, since Cmd+Tab sends no keyup', () => {
		keyDown({ key: 'Meta', metaKey: true });
		elapseHold();
		act(() => {
			window.dispatchEvent(new Event('blur'));
		});
		expect(classes()).toEqual([]);
	});
});

describe('what does not arm the reveal', () => {
	it('a real shortcut, whose second key cancels the pending hold', () => {
		keyDown({ key: 'Meta', metaKey: true });
		keyDown({ key: 'k', code: 'KeyK', metaKey: true });
		elapseHold();
		expect(classes()).toEqual([]);
	});

	it('a second key pressed after the chips are already up', () => {
		keyDown({ key: 'Meta', metaKey: true });
		elapseHold();
		expect(classes()).toEqual(['_modMeta']);

		keyDown({ key: 'k', code: 'KeyK', metaKey: true });
		expect(classes()).toEqual([]);
	});

	it('two modifiers at once, which is a combo being typed, not a question', () => {
		keyDown({ key: 'Meta', metaKey: true });
		keyDown({ key: 'Alt', metaKey: true, altKey: true });
		elapseHold();
		expect(classes()).toEqual([]);
	});

	it('Shift, which has no shortcuts of its own to reveal', () => {
		keyDown({ key: 'Shift', shiftKey: true });
		elapseHold();
		expect(classes()).toEqual([]);
	});

	it('an ordinary letter', () => {
		keyDown({ key: 'a', code: 'KeyA' });
		elapseHold();
		expect(classes()).toEqual([]);
	});
});

describe('teardown', () => {
	it('leaves no class behind when it unmounts mid-hold', () => {
		keyDown({ key: 'Meta', metaKey: true });
		elapseHold();
		expect(classes()).toEqual(['_modMeta']);

		act(() => root.unmount());
		expect(classes()).toEqual([]);

		// The afterEach unmount would otherwise run on an unmounted root.
		root = createRoot(container);
	});
});
