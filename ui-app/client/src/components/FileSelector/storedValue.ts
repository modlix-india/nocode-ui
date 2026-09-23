import getSrcUrl from '../util/getSrcUrl';

/**
 * The value a FileSelector writes to its binding path.
 *
 * ALWAYS a URL string, never the object an upload responded with. Browsing has
 * always stored a string; uploading used to store the whole upload response
 * (`{url, directory, name, size, ...}`), so one component wrote two different
 * shapes depending on its design type and every consumer had to cope with both.
 *
 * Nothing wants the object. A favicon is `properties.links.<key>.href`, a
 * manifest icon is `src`, an image is `src` — each of them a string. What they
 * got instead was an object, which a page then had to unwrap itself one step
 * later; sitezump's Site Settings carried exactly that workaround on save.
 *
 * `fullUrl` decides between an absolute URL and the files-API path, not between
 * a string and an object. A value that leaves the app — a PWA manifest entry,
 * an email, an API payload — is read by something with no idea what this app's
 * origin is, so it needs the absolute form. `getSrcUrl` gives the CDN host when
 * one is configured and returns its input untouched when none is, which makes
 * the page's own origin the floor.
 *
 * Pulled out of the component so it can be tested: this is the shape contract
 * between the file browser and every page that binds one.
 */
export function fileSelectorStoredValue(value: any, fullUrl: boolean, origin: string): any {
	if (!value) return value;

	const raw = typeof value === 'string' ? value : (value?.url ?? '');
	// Not a file-shaped value at all. Handing it back untouched is safer than
	// replacing it with an empty string, which would silently clear a binding.
	if (!raw) return value;

	if (!fullUrl) return raw;

	const cdn = getSrcUrl(raw);
	if (/^[a-z]+:\/\//i.test(cdn)) return cdn;
	return origin + (cdn.startsWith('/') ? cdn : '/' + cdn);
}
