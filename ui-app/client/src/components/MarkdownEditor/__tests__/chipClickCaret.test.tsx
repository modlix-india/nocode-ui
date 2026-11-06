/**
 * A click on an @mention chip let Chrome select the whole contentEditable=false chip, so the next
 * key typed replaced the mention instead of following it (LZ-791). A plain click on a chip in an
 * editable surface now puts the caret just after it; Shift clicks, the chip's X and read-only
 * views keep the browser's behaviour.
 *
 * REAL: TextContent and its MentionPill. jsdom does not place a selection on a click, so the
 * tests check where the mousedown handler puts it.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TextContent } from '../blockEditor/blocks/TextContent';
import type { TextSpan } from '../blockEditor/core/types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const chip: TextSpan = {
	text: '@Kiran',
	marks: [{ type: 'mention', attrs: { kind: 'user', id: '142' } }],
};

let container: HTMLDivElement;
let root: Root;

function mount(content: TextSpan[], editable = true) {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
	act(() =>
		root.render(
			<div className="host" contentEditable={editable} suppressContentEditableWarning>
				<TextContent content={content} />
			</div>,
		),
	);
	return container.querySelector('.host') as HTMLElement;
}

function mouseDown(el: Element, init: MouseEventInit = {}) {
	const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, ...init });
	act(() => {
		el.dispatchEvent(ev);
	});
	return ev;
}

beforeEach(() => globalThis.getSelection()?.removeAllRanges());

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

test('a click on a chip in the middle of a line puts the caret before the text after it', () => {
	const host = mount([{ text: 'hello ' }, chip, { text: ' world' }]);
	const pill = host.querySelector("[data-mention='true']")!;
	const ev = mouseDown(pill);
	const sel = globalThis.getSelection()!;
	expect(ev.defaultPrevented).toBe(true);
	expect(sel.isCollapsed).toBe(true);
	expect(sel.anchorNode).toBe(pill.nextSibling);
	expect(sel.anchorNode?.textContent).toBe(' world');
	expect(sel.anchorOffset).toBe(0);
	expect(document.activeElement).toBe(host);
});

test('a click on a chip that ends the line puts the caret in the pad after it', () => {
	const host = mount([{ text: 'hi ' }, chip]);
	mouseDown(host.querySelector("[data-mention='true']")!);
	const sel = globalThis.getSelection()!;
	expect(sel.anchorNode?.textContent).toBe('​');
	expect(sel.anchorOffset).toBe(0);
});

test('a click on a chip followed by another chip puts the caret between them', () => {
	const host = mount([chip, { ...chip }]);
	const [first] = Array.from(host.querySelectorAll("[data-mention='true']"));
	mouseDown(first!);
	const sel = globalThis.getSelection()!;
	expect(sel.anchorNode).toBe(host);
	expect(sel.anchorOffset).toBe(1);
});

test('Shift clicks, the X and read-only views are left to the browser', () => {
	let host = mount([{ text: 'a ' }, chip]);
	let pill = host.querySelector("[data-mention='true']")!;
	expect(mouseDown(pill, { shiftKey: true }).defaultPrevented).toBe(false);
	expect(mouseDown(pill.querySelector('.mde-mention-remove')!).defaultPrevented).toBe(true); // the X's own handler
	expect(globalThis.getSelection()!.rangeCount).toBe(0);
	act(() => root.unmount());
	container.remove();

	host = mount([{ text: 'a ' }, chip], false);
	pill = host.querySelector("[data-mention='true']")!;
	expect(mouseDown(pill).defaultPrevented).toBe(false);
	expect(globalThis.getSelection()!.rangeCount).toBe(0);
});
