import getSrcUrl, { getSizesFromStyle, getSrcSet, rewriteCssUrls } from '../getSrcUrl';

const g = globalThis as any;

const PNG = '/api/files/static/file/FIN/CoevolveMisty/secondary-logo.png';
const CDN = 'https://cdn.modlix.com';

beforeEach(() => {
	g.cdnPrefix = 'cdn.modlix.com';
	g.cdnStripAPIPrefix = true;
	g.cdnReplacePlus = true;
	g.cdnResizeOptionsType = 'cloudflare';
	g.isDebugMode = false;
});

afterEach(() => {
	delete g.cdnPrefix;
	delete g.cdnStripAPIPrefix;
	delete g.cdnReplacePlus;
	delete g.cdnResizeOptionsType;
	delete g.isDebugMode;
});

describe('getSrcUrl option list', () => {
	// The regression. `/cdn-cgi/image/?width=450,...` is not rejected by the CDN:
	// the option list is discarded and the ORIGINAL file comes back with a 200,
	// so an author who asked for 450px silently kept shipping 4569px.
	it('does not leave the authored query mark in the option list', () => {
		const url = getSrcUrl(`${PNG}?width=450&format=auto`);

		expect(url).toBe(`${CDN}/cdn-cgi/image/width=450,format=auto/FIN/CoevolveMisty/secondary-logo.png`);
		expect(url).not.toContain('/cdn-cgi/image/?');
	});

	it('asks for format=auto on a raster file the author said nothing about', () => {
		expect(getSrcUrl(PNG)).toBe(
			`${CDN}/cdn-cgi/image/format=auto/FIN/CoevolveMisty/secondary-logo.png`,
		);
	});

	it('adds format=auto alongside an authored width', () => {
		expect(getSrcUrl(`${PNG}?width=450`)).toBe(
			`${CDN}/cdn-cgi/image/width=450,format=auto/FIN/CoevolveMisty/secondary-logo.png`,
		);
	});

	it('leaves an authored format alone rather than asking for two', () => {
		const url = getSrcUrl(`${PNG}?format=webp`);
		expect(url).toContain('/cdn-cgi/image/format=webp/');
		expect(url).not.toContain('format=auto');
	});

	it('takes a width from the caller when the author gave none', () => {
		expect(getSrcUrl(PNG, { width: 640 })).toBe(
			`${CDN}/cdn-cgi/image/width=640,format=auto/FIN/CoevolveMisty/secondary-logo.png`,
		);
	});

	it("does not override the author's own width with the caller's", () => {
		expect(getSrcUrl(`${PNG}?width=450`, { width: 1920 })).toContain('width=450,format=auto');
	});
});

