import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { STORE_PATH_SHORTCUT_ANNOUNCE, STORE_PATH_SHORTCUT_CHOOSER } from '../../constants';
import { setData } from '../../context/StoreContext';
import { __setApplePlatformForTests } from '../comboUtil';
import { __resetLayersForTests } from '../layerStack';
import { ShortcutChooser } from '../ShortcutChooser';
import { shortcutRegistry, type ShortcutRegistration } from '../shortcutRegistry';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function makeReg(id: string, label: string, run: jest.Mock): ShortcutRegistration {
	return {
		id,
		combo: 'ctrl+s',
		spec: 'Mod+S',
		label,
		scope: 'PAGE',
		pageName: 'testPage',
		level: 0,
		layer: 0,
		priority: 0,
		enabled: () => true,
		run,
	};
}

function render() {
	act(() => {
		root.render(<ShortcutChooser />);
	});
}

function panel(): HTMLElement | null {
	return document.body.querySelector('._shortcutChooserPanel');
}

function press(key: string) {
	const el = panel()!;
	act(() => {
		el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
	});
}

function options(): HTMLElement[] {
	return Array.from(document.body.querySelectorAll('._shortcutOption'));
}

beforeEach(() => {
	__setApplePlatformForTests(false);
	__resetLayersForTests();
	shortcutRegistry.__resetForTests();
	setData(STORE_PATH_SHORTCUT_CHOOSER, undefined, undefined, true);
	setData(STORE_PATH_SHORTCUT_ANNOUNCE, undefined, undefined, true);
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	setData(STORE_PATH_SHORTCUT_CHOOSER, undefined, undefined, true);
	setData(STORE_PATH_SHORTCUT_ANNOUNCE, undefined, undefined, true);
	__setApplePlatformForTests(undefined);
});

describe('ShortcutChooser', () => {
	it('stays closed until a tie puts more than one option in the store', () => {
		render();
		expect(panel()).toBeNull();

		act(() => {
			setData(STORE_PATH_SHORTCUT_CHOOSER, {
				display: 'Ctrl+S',
				options: [{ id: 'a', label: 'Save', pageName: 'p', scopeLabel: 'This page' }],
			});
		});
		// A single option is not a conflict, so nothing should appear.
		expect(panel()).toBeNull();
	});

	it('opens on a tie and lists every candidate', () => {
		render();
		const a = jest.fn();
		const b = jest.fn();
		shortcutRegistry.register(makeReg('a', 'Save Draft', a));
		shortcutRegistry.register(makeReg('b', 'Save and Close', b));

		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});

		expect(panel()).not.toBeNull();
		expect(options()).toHaveLength(2);
		expect(document.body.textContent).toContain('Save Draft');
		expect(document.body.textContent).toContain('Save and Close');
		expect(a).not.toHaveBeenCalled();
		expect(b).not.toHaveBeenCalled();
	});

	it('runs the option matching a pressed digit', () => {
		render();
		const a = jest.fn();
		const b = jest.fn();
		shortcutRegistry.register(makeReg('a', 'First', a));
		shortcutRegistry.register(makeReg('b', 'Second', b));
		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});

		press('2');

		expect(b).toHaveBeenCalledTimes(1);
		expect(a).not.toHaveBeenCalled();
		expect(panel()).toBeNull();
	});

	it('moves the active row with the arrows and runs it on Enter', () => {
		render();
		const a = jest.fn();
		const b = jest.fn();
		shortcutRegistry.register(makeReg('a', 'First', a));
		shortcutRegistry.register(makeReg('b', 'Second', b));
		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});

		expect(options()[0].className).toContain('_active');

		press('ArrowDown');
		expect(options()[1].className).toContain('_active');

		press('Enter');
		expect(b).toHaveBeenCalledTimes(1);
		expect(a).not.toHaveBeenCalled();
	});

	it('wraps the arrow selection around the ends', () => {
		render();
		shortcutRegistry.register(makeReg('a', 'First', jest.fn()));
		shortcutRegistry.register(makeReg('b', 'Second', jest.fn()));
		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});

		press('ArrowUp');
		expect(options()[1].className).toContain('_active');
	});

	it('dismisses on Escape without running anything', () => {
		render();
		const a = jest.fn();
		const b = jest.fn();
		shortcutRegistry.register(makeReg('a', 'First', a));
		shortcutRegistry.register(makeReg('b', 'Second', b));
		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});

		press('Escape');

		expect(panel()).toBeNull();
		expect(a).not.toHaveBeenCalled();
		expect(b).not.toHaveBeenCalled();
	});

	it('always renders the shared live region, even while closed', () => {
		render();
		expect(container.querySelector('._srOnly[role="status"]')).not.toBeNull();

		act(() => setData(STORE_PATH_SHORTCUT_ANNOUNCE, 'Focused Search'));
		expect(container.querySelector('._srOnly')?.textContent).toBe('Focused Search');
	});
});
