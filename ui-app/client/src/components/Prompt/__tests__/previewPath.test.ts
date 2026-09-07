import { parsePreviewPath } from '../PagePreview';

/**
 * The path box in the preview bar. Whatever someone types there means "show me
 * this page", and there are only three things they type: a bare name, `/name`,
 * and a whole preview URL pasted out of a browser tab.
 *
 * The pasted URL is the one with teeth. It carries an origin, and on a draft
 * preview that origin is a MINTED TOKEN hostname with a lifetime -- honouring it
 * would pin the pane to a host that stops resolving, and would also override the
 * Draft/Live toggle sitting right next to the box. So the origin is dropped and
 * the surface stays the toggle's business.
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
		});
	});

	it('drops the origin of a pasted URL, so the surface stays the toggle’s call', () => {
		expect(parse('https://t-9f2c.modlix.com/monkbars/SYSTEM/page/sampleAI')).toEqual({
			appCode: APP,
			clientCode: CLIENT,
			pageName: 'sampleAI',
			suffix: '',
		});
	});

	it('keeps a query string, because a page can need parameters', () => {
		expect(parse('/dealDetail?id=42#top')).toEqual({
			appCode: APP,
			clientCode: CLIENT,
			pageName: 'dealDetail',
			suffix: '?id=42#top',
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
