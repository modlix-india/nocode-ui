/**
 * The W and H boxes on a selected markdown image used to set the size to parseInt(text) || 0 on
 * every keystroke. An emptied box set the width to 0, so the picture jumped to its natural size
 * while the user typed and a blur saved width 0 into the document; a typed "0" was wiped (0 shows
 * as ''); a "." left parseInt's whole part.
 *
 * REAL: BlockRenderer's ImageBlock and DraftNumberInput. The document side is the
 * 'mde-image-update' event the block dispatches on blur, collected here.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BlockRenderer } from '../blockEditor/blocks/BlockRenderer';

jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: () => undefined,
	UrlDetailsExtractor: { getForContext: () => ({}) },
	PageStoreExtractor: { getForContext: () => ({}) },
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let updates: any[];
const onUpdate = (e: Event) => updates.push((e as CustomEvent).detail);

beforeEach(() => {
	updates = [];
	globalThis.addEventListener('mde-image-update', onUpdate);
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	globalThis.removeEventListener('mde-image-update', onUpdate);
});

function renderSelectedImage() {
	const block: any = {
		id: 'img1',
		type: 'image',
		props: { src: 'https://example.com/a.png', width: 400, height: 200 },
		children: [],
	};
	act(() => root.render(<BlockRenderer block={block} />));
	act(() => container.querySelector('img')!.parentElement!.click());
}

function sizeBoxes(): HTMLInputElement[] {
	return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="number"]'));
}

function imgWidth(): string {
	return container.querySelector('img')!.style.width;
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;

function typeInto(el: HTMLInputElement, text: string): string {
	act(() => {
		valueSetter.call(el, text);
		el.dispatchEvent(new Event('input', { bubbles: true }));
	});
	return el.value;
}

function keyDown(el: HTMLInputElement, k: string): boolean {
	let ev!: KeyboardEvent;
	act(() => {
		ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
		el.dispatchEvent(ev);
	});
	return ev.defaultPrevented;
}

test('the selected image shows its W and H', () => {
	renderSelectedImage();
	expect(sizeBoxes().map(b => b.value)).toEqual(['400', '200']);
});

test('an emptied W box can stay empty, leaves the image alone, and shows the width on blur', () => {
	renderSelectedImage();
	const [w] = sizeBoxes();
	act(() => w.focus());
	expect(typeInto(w, '')).toBe('');
	expect(imgWidth()).toBe('400px');
	act(() => w.blur());
	expect(w.value).toBe('400');
	expect(updates[updates.length - 1]).toMatchObject({ blockId: 'img1', width: 400 });
	expect(updates.some(u => u.width === 0)).toBe(false);
});

test('typing a new width keeps the text and resizes on each whole number', () => {
	renderSelectedImage();
	const [w] = sizeBoxes();
	act(() => w.focus());
	typeInto(w, '');
	const seen = ['3', '32', '320'].map(t => typeInto(w, t));
	expect(seen).toEqual(['3', '32', '320']);
	expect(imgWidth()).toBe('320px');
	act(() => w.blur());
	expect(updates[updates.length - 1]).toMatchObject({ width: 320 });
});

test('a typed "0" is not wiped and does not resize', () => {
	renderSelectedImage();
	const [w] = sizeBoxes();
	act(() => w.focus());
	typeInto(w, '');
	expect(typeInto(w, '0')).toBe('0');
	expect(imgWidth()).toBe('400px');
	act(() => w.blur());
	expect(w.value).toBe('400');
});

test('".", "e" and "-" are refused; a pasted decimal is put back', () => {
	renderSelectedImage();
	const [w, h] = sizeBoxes();
	for (const box of [w, h]) {
		expect(keyDown(box, '.')).toBe(true);
		expect(keyDown(box, 'e')).toBe(true);
		expect(keyDown(box, '-')).toBe(true);
		expect(keyDown(box, '5')).toBe(false);
	}
	act(() => w.focus());
	expect(typeInto(w, '12.5')).toBe('400');
});
