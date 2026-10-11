/**
 * Hints for what the page's first render will ask for, so the browser can start on it while the
 * scripts download instead of discovering it one round trip at a time after they run.
 *
 * Measured on rajaplatino.com before this: five rounds of requests before the page could draw.
 * The document named 10 scripts; `index` then fetched the other 16 the first render needs; the
 * app then added App.css, the font and icon stylesheets and the first style JSON; a lazy chunk,
 * Gallery.css and two more style JSON files came after that.
 *
 * What is NOT here, measured (Lighthouse mobile, five variants of that page): preloading every
 * script at High priority, or the font and App.css stylesheets, put 0.5-2.5 s on first paint.
 * On a slow link bytes are the limit, so anything fetched early at high priority competes with
 * what the paint needs; the rest of the scripts are named at Low priority instead
 * (`startupScriptPreloads`). Every URL is built exactly as the client builds it, because a
 * preload only helps when the later request is for the same URL.
 */

/** Style properties kept in `/styleProperties/<Name>.json`; keep in step with the client's
 * `src/ssr/stylePropertyComponents.ts` (EXTERNAL_STYLE_PROPERTY_COMPONENTS). */
const EXTERNAL_STYLE_PROPERTY_COMPONENTS = new Set([
	'Audio',
	'Button',
	'Calendar',
	'ColorPicker',
	'Dropdown',
	'FileUpload',
	'Menu',
	'Otp',
	'PhoneNumber',
	'Stepper',
	'Table',
	'TableColumn',
	'TableColumnHeader',
	'TableColumns',
	'TableEmptyGrid',
	'TableGrid',
	'TablePreviewGrid',
	'TableRow',
	'TextArea',
	'TextBox',
	'Tree',
	'Video',
]);

/** Hosts the client's named icon packs load from (App.tsx ICON_PACKS), opened early. */
const ICON_PACK_HOSTS: Array<[RegExp, string[]]> = [
	[/FONT_AWESOME/, ['https://cdnjs.cloudflare.com']],
	[/^MATERIAL_/, ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net']],
];

/**
 * Browsers keep separate connections for CORS and no-CORS requests. Only gstatic serves nothing but
 * font files (CORS); the other hosts' first request is a stylesheet (no-CORS), so their preconnect
 * carries no `crossorigin`.
 */
const CORS_HOSTS = new Set(['https://fonts.gstatic.com']);

function escapeAttr(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Each script once, in order, as a file name. */
export function startupScripts(entrypoints: string[], chunks: string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const s of [...entrypoints, ...chunks]) {
		const file = s.startsWith('http') ? (s.split('/').pop() ?? s) : s;
		if (seen.has(file)) continue;
		seen.add(file);
		out.push(file);
	}
	return out;
}

/**
 * Preload tags for the scripts the first render needs. The entry and the two chunks index.tsx
 * imports (`Application`, `ApplicationStyle`) at the default (High) priority, as before; the rest
 * of those imports' chunk groups (asset-manifest `preload`) at Low, which is the priority webpack's
 * runtime gives them anyway, only found from here instead of after index has run.
 */
export function startupScriptPreloads(cdnUrl: string, entrypoints: string[], chunks: string[]): string {
	const scripts = startupScripts(entrypoints, chunks);
	const high = new Set(startupScripts(entrypoints, chunks.filter(c => /(^|\/)Application(Style)?-/.test(c))));
	return scripts
		.map(
			f =>
				`<link rel="preload" href="${escapeAttr(cdnUrl + f)}" as="script"${high.has(f) ? '' : ' fetchpriority="low"'}>`,
		)
		.join('\n\t\t');
}

/** The external style-property components a page definition uses, sorted (the client's rule). */
export function stylePropertyComponentsFor(page: any): string[] {
	const types = new Set<string>();
	for (const c of Object.values(page?.componentDefinition ?? {}) as any[])
		if (EXTERNAL_STYLE_PROPERTY_COMPONENTS.has(c?.type)) types.add(c.type);
	return [...types].sort();
}

interface LinkTag {
	rel: string;
	href: string;
}

function linkTagsOf(code: unknown): LinkTag[] {
	if (typeof code !== 'string') return [];
	const out: LinkTag[] = [];
	for (const tag of code.match(/<link\b[^>]*>/gi) ?? []) {
		const attr = (name: string) => new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
		const href = attr('href');
		const rel = attr('rel');
		if (!href) continue;
		out.push({ rel: (rel?.[1] ?? rel?.[2] ?? '').toLowerCase(), href: href[1] ?? href[2] });
	}
	return out;
}

/** Whether any font pack loads a Google Fonts stylesheet (App/fontPacks.ts merges them into one). */
export function usesGoogleFonts(fontPacks: any): boolean {
	return Object.values(fontPacks ?? {}).some((pack: any) =>
		linkTagsOf(pack?.code).some(l => l.rel === 'stylesheet' && l.href.includes('fonts.googleapis.com/css2')),
	);
}

/**
 * Preconnects for the font and icon hosts, and preloads for the page's style JSON. `assetBase` is
 * where the client's `lazyStylePropURL` points (the CDN's `https://<host>/js/dist`, or '' for a
 * same-origin bundle).
 */
export function startupHintTags(opts: {
	assetBase: string;
	buildVersion?: string;
	page: any;
	application: any;
}): string {
	const { assetBase, buildVersion, page, application } = opts;
	const version = buildVersion ? `?v=${buildVersion}` : '';
	const tags: string[] = [];

	// A connection costs round trips but no bandwidth, so opening these early takes nothing from
	// the paint.
	const preconnect = new Set<string>();
	const props = application?.properties ?? {};
	if (usesGoogleFonts(props.fontPacks)) {
		preconnect.add('https://fonts.googleapis.com');
		preconnect.add('https://fonts.gstatic.com');
	}
	for (const pack of Object.values(props.iconPacks ?? {}) as any[]) {
		const links = linkTagsOf(pack?.code);
		if (links.length) {
			for (const l of links)
				try {
					preconnect.add(new URL(l.href).origin);
				} catch {
					/* not an absolute URL: nothing to open */
				}
		} else
			for (const [pattern, hosts] of ICON_PACK_HOSTS)
				if (pattern.test(String(pack?.name ?? ''))) hosts.forEach(h => preconnect.add(h));
	}
	for (const host of preconnect)
		tags.push(`<link rel="preconnect" href="${escapeAttr(host)}"${CORS_HOSTS.has(host) ? ' crossorigin' : ''}>`);

	// The page's style JSON (lazyStylePropURL): a few KB each, needed before the components that
	// use them can draw. Fetched with axios: CORS mode, no credentials.
	for (const name of stylePropertyComponentsFor(page))
		tags.push(
			`<link rel="preload" href="${escapeAttr(`${assetBase}/styleProperties/${name}.json${version}`)}" as="fetch" crossorigin="anonymous">`,
		);

	return tags.join('\n\t\t');
}
