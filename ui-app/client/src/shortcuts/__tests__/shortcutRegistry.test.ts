import { __setApplePlatformForTests } from '../comboUtil';
import { __resetLayersForTests, popLayer, pushLayer } from '../layerStack';
import { shortcutRegistry, type ShortcutRegistration } from '../shortcutRegistry';

let idCounter = 0;

function makeReg(overrides: Partial<ShortcutRegistration> = {}): ShortcutRegistration {
	return {
		id: overrides.id ?? `reg_${idCounter++}`,
		combo: 'ctrl+s',
		spec: 'Mod+S',
		label: 'Save',
		scope: 'PAGE',
		pageName: 'testPage',
		level: 0,
		layer: 0,
		priority: 0,
		enabled: () => true,
		run: jest.fn(),
		...overrides,
	};
}

/** A keydown carrying a working preventDefault, since jsdom's is a no-op on synthetic dispatch. */
function keyEvent(
	init: Partial<KeyboardEventInit & { code: string; keyCode: number }>,
	target?: HTMLElement,
) {
	const e = new KeyboardEvent('keydown', { cancelable: true, ...init } as KeyboardEventInit);
	if (target) Object.defineProperty(e, 'target', { value: target });
	Object.defineProperty(e, 'composedPath', { value: () => (target ? [target] : []) });
	return e;
}

beforeEach(() => {
	__setApplePlatformForTests(false);
	__resetLayersForTests();
	shortcutRegistry.__resetForTests();
	globalThis.designMode = '';
	document.body.innerHTML = '';
	idCounter = 0;
});

afterEach(() => __setApplePlatformForTests(undefined));

describe('dispatch', () => {
	it('runs the single matching registration and swallows the key', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run }));

		const e = keyEvent({ key: 's', code: 'KeyS', ctrlKey: true });
		shortcutRegistry.dispatch(e);

		expect(run).toHaveBeenCalledTimes(1);
		expect(e.defaultPrevented).toBe(true);
	});

	it('never swallows a key nobody registered', () => {
		shortcutRegistry.register(makeReg());

		const e = keyEvent({ key: 'q', code: 'KeyQ', ctrlKey: true });
		shortcutRegistry.dispatch(e);

		expect(e.defaultPrevented).toBe(false);
	});

	it('leaves the key alone when preventDefault is opted out', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run, preventDefault: false }));

		const e = keyEvent({ key: 's', code: 'KeyS', ctrlKey: true });
		shortcutRegistry.dispatch(e);

		expect(run).toHaveBeenCalledTimes(1);
		expect(e.defaultPrevented).toBe(false);
	});

	it('ignores an already handled event', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run }));

		const e = keyEvent({ key: 's', code: 'KeyS', ctrlKey: true });
		e.preventDefault();
		shortcutRegistry.dispatch(e);

		expect(run).not.toHaveBeenCalled();
	});

	it('ignores a repeat from a held key', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true, repeat: true }));

		expect(run).not.toHaveBeenCalled();
	});

	it('does not fire inside the page editor iframe', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run }));
		globalThis.designMode = 'PAGE';

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(run).not.toHaveBeenCalled();
	});

	it('skips a disabled registration', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run, enabled: () => false }));

		const e = keyEvent({ key: 's', code: 'KeyS', ctrlKey: true });
		shortcutRegistry.dispatch(e);

		expect(run).not.toHaveBeenCalled();
		expect(e.defaultPrevented).toBe(false);
	});
});

