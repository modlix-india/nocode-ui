import { pagePathOnHost, parsePreviewPath } from '../PagePreview';

/**
 * The path box in the preview bar. Whatever someone types there means "show me
 * this page", and there are only three things they type: a bare name, `/name`,
 * and a whole preview URL pasted out of a browser tab.
 *
 * The pasted URL is the one with teeth. It carries an origin, and on a draft
 * preview that origin is a MINTED TOKEN hostname with a lifetime -- honouring it
 * as the frame's host would pin the pane to something that stops resolving. So it
 * is reported but never used as the host: the caller matches it against the two
 * surfaces and moves the toggle, which is what makes editing the host half of a
 * complete URL do something truthful.
 */

const APP = 'monkbars';
const CLIENT = 'SYSTEM';
const parse = (text: string) => parsePreviewPath(text, APP, CLIENT);

describe('parsePreviewPath', () => {
	it('takes a bare page name, and the app it is already on', () => {
		expect(parse('sampleAI')).toEqual({
			appCode: APP,
			clientCode: CLIENT,
			pageName: 'sampleAI',
			suffix: '',
			origin: '',
		});
	});

	it('takes a leading slash, and stray whitespace', () => {
		expect(parse('  /deals  ')?.pageName).toBe('deals');
	});

	it('reads a whole preview path back', () => {
		expect(parse('/leadzump/ACME/page/dealDetail')).toEqual({
			appCode: 'leadzump',
			clientCode: 'ACME',
			pageName: 'dealDetail',
			suffix: '',
			origin: '',
		});
	});

	it('reports a pasted origin without letting it become the host', () => {
		// Reported so the caller can move the Draft/Live toggle to match, since the
		// box shows complete URLs and editing the host half has to mean something.
		// Never used as the frame's host: a draft origin is a token that expires.
		expect(parse('https://t-9f2c.modlix.com/monkbars/SYSTEM/page/sampleAI')).toEqual({
			appCode: APP,
			clientCode: CLIENT,
			pageName: 'sampleAI',
			suffix: '',
			origin: 'https://t-9f2c.modlix.com',
		});
	});

	it('reports the origin of a live URL too, port and all', () => {
		expect(parse('http://localhost:1234/monkbars/SYSTEM/page/sampleAI')?.origin).toBe(
			'http://localhost:1234',
		);
	});

	it('keeps a query string, because a page can need parameters', () => {
		expect(parse('/dealDetail?id=42#top')).toEqual({
			appCode: APP,
			clientCode: CLIENT,
			pageName: 'dealDetail',
			suffix: '?id=42#top',
			origin: '',
		});
		expect(parse('https://x.modlix.com/a/B/page/c?d=1')?.suffix).toBe('?d=1');
	});

	it('falls back to the last segment when the shape is not a preview path', () => {
		// No `page` marker to key off. The app and the client are what the pane is
		// already pointed at, so only the page name can be taken from this.
		expect(parse('/monkbars/SYSTEM/sampleAI')).toEqual({
			appCode: APP,
			clientCode: CLIENT,
			pageName: 'sampleAI',
			suffix: '',
			origin: '',
		});
	});

	it('does not read a `page` segment that names nothing', () => {
		expect(parse('/app/CLIENT/page')?.pageName).toBe('page');
		expect(parse('page/sampleAI')?.pageName).toBe('sampleAI');
	});

	it('is undefined for nothing typed, which the caller reads as “follow the agent”', () => {
		expect(parse('')).toBeUndefined();
		expect(parse('   ')).toBeUndefined();
		expect(parse('///')).toBeUndefined();
		expect(parse('https://t-9f2c.modlix.com')).toBeUndefined();
	});
});

/**
 * Which shape a page's path takes depends on WHICH HOST is about to serve it, and
 * getting it wrong is silent: on an app host the first segment is the page name,
 * so the gateway's `/<app>/<client>/page/<name>` asks for a page named after the
 * app and the preview shows the wrong thing rather than an error.
 */
describe('pagePathOnHost', () => {
	it('spells out app and client on the gateway, which serves every app', () => {
		expect(pagePathOnHost(false, APP, CLIENT, 'sampleAI')).toBe(
			'/monkbars/SYSTEM/page/sampleAI',
		);
	});

	it('is just the page name on a draft or live host, which knows both from its name', () => {
		expect(pagePathOnHost(true, APP, CLIENT, 'sampleAI')).toBe('/sampleAI');
	});

	it('carries a query string and hash on either host', () => {
		expect(pagePathOnHost(true, APP, CLIENT, 'dealDetail', '?id=42#top')).toBe(
			'/dealDetail?id=42#top',
		);
		expect(pagePathOnHost(false, APP, CLIENT, 'dealDetail', '?id=42')).toBe(
			'/monkbars/SYSTEM/page/dealDetail?id=42',
		);
	});

	it('is empty with no page, so the caller renders nothing rather than a bare host', () => {
		expect(pagePathOnHost(true, APP, CLIENT, '')).toBe('');
		expect(pagePathOnHost(false, APP, CLIENT, '')).toBe('');
	});

	it('needs no app code on an app host, because the host is the app', () => {
		// The draft grant is minted per app, so the pane can be pointed at a page
		// before it has resolved which app it belongs to.
		expect(pagePathOnHost(true, '', '', 'sampleAI')).toBe('/sampleAI');
		// ...but on the gateway an app-less path would be a page called after the
		// client, so there is nothing honest to build.
		expect(pagePathOnHost(false, '', CLIENT, 'sampleAI')).toBe('');
	});
});
