import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveCodesFromRequest, extractPageName, getAuthToken } from '../resolver/codeResolver.js';
import {
	fetchAllPageData,
	fetchApplication,
	type PageDefinition,
	type ApplicationDefinition,
	type ThemeDefinition,
	type HeadTagCollection,
} from '../api/client.js';
import { assignmentSetCookie, isDesignUrl, resolveRoute } from '../resolver/pageRouting.js';
import { getCachedData, setCachedData, generateAppCacheKey, generateCacheKey, getCachedHtml, setCachedHtml, getCachedGzippedHtml } from '../cache/redis.js';
import { getConfig } from '../config/configLoader.js';
import logger from '../config/logger.js';
import { loadManifest, getCriticalChunks } from '../util/manifestLoader.js';
// Key compression removed - doesn't help gzipped transfer size (only 14% savings)
// and adds 10-20ms CPU overhead that hurts TTFB/FBBT

// Load manifest at startup
const assetManifest = loadManifest();
if (assetManifest) {
	logger.info('Asset manifest loaded successfully', {
		applicationChunks: assetManifest.preload.application.length,
		styleChunks: assetManifest.preload.applicationStyle.length,
	});
} else {
	logger.warn('Asset manifest not found or invalid - preload optimization disabled');
}

interface CDNConfig {
	hostName: string;
	stripAPIPrefix: boolean;
	replacePlus: boolean;
	resizeOptionsType: string;
}

interface CachedPageData {
	application: ApplicationDefinition;
	page: PageDefinition;
	theme: ThemeDefinition | null;
	/** Which theme `theme` is, so the client can tell whether it matches its own. */
	themeName?: string;
	codes: { appCode: string; clientCode: string };
	pageName: string;
	cachedAt: number;
}

/**
 * The visitor's selected theme, from the cookie the client writes.
 *
 * The name must match IndexHTMLService.THEME_COOKIE_PREFIX and the client's
 * themeSelection.ts. One cookie per app, because a single host can serve several
 * apps under /appCode/clientCode/page and they do not share a theme.
 */
function readThemeCookie(header: string | undefined, appCode: string): string | undefined {
	if (!header) return undefined;

	const match = new RegExp(String.raw`(?:^|;\s*)mlxTheme_` + appCode + '=([^;]*)').exec(header);
	if (!match) return undefined;

	try {
		return decodeURIComponent(match[1]) || undefined;
	} catch {
		// Not a value we wrote. Treat it as absent rather than keying the cache on
		// something malformed.
		return undefined;
	}
}

/**
 * Convert camelCase to kebab-case (e.g., defaultSrc -> default-src)
 */
