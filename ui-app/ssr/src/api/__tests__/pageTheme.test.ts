import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { pageThemeName, resolveThemeName } from '../client.js';
import type { ApplicationDefinition, PageDefinition } from '../client.js';

/**
 * A page may name its own theme. SSR has to pick the same one the client will,
 * or the client throws the bootstrap theme away and the page repaints.
 */
const application = {
	properties: {
		themes: {
			a: { name: 'monoLight', order: 1 },
			b: { name: 'theme', order: 3 },
		},
	},
} as unknown as ApplicationDefinition;

const page = (properties: any) => ({ properties }) as unknown as PageDefinition;

describe('pageThemeName', () => {
	it('is the theme a page names, when the app lists it', () => {
		assert.equal(pageThemeName(application, page({ theme: 'theme' })), 'theme');
	});

	it('is undefined for a page that names none', () => {
		assert.equal(pageThemeName(application, page({})), undefined);
		assert.equal(pageThemeName(application, null), undefined);
	});

	it('ignores a theme the app does not list', () => {
		assert.equal(pageThemeName(application, page({ theme: 'gone' })), undefined);
	});

	it('ignores a value that is not a name', () => {
		assert.equal(pageThemeName(application, page({ theme: { value: 'theme' } })), undefined);
	});
});

describe('page-only themes', () => {
	const withClassic = {
		properties: {
			themes: {
				a: { name: 'monoLight', order: 1 },
				c: { name: 'classic', order: 0, pageOnly: true },
			},
		},
	} as unknown as ApplicationDefinition;

	it('are never the default, even with the lowest order', () => {
		assert.equal(resolveThemeName(withClassic, null), 'monoLight');
	});

	it('are never taken from a cookie', () => {
		assert.equal(resolveThemeName(withClassic, 'classic'), 'monoLight');
	});

	it('can still be named by a page', () => {
		assert.equal(pageThemeName(withClassic, page({ theme: 'classic' })), 'classic');
	});
});
