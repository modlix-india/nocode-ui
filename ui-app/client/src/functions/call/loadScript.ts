/**
 * Loads a provider SDK from its CDN with a script tag, once per URL, and hands back the global
 * it defines. Same approach as util/googleMapsLoader: nothing is fetched until a page connects.
 *
 * LZT-2167: the URL each global came from is remembered, so a global left by another URL (an
 * older SDK version) is never taken for this one, and a failed load (a network error, or a wrong
 * file at the right URL that defines nothing) is forgotten and its tag removed, so the next
 * Connect tries again without a page reload.
 */
const loaders = new Map<string, Promise<any>>();

/** Which URL defined each global this loader loaded. */
const SOURCE_KEY = '__modlixCallSdkSource';

function sources(): Record<string, string> {
	const g = globalThis as any;
	if (!g[SOURCE_KEY] || typeof g[SOURCE_KEY] !== 'object') g[SOURCE_KEY] = {};
	return g[SOURCE_KEY];
}

export function loadScript(url: string, globalName: string): Promise<any> {
	const existing = (globalThis as any)[globalName];
	if (existing && sources()[globalName] === url) return Promise.resolve(existing);
	const cached = loaders.get(url);
	if (cached) return cached;

	let script: HTMLScriptElement | undefined;
	const p = new Promise<any>((resolve, reject) => {
		script = document.createElement('script');
		script.src = url;
		script.async = true;
		script.crossOrigin = 'anonymous';
		script.onload = () => {
			const value = (globalThis as any)[globalName];
			if (value) {
				sources()[globalName] = url;
				resolve(value);
			} else reject(new Error(`${url} loaded but did not define ${globalName}`));
		};
		script.onerror = () => reject(new Error(`Could not load ${url}`));
		document.head.appendChild(script);
	});
	// A failed load is not cached, so the next Connect tries again.
	p.catch(() => {
		if (loaders.get(url) === p) loaders.delete(url);
		script?.remove();
	});
	loaders.set(url, p);
	return p;
}
