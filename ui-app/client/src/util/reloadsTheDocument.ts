/**
 * Whether `location.replace(url)` loads a new document. Only a URL that differs from this one in
 * its fragment alone (or repeats it with a fragment) is a same-document navigation.
 */
export function reloadsTheDocument(url: string, current: string = window.location.href): boolean {
	try {
		const to = new URL(url, current);
		const from = new URL(current);
		if (!to.hash) return true;
		to.hash = '';
		from.hash = '';
		return to.toString() !== from.toString();
	} catch {
		return true;
	}
}
