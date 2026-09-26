import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Three places write the analytics beacon's script tag, and they have to agree.
 *
 * `IndexHTMLService.java` (the Java ui service), `htmlRenderer.ts` (SSR) and
 * `AnalyticsBinder.tsx` (the webpack dev server, which serves one template for every app and
 * so cannot carry the tag statically). There is no shared definition of the attribute list,
 * and they have drifted before: `data-heatmaps` was added to the two renderers and not to the
 * binder, and the symptom was a local page that recorded page views perfectly and no clicks at
 * all, with nothing anywhere saying why.
 *
 * This compares the two TypeScript ones as TEXT rather than by calling them, because the SSR
 * emitter is not exported and the shape being checked is the literal attribute list. The Java
 * one lives in another repository and cannot be read from here; the comment above it says so.
 */
// Hyphens included: `data-mlx-beacon` truncated to `data-mlx` matched nothing and
// compared equal to nothing, which is a test that passes by not looking.
const ATTRIBUTE = /data-[a-z]+(?:-[a-z]+)*/g;

function attributesIn(file: string): string[] {
	const src = readFileSync(file, 'utf8');
	// Only the function that writes the tag, so an unrelated `data-` elsewhere in the file
	// cannot fail this or, worse, satisfy it.
	const start = src.indexOf('/a.js');
	if (start < 0) throw new Error(`no beacon tag found in ${file}`);
	const end = src.indexOf('</script>', start);
	const body = src.slice(start, end < 0 ? start + 2000 : end);

	return [...new Set(body.match(ATTRIBUTE) ?? [])].sort();
}

describe('the beacon tag', () => {
	it('carries the same attributes from the SSR renderer and the dev binder', () => {
		const ssr = attributesIn(join(__dirname, '../../../../ssr/src/render/htmlRenderer.ts'));
		const dev = attributesIn(join(__dirname, '../AnalyticsBinder.tsx'));

		// The binder marks its own tag so it can tell one it wrote from one a renderer wrote.
		// That is a dev-only concern and not part of the contract.
		const devContract = dev.filter(a => a !== 'data-mlx-beacon');

		expect(devContract).toEqual(ssr);
	});

	it('includes every attribute the beacon reads', () => {
		// The other direction: the beacon growing an option that no renderer emits is just as
		// silent a failure as a renderer forgetting one, because the option then takes its
		// default everywhere and the setting that was meant to control it does nothing.
		const ssr = attributesIn(join(__dirname, '../../../../ssr/src/render/htmlRenderer.ts'));

		expect(ssr).toEqual([
			'data-autocapture',
			'data-consent',
			'data-heatmaps',
			'data-pageleaves',
			'data-pageviews',
			'data-scroll',
		]);
	});
});
