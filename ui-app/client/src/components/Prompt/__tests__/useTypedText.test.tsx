import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { typingStep, useTypedText } from '../useTypedText';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * A tool posts a whole question in one piece; a live reply must still type it
 * out, and a reply that was never live (history) shows at once
 * (live 2026-09-29: questions appeared instantly, with no typing).
 */

const question = 'Which platform should we run this on - Google Ads or Meta?';

let container: HTMLDivElement;
let root: Root;

function Probe({ text, live }: { text: string; live: boolean }) {
	return <span>{useTypedText(text, live)}</span>;
}

function render(text: string, live: boolean) {
	act(() => {
		root.render(<Probe text={text} live={live} />);
	});
}

function shown(): string {
	return container.textContent ?? '';
}

function frames(n: number) {
	for (let i = 0; i < n; i++) {
		act(() => {
			jest.advanceTimersByTime(16);
		});
	}
}

beforeEach(() => {
	jest.useFakeTimers();
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	jest.useRealTimers();
});

test('a live question that arrives in one piece types out', () => {
	render('', true);
	render(question, true);
	expect(shown()).toBe('');
	frames(1);
	expect(shown().length).toBeGreaterThan(0);
	expect(shown().length).toBeLessThan(question.length);
	frames(60);
	expect(shown()).toBe(question);
});

test('typing finishes after the reply ends', () => {
	render('', true);
	render(question, true);
	frames(2);
	render(question, false);
	expect(shown().length).toBeLessThan(question.length);
	frames(60);
	expect(shown()).toBe(question);
});

test('a reply that was never live shows at once', () => {
	render(question, false);
	expect(shown()).toBe(question);
});

test('text that shrinks (a card split the reply) follows at once', () => {
	render(question, true);
	frames(60);
	render('', true);
	expect(shown()).toBe('');
});

test('the pace speeds up when far behind', () => {
	expect(typingStep(10)).toBe(2);
	expect(typingStep(600)).toBe(40);
});
