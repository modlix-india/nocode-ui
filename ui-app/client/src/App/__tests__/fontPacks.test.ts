/**
 * Font pack injection.
 *
 * Both behaviours pinned here were live defects measured on the deployed dev
 * site: every pack was added twice, and each family was its own
 * render-blocking request. 54 stylesheet links, 21 distinct.
 */
import { processFontPacks, resetFontPacksForTests } from '../fontPacks';

const GOOGLE = (family: string) =>
	`<link href="https://fonts.googleapis.com/css2?family=${family}&display=swap" rel="stylesheet" />`;

beforeEach(() => {
	document.head.innerHTML = '';
	resetFontPacksForTests();
});

const sheets = () =>
	Array.from(document.head.querySelectorAll('link[rel=stylesheet]')).map(l =>
		l.getAttribute('href'),
	);
const googleSheets = () => sheets().filter(h => h!.includes('fonts.googleapis.com'));

describe('processFontPacks', () => {
	it('asks for every Google family in a single request', () => {
		processFontPacks({
			a: { code: GOOGLE('Asap'), order: 1 },
			b: { code: GOOGLE('Inter'), order: 2 },
			c: { code: GOOGLE('Domine'), order: 3 },
		});
		expect(googleSheets()).toHaveLength(1);
		const href = googleSheets()[0]!;
		for (const f of ['Asap', 'Inter', 'Domine']) expect(href).toContain(`family=${f}`);
	});

	it('does not add the same pack twice when boot runs it again', () => {
		// The exact defect: the guard read the set and never wrote to it, and
		// App.tsx calls this from two places during boot.
		const packs = { a: { code: GOOGLE('Asap') }, b: { code: GOOGLE('Inter') } };
		processFontPacks(packs);
		processFontPacks(packs);
		expect(googleSheets()).toHaveLength(1);
		expect(sheets()).toEqual(Array.from(new Set(sheets())));
	});

	it('folds a later pack into the existing request rather than opening a second', () => {
		processFontPacks({ a: { code: GOOGLE('Asap') } });
		processFontPacks({ b: { code: GOOGLE('Inter') } });
		expect(googleSheets()).toHaveLength(1);
		expect(googleSheets()[0]).toContain('family=Asap');
		expect(googleSheets()[0]).toContain('family=Inter');
	});

	it('forces display=swap so a slow font never hides its text', () => {
		processFontPacks({ a: { code: GOOGLE('Asap') } });
		expect(googleSheets()[0]).toContain('display=swap');
	});

	it('preconnects both font hosts, gstatic with crossorigin', () => {
		processFontPacks({ a: { code: GOOGLE('Asap') } });
		const pre = Array.from(document.head.querySelectorAll('link[rel=preconnect]'));
		const by = Object.fromEntries(pre.map(l => [l.getAttribute('href'), l]));
		expect(Object.keys(by)).toEqual(
			expect.arrayContaining(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']),
		);
		// Fonts are fetched in CORS mode; without this the hint is ignored and
		// the connection is opened twice.
		expect(by['https://fonts.gstatic.com'].getAttribute('crossorigin')).not.toBeNull();
		expect(by['https://fonts.googleapis.com'].getAttribute('crossorigin')).toBeNull();
	});

	it('leaves non-Google stylesheets exactly as they were', () => {
		// Icon packs point at jsdelivr and cdnjs and cannot be merged.
		const other = '<link href="https://cdn.jsdelivr.net/x/font.css" rel="stylesheet" />';
		processFontPacks({ a: { code: other }, b: { code: GOOGLE('Asap') } });
		expect(sheets()).toContain('https://cdn.jsdelivr.net/x/font.css');
		expect(googleSheets()).toHaveLength(1);
	});

	it('keeps a pack that carries several families on one link', () => {
		processFontPacks({
			a: {
				code:
					'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' +
					'family=Asap&family=Inter" />',
			},
		});
		expect(googleSheets()[0]).toContain('family=Asap');
		expect(googleSheets()[0]).toContain('family=Inter');
	});

	it('does nothing at all when there are no packs', () => {
		processFontPacks(undefined);
		processFontPacks({});
		expect(document.head.innerHTML).toBe('');
	});

	it('does not preconnect when no Google font is involved', () => {
		processFontPacks({ a: { code: '<link href="https://x/y.css" rel="stylesheet" />' } });
		expect(document.head.querySelectorAll('link[rel=preconnect]')).toHaveLength(0);
	});
});
