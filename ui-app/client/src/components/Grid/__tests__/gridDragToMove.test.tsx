/**
 * Opt-in "Move by dragging" on Grid (dragToMove, dragMemory, dragInset), CXZ-1742: wrap
 * any component in a Grid to make it draggable.
 *
 * Off by default: no listeners, no position, nothing fetched, children click as before.
 * On: a tap reaches the child (a Button inside still clicks); once a drag starts the
 * Grid swallows the drag's events in the capture phase, so the child never sees the
 * release or the click after it; the Grid follows the pointer inside the window. With
 * _PERSONALIZATION the spot is read once on mount and written (debounced) only at the
 * end of a drag; a failed read, a missing document or a signed out user leaves the grid
 * where its style puts it.
 *
 * REAL: Grid, usePointerDrag, the personalization helper.
 * STUBBED: axios, the store (synchronous listeners, as the real one), runEvent, style
 * processing, the helper overlay, the router, and Children (one plain button with a
 * React onClick, standing in for a child Button).
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import axios from 'axios';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../util/runEvent', () => ({ runEvent: jest.fn().mockResolvedValue(undefined) }));

const listeners = new Map<string, Set<(path: string, value: any) => void>>();
const storeValues = new Map<string, any>();

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'testpage' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListener: () => () => {},
	addListenerAndCallImmediatelyWithChildrenActivity: (
		_pageName: string,
		callback: (path: string, value: any) => void,
		path: string,
	) => {
		if (!listeners.has(path)) listeners.set(path, new Set());
		listeners.get(path)!.add(callback);
		callback(path, storeValues.get(path));
		return () => listeners.get(path)?.delete(callback);
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	getDataFromPath: (path: string) => {
		if (!path) return undefined;
		if (storeValues.has(path)) return storeValues.get(path);
		// Store.personalization.testpage.wrap.dragPosition and the like.
		const dot = path.lastIndexOf('.');
		const parent = storeValues.get(path.substring(0, dot));
		return parent && typeof parent === 'object' ? parent[path.substring(dot + 1)] : undefined;
	},
	setData: (path: string, value: any) => {
		if (value === undefined) storeValues.delete(path);
		else storeValues.set(path, value);
		listeners.get(path)?.forEach(cb => cb(path, value));
	},
}));

jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({
		comp: { position: 'fixed', right: '24px', bottom: '24px' },
	}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('react-router-dom', () => ({
	Link: (p: any) => <a {...p} />,
	useLocation: () => ({ pathname: '/' }),
}));

const childClick = jest.fn();
jest.mock('../../Children', () => ({
	__esModule: true,
	default: () => (
		<button type="button" className="child" onClick={() => childClick()}>
			child
		</button>
	),
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'wrap', properties, stylePropertiesWithPseudoStates: {} }),
}));

// Imported after the mocks.
import GridComponent from '../Grid';
import { draggedThisVisit } from '../../../functions/usePointerDrag';

const PAGE_DEFINITION = { name: 'testpage', translations: {}, eventFunctions: {} };
const DOC_URL = 'api/ui/personalization/cxzump/grid_testpage_wrap';
const BINDING = 'Store.personalization.testpage.wrap';

// Every element is a 48 px box 24 px from the right and bottom of jsdom's 1024 x 768 window.
const originalRect = HTMLElement.prototype.getBoundingClientRect;
beforeAll(() => {
	HTMLElement.prototype.getBoundingClientRect = function () {
		return {
			left: 1024 - 24 - 48,
			top: 768 - 24 - 48,
			width: 48,
			height: 48,
			right: 1024 - 24,
			bottom: 768 - 24,
		} as DOMRect;
	};
});
afterAll(() => {
	HTMLElement.prototype.getBoundingClientRect = originalRect;
});

let container: HTMLDivElement;
let root: Root;

const flush = async () => {
	await act(async () => {
		for (let i = 0; i < 5; i++) await Promise.resolve();
	});
};

function render(props: Record<string, any>) {
	properties = { containerType: 'DIV', layout: 'SINGLECOLUMNLAYOUT', ...props };
	const Comp = GridComponent.component as React.ComponentType<any>;
	act(() => {
		root.render(
			<Comp
				definition={{ key: 'wrap', name: 'wrap', type: 'Grid', children: { x: true } }}
				pageDefinition={PAGE_DEFINITION}
				locationHistory={[]}
				context={{ pageName: 'testpage' }}
			/>,
		);
	});
	const grid = container.querySelector('#wrap') as HTMLElement;
	const child = container.querySelector('button.child') as HTMLElement;
	return { grid, child };
}

const fire = (el: Element, type: string, x: number, y: number) =>
	act(() => {
		el.dispatchEvent(
			new MouseEvent(type, {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: x,
				clientY: y,
			}),
		);
	});

// A press on the child at (950, 720), moved by (dx, dy), released, then the browser's click.
function press(el: Element, dx: number, dy: number) {
	fire(el, 'pointerdown', 950, 720);
	if (dx || dy) fire(el, 'pointermove', 950 + dx, 720 + dy);
	fire(el, 'pointerup', 950 + dx, 720 + dy);
	fire(el, 'mouseup', 950 + dx, 720 + dy);
	fire(el, 'click', 950 + dx, 720 + dy);
}

beforeEach(() => {
	jest.useFakeTimers();
	jest.clearAllMocks();
	listeners.clear();
	storeValues.clear();
	draggedThisVisit.clear();
	storeValues.set('Store.application.appCode', 'cxzump');
	storeValues.set('LocalStore.AuthToken', 'token');
	mockedAxios.get.mockResolvedValue({ data: {} } as any);
	mockedAxios.post.mockResolvedValue({} as any);
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	jest.useRealTimers();
});

describe('Grid without dragToMove (the default)', () => {
	it('does not move, fetches nothing, and a drag over a child still clicks it', async () => {
		const { grid, child } = render({});
		await flush();
		press(child, -100, -200);

		expect(childClick).toHaveBeenCalledTimes(1);
		expect(grid.style.right).toBe('24px');
		expect(grid.style.left).toBe('');
		expect(grid.style.touchAction || '').toBe('');
		expect(grid.style.cursor || '').toBe('');
		expect(mockedAxios.get).not.toHaveBeenCalled();
	});

	it('ignores dragMemory without dragToMove', async () => {
		render({ dragMemory: '_PERSONALIZATION' });
		await flush();
		expect(mockedAxios.get).not.toHaveBeenCalled();
	});
});

describe('Grid with dragToMove', () => {
	it('a tap reaches the child', () => {
		const { grid, child } = render({ dragToMove: true });
		expect(grid.style.touchAction).toBe('none');
		expect(grid.style.cursor).toBe('grab');
		press(child, 2, 1);
		expect(childClick).toHaveBeenCalledTimes(1);
		expect(grid.style.left).toBe('');
	});

	it('a drag moves the grid and never reaches the child', () => {
		const { grid, child } = render({ dragToMove: true });
		const seen: string[] = [];
		['pointerup', 'mouseup', 'click'].forEach(t =>
			child.addEventListener(t, () => seen.push(t)),
		);
		press(child, -100, -200);

		expect(childClick).not.toHaveBeenCalled();
		expect(seen).toEqual([]);
		expect(grid.style.right).toBe('124px');
		expect(grid.style.bottom).toBe('224px');
		expect(grid.style.left).toBe('auto');
		expect(grid.style.top).toBe('auto');

		// Next turn: a tap is a click again.
		act(() => jest.runOnlyPendingTimers());
		press(child, 0, 0);
		expect(childClick).toHaveBeenCalledTimes(1);
	});

	it('keeps keyboard events flowing to the child', () => {
		const { child } = render({ dragToMove: true });
		const keys = jest.fn();
		child.addEventListener('keydown', keys);
		act(() => {
			child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		});
		expect(keys).toHaveBeenCalledTimes(1);
	});

	it('keeps the grid inside the window by dragInset', () => {
		const { grid, child } = render({ dragToMove: true, dragInset: 16 });
		press(child, 500, 500);
		expect(grid.style.right).toBe('16px');
		expect(grid.style.bottom).toBe('16px');
	});

	it('remembers nothing with dragMemory _NONE', async () => {
		const { child } = render({ dragToMove: true, dragMemory: '_NONE' });
		await flush();
		press(child, -100, -200);
		act(() => jest.advanceTimersByTime(3000));
		expect(mockedAxios.get).not.toHaveBeenCalled();
		expect(mockedAxios.post).not.toHaveBeenCalled();
	});

	it('does nothing in the page editor', () => {
		(globalThis as any).isDesignMode = true;
		try {
			const { grid, child } = render({ dragToMove: true, dragMemory: '_PERSONALIZATION' });
			expect(grid.style.touchAction || '').toBe('');
			press(child, -100, -200);
			expect(grid.style.left).toBe('');
			expect(mockedAxios.get).not.toHaveBeenCalled();
		} finally {
			(globalThis as any).isDesignMode = false;
		}
	});
});

describe('dragMemory _PERSONALIZATION', () => {
	const remembered = { dragToMove: true, dragMemory: '_PERSONALIZATION' };

	it('reads the saved spot once on mount and puts the grid there', async () => {
		mockedAxios.get.mockResolvedValue({
			data: { dragPosition: { right: 300, bottom: 400 } },
		} as any);
		const { grid } = render(remembered);
		await flush();

		expect(mockedAxios.get).toHaveBeenCalledTimes(1);
		expect(mockedAxios.get).toHaveBeenCalledWith(DOC_URL, {
			headers: { Authorization: 'token' },
		});
		expect(grid.style.right).toBe('300px');
		expect(grid.style.bottom).toBe('400px');
	});

	it('brings a saved spot that no longer fits back inside the window', async () => {
		mockedAxios.get.mockResolvedValue({
			data: { dragPosition: { right: 5000, bottom: -50 } },
		} as any);
		const { grid } = render({ ...remembered, dragInset: 8 });
		await flush();
		// offsetWidth is 0 in jsdom, so the far edge is the window less the inset.
		expect(grid.style.right).toBe(`${1024 - 8}px`);
		expect(grid.style.bottom).toBe('8px');
	});

	it('saves the spot at the end of a drag, debounced, and not while dragging', async () => {
		const { child } = render(remembered);
		await flush();

		fire(child, 'pointerdown', 950, 720);
		fire(child, 'pointermove', 850, 520);
		expect(storeValues.get(BINDING)?.dragPosition).toBeUndefined();
		fire(child, 'pointerup', 850, 520);

		expect(storeValues.get(BINDING)).toEqual({ dragPosition: { right: 124, bottom: 224 } });
		expect(mockedAxios.post).not.toHaveBeenCalled();
		act(() => jest.advanceTimersByTime(2000));
		expect(mockedAxios.post).toHaveBeenCalledTimes(1);
		expect(mockedAxios.post).toHaveBeenCalledWith(
			DOC_URL,
			{ dragPosition: { right: 124, bottom: 224 } },
			{ headers: { Authorization: 'token' } },
		);
	});

	it('keeps the dragged size in the same document', async () => {
		mockedAxios.get.mockResolvedValue({ data: { resizeSize: 460 } } as any);
		const { child } = render(remembered);
		await flush();
		press(child, -100, -200);
		expect(storeValues.get(BINDING)).toEqual({
			resizeSize: 460,
			dragPosition: { right: 124, bottom: 224 },
		});
	});

	it('a grid shown again on the same visit starts where the store has it', async () => {
		storeValues.set(BINDING, { dragPosition: { right: 210, bottom: 330 } });
		mockedAxios.get.mockResolvedValue({
			data: { dragPosition: { right: 210, bottom: 330 } },
		} as any);
		const { grid } = render(remembered);
		// Before the GET answers.
		expect(grid.style.right).toBe('210px');
		expect(grid.style.bottom).toBe('330px');
		await flush();
	});

	it("this visit's drag wins over an older saved spot read when the grid shows again", async () => {
		mockedAxios.get.mockResolvedValue({
			data: { dragPosition: { right: 300, bottom: 400 } },
		} as any);
		let { grid, child } = render(remembered);
		await flush();
		press(child, -100, -200);
		expect(grid.style.right).toBe('124px');

		// Hidden and shown again before the debounced save reached the server.
		act(() => root.unmount());
		root = createRoot(container);
		({ grid } = render(remembered));
		expect(grid.style.right).toBe('124px');
		await flush();
		expect(grid.style.right).toBe('124px');
		expect(grid.style.bottom).toBe('224px');
	});

	it('a failed read leaves the grid at its style position and does not throw', async () => {
		mockedAxios.get.mockRejectedValue(new Error('500'));
		const { grid, child } = render(remembered);
		await flush();
		expect(grid.style.right).toBe('24px');
		expect(grid.style.left).toBe('');
		// Still draggable for this visit.
		press(child, -100, -200);
		expect(grid.style.right).toBe('124px');
	});

	it('a failed save is silent', async () => {
		mockedAxios.post.mockRejectedValue(new Error('500'));
		const { grid, child } = render(remembered);
		await flush();
		press(child, -100, -200);
		act(() => jest.advanceTimersByTime(2000));
		await flush();
		expect(mockedAxios.post).toHaveBeenCalledTimes(1);
		expect(grid.style.right).toBe('124px');
	});

	it('a document without a usable spot is ignored', async () => {
		mockedAxios.get.mockResolvedValue({ data: { dragPosition: { right: 'x' } } } as any);
		const { grid } = render(remembered);
		await flush();
		expect(grid.style.right).toBe('24px');
		expect(grid.style.left).toBe('');
	});

	it('a signed out user gets no read and no save', async () => {
		storeValues.delete('LocalStore.AuthToken');
		const { grid, child } = render(remembered);
		await flush();
		press(child, -100, -200);
		act(() => jest.advanceTimersByTime(3000));
		expect(mockedAxios.get).not.toHaveBeenCalled();
		expect(mockedAxios.post).not.toHaveBeenCalled();
		expect(grid.style.right).toBe('124px');
	});
});
