/**
 * Font packs: the `<link>` tags an application's definition asks for.
 *
 * Split out of App.tsx so it can be tested. Importing App.tsx under Jest drags
 * in the whole component tree, whose module graph is circular there -- the same
 * constraint Tree's style artifact test records.
 *
 * Two things happen here that did not before, both measured on dev:
 *
 *  - Packs are marked as added. The guard used to read `addedKeySet` without
 *    ever writing to it, and this runs twice during boot, so every pack landed
 *    in the head twice: 54 stylesheet links, 21 distinct, 33 duplicate
 *    requests, one family fetched four times.
 *  - Google Fonts families are merged into ONE request. Each `<link>` is
 *    render-blocking and costs its own DNS, TLS and round trip; this app was
 *    making 34 of them before anything could paint.
 */

/** Packs already applied, so a second boot pass does not re-add them. */
const addedPacks = new Set<string>();

/** Google Fonts stylesheet hrefs already put in the head, so we never ask twice. */
const googleFontFamilies = new Set<string>();
let googleFontLink: HTMLLinkElement | undefined;

/**
 * Every Google Fonts family the app wants, as ONE stylesheet.
 *
 * The css2 endpoint takes repeated `family=` parameters, so a page that wants
 * seventeen families can ask for them in a single request instead of seventeen.
 * Each separate `<link>` is render-blocking and costs its own DNS, TLS and round
 * trip before anything paints; measured on dev, this app was making 34 of them.
 *
 * `display=swap` is forced on: without it a slow font hides the text it applies
 * to rather than showing a fallback, which is the worst possible failure for a
 * marketing page.
 */
function setGoogleFontFamilies(): void {
	if (!googleFontFamilies.size) return;

	const href =
		'https://fonts.googleapis.com/css2?' +
		Array.from(googleFontFamilies)
			.sort()
			.map(f => `family=${f}`)
			.join('&') +
		'&display=swap';

	if (!googleFontLink) {
		googleFontLink = document.createElement('link');
		googleFontLink.rel = 'stylesheet';
		document.head.appendChild(googleFontLink);
	}
	// Reassigned rather than added to: a later pack adds families to the same
	// single request instead of opening a second one.
	if (googleFontLink.href !== href) googleFontLink.href = href;
}

/**
 * Tell the browser to open the font connections before it knows it needs them.
 *
 * gstatic serves the font FILES and is a different origin from the stylesheet,
 * so it is only discovered after the CSS parses -- a whole round trip later.
 * `crossorigin` is required on that one and the hint is silently ignored
 * without it, because fonts are fetched in CORS mode.
 */
function preconnectFontHosts(): void {
	for (const [host, cors] of [
		['https://fonts.googleapis.com', false],
		['https://fonts.gstatic.com', true],
	] as Array<[string, boolean]>) {
		if (document.head.querySelector(`link[rel="preconnect"][href="${host}"]`)) continue;
		const l = document.createElement('link');
		l.rel = 'preconnect';
		l.href = host;
		if (cors) l.crossOrigin = 'anonymous';
		document.head.insertBefore(l, document.head.firstChild);
	}
}

export function processFontPacks(fontPacks: any) {
	if (!fontPacks) return;

	let sawGoogleFont = false;

	Object.entries(fontPacks)
		.sort((a: any[], b: any[]) => (a[1]?.order ?? 0) - (b[1]?.order ?? 0))
		.forEach(([key, fontPack]: [string, any]) => {
			const setKey = `FONT_${key}`;
			// This guard used to read the set without ever writing to it, and
			// this function is called twice during boot, so every pack landed in
			// the head twice. Measured on dev: 54 stylesheet links, 21 distinct,
			// 33 of them duplicate requests -- one family asked for four times.
			if (addedPacks.has(setKey)) return;
			addedPacks.add(setKey);

			const div = document.createElement('div');
			div.innerHTML = (fontPack.code ?? '').trim();

			Array.from(div.children).forEach(cp => {
				const families = googleFontFamiliesOf(cp);
				if (families.length) {
					// Folded into the one combined request below rather than
					// appended as its own render-blocking link.
					for (const f of families) googleFontFamilies.add(f);
					sawGoogleFont = true;
					return;
				}
				document.head.appendChild(cp);
			});
		});

	if (sawGoogleFont) {
		preconnectFontHosts();
		setGoogleFontFamilies();
	}
}

/**
 * The `family=...` value of a Google Fonts stylesheet link, or undefined for
 * anything else.
 *
 * Anything that is not a plain Google Fonts css2 stylesheet is left alone: the
 * icon packs point at jsdelivr and cdnjs, and a pack is free to carry a
 * `@font-face` block of its own. Only the requests that CAN be merged are.
 */
function googleFontFamiliesOf(node: Element): string[] {
	if (node.tagName !== 'LINK') return [];
	const link = node as HTMLLinkElement;
	if ((link.getAttribute('rel') ?? '').toLowerCase() !== 'stylesheet') return [];

	const href = link.getAttribute('href') ?? '';
	if (!href.includes('fonts.googleapis.com/css2')) return [];

	try {
		// A link may already carry several families; those are folded in
		// individually rather than treated as one opaque value.
		return new URL(href, window.location.href).searchParams.getAll('family');
	} catch {
		/* an href we cannot parse is one we should not rewrite */
		return [];
	}
}

/** Testing seam: drop all state between cases. */
export function resetFontPacksForTests(): void {
	addedPacks.clear();
	googleFontFamilies.clear();
	googleFontLink = undefined;
}
