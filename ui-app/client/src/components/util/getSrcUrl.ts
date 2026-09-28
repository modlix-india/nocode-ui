const STATIC_FILE_API_PREFIX = 'api/files/static/file';
const STATIC_FILE_API_PREFIX_LENGTH = STATIC_FILE_API_PREFIX.length;

/**
 * The formats the CDN's image transformer may re-encode and rescale.
 *
 * Deliberately not svg: the transformer rasterises one, losing the single
 * property it was chosen for. Everything else that reaches here must pass
 * through untouched, and a lot does -- Video posters and sources, Audio
 * sources, glTF models and HDR environment maps all call getSrcUrl, and only
 * the raster stills among them are safe to rewrite.
 */
const RESIZABLE = /\.(?:png|jpe?g|webp|avif)$/i;

/**
 * The candidate widths offered to the browser, in CSS px.
 *
 * Short on purpose. Each distinct width is a separately billed transformation
 * at the CDN, so the ladder is a cost as well as a menu; five steps covers a
 * phone through a 2x desktop without paying for resolutions nothing picks.
 *
 * Nothing here can upscale: the transformer's default fit is scale-down, so a
 * 400px source asked for at 1920 returns the 400px original. That is what
 * makes a fixed ladder safe to apply to images whose dimensions we never see.
 */
const SRCSET_WIDTHS = [320, 640, 960, 1280, 1920];

export interface SrcUrlOptions {
	/**
	 * false leaves the URL addressing the original file.
	 *
	 * For a value that outlives the page: something stored back into a binding,
	 * put in a PWA manifest or sent to an API has no business naming a resized
	 * derivative of the thing it means.
	 */
	transform?: boolean;
	/** Rendered width in CSS px, when the caller knows it. */
	width?: number;
}

function splitQuery(url: string): [string, string] {
	const q = url.indexOf('?');
	return q === -1 ? [url, ''] : [url.substring(0, q), url.substring(q + 1)];
}

/**
 * The stored value as a trimmed string.
 *
 * Padding around a stored path is common and used to be harmless, because the
 * only thing done with it was a prefix swap. It stopped being harmless once
 * spaces became %20: a trailing one encodes into the URL, which both breaks the
 * request and pushes the extension away from the end of the string, so the
 * `RESIZABLE` test fails and the file quietly stops being transformed at all.
 *
 * Trimming has to happen before `indexOf`, not after. The prefix offset is taken
 * from this string and used to slice it, so trimming in between shifts the path
 * out from under an offset already measured against the untrimmed form.
 */
function normalize(urlAny: any): string {
	return (typeof urlAny !== 'string' ? '' + urlAny : urlAny).trim();
}

/**
 * The `/cdn-cgi/image/<options>/<path>` form the transformer answers on.
 *
 * Options are comma separated, and the leading `?` of the authored query is
 * NOT part of them. Keeping it produced `/cdn-cgi/image/?width=450,format=auto`,
 * which is not a parse error at the CDN: the option list is simply discarded
 * and the original file returned with a 200, so every author who asked for a
 * resize silently got none and nothing anywhere reported a failure.
 */
