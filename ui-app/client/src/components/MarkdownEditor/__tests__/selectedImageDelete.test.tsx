/**
 * LZ-831: a clicked image is outlined but holds no caret, so Backspace and Delete never reached
 * it. An image pasted into an empty description was the only block, the caret pointed at the
 * paragraph the paste replaced, and the image could not be removed at all.
 *
 * REAL: BlockEditor and BlockRenderer's ImageBlock. The image reports its selection to the editor
 * through the block env; Backspace / Delete on the editor then delete that block.
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

const image = (id: string) =>
	({
		id,
		type: 'image',
		content: [],
		children: [],
		props: { src: `https://example.com/${id}.png`, width: 400, height: 200 },
	}) as any;

const paragraph = (id: string, text: string) =>
	({ id, type: 'paragraph', content: [{ text }], children: [], props: {} }) as any;

function render(blocks: any[]) {
	act(() =>
		root.render(<BlockEditor ref={editorRef} initialDocument={createDocument(blocks)} />),
	);
}

function editorRoot(): HTMLElement {
	return container.querySelector<HTMLElement>('.mde-editor')!;
}

function clickImage(index = 0) {
	act(() => container.querySelectorAll('img')[index]!.parentElement!.click());
}

function key(k: string): KeyboardEvent {
	const ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
	act(() => {
		editorRoot().dispatchEvent(ev);
	});
	return ev;
}

const blockTypes = () => editorRef.current!.getDocument().blocks.map(b => b.type);

test.each(['Backspace', 'Delete'])('%s removes an image that is the only block', k => {
	render([image('img1')]);
	clickImage();
	expect(key(k).defaultPrevented).toBe(true);
	expect(blockTypes()).toEqual(['paragraph']);
	expect(container.querySelector('img')).toBeNull();
});

test('Backspace removes only the selected image, the text stays', () => {
	render([paragraph('p1', 'before'), image('img1'), image('img2'), paragraph('p2', 'after')]);
	clickImage(1);
	key('Backspace');
	const doc = editorRef.current!.getDocument();
	expect(doc.blocks.map(b => b.id)).toEqual(['p1', 'img1', 'p2']);
});

test('an image clicked again (deselected) is not removed by Backspace', () => {
	render([image('img1'), paragraph('p1', 'text')]);
	clickImage();
	clickImage();
	act(() =>
		editorRef.current!.focus({
			anchor: { blockId: 'p1', offset: 4 },
			focus: { blockId: 'p1', offset: 4 },
		}),
	);
	key('Backspace');
	expect(blockTypes()).toEqual(['image', 'paragraph']);
});
