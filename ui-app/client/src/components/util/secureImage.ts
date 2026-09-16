import axios from 'axios';
import { getDataFromPath } from '../../context/StoreContext';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';

/**
 * Fetch a secured file as a blob URL an `<img>` can use.
 *
 * A secured file is not servable by URL: `/api/files/secured/file/...` needs an
 * Authorization header, and an `<img src>` cannot send one. So it is fetched as
 * a blob and handed to the element as an object URL instead.
 *
 * Lifted out of `Image.tsx`, where it had been the private helper of one
 * component. The chat needs exactly the same thing for attachments, and a second
 * copy of it would have been a second place to get the auth header wrong.
 */

/**
 * In-flight and completed fetches, keyed on the URL.
 *
 * Deduplication, not just speed. The original made one request AND one object
 * URL per effect run, and nothing ever revoked them, so a component that
 * re-rendered — or rendered the same image twice — leaked a blob per render for
 * the life of the page. Sharing one promise per URL bounds that to one blob per
 * distinct image, which is the actual bug; `revokeSecureImage` is there for
 * callers that know a URL is finished with.
 *
 * Deliberately not per-component cleanup: `Image.tsx` calls this from an effect
 * that React 18 runs twice in development, and revoking on unmount would blank
 * images that are still on screen.
 */
const cache = new Map<string, Promise<string>>();

// Past this, the oldest entries are revoked and dropped. A chat with hundreds of
// attachments should not hold every blob it has ever scrolled past.
const MAX_CACHED = 200;

function evictOldest() {
	while (cache.size > MAX_CACHED) {
		const oldest = cache.keys().next();
		if (oldest.done) return;
		revokeSecureImage(oldest.value);
	}
}

export default async function secureImage(src: string): Promise<string> {
	const existing = cache.get(src);
	if (existing) return existing;

	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode)
		headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

	const pending = axios
		.get(src, { responseType: 'blob', headers })
		.then(res => URL.createObjectURL(res.data))
		.catch(err => {
			// Not cached: a failure is usually the file having expired or been
			// deleted, but it is also what a dropped connection looks like, and
			// the next render should be allowed to try again.
			cache.delete(src);
			throw err;
		});

	cache.set(src, pending);
	evictOldest();
	return pending;
}

/** Release the blob held for `src`, if any. Safe to call for an unknown URL. */
export function revokeSecureImage(src: string) {
	const pending = cache.get(src);
	if (!pending) return;
	cache.delete(src);
	pending.then(objectUrl => URL.revokeObjectURL(objectUrl)).catch(() => {});
}

/** True when this URL has to go through `secureImage` rather than straight to `src`. */
export function isSecuredUrl(url: string | undefined): boolean {
	return !!url && url.includes('api/files/secured');
}
