import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
	generateMetaTags,
	generateStructuredData,
	hreflangAlternates,
	isLoginStandIn,
	isNotFoundStandIn,
	resolveOg,
} from '../htmlRenderer.js';
import { jsonLdNodes, scriptSafeJson, isoInstant } from '../structuredData.js';
import { declaresPaths, lookupPath, pathCacheKey } from '../seoPaths.js';
import { extractPagePath } from '../../resolver/codeResolver.js';
import { generateCacheKey } from '../../cache/redis.js';
import type { ApplicationDefinition, PageDefinition } from '../../api/client.js';

/** The AEO head: canonical, hreflang, JSON-LD, signed in noindex, per path values and 404s. */

const BASE = 'https://example.test';

function app(props: Record<string, unknown> = {}, extra: Partial<ApplicationDefinition> = {}): ApplicationDefinition {
	return {
		name: 'shop',
		appCode: 'shop',
		clientCode: 'SYSTEM',
		...extra,
		properties: { title: 'Shop', defaultPage: 'home', og: { canonicalBase: BASE }, ...props } as never,
	};
}

function page(seo: Record<string, unknown> = {}, extra: Partial<PageDefinition> = {}): PageDefinition {
	return {
		name: 'blog',
		rootComponent: 'root',
		componentDefinition: {},
		updatedAt: 1790494664,
		...extra,
		properties: { title: { name: { value: 'Blog' } }, seo },
	};
}

const SOURCE = { appCode: 'shop', clientCode: 'SYSTEM' };

function ldBlocks(html: string): any[] {
	return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
}

describe('canonical', () => {
	it('names the page under the canonical base', () => {
		const html = generateMetaTags(page(), app(), { pageName: 'blog' });
		assert.match(html, /<link rel="canonical" href="https:\/\/example.test\/blog">/);
	});

	it('is the root for the default page, however it was asked for', () => {
		for (const pageName of ['index', 'home', undefined]) {
			assert.equal(resolveOg(page(), app(), { pageName }).canonical, `${BASE}/`);
		}
	});

	it('carries the full path of a seo.paths entry', () => {
		const r = resolveOg(page(), app(), { pageName: 'blog', path: '2024/my post' });
		assert.equal(r.canonical, `${BASE}/blog/2024/my%20post`);
	});

	it('prefers the entry canonical, resolved against the base', () => {
		const r = resolveOg(page(), app(), { pageName: 'blog', path: 'a', pathHead: { canonical: '/posts/a' } });
		assert.equal(r.canonical, `${BASE}/posts/a`);
	});

	it('is absent without a canonical base, on a signed in page and on the not found page', () => {
		assert.equal(resolveOg(page(), app({ og: {} }), { pageName: 'blog' }).canonical, '');
		assert.equal(resolveOg(page(), app(), { pageName: 'blog', signedIn: true }).canonical, '');
		assert.equal(resolveOg(page(), app(), { pageName: 'blog', notFound: true }).canonical, '');
	});
});

describe('hreflang', () => {
	it('lists every language, default at the canonical, plus x-default', () => {
		const a = app({}, { languages: { en: {}, hi: {} }, translations: { te: {} }, defaultLanguage: 'en' });
		assert.deepEqual(hreflangAlternates(a, `${BASE}/blog`), [
			['en', `${BASE}/blog`],
			['hi', `${BASE}/blog?lang=hi`],
			['te', `${BASE}/blog?lang=te`],
			['x-default', `${BASE}/blog`],
		]);
	});

	it('says nothing for one language', () => {
		assert.deepEqual(hreflangAlternates(app({}, { translations: { en: {} } }), `${BASE}/`), []);
	});

	it('is emitted beside the canonical', () => {
		const html = generateMetaTags(page(), app({}, { languages: { en: {}, fr: {} } }), { pageName: 'blog' });
		assert.match(html, /<link rel="alternate" hreflang="fr" href="https:\/\/example.test\/blog\?lang=fr">/);
	});
});

