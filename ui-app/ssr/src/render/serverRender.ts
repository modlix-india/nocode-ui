import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import logger from '../config/logger.js';
import { loadManifest } from '../util/manifestLoader.js';

/**
 * Server rendering of the page itself, so `#app` arrives drawn and the browser hydrates it
 * (ui-app/ssr/HYDRATION_PLAN.md). Off unless SERVER_RENDER_BUNDLE names the client's server
 * build (`client/webpack.server.js` -> `dist-server/serverEntry.js`); with it unset every
 * response is exactly what it was.
 *
 * Each render runs in its own short-lived worker. The client keeps its state in module-level
 * singletons (the store, the device), so one loaded copy cannot draw page after page; a fresh
 * worker per render is full isolation, and terminating it is a hard time limit. The HTML cache in
 * front of this means only a miss pays for it.
 *
 * Anything that goes wrong (too many renders in flight, the time limit, an exception) answers
 * null and the caller serves today's empty `#app`, which the browser renders as it always has.
 */

// Where a deploy puts the server render: CI copies the client's server build and its style JSON
// into the image's manifests/ (beside asset-manifest.json), so including them in an environment's
// image is what switches server rendering on there. SERVER_RENDER_BUNDLE overrides it (local:
// client/dist-server/serverEntry.js, with the style JSON in client/dist/styleProperties).
const IMAGE_BUNDLE = path.join(process.cwd(), 'manifests', 'server-render', 'serverEntry.js');
const BUNDLE = process.env.SERVER_RENDER_BUNDLE ?? (existsSync(IMAGE_BUNDLE) ? IMAGE_BUNDLE : undefined);
const STYLE_PROPERTIES_DIR =
	process.env.SERVER_RENDER_STYLE_PROPERTIES ??
	(BUNDLE
		? [path.join(path.dirname(BUNDLE), 'styleProperties'), path.join(path.dirname(BUNDLE), '..', 'dist', 'styleProperties')].find(d => existsSync(d))
		: undefined);
const TIMEOUT_MS = Number(process.env.SERVER_RENDER_TIMEOUT_MS ?? 3000);
const MAX_IN_FLIGHT = Number(process.env.SERVER_RENDER_MAX_IN_FLIGHT ?? 2);

/** A few widths, one per device class, so the cache keeps a handful of copies, not one per screen. */
export const RENDER_WIDTHS = { phone: 390, tablet: 820, desktop: 1440 } as const;

let inFlight = 0;
let styleProperties: Record<string, unknown> | undefined;

export function serverRenderEnabled(): boolean {
	return !!BUNDLE && existsSync(BUNDLE);
}

/**
 * The width to draw at, from the request. Only a guess at the visitor's screen: the browser's first
 * render uses this same number (the bootstrap's `deviceWidth`) and applies its real width after
 * hydration, so a wrong guess costs a restyle, never a failed hydration.
 */
export function renderWidthFor(headers: Record<string, string | string[] | undefined>): number {
	const ua = String(headers['user-agent'] ?? '');
	if (headers['sec-ch-ua-mobile'] === '?1' || /iPhone|iPod|Android.+Mobile|Mobile Safari|Windows Phone/i.test(ua))
		return RENDER_WIDTHS.phone;
	if (/iPad|Tablet|Android(?!.*Mobile)|Silk/i.test(ua)) return RENDER_WIDTHS.tablet;
	return RENDER_WIDTHS.desktop;
}

/** Every `/styleProperties/<Name>.json` beside the bundle, read once. */
function loadStyleProperties(): Record<string, unknown> {
	if (styleProperties) return styleProperties;
	const found: Record<string, unknown> = {};
	try {
		if (STYLE_PROPERTIES_DIR && existsSync(STYLE_PROPERTIES_DIR))
			for (const f of readdirSync(STYLE_PROPERTIES_DIR))
				if (f.endsWith('.json'))
					found[f.slice(0, -5)] = JSON.parse(readFileSync(path.join(STYLE_PROPERTIES_DIR, f), 'utf8'));
	} catch (error) {
		logger.warn('Server render: style properties unreadable', { dir: STYLE_PROPERTIES_DIR, error: String(error) });
	}
	styleProperties = found;
	return found;
}

/**
 * The page drawn at `width`, as the markup that goes inside `#app`, or null to serve the page
 * unrendered. `documentHtml` is the full SSR document: the worker reads its bootstrap script
 * exactly as a browser would.
 */
export async function serverRenderPage(documentHtml: string, url: string, width: number): Promise<string | null> {
	if (!serverRenderEnabled()) return null;
	if (inFlight >= MAX_IN_FLIGHT) {
		logger.info('Server render skipped: busy', { url, inFlight });
		return null;
	}
	inFlight++;
	const started = Date.now();
	try {
		return await new Promise<string | null>(resolve => {
			const worker = new Worker(new URL('./serverRenderWorker.js', import.meta.url), {
				workerData: {
					documentHtml,
					url,
					width,
					bundle: BUNDLE,
					styleProperties: loadStyleProperties(),
					// The deployed client's build version: asset URLs carry it (AppStyle's stylesheet), so
					// the server must stamp the one the browser's bundle will, or hydration fails at once.
					buildVersion: loadManifest()?.buildVersion,
				},
			});
			let settled = false;
			const done = (html: string | null, reason?: string) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				worker.terminate().catch(() => undefined);
				if (reason) logger.warn('Server render fell back to an empty #app', { url, reason: reason.slice(0, 500) });
				else logger.info('Server rendered', { url, width, ms: Date.now() - started, bytes: html?.length });
				resolve(html);
			};
			const timer = setTimeout(() => done(null, `timeout after ${TIMEOUT_MS} ms`), TIMEOUT_MS);
			worker.once('message', (m: { html?: string; error?: string }) => done(m.html ?? null, m.error));
			worker.once('error', e => done(null, String(e?.stack ?? e)));
			worker.once('exit', code => done(null, `worker exited (${code}) before answering`));
		});
	} finally {
		inFlight--;
	}
}
