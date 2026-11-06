import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generateMetaTags } from '../htmlRenderer.js';
import { requestedLanguage } from '../requestedLanguage.js';
import { generateCacheKey } from '../../cache/redis.js';
import type { ApplicationDefinition, PageDefinition } from '../../api/client.js';

/** `?lang=<code>`, the URL each non-default hreflang alternate points at (PLAT-1550). */

const BASE = 'https://example.test';

const app: ApplicationDefinition = {
	name: 'shop',
	appCode: 'shop',
	clientCode: 'SYSTEM',
	defaultLanguage: 'en',
	languages: { en: {}, hi: {} },
	translations: { 'pt-BR': {}, 'bad:key': {} },
	properties: { title: 'Shop', defaultPage: 'home', og: { canonicalBase: BASE } } as never,
};

const page: PageDefinition = {
	name: 'blog',
	rootComponent: 'root',
	componentDefinition: {},
	properties: { title: { name: { value: 'Blog' } }, seo: {} },
};

const lang = (search: string, a: ApplicationDefinition | null = app) => requestedLanguage(a, new URLSearchParams(search));

describe('requestedLanguage', () => {
	it("answers a non-default language the app has, in the app's own spelling", () => {
		assert.equal(lang('?lang=hi'), 'hi');
		assert.equal(lang('?lang=HI'), 'hi');
		assert.equal(lang('?x=1&lang=pt-br'), 'pt-BR');
	});

	it('answers nothing for the default, an unknown language, a non tag or no parameter', () => {
		assert.equal(lang('?lang=en'), undefined);
		assert.equal(lang('?lang=fr'), undefined);
		assert.equal(lang('?lang=bad:key'), undefined);
		assert.equal(lang('?lang='), undefined);
		assert.equal(lang(''), undefined);
		assert.equal(lang('?lang=hi', null), undefined);
	});
});

describe('?lang copies', () => {
	it('are cached apart from the bare URL, which keeps its old key', () => {
		const bare = generateCacheKey('shop', 'SYSTEM', 'blog', false, 'dark', 1440, 'shop.test');
		assert.equal(bare, 'shop:SYSTEM:blog:theme:dark:w1440:shop.test');
		assert.equal(
			generateCacheKey('shop', 'SYSTEM', 'blog', false, 'dark', 1440, 'shop.test', 'hi'),
			`${bare}:lang:hi`,
		);
		assert.equal(generateCacheKey('shop', 'SYSTEM', 'blog', false, undefined, undefined, undefined, 'hi'), 'shop:SYSTEM:blog:lang:hi');
	});

	it('are their own canonical, with the same alternates', () => {
		const html = generateMetaTags(page, app, { pageName: 'blog', lang: 'hi' });
		assert.match(html, /<link rel="canonical" href="https:\/\/example.test\/blog\?lang=hi">/);
		assert.match(html, /<link rel="alternate" hreflang="en" href="https:\/\/example.test\/blog">/);
		assert.match(html, /<link rel="alternate" hreflang="x-default" href="https:\/\/example.test\/blog">/);
		const bare = generateMetaTags(page, app, { pageName: 'blog' });
		assert.match(bare, /<link rel="canonical" href="https:\/\/example.test\/blog">/);
	});
});
