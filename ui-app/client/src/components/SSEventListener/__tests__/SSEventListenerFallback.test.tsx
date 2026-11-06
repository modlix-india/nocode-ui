/**
 * While its code loads, the listener draws nothing outside the editor. Its old "..." fallback was a
 * 12 px item in the shell's flex row, and the main column moved sideways when the chunk arrived.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';

jest.mock('../LazySSEventListener', () => ({ __esModule: true, default: () => null }));

function loadingMarkup(): string {
	let html = '';
	jest.isolateModules(() => {
		const SSEventListener = require('../SSEventListener').default;
		const Comp = SSEventListener.component;
		html = renderToString(
			<Comp definition={{ key: 'sse' } as any} locationHistory={[]} context={{} as any} />,
		);
	});
	return html;
}

describe('SSEventListener while loading', () => {
	afterEach(() => {
		(globalThis as any).designMode = undefined;
	});

	it('draws nothing on a page', () => {
		(globalThis as any).designMode = undefined;
		expect(loadingMarkup()).not.toContain('...');
	});

	it('keeps the dots in the editor', () => {
		(globalThis as any).designMode = 'PAGE';
		expect(loadingMarkup()).toContain('...');
	});
});