describe('signed in pages', () => {
	it('are noindex, nofollow whatever seo.robots says', () => {
		const html = generateMetaTags(page({ robots: { value: 'index, follow' } }), app(), { pageName: 'blog', signedIn: true });
		assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
		assert.equal((html.match(/name="robots"/g) ?? []).length, 1);
	});

	it('carry no JSON-LD, including when only the permission says so', () => {
		const p = page({ jsonLd: { value: { '@type': 'Article', headline: 'x' } } }, { permission: 'Authorities.X' });
		assert.equal(generateStructuredData(p, app({ structuredData: { '@type': 'Organization' } }), { pageName: 'blog' }), '');
	});

	it('the login page standing in is recognised, the login page itself is not', () => {
		const a = app({ loginPage: 'login' });
		assert.equal(isLoginStandIn({ application: a, page: page({}, { name: 'login' }), resolvedPageName: 'orders' }), true);
		assert.equal(isLoginStandIn({ application: a, page: page({}, { name: 'login' }), resolvedPageName: 'login' }), false);
	});
});

describe('the not found stand in', () => {
	const a = app({ notFoundPage: 'nf' });

	it('is the notFoundPage answering for another name', () => {
		assert.equal(isNotFoundStandIn({ application: a, page: page({}, { name: 'nf' }), resolvedPageName: 'nope' }), true);
	});

	it('is not the notFoundPage asked for by name, nor a real page', () => {
		assert.equal(isNotFoundStandIn({ application: a, page: page({}, { name: 'nf' }), resolvedPageName: 'nf' }), false);
		assert.equal(isNotFoundStandIn({ application: a, page: page(), resolvedPageName: 'blog' }), false);
	});

	it('gets noindex and nothing else', () => {
		const html = generateMetaTags(page(), app(), { pageName: 'nope', notFound: true });
		assert.match(html, /<meta name="robots" content="noindex">/);
		assert.ok(!html.includes('rel="canonical"'));
		assert.equal(generateStructuredData(page(), app(), { pageName: 'nope', notFound: true }), '');
	});
});

describe('JSON-LD', () => {
	it('reads a node, an array, a keyed map, a JSON string and a { value } wrapper', () => {
		const n = { '@type': 'Organization', name: 'A' };
		assert.equal(jsonLdNodes(n).length, 1);
		assert.equal(jsonLdNodes([n, n]).length, 2);
		assert.equal(jsonLdNodes({ org: n, site: { '@type': 'WebSite' } }).length, 2);
		assert.equal(jsonLdNodes(JSON.stringify(n)).length, 1);
		assert.equal(jsonLdNodes({ value: [n] }).length, 1);
		assert.deepEqual(jsonLdNodes('not json'), []);
		assert.deepEqual(jsonLdNodes({ value: 'x' }), []);
	});

	it('adds the schema.org context only when missing', () => {
		assert.equal(jsonLdNodes({ '@type': 'Thing' })[0]['@context'], 'https://schema.org');
		assert.equal(jsonLdNodes({ '@context': 'https://x', '@type': 'Thing' })[0]['@context'], 'https://x');
	});

	it('cannot close its script element', () => {
		const json = scriptSafeJson({ name: '</script><script>alert(1)</script> &  ' });
		assert.ok(!json.includes('<') && !json.includes('>') && !json.includes('&'));
		assert.equal(JSON.parse(json).name, '</script><script>alert(1)</script> &  ');
	});

	it('emits app nodes, then page nodes, then derived ones', () => {
		const html = generateStructuredData(
			page({ jsonLd: { value: { '@type': 'Article', headline: 'Post' } } }),
			app({ structuredData: [{ '@type': 'Organization', name: 'Shop' }] }),
			{ pageName: 'blog' },
		);
		assert.deepEqual(ldBlocks(html).map(n => n['@type']), ['Organization', 'Article', 'BreadcrumbList', 'WebPage']);
	});

	it('derives a breadcrumb from the path and dateModified from the update time', () => {
		const blocks = ldBlocks(generateStructuredData(page(), app(), { pageName: 'blog' }));
		const crumbs = blocks.find(b => b['@type'] === 'BreadcrumbList');
		assert.deepEqual(
			crumbs.itemListElement.map((i: any) => [i.position, i.name, i.item]),
			[[1, 'Shop', `${BASE}/`], [2, 'Blog', `${BASE}/blog`]],
		);
		assert.equal(blocks.find(b => b['@type'] === 'WebPage').dateModified, isoInstant(1790494664));
	});

	it('does not derive a type the page already has', () => {
		const html = generateStructuredData(
			page({ jsonLd: { value: [{ '@type': 'FAQPage' }, { '@type': 'BreadcrumbList' }] } }),
			app(),
			{ pageName: 'blog' },
		);
		assert.deepEqual(ldBlocks(html).map(n => n['@type']), ['FAQPage', 'BreadcrumbList']);
	});

	it('has no breadcrumb on the home page', () => {
		const html = generateStructuredData(page({}, { name: 'home' }), app(), { pageName: 'home' });
		assert.ok(!ldBlocks(html).some(n => n['@type'] === 'BreadcrumbList'));
	});

	it('reads epoch seconds, milliseconds and ISO strings', () => {
		assert.equal(isoInstant(1700000000), '2023-11-14T22:13:20.000Z');
		assert.equal(isoInstant(1700000000000), '2023-11-14T22:13:20.000Z');
		assert.equal(isoInstant('2023-11-14T22:13:20Z'), '2023-11-14T22:13:20.000Z');
		assert.equal(isoInstant('nonsense'), undefined);
	});
});

