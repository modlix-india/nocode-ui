/**
 * A mouse click on an image's W or H box focused it, but Chrome left the document selection in
 * the island's text beside the box ("W|"), so keys went to that caret and nothing was typed until
 * the box's own text was selected. The editor also read that selection as its caret, and wrote
 * its caret back into the text on the next render, which took the keys from the box.
 *
 * REAL: BlockEditor, BlockRenderer's ImageBlock, DraftNumberInput and the escape guard. jsdom
 * does not place a selection on a click, so the tests check what the code does with the events:
 * the first mousedown focuses the box from code, the editor leaves its caret alone while the box
 * has focus, and Enter or Escape bring the caret back to where it was in the text.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BlockEditor, BlockEditorRef } from '../blockEditor';
import { createDocument } from '../blockEditor/core/document';

jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => undefined,
	UrlDetailsExtractor: { getForContext: () => ({}) },
	PageStoreExtractor: { getForContext: () => ({}) },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let editorRef: React.RefObject<BlockEditorRef | null>;

beforeAll(() => {
	(globalThis as any).ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	globalThis.matchMedia ??= ((q: string) => ({
		matches: false,
		media: q,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {},
		onchange: null,
		dispatchEvent: () => false,
	})) as any;
});

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
	editorRef = React.createRef<BlockEditorRef>();
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const TEXT_ID = 'p1';

function renderEditor() {
	const doc = createDocument([
		{
			id: TEXT_ID,
			type: 'paragraph',
			content: [{ text: 'Image size test' }],
			children: [],
			props: {},
		} as any,
		{
			id: 'img1',
			type: 'image',
			content: [],
			children: [],
			props: { src: 'https://example.com/a.png', width: 400, height: 200 },
		} as any,
	]);
	act(() => root.render(<BlockEditor ref={editorRef} initialDocument={doc} />));
	// The caret in the text, then the image selected: its W and H boxes show.
	act(() =>
		editorRef.current!.focus({
			anchor: { blockId: TEXT_ID, offset: 5 },
			focus: { blockId: TEXT_ID, offset: 5 },
		}),
	);
	act(() => container.querySelector('img')!.parentElement!.click());
}

function editorRoot(): HTMLElement {
	return container.querySelector<HTMLElement>('.mde-editor')!;
}

function sizeBoxes(): HTMLInputElement[] {
	return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="number"]'));
}

function mouseDown(el: HTMLElement, button = 0): MouseEvent {
	const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button });
	act(() => {
		el.dispatchEvent(ev);
	});
	return ev;
}

function key(el: HTMLElement, k: string, type: 'keydown' | 'keyup' = 'keydown'): KeyboardEvent {
	const ev = new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true });
	act(() => {
		el.dispatchEvent(ev);
	});
	return ev;
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

function typeInto(el: HTMLInputElement, text: string) {
	act(() => {
		valueSetter.call(el, text);
		el.dispatchEvent(new Event('input', { bubbles: true }));
	});
}

/** Puts the document selection beside the box, where Chrome leaves it, and reports it. */
function selectionBesideBox(box: HTMLInputElement) {
	const label = box.parentElement!;
	act(() => {
		const range = document.createRange();
		range.setStart(label.firstChild!, 1);
		range.collapse(true);
		const sel = globalThis.getSelection()!;
		sel.removeAllRanges();
		sel.addRange(range);
		document.dispatchEvent(new Event('selectionchange'));
	});
}

test('the first mousedown on W focuses it from code and selects its text', () => {
	renderEditor();
	const [w] = sizeBoxes();
	expect(w.value).toBe('400');
	const seenByDocument: Event[] = [];
	const onDoc = (e: Event) => seenByDocument.push(e);
	document.addEventListener('mousedown', onDoc);
	const ev = mouseDown(w);
	document.removeEventListener('mousedown', onDoc);
	expect(ev.defaultPrevented).toBe(true);
	expect(document.activeElement).toBe(w);
	expect(seenByDocument).toEqual([]);
	// Typing goes to the box.
	typeInto(w, '320');
	expect(w.value).toBe('320');
	expect(container.querySelector('img')!.style.width).toBe('320px');
});

test('a mousedown on the box once it has focus places the caret as usual', () => {
	renderEditor();
	const [w] = sizeBoxes();
	mouseDown(w);
	expect(mouseDown(w).defaultPrevented).toBe(false);
	expect(mouseDown(sizeBoxes()[1], 2).defaultPrevented).toBe(false);
});