function camelToKebab(str: string): string {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * CSP directives that should include the CDN URL
 */
const CSP_DIRECTIVES_FOR_CDN = [
	'default-src',
	'script-src',
	'style-src',
	'img-src',
	'font-src',
	'connect-src',
	'media-src',
];

/**
 * Process CSP value (can be string or object with directives)
 * Handles both formats:
 * - Already kebab-case: { "default-src": "'self'" }
 * - camelCase: { "defaultSrc": "'self'" } -> converts to "default-src"
 * Also adds CDN URL to relevant directives
 */
function processCSP(csp: string | Record<string, string> | undefined, cdnHostName?: string): string | null {
	if (!csp) return null;

	const cdnUrl = cdnHostName ? `https://${cdnHostName}` : null;

	if (typeof csp === 'string') {
		// For string CSP, we can't easily inject CDN - return as-is
		return csp;
	}

	return Object.entries(csp)
		.map(([directive, value]) => {
			// Convert camelCase to kebab-case if needed
			const kebabDirective = directive.includes('-') ? directive : camelToKebab(directive);

			// Add CDN URL to relevant directives if not already present
			let finalValue = value;
			if (cdnUrl && CSP_DIRECTIVES_FOR_CDN.includes(kebabDirective)) {
				if (!value.includes(cdnHostName!)) {
					finalValue = `${value} ${cdnUrl}`;
				}
			}

			return `${kebabDirective} ${finalValue}`;
		})
		.join('; ');
}

/**
 * Generate ETag from page data
 */
function generateETag(data: CachedPageData): string {
	const content = JSON.stringify({
		app: data.application?.id,
		page: data.page?.id,
		pageName: data.pageName,
		cachedAt: data.cachedAt,
	});
	return `"${createHash('md5').update(content).digest('hex').slice(0, 16)}"`;
}

/**
 * Escape HTML special characters
 */
// Map security.appCodeSuffix to the authzump beacon host:
//   ""        -> "authzump.ai"
//   ".dev"    -> "dev.authzump.ai"
//   ".stage"  -> "stage.authzump.ai"
//   ".local"  -> "authzump.local.modlix.com"
//
// Local is deliberately not "local.authzump.ai". Local hosts are <app>.local.modlix.com
// (dnsmasq wildcards that suffix to 127.0.0.1 on a developer machine); the .ai names
// belong to the deployed environments only. "local.authzump.ai" does resolve, to prod-lb,
// where it is a stray vhost carrying appCode "nothing", so pointing the beacon there
// silently broke all local SSO.
//
// Must stay in step with IndexHTMLService.deriveBeaconHost in nocode-saas/ui.
const LOCAL_ENV = 'local';

function deriveBeaconHost(appCodeSuffix: string | undefined | null): string {
	if (!appCodeSuffix) return 'authzump.ai';
	const trimmed = appCodeSuffix.startsWith('.') ? appCodeSuffix.slice(1) : appCodeSuffix;
	const dotIdx = trimmed.indexOf('.');
	const env = dotIdx >= 0 ? trimmed.slice(0, dotIdx) : trimmed;
	if (!env) return 'authzump.ai';
	return env === LOCAL_ENV ? `authzump.${env}.modlix.com` : `${env}.authzump.ai`;
}

function escapeHtml(str: string | undefined | null): string {
	if (!str || typeof str !== 'string') {
		return '';
	}
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Critical CSS for initial render
 */
const CRITICAL_CSS = `
body { margin: 0; }
.comp { box-sizing: border-box; position: relative; }
/* The ROOT page only. Every rule in this block outlives the first paint, because
   nothing removes the <style>, and the client's own PageCss never writes a
   min-height, so a single-class .compPage rule went on applying to every NESTED
   page too. A SubPage pane is a .compPage inside the shell's .compPage, so 100vh
   forced each pane to a full viewport below the shell header and pushed the
   document down by the header's height: a scrollbar on workspace, org and docs,
   which lock their height, and only on the environments serving this block. */
#app > .comp.compPage { min-height: 100vh; }
.compGrid { display: flex; flex-direction: column; }
.compTable { display: flex; flex-direction: row; }
.compTableColumns { display: table; border-spacing: 0; width: 100%; }
.compTableColumn, .compTableHeaderColumn { display: table-cell; vertical-align: middle; }
.compMessages { position: fixed; top: 10px; right: 10px; z-index: 10000; }
._noAnchorGrid { }
._ROWLAYOUT { flex-direction: row; }
._SINGLECOLUMNLAYOUT { flex-direction: column; }
._ROWCOLUMNLAYOUT { flex-direction: column; }
._TWOCOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
._THREECOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
._FOURCOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
._FIVECOLUMNSLAYOUT { display: grid; grid-template-columns: 1fr; }
@media screen and (min-width: 641px) {
	._TWOCOLUMNSLAYOUT, ._THREECOLUMNSLAYOUT, ._FOURCOLUMNSLAYOUT, ._FIVECOLUMNSLAYOUT {
		grid-template-columns: 1fr 1fr;
	}
}
@media screen and (min-width: 1025px) {
	._TWOCOLUMNSLAYOUT { grid-template-columns: 1fr 1fr; }
	._THREECOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr; }
	._FOURCOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr 1fr; }
	._FIVECOLUMNSLAYOUT { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
	._ROWCOLUMNLAYOUT { flex-direction: row; }
}
`;

/**
 * A head-tag collection as it is really stored: a map keyed by generated id.
 *
 * Every consumer but this one already knew that. Java iterates `.values()`, the
 * React client does `Object.entries`, and the appbuilder Settings pane writes a
 * map. SSR declared an array and used `for...of`, which throws
 * `TypeError: not iterable` on an object -- and the throw is caught up in the
 * request handler, so an app that had ever saved a head tag served a bare 500
 * with nothing in it pointing here.
 *
 * `order` sorts ascending, matching Java's `MapWithOrderComparator`. A
 * non-numeric order sorts as 0 rather than throwing, which is the one place
 * this is deliberately laxer than Java (that one raises NumberFormatException).
 */
export function headTagValues<T extends { order?: number | string }>(
	collection: HeadTagCollection<T> | undefined
): T[] {
	if (!collection) return [];
	const values = Array.isArray(collection) ? [...collection] : Object.values(collection);
	return values
		.filter((v): v is T => !!v && typeof v === 'object')
		.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}

/** Trim one side's slashes with string ops; the regex forms backtrack. */
function trimSlashes(value: string, side: 'start' | 'end'): string {
	let from = 0;
	let to = value.length;
	if (side === 'start') while (from < to && value[from] === '/') from++;
	else while (to > from && value[to - 1] === '/') to--;
	return value.slice(from, to);
}

/**
 * Resolve a stored URL to an absolute one.
 *
 * Stored image values are root-relative files-API paths, and there is no
 * `getSrcUrl` on this side -- `cdn.hostName` here only ever addresses script and
 * preload tags. Facebook, X and Slack all reject a relative `og:image`, so a
 * value that is not already absolute is resolved against the configured
 * canonical base. With no base configured there is nothing honest to prepend,
 * so the tag is dropped rather than emitted broken.
 */
function absolutise(value: string, canonicalBase: string): string {
	const v = value.trim();
	if (!v) return '';
	const lower = v.toLowerCase();
	if (lower.startsWith('http://') || lower.startsWith('https://') || v.startsWith('//')) return v;
	// A data: URI is self-contained but no consumer accepts one for og:image,
	// and it would blow the document up besides. Treated as unusable.
	if (lower.startsWith('data:')) return '';
	if (!canonicalBase) return '';
	return `${trimSlashes(canonicalBase, 'end')}/${trimSlashes(v, 'start')}`;
}

/** Page SEO keys that are plain `name=` metas, and the attribute each emits under. */
const PLAIN_META_KEYS: Array<[string, string]> = [
	['description', 'description'],
	['keywords', 'keywords'],
	['robots', 'robots'],
	['author', 'author'],
	// The HTML attribute is hyphenated; the stored key is not. The client makes
	// the same translation, so the two agree on what lands in the document.
	['applicationName', 'application-name'],
	['generator', 'generator'],
];

/** Page SEO keys that map to a `twitter:` name, in emission order. */
const TWITTER_KEYS: Array<[string, string]> = [
	['twitterCard', 'twitter:card'],
	['twitterSite', 'twitter:site'],
	['twitterCreator', 'twitter:creator'],
];

/** ogp.me's `article` type-specific properties, emitted only for `og:type=article`. */
const ARTICLE_KEYS: Array<[string, string]> = [
	['articlePublishedTime', 'article:published_time'],
	['articleModifiedTime', 'article:modified_time'],
	['articleAuthor', 'article:author'],
	['articleSection', 'article:section'],
	['articleTag', 'article:tag'],
];

export interface MetaRenderContext {
	pageName?: string;
	appCode?: string;
	clientCode?: string;
}

/** First non-blank candidate, trimmed. The whole fallback chain is built on it. */
function firstOf(...candidates: Array<string | number | undefined | null>): string {
	for (const c of candidates) {
		const v = (c ?? '').toString().trim();
		if (v) return v;
	}
	return '';
}

/**
 * Everything the head needs to say about this page, with inheritance already
 * applied: the page's own `properties.seo` first, the application's
 * `properties.og` behind it, and the title chain the `<title>` tag uses behind
 * that.
 */
export interface ResolvedOg {
	charset: string;
	title: string;
	type: string;
	image: string;
	imageAlt: string;
	imageType: string;
	imageWidth: string;
	imageHeight: string;
	url: string;
	description: string;
	siteName: string;
	locale: string;
	localeAlternate: string[];
	determiner: string;
	twitterCard: string;
	twitterSite: string;
	twitterCreator: string;
	fbAppId: string;
	article: Array<[string, string]>;
	plain: Array<[string, string]>;
	/** False when there is nothing worth a card, so no og block is emitted. */
	present: boolean;
}

export function resolveOg(
	page: PageDefinition | null,
	application: ApplicationDefinition | null,
	ctx: MetaRenderContext = {}
): ResolvedOg {
	const seo = page?.properties?.seo;
	const og = application?.properties?.og;
	const appTitle = application?.properties?.title;
	const s = (key: string): string => (seo?.[key]?.value ?? '').toString().trim();

	const canonicalBase = trimSlashes((og?.canonicalBase ?? '').toString().trim(), 'end');

	const image = absolutise(firstOf(s('ogImage'), og?.image?.url), canonicalBase);
	const title = firstOf(s('ogTitle'), og?.title, page?.properties?.title?.name?.value, appTitle);
	const description = firstOf(s('ogDescription'), s('description'), og?.description);

	// A page reached at its own path, expressed against the canonical origin
	// rather than the host that happened to ask. The HTML cache key carries no
	// host, so one cached document is served to every domain the app answers on,
	// and a host-derived value would be whichever host missed the cache first.
	const ownUrl = absolutise(s('ogUrl'), canonicalBase);
	const path = ctx.pageName ? `/${ctx.pageName}` : '/';

	return {
		// The encoding declaration has to be in the document's first 1024 bytes
		// and is a lone attribute rather than a name plus content, so it is
		// emitted separately from everything else here.
		charset: firstOf(s('charset'), 'utf-8'),
		title,
		type: firstOf(s('ogType'), og?.type, 'website'),
		image,
		imageAlt: firstOf(s('ogImageAlt'), og?.image?.alt),
		imageType: firstOf(s('ogImageType'), og?.image?.type),
		imageWidth: firstOf(s('ogImageWidth'), og?.image?.width),
		imageHeight: firstOf(s('ogImageHeight'), og?.image?.height),
		url: firstOf(ownUrl, canonicalBase ? `${canonicalBase}${path}` : ''),
		description,
		siteName: firstOf(s('ogSiteName'), og?.siteName, appTitle),
		locale: firstOf(s('ogLocale'), og?.locale),
		localeAlternate: (og?.localeAlternate ?? []).map(a => (a ?? '').toString().trim()).filter(Boolean),
		determiner: firstOf(s('ogDeterminer'), og?.determiner),
		// X reads og:* for everything except the card layout, which only
		// twitter:card selects. Defaulted from whether an image resolved,
		// because summary_large_image with no image renders as a blank plate.
		twitterCard: firstOf(s('twitterCard'), og?.twitter?.card, image ? 'summary_large_image' : 'summary'),
		twitterSite: firstOf(s('twitterSite'), og?.twitter?.site),
		twitterCreator: firstOf(s('twitterCreator'), og?.twitter?.creator),
		fbAppId: firstOf(og?.fbAppId),
		article: ARTICLE_KEYS.map(([key, tag]) => [tag, s(key)] as [string, string]).filter(e => !!e[1]),
		plain: PLAIN_META_KEYS.map(([key, name]) => {
			const value = firstOf(s(key), key === 'description' ? description : '');
			return [name, value] as [string, string];
		}).filter(e => !!e[1]),
		// Nothing to say at all means nothing is said. A card built from an empty
		// title and no image is worse than no card: the consumer then falls back
		// to the page's own <title>, which is usually right.
		present: !!(title || image || description),
	};
}

/** Collects `<meta>` tags, refusing a property that has already been said. */
class MetaSink {
	readonly tags: string[] = [];
	// ogp.me gives the first tag precedence on a conflict, but LinkedIn and
	// Teams do not document that they follow it, so a document is never given
	// two of the same property to choose between.
	private readonly seen = new Set<string>();

	add(attr: 'name' | 'property', key: string, value: string): void {
		const v = (value ?? '').toString().trim();
		if (!v || this.seen.has(key)) return;
		this.seen.add(key);
		this.tags.push(`<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(v)}">`);
	}

	/** For ogp.me's repeated properties, which are meant to appear more than once. */
	addRepeated(attr: 'name' | 'property', key: string, value: string): void {
		this.tags.push(`<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(value)}">`);
	}

	has(key: string): boolean {
		return this.seen.has(key);
	}

	claim(key: string): void {
		this.seen.add(key);
	}

	raw(tag: string): void {
		this.tags.push(tag);
	}
}

/** The og block, in the order ogp.me lays it out. */
function emitOg(sink: MetaSink, r: ResolvedOg): void {
	if (!r.present) return;

	// The four required properties come first.
	sink.add('property', 'og:title', r.title);
	sink.add('property', 'og:type', r.type);

	if (r.image) {
		sink.add('property', 'og:image', r.image);
		// ogp.me: "Put structured properties after you declare their root tag.
		// Whenever another root element is parsed, that structured property is
		// considered to be done." So these sit directly under og:image; moved
		// below og:site_name they would attach to nothing.
		if (r.image.toLowerCase().startsWith('https://')) {
			sink.add('property', 'og:image:secure_url', r.image);
		}
		sink.add('property', 'og:image:alt', r.imageAlt);
		sink.add('property', 'og:image:type', r.imageType);
		sink.add('property', 'og:image:width', r.imageWidth);
		sink.add('property', 'og:image:height', r.imageHeight);
	}

	sink.add('property', 'og:url', r.url);

	sink.add('property', 'og:description', r.description);
	sink.add('property', 'og:site_name', r.siteName);
	sink.add('property', 'og:locale', r.locale);
	// The one repeated property in the set: ogp.me says to put multiple versions
	// of the same tag on the page, so this deliberately bypasses the dedupe.
	if (r.localeAlternate.length) sink.claim('og:locale:alternate');
	for (const alt of r.localeAlternate) sink.addRepeated('property', 'og:locale:alternate', alt);
	sink.add('property', 'og:determiner', r.determiner);

	if (r.type === 'article') {
		for (const [tag, value] of r.article) sink.add('property', tag, value);
	}

	sink.add('name', 'twitter:card', r.twitterCard);
	sink.add('name', 'twitter:site', r.twitterSite);
	sink.add('name', 'twitter:creator', r.twitterCreator);
	sink.add('property', 'fb:app_id', r.fbAppId);
}

/**
 * Application-level head metas, last and never duplicating.
 *
 * These are the free-form escape hatch. The typed blocks above are the ones the
 * product can preview, so they win, and an entry here that names something
 * already said is dropped rather than appended.
 */
function emitAppMetas(sink: MetaSink, application: ApplicationDefinition | null): void {
	for (const m of headTagValues(application?.properties?.metas)) {
		if (m.charset) continue; // already emitted, and only one is legal

		const property = m.property?.trim();
		const name = m.name?.trim();
		const httpEquiv = (m['http-equiv'] ?? m.httpEquiv)?.trim();

		const key = property || name || httpEquiv;
		if (!key || sink.has(key)) continue;
		sink.claim(key);

		const attrs: string[] = [];
		if (name) attrs.push(`name="${escapeHtml(name)}"`);
		if (property) attrs.push(`property="${escapeHtml(property)}"`);
		if (httpEquiv) attrs.push(`http-equiv="${escapeHtml(httpEquiv)}"`);
		// `order` is bookkeeping, not an attribute. The React client emits it as
		// a literal `<meta order="1">`; this one does not.
		if (m.content) attrs.push(`content="${escapeHtml(m.content)}"`);
		if (attrs.length > 0) sink.raw(`<meta ${attrs.join(' ')}>`);
	}
}

/**
 * Resolve and emit the document head's metadata.
 *
 * A page's own `properties.seo` wins, the application's `properties.og` fills
 * the gaps, and the free-form `properties.metas` comes last for anything
 * neither covers. ogp.me makes og:title, og:type, og:image and og:url all
 * required, so all four are emitted whenever there is anything to say at all.
 */
export function generateMetaTags(
	page: PageDefinition | null,
	application: ApplicationDefinition | null,
	ctx: MetaRenderContext = {}
): string {
	const resolved = resolveOg(page, application, ctx);
	const sink = new MetaSink();

	sink.raw(`<meta charset="${escapeHtml(resolved.charset)}">`);
	sink.raw('<meta name="viewport" content="width=device-width, initial-scale=1">');

	emitOg(sink, resolved);

	// `robots`, `author`, `applicationName` and `generator` have been authored by
	// the page editor's SEO panel since it existed and were never rendered, so
	// the panel promised something it did not deliver.
	for (const [name, value] of resolved.plain) sink.add('name', name, value);

	emitAppMetas(sink, application);

	return sink.tags.join('\n\t\t');
}

/**
 * Generate external links HTML (fonts, stylesheets)
 */
function generateExternalLinks(application: ApplicationDefinition | null): string {
	const links: string[] = [];
	const externalLinks = application?.properties?.links || {};

	for (const [, link] of Object.entries(externalLinks)) {
		// Skip links without href
		if (!link.href || typeof link.href !== 'string') {
			continue;
		}
		const rel = link.rel || 'stylesheet';
		links.push(`<link rel="${escapeHtml(rel)}" href="${escapeHtml(link.href)}">`);
	}

	return links.join('\n\t\t');
}

/**
 * The analytics beacon, as one script tag.
 *
 * The script itself is served by the engine that receives its events, so there is no vendor
 * stub here and no copy of the wire format. The previous arrangement transcribed the same
 * minified blob into this file and into IndexHTMLService.java, and the two had begun to
 * drift; now both emit a tag and the engine owns the client.
 *
 * Returns '' when analytics is off for the app or no host is configured — the rendered page
 * then carries nothing at all, rather than a script that would load and measure nobody.
 */
function generateAnalyticsSnippet(
	application: ApplicationDefinition | null,
	ingestionHost: string,
): string {
	if (!ingestionHost) return '';

	const a = application?.properties?.analytics;
	if (!a?.enabled) return '';

	const host = ingestionHost.endsWith('/') ? ingestionHost.slice(0, -1) : ingestionHost;
	const attr = (v: unknown, dflt: boolean) => String(v === undefined || v === null ? dflt : v !== false);

	return (
		// A queue, so an event fired before the async script arrives is not lost.
		'<script>window.mlx=window.mlx||function(){(window.mlx.q=window.mlx.q||[]).push(arguments)};</script>' +
		`<script async src="${escapeHtml(host)}/a.js"` +
		` data-autocapture="${attr(a.autocapture, true)}"` +
		` data-pageviews="${attr(a.capturePageviews, true)}"` +
		` data-pageleaves="${attr(a.capturePageleaves, true)}"` +
		// On unless the app says otherwise: one extra event per page view, where a heatmap
		// is one per click, and nothing it records is about the person.
		` data-scroll="${attr(a.captureScroll, true)}"` +
		// Off unless the app asks: every click becomes an event, where autocapture records
		// only the labelled ones.
		` data-heatmaps="${attr(a.heatmaps?.enabled, false)}"` +
		// Unconditional. There is no application setting that turns consent off:
		// one set wrong, once, measures people who were never asked, and nothing
		// about that state looks wrong from the outside.
		' data-consent="required"></script>'
	);
}

/**
 * Generate external scripts HTML
 */
function generateExternalScripts(application: ApplicationDefinition | null): string {
	const scripts: string[] = [];
	// Same keyed-map shape as `metas`, and the same `for...of` throw before this
	// went through `headTagValues`. See its comment.
	const externalScripts = headTagValues(application?.properties?.scripts);

	for (const script of externalScripts) {
		// Skip scripts without src
		if (!script.src || typeof script.src !== 'string') {
			continue;
		}
		scripts.push(`<script src="${escapeHtml(script.src)}" defer></script>`);
	}

	return scripts.join('\n\t\t');
}

/**
 * Extract and sort code parts by placement
 */
interface CodePart {
	place: 'BEFORE_HEAD' | 'AFTER_HEAD' | 'BEFORE_BODY' | 'AFTER_BODY';
	order: number;
	part: string;
}

function extractCodeParts(
	application: ApplicationDefinition | null,
	place: CodePart['place']
): string {
	const codeParts = application?.properties?.codeParts || {};

	// Filter and sort code parts for the specified placement
	const parts = Object.values(codeParts)
		.filter((part: any) => part.place === place)
		.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
		.map((part: any) => part.part || '');

	return parts.join('\n\t\t');
}

/**
 * Generate the complete HTML page
 */
function generateHtml(
	data: CachedPageData | null,
	// `urlType` is part of the object every caller already passes; it was the
	// TYPE here that hid it, which is why the draft marker never reached the
	// shell. Taking it off `codes` rather than adding a parameter means none of
	// the six call sites can forget it -- the way they all did.
	codes: { appCode: string; clientCode: string; urlType?: string },
	pageName: string,
	cdn: CDNConfig,
	error?: string
): string {
	// The client reads this to know which surface it is on, and SSR is the only
	// thing that writes the shell on this path -- IndexHTMLService never runs
	// here, so without this a draft host gets drafted content, a draft-keyed
	// cache entry and no banner.
	const draftAttr = codes.urlType === 'DRAFT' ? ' data-draft="true"' : '';
	const cdnUrl = `https://${cdn.hostName}/js/dist/`;
	const application = data?.application || null;
	const page = data?.page || null;
	const theme = data?.theme || null;

	// Get page title
	const pageTitle =
		page?.properties?.title?.name?.value ||
		application?.properties?.title ||
		'Modlix';

	// Bootstrap data for client hydration
	// Which theme `theme` is. Without it the client cannot tell whether this
	// bootstrap matches its own resolution, and taking a mismatched one applies
	// the wrong theme permanently rather than for a frame.
	const themeName = data?.themeName;

	const bootstrapData = data
		? {
				application,
				pageDefinition: { [pageName]: page },
				theme,
				themeName,
				/**
				 * The page routing chose, which is not necessarily the one named in
				 * the URL. The client reads this instead of deriving the name from
				 * the location, so it does not discard this bootstrap and refetch.
				 *
				 * Only the resolved name appears here, and deliberately so: it is
				 * exactly what the HTML cache is keyed by, so every visitor served
				 * this cached document belongs under it. Which rule fired, and which
				 * arm of a split they drew, are per-visitor and would be baked in for
				 * whoever happened to miss the cache first.
				 */
				resolvedPageName: pageName,
				urlDetails: {
					pageName,
					appCode: codes.appCode,
					clientCode: codes.clientCode,
				},
		  }
		: null;

	// `pageName` here is the page actually served, which is what the canonical
	// URL has to name: a routing split that resolved to a variant still belongs
	// under the URL the visitor asked for, and that is the name this carries.
	const metaTags = generateMetaTags(page, application, {
		pageName,
		appCode: codes.appCode,
		clientCode: codes.clientCode,
	});
	const externalLinks = generateExternalLinks(application);
	const externalScripts = generateExternalScripts(application);
	const analyticsSnippet = generateAnalyticsSnippet(
		application,
		getConfig().analytics.ingestionHost,
	);

	// Extract code parts for different placements
	const beforeHeadParts = extractCodeParts(application, 'BEFORE_HEAD');
	const afterHeadParts = extractCodeParts(application, 'AFTER_HEAD');
	const beforeBodyParts = extractCodeParts(application, 'BEFORE_BODY');
	const afterBodyParts = extractCodeParts(application, 'AFTER_BODY');

	// Get critical chunks from manifest for preloading
	const criticalChunks = getCriticalChunks(assetManifest, 3);

	// Get entrypoint scripts from manifest (with fallback to legacy bundles)
	const entrypointScripts = assetManifest?.entrypoints?.index || ['vendors.js', 'index.js'];

	// Generate preload tags for entrypoint scripts
	const entrypointPreloadTags = entrypointScripts
		.map(script => `<link rel="preload" href="${cdnUrl}${script}" as="script">`)
		.join('\n\t\t');

	// Helper to extract filename from full URL or return as-is if already a filename
	const extractFilename = (path: string) => {
		if (path.startsWith('http')) {
			return path.split('/').pop() || path;
		}
		return path;
	};

	// Generate preload tags for critical chunks (strip CDN URL if present)
	const chunkPreloadTags = [
		...criticalChunks.application.map(chunk => `<link rel="preload" href="${cdnUrl}${extractFilename(chunk)}" as="script">`),
		...criticalChunks.applicationStyle.map(chunk => `<link rel="preload" href="${cdnUrl}${extractFilename(chunk)}" as="script">`)
	].join('\n\t\t');

	return `<!DOCTYPE html>
<html lang="en"${draftAttr}>
	<head>
		${beforeHeadParts ? `${beforeHeadParts}\n\t\t` : ''}${metaTags}
		<title>${escapeHtml(pageTitle)}</title>

		<!-- Resource hints -->
		<link rel="dns-prefetch" href="https://${cdn.hostName}">
		<link rel="preconnect" href="https://${cdn.hostName}" crossorigin="anonymous">

		<!-- Preload entrypoint scripts -->
		${entrypointPreloadTags}		
		${chunkPreloadTags ? `${chunkPreloadTags}\n\t\t` : ''}<!-- Preload critical Application chunks -->

		<!-- Critical CSS -->
		<style id="criticalCss">${CRITICAL_CSS}</style>

		<!-- External stylesheets (fonts, etc.) -->
		${externalLinks}
		${analyticsSnippet}
		${afterHeadParts ? `\n\t\t${afterHeadParts}` : ''}
	</head>
	<body>
		${beforeBodyParts ? `${beforeBodyParts}\n\t\t` : ''}<!-- Bootstrap data for client hydration -->
		<script>
			${bootstrapData ? `window.__APP_BOOTSTRAP__ = ${JSON.stringify(removeCodeParts(bootstrapData))};` : ''}
			window.domainAppCode = '${escapeHtml(codes.appCode)}';
			window.domainClientCode = '${escapeHtml(codes.clientCode)}';
			// Read by the client's themeSelection.ts to name the theme cookie and the
			// personalization row. Separate from domainAppCode because getHref.ts
			// overwrites that one with a hardcoded value on import, and because a
			// domain-mapped host has no app code in its path for the client to parse:
			// without this stamp a theme the visitor picks here is never remembered.
			window.__mlxAppCode = '${escapeHtml(codes.appCode)}';
			window.cdnPrefix = '${escapeHtml(cdn.hostName)}';
			window.cdnStripAPIPrefix = ${cdn.stripAPIPrefix};
			window.cdnReplacePlus = ${cdn.replacePlus};
			${cdn.resizeOptionsType ? `window.cdnResizeOptionsType = '${escapeHtml(cdn.resizeOptionsType)}';` : ''}
			window.__SOCIAL_LOGIN_HOST__ = '${escapeHtml(deriveBeaconHost(getConfig().security.appCodeSuffix))}';
			${application?.properties?.sso3 === true ? `window.__SSO_BEACON_HOST__ = '${escapeHtml(deriveBeaconHost(getConfig().security.appCodeSuffix))}';` : ''}
		</script>

		<!-- Main app container -->
		<div id="app">${error ? `<div style="padding:20px;color:#721c24;background:#f8d7da;border:1px solid #f5c6cb;border-radius:4px;margin:20px;">${escapeHtml(error)}</div>` : ''}</div>

		<!-- Application style from style service, for the resolved theme -->
		<link rel="stylesheet" id="mlxAppStyle" href="/${escapeHtml(codes.appCode)}/${escapeHtml(codes.clientCode)}/page/api/ui/style${themeName ? `?theme=${encodeURIComponent(themeName)}` : ''}" />

		<!-- External scripts from application -->
		${externalScripts}

		<!-- Client JS bundles -->
		${entrypointScripts.map(script => `<script src="${cdnUrl}${script}" defer></script>`).join('\n\t\t')}
		${afterBodyParts ? `\n\t\t${afterBodyParts}` : ''}
	</body>
</html>`;
}

function removeCodeParts(def: any) : any {

	console.log(def.application?.properties?.codeParts);

	if (!def.application?.properties?.codeParts) return def;

	delete def.application.properties.codeParts;

	return def;
}

/**
 * Set response headers
 */
const SHARED_CACHE_CONTROL = 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600';

/**
 * A response that carries a Set-Cookie must never be stored by a shared cache.
 *
 * The HTML body is the same for everyone who resolves to this page, so the body
 * itself is perfectly cacheable — but replaying its Set-Cookie to the next
 * visitor would pin the whole internet into one arm of a split. Only the first
 * request from a given visitor draws, so only that one response is uncacheable;
 * every one after it carries the cookie, draws nothing, and is public again.
 */
function cacheControlFor(drewAssignment: boolean): string {
	return drewAssignment ? 'private, no-store' : SHARED_CACHE_CONTROL;
}

function setResponseHeaders(
	res: ServerResponse,
	isAuthenticated: boolean,
	fromCache: boolean,
	etag: string | null,
	application: ApplicationDefinition | null,
	cdnHostName?: string,
	drewAssignment: boolean = false,
): void {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');

	// Cache headers
	if (isAuthenticated) {
		res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
	} else {
		res.setHeader('Cache-Control', cacheControlFor(drewAssignment));
		res.setHeader('Vary', 'Authorization, Cookie');
	}

	// ETag
	if (etag) {
		res.setHeader('ETag', etag);
	}

	// Cache status
	res.setHeader('X-Cache-Status', fromCache ? 'HIT' : 'MISS');

	// CSP headers
	if (application?.properties) {
		const csp = processCSP(application.properties.csp, cdnHostName);
		if (csp) {
			res.setHeader('Content-Security-Policy', csp);
		}

		const cspReport = processCSP(application.properties.cspReport, cdnHostName);
		if (cspReport) {
			res.setHeader('Content-Security-Policy-Report-Only', cspReport);
		}
	}
}

/**
 * Handle page request - main entry point for SSR
 */
export async function handlePageRequest(
	req: IncomingMessage,
	res: ServerResponse
): Promise<void> {
	const url = new URL(req.url || '/', `http://${req.headers.host}`);

	// Convert IncomingMessage to Request-like object for resolver
	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (value) {
			if (Array.isArray(value)) {
				value.forEach((v) => headers.append(key, v));
			} else {
				headers.set(key, value);
			}
		}
	}

	const request = {
		url: url.toString(),
		headers,
	} as Request;

	const codes = await resolveCodesFromRequest(request);
	const urlPageName = extractPageName(url.pathname);
	const authToken = getAuthToken(request);
	const isAuthenticated = !!authToken;

	// The gateway set this from the resolved hostname before the request reached
	// us, and it is the only trustworthy signal of which surface this is: SSR
	// talks to the gateway server to server, so the original host is not
	// recoverable downstream.
	// The surface comes from resolving the hostname, NOT from an inbound header.
	// An x-draft on the incoming request is caller-supplied and is ignored: the
	// gateway is the only thing allowed to decide this, and codes.urlType comes
	// from the same security-service lookup the gateway itself uses.
	const isDraft = codes.urlType === 'DRAFT';

	// The visitor's selected theme. A cookie rather than localStorage precisely so
	// that this server can see it: the pre-rendered HTML carries the theme in its
	// bootstrap, and getting it wrong here means the client throws that away and
	// refetches on every load.
	//
	// Cached per theme. Apps have one or two, so this multiplies the entry count by
	// one or two, and the alternative is serving every visitor the default.
	const cookieTheme = readThemeCookie(req.headers.cookie, codes.appCode);


	logger.info('SSR page request', {
		url: url.pathname,
		appCode: codes.appCode,
		clientCode: codes.clientCode,
		pageName: urlPageName,
		isAuthenticated,
	});

	// Get CDN config
	const config = getConfig();
	const cdn: CDNConfig = {
		hostName: config.cdn.hostName,
		stripAPIPrefix: config.cdn.stripAPIPrefix,
		replacePlus: config.cdn.replacePlus,
		resizeOptionsType: config.cdn.resizeOptionsType,
	};

	if (!cdn.hostName) {
		logger.error('CDN hostName not configured');
		res.writeHead(500, { 'Content-Type': 'text/html' });
		res.end(generateHtml(null, codes, urlPageName, cdn, 'CDN hostName not configured. Check ssr.cdn.hostName in config server.'));
		return;
	}

	const fetchOptions = {
		appCode: codes.appCode,
		clientCode: codes.clientCode,
		authToken,
		// Let the gateway resolve the surface from the host, as it does for a
		// direct browser request.
		forwardedHost: headers.get('x-forwarded-host') ?? url.host,
		forwardedProto: headers.get('x-forwarded-proto') ?? url.protocol.replace(':', ''),
		forwardedPort: headers.get('x-forwarded-port') ?? url.port,
	};

	// The application definition must be in hand before anything else, because it
	// carries the routing rules and routing decides which page this request
	// renders -- which is what every cache key below is built from.
	//
	// Before page routing there was only one such decision, index -> defaultPage,
	// and it was taken after the page had already been fetched. That is why the
	// cache used to be probed twice, once on the URL's name and again on the
	// resolved one. Deciding first collapses both into a single lookup.
	//
	// Cached for anonymous visitors only: the ui service varies the definition by
	// whether the caller is authenticated, so a signed-in copy must not be shared
	// -- and authenticated requests never reach the HTML cache anyway.
	const appCacheKey = generateAppCacheKey(codes.appCode, codes.clientCode, isDraft);
	let application: ApplicationDefinition | null;
	if (isAuthenticated) {
		application = await fetchApplication(fetchOptions);
	} else {
		application = await getCachedData<ApplicationDefinition>(appCacheKey);
		if (!application) {
			application = await fetchApplication(fetchOptions);
			if (application) await setCachedData(appCacheKey, application, config.cache.ttlSeconds);
		}
	}

	const route = resolveRoute(application, url, req.headers, urlPageName, isAuthenticated);
	const actualPageName = route.pageName;

	// A visitor drawn into a split for the first time. The cookie is set whether
	// the HTML that follows comes from cache or not: the body is identical for
	// everyone who resolves to this page, but the assignment is theirs alone.
	const drewAssignment = !!route.assignments;
	if (route.assignments) {
		res.setHeader(
			'Set-Cookie',
			assignmentSetCookie(
				route.assignments,
				config.routing.assignmentCookieMaxAgeSeconds,
				fetchOptions.forwardedProto === 'https',
			),
		);
	}

	if (actualPageName !== urlPageName) {
		logger.info('Page routing resolved', {
			requested: urlPageName,
			resolved: actualPageName,
			rule: route.resolution.ruleKey,
			variant: route.resolution.variantKey,
		});
	}

	const htmlCacheKey = generateCacheKey(
		codes.appCode,
		codes.clientCode,
		actualPageName,
		isDraft,
		cookieTheme,
	);

	// A page asked for as-is, for somebody looking at their own heatmap. It renders the page
	// NAMED rather than the arm routing would serve, and its HTML carries a marker telling the
	// beacon not to count the visit — so it must never be stored under the key a real visitor
	// reads from, or that marker would switch measurement off for everyone on that page.
	// Neither read nor written: reading a normal copy would serve the routed arm and defeat
	// the whole request.
	const isDesign = isDesignUrl(url);

	// Check HTML cache for non-authenticated requests (fastest path)
	if (!isAuthenticated && !isDesign) {
		// Check if client accepts gzip
		const acceptEncoding = req.headers['accept-encoding'] || '';
		const supportsGzip = acceptEncoding.includes('gzip');

		if (supportsGzip) {
			// Try to serve pre-compressed content (fastest TTFB!)
			const cachedGzipped = await getCachedGzippedHtml(htmlCacheKey);
			if (cachedGzipped) {
				logger.info('HTML cache hit (pre-compressed)', {
					cacheKey: htmlCacheKey,
					pageName: actualPageName,
					size: cachedGzipped.length
				});

				// Set headers for pre-compressed response
				res.setHeader('Content-Type', 'text/html; charset=utf-8');
				res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Cache-Control', cacheControlFor(drewAssignment));
				res.setHeader('Vary', 'Authorization, Cookie, Accept-Encoding');
				res.setHeader('X-Cache-Status', 'HIT-HTML-GZIP');

				res.writeHead(200);
				res.end(cachedGzipped);
				return;
			}
		}

		// Fallback: serve uncompressed HTML (let Nginx compress)
		const cachedHtml = await getCachedHtml(htmlCacheKey);
		if (cachedHtml) {
			logger.info('HTML cache hit', { cacheKey: htmlCacheKey, pageName: actualPageName });

			// Set headers for cached response
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.setHeader('Cache-Control', cacheControlFor(drewAssignment));
			res.setHeader('Vary', 'Authorization, Cookie');
			res.setHeader('X-Cache-Status', 'HIT-HTML');

			res.writeHead(200);
			res.end(cachedHtml);
			return;
		}

		// Fallback: legacy object cache
		const cached = await getCachedData<CachedPageData>(htmlCacheKey);
		if (cached) {
			logger.info('Cache hit', { cacheKey: htmlCacheKey, pageName: actualPageName });
			const etag = generateETag(cached);

			// Check If-None-Match for conditional request
			const ifNoneMatch = req.headers['if-none-match'];
			if (ifNoneMatch === etag) {
				res.writeHead(304);
				res.end();
				return;
			}

			setResponseHeaders(res, isAuthenticated, true, etag, cached.application, cdn.hostName, drewAssignment);
			res.writeHead(200);
			res.end(generateHtml(cached, codes, cached.pageName, cdn));
			return;
		}
	}

	// Fetch from backend. The application is handed in rather than refetched: it
	// is already loaded above, and it is what routing was decided from, so the
	// page and the rules that chose it come from the same definition.
	logger.info('Fetching page data from backend', { pageName: actualPageName });
	let data = await fetchAllPageData(actualPageName, fetchOptions, cookieTheme, application);
	let servedPageName = actualPageName;

	// A rule can name a page that has since been deleted, or was never published.
	// Falling back to the URL's own name keeps the live page working while the
	// definition is wrong, rather than taking it down with a 404 naming a page no
	// visitor ever asked for. Only worth trying when routing actually changed the
	// name, and only when the app itself came back.
	if (data.application && !data.page && actualPageName !== urlPageName) {
		logger.warn('Routed page missing, falling back to the requested page', {
			requested: urlPageName,
			resolved: actualPageName,
			rule: route.resolution.ruleKey,
		});
		const fallback = await fetchAllPageData(urlPageName, fetchOptions, cookieTheme, application);
		if (fallback.page) {
			data = fallback;
			servedPageName = fallback.resolvedPageName;
		}
	}

	// Handle not found
	if (!data.application || !data.page) {
		logger.warn('Page not found', { pageName: servedPageName, appCode: codes.appCode });
		setResponseHeaders(res, true, false, null, null, cdn.hostName);
		res.writeHead(404);
		res.end(generateHtml(null, codes, servedPageName, cdn, `Page "${servedPageName}" not found`));
		return;
	}

	// Build result
	const result: CachedPageData = {
		application: data.application,
		page: data.page,
		theme: data.theme as ThemeDefinition | null,
		themeName: data.themeName,
		codes,
		pageName: servedPageName,
		cachedAt: Date.now(),
	};

	// Generate HTML once
	const generatedHtml = generateHtml(result, codes, servedPageName, cdn);

	// Cache HTML for unauthenticated requests (primary cache).
	//
	// Keyed on the page actually served, which after a fallback is not the page
	// routing picked -- storing it under the missing name would serve the wrong
	// document the moment that name starts resolving again.
	const servedCacheKey =
		servedPageName === actualPageName
			? htmlCacheKey
			: generateCacheKey(codes.appCode, codes.clientCode, servedPageName, isDraft, cookieTheme);
	if (!isAuthenticated && !isDesign) {
		// Cache the rendered HTML (fast serving)
		await setCachedHtml(servedCacheKey, generatedHtml, config.cache.ttlSeconds);
		logger.info('Cached HTML', {
			cacheKey: servedCacheKey,
			pageName: servedPageName,
			htmlSize: generatedHtml.length,
			ttl: config.cache.ttlSeconds
		});

		// Also cache the object data (for cache warming and debugging)
		await setCachedData(servedCacheKey + ':data', result, config.cache.ttlSeconds);
	}

	// Analyze key frequencies (debug mode only - set ANALYZE_KEYS=true in env)
	if (process.env.ANALYZE_KEYS === 'true') {
		analyzeKeyFrequencies(data);
	}

	// Generate response
	const etag = generateETag(result);
	setResponseHeaders(res, isAuthenticated, false, etag, data.application, cdn.hostName, drewAssignment);

	logger.info('SSR page rendered', {
		pageName: servedPageName,
		appCode: codes.appCode,
		fromCache: false,
		htmlSize: generatedHtml.length,
		cdnHostName: cdn.hostName,
	});

	res.writeHead(200);
	res.end(generatedHtml);
}

/**
 * Analyze key frequencies in the data structure
 */
function analyzeKeyFrequencies(data: any): void {
	const keyFrequency = new Map<string, number>();

	function traverse(obj: any): void {
		if (!obj || typeof obj !== 'object') return;

		if (Array.isArray(obj)) {
			for (const item of obj) {
				traverse(item);
			}
			return;
		}

		for (const key of Object.keys(obj)) {
			keyFrequency.set(key, (keyFrequency.get(key) || 0) + 1);
			traverse(obj[key]);
		}
	}

	traverse({ application: data.application, page: data.page, theme: data.theme });

	// Sort by frequency
	const sorted = Array.from(keyFrequency.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 50); // Top 50 keys

	logger.info('Key frequency analysis (top 50)', {
		totalUniqueKeys: keyFrequency.size,
		topKeys: sorted.map(([key, count]) => `${key}: ${count}`).join(', ')
	});

	// Check user's hypothesis
	const highFreqKeys = ['statementName', 'name', 'namespace', 'position', 'parameterMap',
		'expression', 'type', 'value', 'key', 'order', 'top', 'left', 'steps', 'dependentStatements'];
	const mediumFreqKeys = ['createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'id',
		'version', 'clientCode', 'appCode', 'properties', 'eventFunctions', 'message'];

	logger.info('Hypothesis validation', {
		highFrequency: highFreqKeys.map(k => `${k}: ${keyFrequency.get(k) || 0}`).join(', '),
		mediumFrequency: mediumFreqKeys.map(k => `${k}: ${keyFrequency.get(k) || 0}`).join(', ')
	});
}
