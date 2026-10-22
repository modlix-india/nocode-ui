/**
 * Loads a provider SDK from its CDN with a script tag, once per URL, and hands back the global
 * it defines. Same approach as util/googleMapsLoader: nothing is fetched until a page connects.
 */
const loaders = new Map<string, Promise<any>>();

export function loadScript(url: string, globalName: string): Promise<any> {
	const existing = (globalThis as any)[globalName];
	if (existing) return Promise.resolve(existing);
	const cached = loaders.get(url);
	if (cached) return cached;

	const p = new Promise<any>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = url;
		script.async = true;
		script.crossOrigin = 'anonymous';
		script.onload = () => {
			const value = (globalThis as any)[globalName];
			if (value) resolve(value);
			else reject(new Error(`${url} loaded but did not define ${globalName}`));
		};
		script.onerror = () => reject(new Error(`Could not load ${url}`));
		document.head.appendChild(script);
	});
	// A failed load is not cached, so the next Connect tries again.
	p.catch(() => loaders.delete(url));
	loaders.set(url, p);
	return p;
}