function transformed(path: string, authored: string, width?: number): string {
	if (globalThis.cdnResizeOptionsType !== 'cloudflare' || !RESIZABLE.test(path))
		return authored ? `${path}?${authored}` : path;

	const options = authored ? authored.split('&').filter(Boolean) : [];
	const named = new Set(options.map(o => o.split('=')[0]));

	// format=auto is what turns the visitor's own Accept header into AVIF or
	// WebP. It is the half of this that needs no knowledge of the layout, but
	// only the half: the transformer keeps the source's pixel dimensions, so a
	// 4569px logo re-encodes to a smaller 4569px logo. Width is the other half.
	if (!named.has('format') && !named.has('f')) options.push('format=auto');
	if (width && !named.has('width') && !named.has('w')) options.unshift(`width=${width}`);

	return `/cdn-cgi/image/${options.join(',')}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function getSrcUrl(urlAny: any, options?: SrcUrlOptions) {
	if (globalThis.isDebugMode || !globalThis.cdnPrefix || !urlAny) return urlAny;
	let url = normalize(urlAny);

	const index = url.indexOf(STATIC_FILE_API_PREFIX);

	if (index == -1) return url;

	if (globalThis.cdnStripAPIPrefix) {
		url = url.substring(index + STATIC_FILE_API_PREFIX_LENGTH);
	}

	// In some CDNs, the '+' character is not recognized as a space.
	if (globalThis.cdnReplacePlus) {
		url = url.replaceAll('+', '%20');
	}

	// A literal space is legal in a stored path -- `FIN/Raja IRA/Yoga 1.jpg` is a
	// real one -- and it survives in `src`, because the browser encodes it on the
	// way out. A srcset candidate is `<url> <descriptor>`, so there the same space
	// ends the URL early, the whole candidate list fails to parse, and the browser
	// silently falls back to src. Nothing looks broken and the ladder simply never
	// applies, which is exactly how this got shipped.
	url = url.replaceAll(' ', '%20');

	if (options?.transform !== false) {
		const [path, query] = splitQuery(url);
		url = transformed(path, query, options?.width);
	}

	return 'https://' + globalThis.cdnPrefix + url;
}

/**
 * A `srcset` for this file, or undefined when there is nothing useful to say.
 *
 * The component cannot know its own rendered box at the point it builds a URL,
 * and it does not have to: handing the browser a ladder of widths lets it pick
 * against the box AND the device pixel ratio, which is the pair that decides
 * how much of a download is wasted. This is what closes the gap on an image
 * served at 4569px into a 450px slot without asking an author to notice.
 *
 * Undefined rather than a single candidate when the author pinned their own
 * width, because every entry would then be the same URL.
 */
export function getSrcSet(urlAny: any, widths: number[] = SRCSET_WIDTHS): string | undefined {
	if (globalThis.isDebugMode || !globalThis.cdnPrefix || !urlAny) return undefined;
	if (globalThis.cdnResizeOptionsType !== 'cloudflare') return undefined;

	const url = normalize(urlAny);
	if (!url.includes(STATIC_FILE_API_PREFIX)) return undefined;

	const [path, query] = splitQuery(url);
	if (!RESIZABLE.test(path)) return undefined;

	const named = new Set(query ? query.split('&').map(o => o.split('=')[0]) : []);
	if (named.has('width') || named.has('w')) return undefined;

	return widths.map(w => `${getSrcUrl(urlAny, { width: w })} ${w}w`).join(', ');
}

/**
 * `url(...)`, taking the whole of what is between the parens.
 *
 * Quotes are picked off afterwards rather than in the pattern: an optional
 * quote group next to a class that can itself match a quote gives the engine
 * two ways to read the same text, and that ambiguity is what makes a regex
 * backtrack super-linearly over a long stylesheet.
 */
const CSS_URL = /url\(([^()]*)\)/g;
const CSS_QUOTED = /^(['"])([\s\S]*)\1$/;

/**
 * Point every `url(...)` in a block of CSS at the CDN.
 *
 * Replaces a hand-rolled split/splice over the same text that had three faults,
 * each of which this makes structurally impossible rather than merely fixed:
 *
 *   - it appended the CDN host WITH a trailing slash to a path that already
 *     began with one, and `https://<cdn>//FIN/x.jpg` is a 404, not a tolerated
 *     spelling. Every page-class background was broken;
 *   - it resumed two characters past the closing `)`, eating whatever followed.
 *     For the usual `url(...); color: red` that is the semicolon, so the next
 *     declaration was swallowed into the value and lost;
 *   - it stepped through the split parts two at a time, which is right only
 *     for the first URL. A second one emitted its path with no host at all,
 *     leaving a protocol-relative `//FIN/b.png` pointing at a host named FIN.
 *
 * Going through getSrcUrl is also what earns these the format and width
 * handling above, which is the whole reason a background image can now weigh
 * what the layout actually needs.
 */
export function rewriteCssUrls(css: string): string {
	if (!globalThis.cdnPrefix || !css) return css;

	return css.replace(CSS_URL, (whole, inner: string) => {
		const trimmed = inner.trim();
		const quoted = CSS_QUOTED.exec(trimmed);
		const quote = quoted ? quoted[1] : '';
		const src = (quoted ? quoted[2] : trimmed).trim();

		// Anything not served by the files API -- a data: URI, an absolute URL,
		// a font next to the stylesheet -- is left exactly as written.
		if (!src.includes(STATIC_FILE_API_PREFIX)) return whole;
		return `url(${quote}${getSrcUrl(src)}${quote})`;
	});
}

/**
 * The `sizes` to pair with that ladder, read off the width the component has
 * actually been styled with.
 *
 * Only an absolute width answers the question. A percentage is relative to a
 * parent this has no handle on, and undefined means nothing was said at all;
 * in both cases the browser's own default of 100vw applies, which over-fetches
 * on a small image in a wide viewport but still never picks anything larger
 * than the original the same image ships today.
 */
export function getSizesFromStyle(style: any): string | undefined {
	const width = style?.width;
	if (typeof width === 'number') return `${width}px`;
	if (typeof width !== 'string') return undefined;

	const trimmed = width.trim();
	return /^\d+(?:\.\d+)?(?:px|vw|em|rem)$/i.test(trimmed) ? trimmed : undefined;
}
