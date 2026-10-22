import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { SIGNED_IN_ATTR, SIGNED_IN_CSS, SIGNED_IN_DROP_SCRIPT, SIGNED_IN_FLAG_SCRIPT } from '../signedInGuard.js';

/**
 * A signed-in visitor must never be shown the page drawn for an anonymous one (QA-0504/0507/0508):
 * the drawing is emptied before it can paint. A signed-out visitor keeps it to hydrate.
 */

const DRAWN = '<div class="comp compPage">Home for signed-out visitors</div><div id="_rendered" data-used-components=""></div>';

function load(opts: { query?: string; token?: [string, string]; drawn?: boolean }) {
	const url = `https://app.example.com/deals${opts.query ?? ''}`;
	const states: { markedBeforeApp?: boolean } = {};
	const html =
		`<!DOCTYPE html><html><head><style>${SIGNED_IN_CSS}</style></head><body>` +
		`<script>${SIGNED_IN_FLAG_SCRIPT};__record()</script>` +
		`<div id="app">${opts.drawn === false ? '' : DRAWN}</div>${SIGNED_IN_DROP_SCRIPT}</body></html>`;
	const dom = new JSDOM(html, {
		url,
		runScripts: 'dangerously',
		// Storage is in place before the inline scripts run, as it is in a real browser.
		beforeParse(window) {
			if (opts.token) window.localStorage.setItem(opts.token[0], opts.token[1]);
			(window as any).__record = () => {
				states.markedBeforeApp = window.document.documentElement.hasAttribute(SIGNED_IN_ATTR);
			};
		},
	});
	const doc = dom.window.document;
	return {
		markedBeforeApp: states.markedBeforeApp,
		markedAfter: doc.documentElement.hasAttribute(SIGNED_IN_ATTR),
		appHtml: doc.getElementById('app')!.innerHTML,
	};
}

describe('signed-in guard', () => {
	it('empties the drawing when a token is stored, and hides #app until then', () => {
		const r = load({ token: ['AuthToken', '"abc"'] });
		assert.equal(r.markedBeforeApp, true);
		assert.equal(r.appHtml, '');
		assert.equal(r.markedAfter, false);
	});

	it('keeps the drawing for a signed-out visitor, who hydrates it', () => {
		const r = load({});
		assert.equal(r.markedBeforeApp, false);
		assert.equal(r.appHtml, DRAWN);
	});

	it('reads the design-mode token only in debug mode, as index.tsx does', () => {
		assert.equal(load({ token: ['designMode_AuthToken', '"abc"'] }).appHtml, DRAWN);
		assert.equal(load({ query: '?debug', token: ['designMode_AuthToken', '"abc"'] }).appHtml, '');
		assert.equal(load({ query: '?debug', token: ['AuthToken', '"abc"'] }).appHtml, DRAWN);
	});

	it('treats an SSO or social sign-in arrival as signed in', () => {
		assert.equal(load({ query: '?ott=123' }).appHtml, '');
		assert.equal(load({ query: '?x=1&sessionId=9' }).appHtml, '');
		assert.equal(load({ query: '?sso=none' }).appHtml, DRAWN);
	});

	it('leaves an undrawn #app alone and still clears the mark', () => {
		const r = load({ token: ['AuthToken', '"abc"'], drawn: false });
		assert.equal(r.appHtml, '');
		assert.equal(r.markedAfter, false);
	});
});
