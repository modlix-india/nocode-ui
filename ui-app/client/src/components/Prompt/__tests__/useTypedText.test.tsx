/**
 * Typing a live reply out.
 *
 * A tool posts a whole question in one piece, and before this it landed on
 * screen all at once, with no typing (live 2026-09-29). These pin that a live
 * reply types, an old one does not, and text that gets shorter is followed.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { typingStep, useTypedText } from '../useTypedText';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const question = 'Which platform should we run this on - Google Ads or Meta?';

let container: HTMLDivElement;
let root: Root;

function Probe({ text, typeOut }: Readonly<{ text: string; typeOut: boolean }>) {
	return <span>{useTypedText(text, typeOut)}</span>;
}

function render(text: string, typeOut: boolean) {
	act(() => root.render(<Probe text={text} typeOut={typeOut} />));
}

function shown(): string {
	return container.textContent ?? '';
}

function advanceFrames(count: number) {
	for (let i = 0; i < count; i++) act(() => jest.advanceTimersByTime(16));
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

describe('useTypedText', () => {
	it('types out a question that arrives in one piece', () => {
		render('', true);
		render(question, true);
		expect(shown()).toBe('');

		advanceFrames(1);
		expect(shown().length).toBeGreaterThan(0);
		expect(shown().length).toBeLessThan(question.length);

		advanceFrames(60);
		expect(shown()).toBe(question);
	});

	it('shows an old reply whole', () => {
		render(question, false);
		expect(shown()).toBe(question);
	});

	it('follows text that gets shorter, as when a card takes the start of it', () => {
		render(question, true);
		advanceFrames(60);
		render('', true);
		expect(shown()).toBe('');
	});

	it('speeds up the further behind it is', () => {
		expect(typingStep(10)).toBe(2);
		expect(typingStep(600)).toBe(40);
	});
});
