import { createHash } from 'node:crypto';
import logger from '../config/logger.js';
import { getConfig } from '../config/configLoader.js';
import type { PageDefinition } from '../api/client.js';

/**
 * Per path head values for a URL driven page (PLAT-1546).
 *
 * A page that serves many URLs (`/blog/<slug>`, `/docs/<a>/<b>`) declares `properties.seo.paths`,
 * one of:
 * - a static map `{ "<slug>": { title, description, image, canonical, jsonLd } }`;
 * - a source `{ uri: "/api/..." }` this server GETs anonymously for the slug, answering that same
 *   object, or 404 when the slug names nothing. `{path}` in the uri is replaced by the slug,
 *   otherwise `path=<slug>` is added to its query.
 *
 * Only such pages get a cache entry per path; every other page keeps its single entry and ignores
 * the rest of the path, as before. An unmatched slug answers 404 with the app's not found page,
 * unless `seo.strictPaths` is `false`; `strictPaths: true` without `paths` makes any slug a 404.
 */

export interface PathHead {
	title?: string;
	description?: string;
	image?: string;
	canonical?: string;
	jsonLd?: unknown;
}

export type PathLookup =
	/** The page does not declare paths: today's behaviour, the slug is the client's business. */
	| { kind: 'none' }
	/** The page's own URL, with no slug. */
	| { kind: 'page' }
	| { kind: 'found'; head: PathHead }
	/** The slug names nothing: 404. */
	| { kind: 'missing' }
	/** The source could not be asked: render without per path values and do not cache. */
	| { kind: 'unknown' };

/** Longer slugs are never looked up: no real post has one, and each would be its own entry. */
export const MAX_PATH_LENGTH = 300;

/** Cached paths per page variant; past this a path is still served, just not stored. */
export const MAX_PATH_ENTRIES = 1000;

const SOURCE_TIMEOUT_MS = 3000;
const MAX_SOURCE_BYTES = 64 * 1024;

const HEAD_KEYS = ['title', 'description', 'image', 'canonical'] as const;

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return !!v && typeof v === 'object' && !Array.isArray(v);
}

/** A page property may be a ComponentProperty (`{ value }`) or the raw value. */
function unwrap(v: unknown): unknown {
	return isPlainObject(v) && 'value' in v && Object.keys(v).every(k => k === 'value' || k === 'location')
		? v.value
		: v;
}

function seoOf(page: PageDefinition | null | undefined): Record<string, unknown> | undefined {
	const seo = page?.properties?.seo as unknown;
	return isPlainObject(seo) ? seo : undefined;
}

function pathsOf(page: PageDefinition | null | undefined): unknown {
	const paths = unwrap(seoOf(page)?.paths);
	return isPlainObject(paths) ? paths : undefined;
}

function strictOf(page: PageDefinition | null | undefined): boolean | undefined {
	const v = unwrap(seoOf(page)?.strictPaths);
	return typeof v === 'boolean' ? v : undefined;
}

/** Whether this page's URLs below its name are its own documents, each cached and checked. */
export function declaresPaths(page: PageDefinition | null | undefined): boolean {
	return pathsOf(page) !== undefined || strictOf(page) === true;
}

/** The head values an entry carries, as trimmed strings; `jsonLd` passes through untouched. */
function toHead(entry: unknown): PathHead | undefined {
	const e = unwrap(entry);
	if (!isPlainObject(e)) return undefined;
	const head: PathHead = {};
	for (const key of HEAD_KEYS) {
		const v = unwrap(e[key]);
		if (typeof v === 'string' && v.trim()) head[key] = v.trim();
	}
	if (e.jsonLd !== undefined) head.jsonLd = e.jsonLd;
	return head;
}

/** A source answer as served by a KIRun function (`[{ name, result }]`) or as the object itself. */
function fromSourceBody(body: unknown): unknown {
	let v = body;
	if (Array.isArray(v)) v = v[0];
	if (isPlainObject(v) && isPlainObject(v.result) && typeof v.name === 'string') v = v.result;
	return v;
}

