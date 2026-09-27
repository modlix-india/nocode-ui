import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generateMetaTags, headTagValues, resolveOg } from '../htmlRenderer.js';
import type { ApplicationDefinition, MetaTag, PageDefinition } from '../../api/client.js';

/**
 * Every test here stands for something that was wrong in the document a crawler
 * was served, or for something that would silently stop being emitted if the
 * resolver were rearranged.
 */

const v = (value: string) => ({ value });

function app(overrides: Partial<NonNullable<ApplicationDefinition['properties']>> = {}): ApplicationDefinition {
	return {
		name: 'Test app',
		appCode: 'testapp',
		clientCode: 'SYSTEM',
		properties: { title: 'Test app', ...overrides },
	};
}

function page(seo: Record<string, { value: string }> = {}, title?: string): PageDefinition {
	return {
		name: 'home',
		rootComponent: 'root',
		componentDefinition: {},
		properties: {
			...(title ? { title: { name: { value: title } } } : {}),
			seo,
		},
	};
}

/** The property or name a tag carries, in document order. */
function keysOf(html: string): string[] {
	return [...html.matchAll(/<meta (?:property|name)="([^"]+)"/g)].map(m => m[1]);
}

function contentOf(html: string, key: string): string | undefined {
	const re = new RegExp(`<meta (?:property|name)="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" content="([^"]*)">`);
	return re.exec(html)?.[1];
}

describe('headTagValues', () => {
	it('reads the keyed map the platform actually stores', () => {
		// The bug this replaces: `for...of` over this object threw
		// `TypeError: not iterable`, the handler caught it, and every app with a
		// head tag served a bare 500.
		const stored: Record<string, MetaTag> = {
			'a1b2': { name: 'description', content: 'from a map' },
			'c3d4': { name: 'keywords', content: 'x,y' },
		};
		assert.equal(headTagValues<MetaTag>(stored).length, 2);
	});

	it('still reads an array', () => {
		assert.equal(headTagValues<MetaTag>([{ name: 'description' }]).length, 1);
	});

	it('treats absent and malformed collections as empty rather than throwing', () => {
		assert.deepEqual(headTagValues(undefined), []);
		assert.deepEqual(headTagValues<MetaTag>({ a: null as never }), []);
	});

	it('sorts ascending on order, matching the Java renderer', () => {
		const out = headTagValues<MetaTag>({
			late: { name: 'b', order: 2 },
			early: { name: 'a', order: 1 },
		});
		assert.deepEqual(out.map(o => o.name), ['a', 'b']);
	});

	it('sorts a non-numeric order as zero instead of throwing', () => {
		const out = headTagValues<MetaTag>({ x: { name: 'x', order: 'nonsense' }, y: { name: 'y', order: 1 } });
		assert.deepEqual(out.map(o => o.name), ['x', 'y']);
	});
});

describe('the fallback chain', () => {
	it('prefers the page over the app', () => {
		const r = resolveOg(page({ ogTitle: v('Page wins') }), app({ og: { title: 'App loses' } }));
		assert.equal(r.title, 'Page wins');
	});

	it('falls back app, then page title, then app title', () => {
		assert.equal(resolveOg(page(), app({ og: { title: 'App' } })).title, 'App');
		assert.equal(resolveOg(page({}, 'Page title'), app()).title, 'Page title');
		assert.equal(resolveOg(page(), app()).title, 'Test app');
	});

	it('falls back from ogDescription to the plain description', () => {
		const r = resolveOg(page({ description: v('Plain') }), app());
		assert.equal(r.description, 'Plain');
	});

	it("defaults og:type to ogp.me's own default", () => {
		assert.equal(resolveOg(page(), app({ og: { title: 'x' } })).type, 'website');
	});

	it('picks the card layout from whether an image resolved', () => {
		const base = 'https://example.com';
		const withImage = resolveOg(page(), app({ og: { title: 't', canonicalBase: base, image: { url: '/a.jpg' } } }));
		const without = resolveOg(page(), app({ og: { title: 't', canonicalBase: base } }));
		assert.equal(withImage.twitterCard, 'summary_large_image');
		// summary_large_image with no image renders as a blank plate.
		assert.equal(without.twitterCard, 'summary');
	});
});

describe('image absolutisation', () => {
	const base = 'https://sitezump.ai';

	it('resolves a stored files-API path against the canonical base', () => {
		const r = resolveOg(
			page({ ogImage: v('/api/files/static/file/SYSTEM/x/og.jpg') }),
			app({ og: { canonicalBase: base, title: 't' } })
		);
		assert.equal(r.image, 'https://sitezump.ai/api/files/static/file/SYSTEM/x/og.jpg');
	});

	it('leaves an already absolute URL alone', () => {
		const r = resolveOg(page({ ogImage: v('https://cdn.example/og.jpg') }), app({ og: { canonicalBase: base } }));
		assert.equal(r.image, 'https://cdn.example/og.jpg');
	});

	it('drops a relative image when no canonical base is configured', () => {
		// Emitting it relative would be a card that renders nowhere, which is
		// worse than no card at all.
		const r = resolveOg(page({ ogImage: v('/og.jpg') }), app({ og: { title: 't' } }));
		assert.equal(r.image, '');
	});

	it('does not collapse or double a slash at the join', () => {
		const r = resolveOg(page({ ogImage: v('/og.jpg') }), app({ og: { canonicalBase: 'https://x.test//' } }));
		assert.equal(r.image, 'https://x.test/og.jpg');
	});

	it('refuses a data URI, which no consumer accepts for og:image', () => {
		const r = resolveOg(page({ ogImage: v('data:image/png;base64,AAAA') }), app({ og: { canonicalBase: base } }));
		assert.equal(r.image, '');
	});
});

