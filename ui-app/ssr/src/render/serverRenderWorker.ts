import { createRequire } from 'node:module';
import { parentPort, workerData } from 'node:worker_threads';
import { JSDOM } from 'jsdom';

/**
 * One server render, in its own worker (see serverRender.ts). The client's server build expects
 * the browser it was written for: a window at the page's URL, the SSR document's inline bootstrap
 * already run, and the usual globals. jsdom provides that; this worker's globalThis is its own, so
 * nothing leaks into the next render.
 */

interface Input {
	documentHtml: string;
	url: string;
	width: number;
	bundle: string;
	styleProperties: Record<string, unknown>;
}

const { documentHtml, url, width, bundle, styleProperties } = workerData as Input;

async function run(): Promise<string> {
	const dom = new JSDOM(documentHtml, { url, pretendToBeVisual: true, runScripts: 'outside-only' });
	const win = dom.window as unknown as Record<string, any>;
	Object.defineProperty(win, 'innerWidth', { value: width, configurable: true });
	Object.defineProperty(win.document.body, 'offsetWidth', { value: width, configurable: true });

	// The SSR document's own bootstrap script (`__APP_BOOTSTRAP__`, domainAppCode, cdnPrefix, ...).
	const inline = [...win.document.querySelectorAll('script:not([src])')]
		.map((s: any) => s.textContent as string)
		.find(t => t.includes('__APP_BOOTSTRAP__'));
	if (!inline) throw new Error('no bootstrap script in the SSR document');
	win.eval(inline);

	const g = globalThis as Record<string, any>;
	for (const key of Object.getOwnPropertyNames(win)) {
		if (key in g) continue;
		try {
			g[key] = win[key];
		} catch {
			/* a getter that refuses: not needed */
		}
	}
	for (const key of ['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'location'])
		Object.defineProperty(g, key, { value: key === 'window' ? win : win[key], configurable: true, writable: true });
	for (const key of ['__APP_BOOTSTRAP__', 'domainAppCode', 'domainClientCode', '__mlxAppCode', 'cdnPrefix', 'cdnStripAPIPrefix', 'cdnReplacePlus', 'cdnResizeOptionsType', '__SOCIAL_LOGIN_HOST__', '__SSO_BEACON_HOST__'])
		if (win[key] !== undefined) g[key] = win[key];

	const { renderPage } = createRequire(import.meta.url)(bundle);
	return renderPage(styleProperties);
}

run().then(
	html => parentPort?.postMessage({ html }),
	error => parentPort?.postMessage({ error: String(error?.stack ?? error) }),
);