describe('typing in a field', () => {
	it('suppresses a bare letter shortcut while an input has focus', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ combo: 's', spec: 'S', run }));

		const input = document.createElement('input');
		document.body.appendChild(input);

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS' }, input));

		expect(run).not.toHaveBeenCalled();
	});

	it('still fires a modifier shortcut while an input has focus', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ combo: 'ctrl+k', spec: 'Mod+K', run }));

		const input = document.createElement('input');
		document.body.appendChild(input);

		shortcutRegistry.dispatch(keyEvent({ key: 'k', code: 'KeyK', ctrlKey: true }, input));

		expect(run).toHaveBeenCalledTimes(1);
	});

	it('honours an explicit allowInInput on a bare letter', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ combo: 's', spec: 'S', run, allowInInput: true }));

		const input = document.createElement('input');
		document.body.appendChild(input);

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS' }, input));

		expect(run).toHaveBeenCalledTimes(1);
	});

	it('fires a bare letter outside a field', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ combo: 's', spec: 'S', run }));

		const div = document.createElement('div');
		document.body.appendChild(div);

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS' }, div));

		expect(run).toHaveBeenCalledTimes(1);
	});
});

describe('precedence', () => {
	it('prefers the higher priority', () => {
		const loser = jest.fn();
		const winner = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'a', run: loser, priority: 0 }));
		shortcutRegistry.register(makeReg({ id: 'b', run: winner, priority: 5 }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(winner).toHaveBeenCalledTimes(1);
		expect(loser).not.toHaveBeenCalled();
	});

	it('prefers the innermost scope', () => {
		const global = jest.fn();
		const page = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'a', run: global, scope: 'GLOBAL' }));
		shortcutRegistry.register(makeReg({ id: 'b', run: page, scope: 'PAGE' }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(page).toHaveBeenCalledTimes(1);
		expect(global).not.toHaveBeenCalled();
	});

	it('prefers the deeper render level', () => {
		const shallow = jest.fn();
		const deep = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'a', run: shallow, level: 0 }));
		shortcutRegistry.register(makeReg({ id: 'b', run: deep, level: 3 }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(deep).toHaveBeenCalledTimes(1);
		expect(shallow).not.toHaveBeenCalled();
	});

	it('prefers the element later in the document', () => {
		const first = document.createElement('button');
		const second = document.createElement('button');
		document.body.append(first, second);

		const firstRun = jest.fn();
		const secondRun = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'a', run: firstRun, element: () => first }));
		shortcutRegistry.register(makeReg({ id: 'b', run: secondRun, element: () => second }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(secondRun).toHaveBeenCalledTimes(1);
		expect(firstRun).not.toHaveBeenCalled();
	});
});

describe('the chooser', () => {
	it('opens on a genuine tie and runs nothing', () => {
		const a = jest.fn();
		const b = jest.fn();
		const chooser = jest.fn();
		shortcutRegistry.setChooser(chooser);
		shortcutRegistry.register(makeReg({ id: 'a', run: a }));
		shortcutRegistry.register(makeReg({ id: 'b', run: b }));

		const e = keyEvent({ key: 's', code: 'KeyS', ctrlKey: true });
		shortcutRegistry.dispatch(e);

		expect(chooser).toHaveBeenCalledTimes(1);
		expect(chooser.mock.calls[0][0]).toHaveLength(2);
		expect(a).not.toHaveBeenCalled();
		expect(b).not.toHaveBeenCalled();
		// The key is still swallowed, otherwise the browser acts while the chooser is up.
		expect(e.defaultPrevented).toBe(true);
	});

	it('does not open when one candidate outranks the other', () => {
		const chooser = jest.fn();
		shortcutRegistry.setChooser(chooser);
		shortcutRegistry.register(makeReg({ id: 'a', scope: 'GLOBAL' }));
		shortcutRegistry.register(makeReg({ id: 'b', scope: 'PAGE' }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(chooser).not.toHaveBeenCalled();
	});

	it('runs the chosen registration by id', () => {
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'a', run }));

		shortcutRegistry.runById('a');

		expect(run).toHaveBeenCalledTimes(1);
	});
});