describe('getSrcUrl leaves alone what it must', () => {
	// Everything below reaches getSrcUrl from a real caller: Video posters and
	// sources, Audio, the glTF loader, the Svg component.
	it.each([
		['svg', '/api/files/static/file/FIN/x/li1.svg'],
		['mp4', '/api/files/static/file/FIN/x/clip.mp4'],
		['gltf', '/api/files/static/file/FIN/x/model.gltf'],
		['hdr', '/api/files/static/file/FIN/x/env.hdr'],
	])('does not route a %s through the transformer', (_label, path) => {
		const url = getSrcUrl(path);
		expect(url).not.toContain('/cdn-cgi/image/');
		expect(url).toBe(CDN + path.replace('/api/files/static/file', ''));
	});

	it('leaves the original addressable when the caller opts out', () => {
		expect(getSrcUrl(PNG, { transform: false })).toBe(
			`${CDN}/FIN/CoevolveMisty/secondary-logo.png`,
		);
	});

	it('preserves an authored query when the caller opts out', () => {
		expect(getSrcUrl(`${PNG}?width=450`, { transform: false })).toBe(
			`${CDN}/FIN/CoevolveMisty/secondary-logo.png?width=450`,
		);
	});

	// Every one of these reaches getSrcUrl from a real caller: an Image with no
	// src set, a Video with no poster, a Table with no pager arrow configured.
	it.each([[undefined], [null], ['']])('hands %p straight back', value => {
		expect(getSrcUrl(value)).toBe(value);
		expect(getSrcSet(value)).toBeUndefined();
	});

	it('does nothing to a URL that is not a static file', () => {
		expect(getSrcUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
	});

	it('does nothing with no CDN configured, which is the local case', () => {
		delete g.cdnPrefix;
		expect(getSrcUrl(PNG)).toBe(PNG);
	});

	it('does not transform when the CDN is not the one with a transformer', () => {
		g.cdnResizeOptionsType = 'something-else';
		expect(getSrcUrl(PNG)).toBe(`${CDN}/FIN/CoevolveMisty/secondary-logo.png`);
	});

	// Padding round a stored value was harmless while this only swapped a prefix.
	// Once spaces became %20 a trailing one encoded into the URL, which breaks the
	// request AND moves the extension off the end of the string, so RESIZABLE
	// stops matching and the file silently stops being transformed at all.
	it.each([
		['trailing', `${PNG} `],
		['leading', ` ${PNG}`],
		['both', `  ${PNG}  `],
		['a newline', `\n${PNG}\n`],
	])('ignores %s whitespace around the stored value', (_label, padded) => {
		expect(getSrcUrl(padded)).toBe(
			`${CDN}/cdn-cgi/image/format=auto/FIN/CoevolveMisty/secondary-logo.png`,
		);
	});

	it('encodes a literal space in a stored path', () => {
		expect(getSrcUrl('/api/files/static/file/FIN/Raja IRA/Yoga 1.jpg')).toBe(
			`${CDN}/cdn-cgi/image/format=auto/FIN/Raja%20IRA/Yoga%201.jpg`,
		);
	});

	it('still replaces + before building the option list', () => {
		expect(getSrcUrl('/api/files/static/file/FIN/x/main+shot.jpg')).toBe(
			`${CDN}/cdn-cgi/image/format=auto/FIN/x/main%20shot.jpg`,
		);
	});
});

describe('getSrcSet', () => {
	it('offers a width ladder the browser can pick against', () => {
		const set = getSrcSet(PNG)!;
		const entries = set.split(', ');

		expect(entries).toHaveLength(5);
		expect(entries[0]).toBe(
			`${CDN}/cdn-cgi/image/width=320,format=auto/FIN/CoevolveMisty/secondary-logo.png 320w`,
		);
		expect(entries[4]).toContain('width=1920,format=auto');
		expect(entries[4].endsWith(' 1920w')).toBe(true);
	});

	// Found in production on rajaira.com: `FIN/Raja IRA/...` produced candidates
	// like `.../FIN/Raja IRA/Yoga%201.jpg 320w`. A srcset entry is split on
	// whitespace, so the raw space ended the URL, the list failed to parse, and
	// every one of the 21 affected images quietly fell back to src.
	it('emits no raw whitespace inside a candidate URL', () => {
		const set = getSrcSet('/api/files/static/file/FIN/Raja IRA/Yoga 1.jpg')!;

		for (const candidate of set.split(', ')) {
			const [url, descriptor, ...extra] = candidate.split(' ');
			expect(extra).toHaveLength(0);
			expect(url).not.toContain(' ');
			expect(descriptor).toMatch(/^\d+w$/);
		}
	});

	it.each([
		['trailing', `${PNG} `],
		['leading', ` ${PNG}`],
	])('still emits a ladder with %s whitespace on the stored value', (_label, padded) => {
		const set = getSrcSet(padded);

		expect(set).toBeDefined();
		expect(set!.split(', ')).toHaveLength(5);
		expect(set).not.toContain('%20 ');
	});

	it('takes an explicit ladder', () => {
		expect(getSrcSet(PNG, [100, 200])!.split(', ')).toHaveLength(2);
	});

	// Every candidate would be the same URL, and a srcset of identical entries
	// tells the browser nothing while still looking like a choice.
	it('says nothing when the author already pinned a width', () => {
		expect(getSrcSet(`${PNG}?width=450`)).toBeUndefined();
	});

	it.each([
		['a non-raster file', '/api/files/static/file/FIN/x/li1.svg'],
		['a URL that is not a static file', 'https://example.com/a.png'],
	])('says nothing for %s', (_label, path) => {
		expect(getSrcSet(path)).toBeUndefined();
	});

	it('says nothing without a transforming CDN', () => {
		g.cdnResizeOptionsType = 'something-else';
		expect(getSrcSet(PNG)).toBeUndefined();
	});

	it('says nothing in debug mode, where the original is the point', () => {
		g.isDebugMode = true;
		expect(getSrcSet(PNG)).toBeUndefined();
	});
});

describe('rewriteCssUrls', () => {
	const F = '/api/files/static/file/FIN';

	// The split/splice this replaced resumed two characters past the `)`, so the
	// semicolon went with it and `color` was swallowed into the background-image
	// value. A browser drops the whole declaration, taking BOTH properties.
	it('keeps the declaration that follows a url()', () => {
		const out = rewriteCssUrls(`.hero { background-image: url('${F}/hero.jpg'); color: red; }`);

		expect(out).toContain("'); color: red;");
		expect(out).toBe(
			`.hero { background-image: url('${CDN}/cdn-cgi/image/format=auto/FIN/hero.jpg'); color: red; }`,
		);
	});

	// It stepped through the split parts two at a time, which is correct only for
	// the first url(). The second kept a bare `/FIN/b.png`, which resolves against
	// the SITE origin and 404s there.
	it('rewrites every url(), not only the first', () => {
		const out = rewriteCssUrls(
			`.a { background: url('${F}/a.png'); } .b { background: url('${F}/b.png'); }`,
		);

		expect(out).not.toMatch(/url\('\/FIN/);
		expect(out.match(new RegExp(CDN, 'g'))).toHaveLength(2);
	});

	it.each([
		['single quotes', `url('${F}/a.png')`, `url('${CDN}/cdn-cgi/image/format=auto/FIN/a.png')`],
		['double quotes', `url("${F}/a.png")`, `url("${CDN}/cdn-cgi/image/format=auto/FIN/a.png")`],
		['no quotes', `url(${F}/a.png)`, `url(${CDN}/cdn-cgi/image/format=auto/FIN/a.png)`],
		['inner spacing', `url( '${F}/a.png' )`, `url('${CDN}/cdn-cgi/image/format=auto/FIN/a.png')`],
	])('handles %s', (_label, input, expected) => {
		expect(rewriteCssUrls(input)).toBe(expected);
	});

	it.each([
		['a data URI', 'url(data:image/png;base64,iVBORw0KGgo=)'],
		['an absolute URL', "url('https://example.com/a.png')"],
		['a relative asset', "url('./sprite.png')"],
	])('leaves %s exactly as written', (_label, css) => {
		expect(rewriteCssUrls(css)).toBe(css);
	});

	it('leaves everything alone with no CDN configured', () => {
		delete g.cdnPrefix;
		const css = `.a { background: url('${F}/a.png'); }`;
		expect(rewriteCssUrls(css)).toBe(css);
	});

	// A truthy non-string used to reach `.replace` and throw, which in a style
	// value takes the whole render down instead of leaving one background alone.
	it.each([[''], [undefined], [null], [{}], [42]])('hands %p back rather than throwing', value => {
		expect(() => rewriteCssUrls(value as any)).not.toThrow();
		expect(rewriteCssUrls(value as any)).toBe(value);
	});
});

describe('getSizesFromStyle', () => {
	it.each([
		[{ width: 450 }, '450px'],
		[{ width: '450px' }, '450px'],
		[{ width: '  80px ' }, '80px'],
		[{ width: '50vw' }, '50vw'],
		[{ width: '20rem' }, '20rem'],
	])('reads %p as an absolute slot', (style, expected) => {
		expect(getSizesFromStyle(style)).toBe(expected);
	});

	// A percentage is against a parent this cannot see, so undefined hands the
	// browser its own 100vw default rather than a number we made up.
	it.each([[{ width: '100%' }], [{ width: 'auto' }], [{}], [undefined]])(
		'declines to guess for %p',
		style => {
			expect(getSizesFromStyle(style)).toBeUndefined();
		},
	);
});
