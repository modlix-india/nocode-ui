const loaders = new Map<string, Promise<any>>();
let cbSeq = 0;

export function loadGoogleMaps(apiKey: string): Promise<any> {
	if ((window as any).google?.maps) return Promise.resolve((window as any).google);
	const cached = loaders.get(apiKey);
	if (cached) return cached;
	const p = new Promise<any>((resolve, reject) => {
		const cbName = `__gmapsCb_${cbSeq++}`;
		(window as any)[cbName] = () => {
			resolve((window as any).google);
			delete (window as any)[cbName];
		};
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${cbName}&loading=async`;
		script.async = true;
		script.defer = true;
		script.onerror = () => reject(new Error('Failed to load Google Maps'));
		document.head.appendChild(script);
	});
	loaders.set(apiKey, p);
	return p;
}
