/**
 * LZ-844: a picture pasted into an empty comment replaced the only paragraph, so the comment
 * was just the image. The caret still pointed at the replaced paragraph and nothing typed
 * after the paste landed anywhere.
 *
 * REAL: BlockEditor's paste and drop handlers. A pasted or dropped image that ends up last
 * gets an empty paragraph after it, and the caret moves there.
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

const paragraph = (id: string, text: string) =>
	({ id, type: 'paragraph', content: text ? [{ text }] : [], children: [], props: {} }) as any;

function render(blocks: any[]) {
	act(() =>
		root.render(<BlockEditor ref={editorRef} initialDocument={createDocument(blocks)} />),
	);
}

function editorRoot(): HTMLElement {
	return container.querySelector<HTMLElement>('.mde-editor')!;
}

function caretIn(blockId: string, offset: number) {
	act(() =>
		editorRef.current!.focus({
			anchor: { blockId, offset },
			focus: { blockId, offset },
		}),
	);
}

const png = () => new File([new Uint8Array([137, 80, 78, 71])], 'shot.png', { type: 'image/png' });

function pasteImage() {
	const file = png();
	const ev = new Event('paste', { bubbles: true, cancelable: true }) as any;
	ev.clipboardData = {
		files: [file],
		items: [{ type: 'image/png', kind: 'file', getAsFile: () => file }],
		types: ['Files'],
		getData: () => '',
	};
	act(() => {
		editorRoot().dispatchEvent(ev);
	});
}

function dropImage(onto: Element) {
	const ev = new Event('drop', { bubbles: true, cancelable: true }) as any;
	ev.dataTransfer = { files: [png()], types: ['Files'], getData: () => '' };
	act(() => {
		onto.dispatchEvent(ev);
	});
}

const doc = () => editorRef.current!.getDocument();
const types = () => doc().blocks.map(b => b.type);

test('an image pasted into an empty comment leaves a line after it with the caret on it', () => {
	render([paragraph('p1', '')]);
	caretIn('p1', 0);
	pasteImage();
	expect(types()).toEqual(['image', 'paragraph']);
	const line = doc().blocks[1].id;
	expect(editorRef.current!.getSelection()?.focus.blockId).toBe(line);
});

test('an image pasted after text at the end also gets a line after it', () => {
	render([paragraph('p1', 'See this')]);
	caretIn('p1', 8);
	pasteImage();
	expect(types()).toEqual(['paragraph', 'image', 'paragraph']);
	expect(editorRef.current!.getSelection()?.focus.blockId).toBe(doc().blocks[2].id);
});

test('an image pasted between two paragraphs adds no extra line', () => {
	render([paragraph('p1', 'above'), paragraph('p2', 'below')]);
	caretIn('p1', 5);
	pasteImage();
	expect(types()).toEqual(['paragraph', 'image', 'paragraph']);
	expect(doc().blocks.map(b => b.id)[2]).toBe('p2');
});

test('an image dropped on the last line gets a line after it', () => {
	render([paragraph('p1', 'text')]);
	dropImage(container.querySelector('[data-block-id="p1"]')!);
	expect(types()).toEqual(['paragraph', 'image', 'paragraph']);
});