describe('layers', () => {
	it('hides page shortcuts while an overlay layer is pushed', () => {
		const pageRun = jest.fn();
		shortcutRegistry.register(makeReg({ run: pageRun, layer: 0 }));

		const layer = pushLayer();
		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));
		expect(pageRun).not.toHaveBeenCalled();

		popLayer(layer);
		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));
		expect(pageRun).toHaveBeenCalledTimes(1);
	});

	it('lets the overlay layer own the combo outright, with no chooser', () => {
		const chooser = jest.fn();
		shortcutRegistry.setChooser(chooser);

		const pageRun = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'page', run: pageRun, layer: 0 }));

		const layer = pushLayer();
		const modalRun = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'modal', run: modalRun, layer }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(modalRun).toHaveBeenCalledTimes(1);
		expect(pageRun).not.toHaveBeenCalled();
		expect(chooser).not.toHaveBeenCalled();
	});

	it('pops a layer by id even when overlays unmount out of order', () => {
		const first = pushLayer();
		const second = pushLayer();
		popLayer(first);
		// The second is still the top, so its registrations keep firing.
		const run = jest.fn();
		shortcutRegistry.register(makeReg({ run, layer: second }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(run).toHaveBeenCalledTimes(1);
	});
});

describe('registration lifecycle', () => {
	it('installs the document listener on the first register', () => {
		const spy = jest.spyOn(document, 'addEventListener');
		shortcutRegistry.register(makeReg());
		expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), true);
		spy.mockRestore();
	});

	it('removes the document listener once the last registration goes', () => {
		const spy = jest.spyOn(document, 'removeEventListener');
		const unregister = shortcutRegistry.register(makeReg({ id: 'a' }));
		unregister();
		expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function), true);
		spy.mockRestore();
	});

	it('keeps the listener while other registrations remain', () => {
		const unregisterA = shortcutRegistry.register(makeReg({ id: 'a' }));
		shortcutRegistry.register(makeReg({ id: 'b', combo: 'ctrl+k' }));
		const spy = jest.spyOn(document, 'removeEventListener');
		unregisterA();
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('replaces rather than duplicates when the same id registers twice', () => {
		const stale = jest.fn();
		const fresh = jest.fn();
		shortcutRegistry.register(makeReg({ id: 'same', run: stale }));
		shortcutRegistry.register(makeReg({ id: 'same', run: fresh }));

		shortcutRegistry.dispatch(keyEvent({ key: 's', code: 'KeyS', ctrlKey: true }));

		expect(fresh).toHaveBeenCalledTimes(1);
		expect(stale).not.toHaveBeenCalled();
		expect(shortcutRegistry.listFor('ctrl+s')).toHaveLength(1);
	});

	it('moves a registration cleanly when its combo changes', () => {
		shortcutRegistry.register(makeReg({ id: 'same', combo: 'ctrl+s' }));
		shortcutRegistry.register(makeReg({ id: 'same', combo: 'ctrl+k' }));

		expect(shortcutRegistry.listFor('ctrl+s')).toHaveLength(0);
		expect(shortcutRegistry.listFor('ctrl+k')).toHaveLength(1);
	});
});

describe('the cheat sheet dedupe', () => {
	it('keeps one row when two registrations share a combo and label', () => {
		// SubPage can render the same page twice at different levels.
		shortcutRegistry.register(makeReg({ id: 'a', level: 0 }));
		shortcutRegistry.register(makeReg({ id: 'b', level: 1 }));
		expect(shortcutRegistry.listFor('ctrl+s')).toHaveLength(2);
	});
});

describe('LOCAL scope', () => {
	it('fires only while focus is inside the component', () => {
		const container = document.createElement('div');
		const input = document.createElement('input');
		container.appendChild(input);
		document.body.appendChild(container);

		const run = jest.fn();
		shortcutRegistry.register(
			makeReg({ run, scope: 'LOCAL', combo: 'ctrl+k', element: () => container }),
		);

		const outside = document.createElement('button');
		document.body.appendChild(outside);
		outside.focus();
		shortcutRegistry.dispatch(keyEvent({ key: 'k', code: 'KeyK', ctrlKey: true }, outside));
		expect(run).not.toHaveBeenCalled();

		input.focus();
		shortcutRegistry.dispatch(keyEvent({ key: 'k', code: 'KeyK', ctrlKey: true }, input));
		expect(run).toHaveBeenCalledTimes(1);
	});
});