test('the editor keeps its caret in the text while the box has focus', () => {
	renderEditor();
	const [w] = sizeBoxes();
	mouseDown(w);
	selectionBesideBox(w);
	// A render (the image's width typed) does not write the caret back into the text.
	typeInto(w, '32');
	expect(document.activeElement).toBe(w);
	expect(editorRef.current!.getSelection()).toMatchObject({
		anchor: { blockId: TEXT_ID, offset: 5 },
	});
});

test('Enter commits and puts the caret back in the text where it was', () => {
	renderEditor();
	const [w] = sizeBoxes();
	mouseDown(w);
	selectionBesideBox(w);
	typeInto(w, '320');
	const updates: any[] = [];
	const onUpdate = (e: Event) => updates.push((e as CustomEvent).detail);
	globalThis.addEventListener('mde-image-update', onUpdate);
	key(w, 'Enter');
	globalThis.removeEventListener('mde-image-update', onUpdate);
	expect(document.activeElement).toBe(editorRoot());
	expect(updates[updates.length - 1]).toMatchObject({ blockId: 'img1', width: 320 });
	const sel = globalThis.getSelection()!;
	expect(sel.anchorNode?.textContent).toBe('Image size test');
	expect(sel.anchorOffset).toBe(5);
});

async function escape(el: HTMLElement) {
	key(el, 'Escape');
	// The box leaves for the text once it has dropped the typed text.
	await act(async () => {
		await Promise.resolve();
	});
	key(el, 'Escape', 'keyup');
}

test('Escape puts back the size from focus, across W and H, and returns to the text', async () => {
	renderEditor();
	const [w, h] = sizeBoxes();
	mouseDown(w);
	selectionBesideBox(w);
	typeInto(w, '3');
	typeInto(w, '32');
	expect(container.querySelector('img')!.style.width).toBe('32px');
	// Tab to H: still the same edit.
	key(w, 'Tab');
	expect(document.activeElement).toBe(h);
	typeInto(h, '50');
	const updates: any[] = [];
	const onUpdate = (e: Event) => updates.push((e as CustomEvent).detail);
	globalThis.addEventListener('mde-image-update', onUpdate);
	const bodyKeyUps: Event[] = [];
	const onBodyKeyUp = (e: Event) => bodyKeyUps.push(e);
	document.body.addEventListener('keyup', onBodyKeyUp);
	await escape(h);
	document.body.removeEventListener('keyup', onBodyKeyUp);
	globalThis.removeEventListener('mde-image-update', onUpdate);
	expect(container.querySelector('img')!.style.width).toBe('400px');
	expect(updates[updates.length - 1]).toMatchObject({ width: 400, height: 200 });
	expect(sizeBoxes().map(b => b.value)).toEqual(['400', '200']);
	// A popup around the editor closes on the Escape keyup: it never sees this one.
	expect(bodyKeyUps).toEqual([]);
	expect(document.activeElement).toBe(editorRoot());
	expect(globalThis.getSelection()!.anchorOffset).toBe(5);
});

test('Escape with nothing typed only returns to the text', async () => {
	renderEditor();
	const [w] = sizeBoxes();
	mouseDown(w);
	await escape(w);
	expect(w.value).toBe('400');
	expect(document.activeElement).toBe(editorRoot());
});

test('keys in the box do not edit the document', () => {
	renderEditor();
	const [w] = sizeBoxes();
	mouseDown(w);
	for (const k of ['Backspace', 'Delete', 'a', 'ArrowUp']) {
		const ev = key(w, k);
		expect([k, ev.defaultPrevented]).toEqual([k, false]);
	}
	expect(document.activeElement).toBe(w);
	const doc = editorRef.current!.getDocument();
	expect(doc.blocks.map(b => b.type)).toEqual(['paragraph', 'image']);
	expect((doc.blocks[0].content as any[]).map(s => s.text).join('')).toBe('Image size test');
});

test('Tab goes from W to H and back, and past either end to the text', () => {
	renderEditor();
	const [w, h] = sizeBoxes();
	mouseDown(w);
	expect(key(w, 'Tab').defaultPrevented).toBe(true);
	expect(document.activeElement).toBe(h);
	const shiftTab = new KeyboardEvent('keydown', {
		key: 'Tab',
		shiftKey: true,
		bubbles: true,
		cancelable: true,
	});
	act(() => {
		h.dispatchEvent(shiftTab);
	});
	expect(document.activeElement).toBe(w);
	key(w, 'Tab');
	key(h, 'Tab');
	expect(document.activeElement).toBe(editorRoot());
	expect(globalThis.getSelection()!.anchorOffset).toBe(5);
});
