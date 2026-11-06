/**
 * The language a URL asks for with `?lang=<code>` (PLAT-1550). The SSR emits hreflang alternates
 * at `<canonical>?lang=<code>` for an app written in two or more languages, so this URL must
 * render in that language.
 *
 * Honoured only when the app is written in it: a key of its `languages` or `translations`, the
 * same keys the hreflang alternates come from, and a usable language tag. The app's own spelling
 * of the key is returned, so `?lang=HI` finds `hi`. Anything else answers undefined and the
 * language is chosen as if the parameter were absent.
 *
 * The SSR keeps an identical copy (ssr/src/render/requestedLanguage.ts) for its cache key and
 * `<html lang>`: both sides must honour exactly the same values, or a server-rendered copy drawn
 * in one language would be stored under the key of another.
 */
const LANGUAGE_TAG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;

const keysOf = (o: unknown) =>
	o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o) : [];

export function requestedLanguage(application: any, search: string | undefined): string | undefined {
	if (!application || !search) return undefined;
	let raw: string | null;
	try {
		raw = new URLSearchParams(search).get('lang');
	} catch {
		return undefined;
	}
	raw = raw?.trim() ?? '';
	if (!raw) return undefined;
	const langs = [
		...new Set([...keysOf(application.languages), ...keysOf(application.translations)]),
	].filter(l => LANGUAGE_TAG.test(l));
	const lower = raw.toLowerCase();
	return langs.find(l => l === raw) ?? langs.find(l => l.toLowerCase() === lower);
}
