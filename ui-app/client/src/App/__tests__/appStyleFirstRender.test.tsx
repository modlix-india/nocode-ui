/**
 * The app theme must be in the FIRST render of AppStyle.
 *
 * It used to be applied in an effect, so the first paint (and every server render, where
 * effects never run) wore the platform defaults: a page whose root is _QUATERNARYBG showed
 * a full screen of #EC6B5F before the theme landed. `renderToStaticMarkup` runs no effects,
 * which is exactly the first-render state.
 */
const THEME_GROUND = '#F2F1EC';

function firstRender(): string {
	let html = '';
	// The floor style components read the preloaded style JSON registry; empty here.
	globalThis.styleProperties = {};
	jest.isolateModules(() => {
		// React and the server renderer come from the same isolated registry as AppStyle,
		// or the hook dispatcher is another React copy's and is null.
		const React = require('react');
		const { renderToStaticMarkup } = require('react-dom/server');
		const { AppStyle } = require('../AppStyle');
		html = renderToStaticMarkup(React.createElement(AppStyle));
	});
	return html;
}

describe('AppStyle first render', () => {
	it('paints theme classes with the app theme, not the platform defaults', () => {
		globalThis.appDefinitionResponse = {
			theme: { ALL: { backgroundColorFour: THEME_GROUND } },
		} as any;

		const html = firstRender();

		const quaternary = /\._QUATERNARYBG\s*\{\s*background:\s*([^;]+);/.exec(html)?.[1];
		expect(quaternary).toBe(THEME_GROUND);
		expect(html).not.toContain('#EC6B5F');
	});

	it('falls back to the defaults when the app has no theme', () => {
		globalThis.appDefinitionResponse = {} as any;

		const html = firstRender();

		expect(/\._QUATERNARYBG\s*\{\s*background:\s*([^;]+);/.exec(html)?.[1]).toBe('#EC6B5F');
	});
});