export interface SourceOptions {
	appCode: string;
	clientCode: string;
	forwardedHost?: string | null;
	forwardedProto?: string | null;
	forwardedPort?: string | null;
}

function sourceUrl(uri: string, slug: string): string | undefined {
	// Only this platform's own API, through the gateway: an absolute or protocol relative uri
	// would make this server fetch whatever a page author named.
	if (!uri.startsWith('/api/') || uri.includes('://')) return undefined;
	const encoded = slug.split('/').map(encodeURIComponent).join('/');
	if (uri.includes('{path}')) return uri.split('{path}').join(encoded);
	return `${uri}${uri.includes('?') ? '&' : '?'}path=${encodeURIComponent(slug)}`;
}

async function askSource(uri: string, slug: string, options: SourceOptions): Promise<PathLookup> {
	const target = sourceUrl(uri, slug);
	if (!target) {
		logger.warn('seo.paths source refused: not an /api/ path', { uri });
		return { kind: 'unknown' };
	}

	// Anonymous on purpose: what a crawler is told about a URL must not depend on who asked.
	const headers: Record<string, string> = {
		Accept: 'application/json',
		appCode: options.appCode,
		clientCode: options.clientCode,
	};
	if (options.forwardedHost) headers['X-Forwarded-Host'] = options.forwardedHost;
	if (options.forwardedProto) headers['X-Forwarded-Proto'] = options.forwardedProto;
	if (options.forwardedPort) headers['X-Forwarded-Port'] = options.forwardedPort;

	try {
		const response = await fetch(`${getConfig().gateway.url}${target}`, {
			headers,
			signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
		});
		if (response.status === 404) return { kind: 'missing' };
		if (!response.ok) {
			logger.warn('seo.paths source failed', { uri, status: response.status });
			return { kind: 'unknown' };
		}
		const text = await response.text();
		if (text.length > MAX_SOURCE_BYTES) {
			logger.warn('seo.paths source answer too large', { uri, size: text.length });
			return { kind: 'unknown' };
		}
		const head = text.trim() ? toHead(fromSourceBody(JSON.parse(text))) : undefined;
		// A 200 with nothing in it is the source saying there is no such path.
		return head ? { kind: 'found', head } : { kind: 'missing' };
	} catch (error) {
		logger.warn('seo.paths source error', { uri, error: String(error) });
		return { kind: 'unknown' };
	}
}

/** What the slug of this request is to this page. Never throws. */
export async function lookupPath(
	page: PageDefinition | null | undefined,
	slug: string,
	options: SourceOptions,
): Promise<PathLookup> {
	if (!declaresPaths(page)) return { kind: 'none' };
	if (!slug) return { kind: 'page' };

	const paths = pathsOf(page) as Record<string, unknown> | undefined;
	const strict = strictOf(page) ?? paths !== undefined;
	const notMatched: PathLookup = strict ? { kind: 'missing' } : { kind: 'page' };

	if (slug.length > MAX_PATH_LENGTH || !paths) return notMatched;

	if (typeof paths.uri === 'string') {
		const found = await askSource(paths.uri, slug, options);
		return found.kind === 'missing' ? notMatched : found;
	}

	// Own keys only: a slug of `constructor` or `__proto__` is not an entry.
	const head = Object.prototype.hasOwnProperty.call(paths, slug) ? toHead(paths[slug]) : undefined;
	return head ? { kind: 'found', head } : notMatched;
}

/**
 * The cache key for one path of a page that declares paths. The suffix goes after everything
 * generateCacheKey puts on the page name, so a publish evicting the bare `app:client:page`
 * (and its `:*` copies, see invalidateCache) removes every path with it.
 */
export function pathCacheKey(pageKey: string, slug: string): string {
	return `${pageKey}:path:${createHash('sha1').update(slug).digest('hex').slice(0, 16)}`;
}
