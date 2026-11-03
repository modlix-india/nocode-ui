/**
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ChildrenErrorBoundary, RETRY_DELAYS_MS } from '../ChildrenErrorBoundary';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let broken = false;
let errorSpy: jest.SpyInstance;

function Flaky() {
	if (broken) throw new Error('not yet');
	return <span className="ok">number and buttons</span>;
}

beforeEach(() => {
	jest.useFakeTimers();
	errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	errorSpy.mockRestore();
	jest.useRealTimers();
});

test('a child that failed once renders again a moment later instead of staying empty', () => {
	broken = true;
	act(() =>
		root.render(
			<ChildrenErrorBoundary pageName="shell">
				<Flaky />
			</ChildrenErrorBoundary>,
		),
	);
	expect(container.querySelector('.ok')).toBeNull();

	// The data the child needs arrives a moment later.
	broken = false;
	act(() => {
		jest.advanceTimersByTime(RETRY_DELAYS_MS[0]);
	});
	expect(container.querySelector('.ok')?.textContent).toBe('number and buttons');
});

test('a child that keeps failing is retried a bounded number of times, then left empty', () => {
	broken = true;
	act(() =>
		root.render(
			<ChildrenErrorBoundary pageName="shell">
				<Flaky />
			</ChildrenErrorBoundary>,
		),
	);
	const total = RETRY_DELAYS_MS.reduce((a, b) => a + b, 0);
	for (let i = 0; i <= RETRY_DELAYS_MS.length + 2; i++)
		act(() => {
			jest.advanceTimersByTime(total);
		});
	expect(container.querySelector('.ok')).toBeNull();
	expect(jest.getTimerCount()).toBe(0);
});