describe('emission order and structure', () => {
	const full = () =>
		generateMetaTags(
			page({ ogImageAlt: v('Alt text') }),
			app({
				og: {
					title: 'Title',
					description: 'Description',
					siteName: 'Site',
					canonicalBase: 'https://sitezump.ai',
					image: { url: '/og.jpg', width: 1200, height: 630, type: 'image/jpeg' },
				},
			}),
			{ pageName: 'pricing' }
		);

	it('emits the four ogp.me required properties first', () => {
		const keys = keysOf(full()).filter(k => k.startsWith('og:') || k.startsWith('twitter:'));
		assert.deepEqual(keys.slice(0, 2), ['og:title', 'og:type']);
		assert.ok(keys.includes('og:image'));
		assert.ok(keys.includes('og:url'));
	});

	it('keeps og:image:* directly under og:image', () => {
		// ogp.me: a structured property attaches to the root tag above it, and
		// is considered done as soon as another root element is parsed. Emitted
		// after og:site_name, og:image:alt would attach to nothing.
		const keys = keysOf(full());
		const image = keys.indexOf('og:image');
		const structured = ['og:image:secure_url', 'og:image:alt', 'og:image:type', 'og:image:width', 'og:image:height'];
		for (const [i, key] of structured.entries()) {
			assert.equal(keys[image + 1 + i], key, `${key} should follow og:image`);
		}
	});

	it('builds og:url from the canonical base and the served page', () => {
		assert.equal(contentOf(full(), 'og:url'), 'https://sitezump.ai/pricing');
	});

	it('emits og:image:secure_url only for https', () => {
		const insecure = generateMetaTags(
			page(),
			app({ og: { title: 't', canonicalBase: 'http://plain.test', image: { url: '/og.jpg' } } })
		);
		assert.ok(!keysOf(insecure).includes('og:image:secure_url'));
	});

	it('repeats og:locale:alternate, which ogp.me says may appear more than once', () => {
		const html = generateMetaTags(
			page(),
			app({ og: { title: 't', localeAlternate: ['fr_FR', 'de_DE'] } })
		);
		assert.equal(keysOf(html).filter(k => k === 'og:locale:alternate').length, 2);
	});

	it('emits article:* only when og:type is article', () => {
		const props = { articleAuthor: v('Someone'), ogType: v('article') };
		assert.ok(keysOf(generateMetaTags(page(props), app())).includes('article:author'));

		const notArticle = generateMetaTags(page({ ...props, ogType: v('website') }), app());
		assert.ok(!keysOf(notArticle).includes('article:author'));
	});

	it('says nothing at all when there is nothing to say', () => {
		// An empty card is worse than none: the consumer falls back to <title>.
		const html = generateMetaTags(page(), { name: 'x', appCode: 'x', clientCode: 'S' });
		assert.deepEqual(keysOf(html), ['viewport']);
	});
});

describe('deduplication against app-level metas', () => {
	it('lets the typed block win over a metas entry naming the same property', () => {
		const html = generateMetaTags(
			page({ ogTitle: v('From the page') }),
			app({ og: { title: 'x' }, metas: { k1: { property: 'og:title', content: 'From metas' } } })
		);
		assert.equal(keysOf(html).filter(k => k === 'og:title').length, 1);
		assert.equal(contentOf(html, 'og:title'), 'From the page');
	});

	it('still emits a metas entry that names something not already said', () => {
		const html = generateMetaTags(
			page(),
			app({ og: { title: 't' }, metas: { k1: { property: 'og:video', content: 'https://v.test/v.mp4' } } })
		);
		assert.equal(contentOf(html, 'og:video'), 'https://v.test/v.mp4');
	});

	it('emits the property attribute, which the Java whitelist cannot', () => {
		const html = generateMetaTags(page(), app({ metas: { k: { property: 'fb:pages', content: '123' } } }));
		assert.match(html, /<meta property="fb:pages" content="123">/);
	});

	it('never emits order as an attribute', () => {
		const html = generateMetaTags(page(), app({ metas: { k: { name: 'x', content: 'y', order: 3 } } }));
		assert.ok(!html.includes('order='));
	});

	it('does not emit a second charset from metas', () => {
		const html = generateMetaTags(page(), app({ metas: { k: { charset: 'iso-8859-1' } } }));
		assert.equal((html.match(/<meta charset=/g) ?? []).length, 1);
	});

	it('reads http-equiv under its stored, hyphenated name', () => {
		const html = generateMetaTags(page(), app({ metas: { k: { 'http-equiv': 'refresh', content: '5' } } }));
		assert.match(html, /http-equiv="refresh"/);
	});
});

describe('the page keys that used to be dropped', () => {
	it('emits robots, author, applicationName and generator', () => {
		const html = generateMetaTags(
			page({
				robots: v('noindex'),
				author: v('A Person'),
				applicationName: v('An App'),
				generator: v('Modlix'),
			}),
			app()
		);
		assert.equal(contentOf(html, 'robots'), 'noindex');
		assert.equal(contentOf(html, 'author'), 'A Person');
		// The HTML attribute is hyphenated where the stored key is not.
		assert.equal(contentOf(html, 'application-name'), 'An App');
		assert.equal(contentOf(html, 'generator'), 'Modlix');
	});

	it('honours an authored charset instead of the hardcoded one', () => {
		const html = generateMetaTags(page({ charset: v('iso-8859-1') }), app());
		assert.match(html, /<meta charset="iso-8859-1">/);
	});
});

describe('escaping', () => {
	it('escapes a quote in a description rather than breaking the tag', () => {
		const html = generateMetaTags(page(), app({ og: { title: 't', description: 'He said "hi" & left' } }));
		assert.match(html, /content="He said &quot;hi&quot; &amp; left"/);
	});
});
