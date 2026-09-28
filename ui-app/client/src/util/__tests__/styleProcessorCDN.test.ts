import { processComponentStylePseudoClasses } from '../styleProcessor';

const g = globalThis as any;

const CDN = 'https://cdn.modlix.com';
const F = '/api/files/static/file/FIN/CoevolveMisty';

/** The only part of the page definition processCDN's path touches. */
const pdef = {} as any;

const backgroundOf = (value: string) =>
	processComponentStylePseudoClasses(pdef, {}, { '': { comp: { backgroundImage: value } } }).comp
		.backgroundImage;

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

describe('component background images through the CDN', () => {
	// Previously the transformer was reached only by a value whose author had
	// typed a query string, so an ordinary background shipped the original file.
	it('asks for format=auto without the author having written a query', () => {
		expect(backgroundOf(`url('${F}/bgsec.jpg')`)).toBe(
			`url('${CDN}/cdn-cgi/image/format=auto/FIN/CoevolveMisty/bgsec.jpg')`,
		);
	});

	it('still honours an authored width, and adds a format alongside it', () => {
		expect(backgroundOf(`url('${F}/bgsec.jpg?width=800')`)).toBe(
			`url('${CDN}/cdn-cgi/image/width=800,format=auto/FIN/CoevolveMisty/bgsec.jpg')`,
		);
	});

	// The old branch rebuilt the value from the url() outwards and dropped
	// whatever followed the closing paren.
	it('keeps the rest of a background shorthand', () => {
		expect(backgroundOf(`url('${F}/bgsec.jpg') no-repeat center / cover`)).toBe(
			`url('${CDN}/cdn-cgi/image/format=auto/FIN/CoevolveMisty/bgsec.jpg') no-repeat center / cover`,
		);
	});

	it('rewrites both layers of a two-image background', () => {
		const out = backgroundOf(`url('${F}/a.png'), url('${F}/b.png')`);
		expect(out.match(new RegExp(CDN, 'g'))).toHaveLength(2);
		expect(out).not.toContain(`url('/api`);
	});

	it('leaves a gradient with no file reference untouched', () => {
		const gradient = 'linear-gradient(to right, #fff, #000)';
		expect(backgroundOf(gradient)).toBe(gradient);
	});

	it('does nothing with no CDN configured', () => {
		delete g.cdnPrefix;
		expect(backgroundOf(`url('${F}/bgsec.jpg')`)).toBe(`url('${F}/bgsec.jpg')`);
	});
});
