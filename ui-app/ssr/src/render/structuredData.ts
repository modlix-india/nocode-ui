/**
 * JSON-LD for the document head (PLAT-1548).
 *
 * Two authored sources and two derived ones, emitted in this order:
 * - the app's `properties.structuredData` (Organization, WebSite, LocalBusiness), on every page;
 * - the page's `properties.seo.jsonLd` (and a `seo.paths` entry's own `jsonLd`);
 * - a BreadcrumbList from the path, and a WebPage carrying `dateModified` from the page's update
 *   time, each only when nothing authored already has that type.
 *
 * Each node goes out as its own `<script type="application/ld+json">`. A data block is never
 * executed, so the app's CSP needs nothing for it (and the header stays under nginx's 4k buffer).
 */

type Node = Record<string, unknown>;

const SCHEMA_CONTEXT = 'https://schema.org';

/** Every JSON-LD block on one page together. Past this, later nodes are dropped, not truncated. */
const MAX_JSON_LD_BYTES = 64 * 1024;

/**
 * schema.org's WebPage and its subtypes. A page that says it is an FAQPage has said it is a
 * WebPage, so a derived WebPage beside it would describe the same page twice.
 */
const WEB_PAGE_TYPES = new Set([
	'WebPage',
	'AboutPage',
	'CheckoutPage',
	'CollectionPage',
	'ContactPage',
	'FAQPage',
	'ItemPage',
	'MedicalWebPage',
	'ProfilePage',
	'QAPage',
	'RealEstateListing',
	'SearchResultsPage',
	'MediaGallery',
	'ImageGallery',
	'VideoGallery',
]);

function isPlainObject(v: unknown): v is Node {
	return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isLdNode(v: unknown): v is Node {
	return isPlainObject(v) && ('@type' in v || '@graph' in v);
}

/**
 * The authored value, whatever it is wrapped in. Page properties are ComponentProperties
 * (`{ value }`), the app's are raw, and a JSON-LD editor may well store the text it was given.
 */
function unwrap(input: unknown): unknown {
	let v = input;
	if (isPlainObject(v) && 'value' in v && !('@type' in v) && !('@graph' in v)) v = v.value;
	if (typeof v === 'string') {
		const text = v.trim();
		if (!text) return undefined;
		try {
			return JSON.parse(text);
		} catch {
			// Not JSON at all: nothing a crawler could read, so nothing is emitted.
			return undefined;
		}
	}
	return v;
}

/**
 * The nodes an authored value holds: one object, an array of them, or a keyed map of them
 * (the shape the settings panes store collections in). Anything else is dropped.
 */
export function jsonLdNodes(input: unknown): Node[] {
	const v = unwrap(input);
	if (Array.isArray(v)) return v.filter(isLdNode).map(withContext);
	if (isLdNode(v)) return [withContext(v)];
	if (isPlainObject(v)) return Object.values(v).filter(isLdNode).map(withContext);
	return [];
}

function withContext(node: Node): Node {
	return '@context' in node ? node : { '@context': SCHEMA_CONTEXT, ...node };
}

/** Every `@type` the nodes declare, `@graph` members included. */
export function typesOf(nodes: Node[]): Set<string> {
	const types = new Set<string>();
	const visit = (n: unknown) => {
		if (!isPlainObject(n)) return;
		const t = n['@type'];
		for (const one of Array.isArray(t) ? t : [t]) if (typeof one === 'string') types.add(one);
		if (Array.isArray(n['@graph'])) n['@graph'].forEach(visit);
	};
	nodes.forEach(visit);
	return types;
}

/**
 * A stored update time as an ISO 8601 instant. The Rust ui service sends epoch seconds, Java
 * sent an ISO string or epoch milliseconds; anything else is no date at all.
 */
export function isoInstant(value: unknown): string | undefined {
	if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
		const ms = value < 1e12 ? value * 1000 : value;
		return new Date(ms).toISOString();
	}
	if (typeof value === 'string' && value.trim()) {
		const d = new Date(value.trim());
		return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
	}
	return undefined;
}

export interface Crumb {
	name: string;
	url: string;
}

export interface DerivedInput {
	/** Already-authored nodes, which suppress a derived node of the same type. */
	authored: Node[];
	/** Home first, the page itself last. Absolute URLs only: schema.org requires them. */
	crumbs: Crumb[];
	url?: string;
	name?: string;
	description?: string;
	dateModified?: string;
}

/** BreadcrumbList and WebPage, each only when nothing authored already says it. */
export function derivedNodes(input: DerivedInput): Node[] {
	const types = typesOf(input.authored);
	const out: Node[] = [];

	// One crumb is only the home page, which has no trail to show.
	if (!types.has('BreadcrumbList') && input.crumbs.length > 1) {
		out.push({
			'@context': SCHEMA_CONTEXT,
			'@type': 'BreadcrumbList',
			itemListElement: input.crumbs.map((c, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: c.name,
				item: c.url,
			})),
		});
	}

	// Only worth a node when it says when the page last changed: that is the freshness signal
	// answer engines read, and a WebPage with nothing but a name repeats the <title>.
	if (input.dateModified && ![...types].some(t => WEB_PAGE_TYPES.has(t))) {
		out.push({
			'@context': SCHEMA_CONTEXT,
			'@type': 'WebPage',
			...(input.url ? { url: input.url } : {}),
			...(input.name ? { name: input.name } : {}),
			...(input.description ? { description: input.description } : {}),
			dateModified: input.dateModified,
		});
	}

	return out;
}

/**
 * JSON for inside a `<script>`. `</script>` or `<!--` in a string would end or bend the element,
 * and U+2028/2029 broke older parsers, so each is written as a JSON escape. The JSON means the same.
 */
export function scriptSafeJson(value: unknown): string {
	return JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

/** One script element per node, in order, until the size cap. */
export function jsonLdScripts(nodes: Node[]): string {
	const tags: string[] = [];
	let total = 0;
	for (const node of nodes) {
		let json: string;
		try {
			json = scriptSafeJson(node);
		} catch {
			continue; // a cycle or a BigInt: not JSON, so not JSON-LD
		}
		total += json.length;
		if (total > MAX_JSON_LD_BYTES) break;
		tags.push(`<script type="application/ld+json">${json}</script>`);
	}
	return tags.join('\n\t\t');
}
