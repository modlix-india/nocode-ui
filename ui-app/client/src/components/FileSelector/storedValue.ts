import getSrcUrl from '../util/getSrcUrl';

/** What the `valueType` property may be set to. */
export const STORE_FILE_OBJECT = '_fileObject';
export const STORE_URL = '_url';

/**
 * The value a FileSelector writes to its binding path.
 *
 * Two properties decide it, and they are independent of each other:
 *
 * `valueType` picks the shape. `_fileObject` keeps whatever the selection
 * produced - browsing produces a URL string, an upload produces the whole
 * response (`{url, directory, name, size, ...}`) - so the shape follows the
 * design type. `_url` stores a URL string whichever way the file arrived, which
 * is what a reader of the binding usually wants: a favicon is
 * `properties.links.<key>.href`, a manifest icon is `src`, an image is `src`,
 * each of them a string. Before this was a property, a page that wanted the
 * string had to unwrap the object itself one step later; sitezump's Site
 * Settings carried exactly that workaround on save.
 *
 * `fullUrl` picks how the URL inside that shape reads: an absolute URL, or the
 * files-API path. A value that leaves the app - a PWA manifest entry, an email,
 * an API payload - is read by something with no idea what this app's origin is,
 * so it needs the absolute form. `getSrcUrl` gives the CDN host when one is
 * configured and returns its input untouched when none is, which makes the
 * page's own origin the floor.
 *
 * `_fileObject` with `fullUrl` on rewrites the object's `url` key and leaves
 * every other key alone, so the absolute form never costs you `name` or `size`.
 *
 * Pulled out of the component so it can be tested: this is the shape contract
 * between the file browser and every page that binds one.
 */
export function fileSelectorStoredValue(
	value: any,
	valueType: string,
	fullUrl: boolean,
	origin: string,
): any {
	if (!value) return value;

	const keepObject = valueType !== STORE_URL;
	// Nothing to do to a string we are not making absolute, and nothing to do to
	// an object we are neither making absolute nor flattening.
	if (!fullUrl && keepObject) return value;

	const raw = typeof value === 'string' ? value : (value?.url ?? '');
	// Not a file-shaped value at all. Handing it back untouched is safer than
	// replacing it with an empty string, which would silently clear a binding.
	if (!raw) return value;

	if (!fullUrl) return raw;

	const cdn = getSrcUrl(raw);
	let absolute = cdn;
	if (!/^[a-z]+:\/\//i.test(cdn)) {
		absolute = cdn.startsWith('/') ? origin + cdn : origin + '/' + cdn;
	}

	if (keepObject && typeof value === 'object') return { ...value, url: absolute };
	return absolute;
}