describe('seo.paths', () => {
	const paths = {
		'post-a': { title: 'Post A', description: 'About A', canonical: '/blog/post-a' },
		'post-b': { title: 'Post B', description: 'About B', jsonLd: { '@type': 'Article', headline: 'B' } },
	};

	it('gives two posts their own title, description and canonical', async () => {
		const p = page({ paths: { value: paths } });
		const heads = [];
		for (const slug of ['post-a', 'post-b']) {
			const found = await lookupPath(p, slug, SOURCE);
			assert.equal(found.kind, 'found');
			heads.push(resolveOg(p, app(), { pageName: 'blog', path: slug, pathHead: (found as any).head }));
		}
		assert.deepEqual(heads.map(h => [h.title, h.description, h.canonical]), [
			['Post A', 'About A', `${BASE}/blog/post-a`],
			['Post B', 'About B', `${BASE}/blog/post-b`],
		]);
	});

	it('answers missing for an unknown slug, and for any slug under strictPaths alone', async () => {
		assert.equal((await lookupPath(page({ paths }), 'nope', SOURCE)).kind, 'missing');
		assert.equal((await lookupPath(page({ strictPaths: { value: true } }), 'x', SOURCE)).kind, 'missing');
		assert.equal((await lookupPath(page({ paths }), '__proto__', SOURCE)).kind, 'missing');
		assert.equal((await lookupPath(page({ paths }), 'x'.repeat(400), SOURCE)).kind, 'missing');
	});

	it('lets strictPaths: false serve an unknown slug as the page itself', async () => {
		assert.equal((await lookupPath(page({ paths, strictPaths: false }), 'nope', SOURCE)).kind, 'page');
	});

	it('leaves a page without paths alone', async () => {
		assert.equal(declaresPaths(page()), false);
		assert.equal((await lookupPath(page(), 'anything', SOURCE)).kind, 'none');
		assert.equal((await lookupPath(page({ paths }), '', SOURCE)).kind, 'page');
	});

	it('refuses a source that is not an /api/ path without fetching', async () => {
		assert.equal((await lookupPath(page({ paths: { uri: 'https://evil.test/x' } }), 'a', SOURCE)).kind, 'unknown');
	});

	it('keys each path apart, after every suffix the page key has', () => {
		const base = generateCacheKey('shop', 'SYSTEM', 'blog', false, 'dark');
		const a = pathCacheKey(base, 'post-a');
		assert.notEqual(a, pathCacheKey(base, 'post-b'));
		// The publish eviction deletes `html:shop:SYSTEM:blog:*` (cache/redis.ts invalidateCache).
		assert.ok(a.startsWith('shop:SYSTEM:blog:'));
	});

	it('reads the slug after the page name in both URL forms', () => {
		assert.equal(extractPagePath('/blog/post-a'), 'post-a');
		assert.equal(extractPagePath('/shop/SYSTEM/page/blog/2024/my%20post'), '2024/my post');
		assert.equal(extractPagePath('/blog'), '');
		assert.equal(extractPagePath('/shop/SYSTEM/page/'), '');
		assert.equal(extractPagePath('/blog/%E0%A4'), '%E0%A4');
	});
});
