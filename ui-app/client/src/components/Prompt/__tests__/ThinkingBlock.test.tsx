/**
 * The thinking box stops growing at its max height and scrolls inside itself.
 * While thinking streams it must keep the newest text in view, and never pull
 * a reader who scrolled up back down (live 2026-09-29: the box filled and the
 * new text streamed out of sight).
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ThinkingBlock } from '../components/ThinkingBlock';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(reasoningContent: string) {
	act(() => {
		root.render(<ThinkingBlock isActive toolCalls={[]} reasoningContent={reasoningContent} />);
	});
}

// jsdom has no layout: give the box a fixed 400px window over 1000px of text.
function box(): HTMLDivElement {
	const el = container.querySelector('._thinkingReasoning') as HTMLDivElement;
	Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 1000 });
	Object.defineProperty(el, 'clientHeight', { configurable: true, value: 400 });
	return el;
}

function scrollTo(el: HTMLDivElement, top: number) {
	el.scrollTop = top;
	act(() => {
		el.dispatchEvent(new Event('scroll'));
	});
}

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

describe('ThinkingBlock', () => {
	it('follows the newest thinking while it streams', () => {
		render('first thought');
		const el = box();
		render('first thought, then more');
		expect(el.scrollTop).toBe(1000);
	});

	it('leaves a reader who scrolled up where they are, and follows again at the bottom', () => {
		render('first thought');
		const el = box();
		scrollTo(el, 100);
		render('first thought, then more');
		expect(el.scrollTop).toBe(100);

		scrollTo(el, 600); // back at the bottom: 1000 - 600 - 400 = 0
		render('first thought, then more, and more');
		expect(el.scrollTop).toBe(1000);
	});
});
