/**
 * SignaturePad component: empty at first (hint shown, Clear disabled, nothing bound), a drawn
 * stroke writes a PNG data URL to the binding and runs On Change, Undo of the only stroke and
 * Clear both remove the key, a value cleared by the page clears the pad, and read only ignores
 * the pointer. STUBBED: the store, runEvent, styles, the helper overlay and the 2D canvas (jsdom
 * has none).
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const runEventMock = jest.fn().mockResolvedValue(undefined);
jest.mock('../../util/runEvent', () => ({ runEvent: (...a: any[]) => runEventMock(...a) }));

const storeValues = new Map<string, any>();
const listeners = new Map<string, (path: string, v: any) => void>();
const setDataMock = jest.fn((path: string, value: any, _ctx?: string, deleteKey?: boolean) => {
	if (deleteKey) storeValues.delete(path);
	else storeValues.set(path, value);
	listeners.get(path)?.(path, storeValues.get(path));
});
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediately: (
		_p: string,
		cb: (path: string, v: any) => void,
		path: string,
	) => {
		listeners.set(path, cb);
		cb(path, storeValues.get(path));
		return () => listeners.delete(path);
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	setData: (...a: any[]) => (setDataMock as any)(...a),
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties, stylePropertiesWithPseudoStates: {} }),
}));

import SignaturePad from '../LazySignaturePad';

const PNG = 'data:image/png;base64,iVBORw0KGgo';

beforeAll(() => {
	const ctx = new Proxy(
		{},
		{ get: (_t, k) => (k === 'then' ? undefined : () => {}), set: () => true },
	);
	(HTMLCanvasElement.prototype as any).getContext = () => ctx;
	(HTMLCanvasElement.prototype as any).toDataURL = () => PNG;
});

const definition = {
	key: 'sig',
	name: 'sig',
	type: 'SignaturePad',
	bindingPath: { value: 'Page.signature' },
} as any;
const pageDefinition = { eventFunctions: { signed: { name: 'signed' } } } as any;

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	storeValues.clear();
	listeners.clear();
	runEventMock.mockClear();
	setDataMock.mockClear();
	properties = { onChange: 'signed', placeholder: 'Sign here', showUndo: true };
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
});

function render() {
	const Comp = SignaturePad as any;
	act(() =>
		root.render(
			<Comp
				definition={definition}
				pageDefinition={pageDefinition}
				locationHistory={[]}
				context={{ pageName: 'p' }}
			/>,
		),
	);
}

function pointer(type: string, x: number, y: number) {
	const canvas = host.querySelector('canvas')!;
	const Ctor: any = (globalThis as any).PointerEvent ?? MouseEvent;
	const ev = new Ctor(type, {
		bubbles: true,
		cancelable: true,
		clientX: x,
		clientY: y,
		button: 0,
	});
	Object.defineProperty(ev, 'pointerId', { value: 1 });
	Object.defineProperty(ev, 'pointerType', { value: 'touch' });
	act(() => {
		canvas.dispatchEvent(ev);
	});
}

function drawStroke() {
	pointer('pointerdown', 10, 10);
	pointer('pointermove', 30, 20);
	pointer('pointermove', 60, 25);
	pointer('pointerup', 60, 25);
}

const button = (cls: string) => host.querySelector(`button.${cls}`) as HTMLButtonElement;

test('empty: hint shown, Clear and Undo disabled, nothing written', () => {
	render();
	expect(host.querySelector('._hint')?.textContent).toBe('Sign here');
	expect(host.querySelector('.compSignaturePad')!.classList.contains('_empty')).toBe(true);
	expect(button('_clear').disabled).toBe(true);
	expect(button('_undo').disabled).toBe(true);
	expect(setDataMock).not.toHaveBeenCalled();
	expect(storeValues.has('Page.signature')).toBe(false);
});

test('a stroke writes a PNG data URL and runs On Change', () => {
	render();
	drawStroke();
	expect(storeValues.get('Page.signature')).toBe(PNG);
	expect(runEventMock).toHaveBeenCalledTimes(1);
	expect(host.querySelector('._hint')).toBeNull();
	expect(button('_clear').disabled).toBe(false);
	expect(button('_undo').disabled).toBe(false);
});

test('Clear removes the key and shows the hint again', () => {
	render();
	drawStroke();
	act(() => button('_clear').click());
	expect(storeValues.has('Page.signature')).toBe(false);
	expect(setDataMock).toHaveBeenLastCalledWith('Page.signature', undefined, 'p', true);
	expect(host.querySelector('._hint')?.textContent).toBe('Sign here');
	expect(runEventMock).toHaveBeenCalledTimes(2);
});

test('Undo of the only stroke leaves no value; of one of two keeps a value', () => {
	render();
	drawStroke();
	drawStroke();
	act(() => button('_undo').click());
	expect(storeValues.get('Page.signature')).toBe(PNG);
	act(() => button('_undo').click());
	expect(storeValues.has('Page.signature')).toBe(false);
	expect(button('_undo').disabled).toBe(true);
});

test('the page clearing the bound value clears the pad', () => {
	render();
	drawStroke();
	act(() => setDataMock('Page.signature', undefined, 'p', true));
	expect(host.querySelector('._hint')?.textContent).toBe('Sign here');
	expect(button('_undo').disabled).toBe(true);
});

test('a value already in the store is shown as an image', () => {
	storeValues.set('Page.signature', PNG);
	render();
	expect(host.querySelector('img._image')?.getAttribute('src')).toBe(PNG);
	expect(host.querySelector('._hint')).toBeNull();
	expect(button('_clear').disabled).toBe(false);
});

test('read only: no buttons and the pointer draws nothing', () => {
	properties = { ...properties, readOnly: true };
	render();
	expect(host.querySelector('button')).toBeNull();
	expect(host.querySelector('.compSignaturePad')!.classList.contains('_readOnly')).toBe(true);
	drawStroke();
	expect(setDataMock).not.toHaveBeenCalled();
});
