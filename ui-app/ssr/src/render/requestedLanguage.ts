import type { ApplicationDefinition } from '../api/client.js';

/**
 * The language a URL asks for with `?lang=<code>`, the URLs the hreflang alternates point at
 * (PLAT-1550). The client keeps an identical copy (client/src/util/requestedLanguage.ts) and loads
 * in this language; this side keys the HTML cache on it and sets `<html lang>`. Both must honour
 * exactly the same values, or a server-rendered copy drawn in one language would be stored under
 * the key of another.
 *
 * Honoured only when the app is written in it: a key of its `languages` or `translations` that is
 * a usable language tag. Answers the app's own spelling of the key, and undefined for anything
 * else, including the app's `defaultLanguage`, which renders exactly as the bare URL does.
 */
const LANGUAGE_TAG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;

const keysOf = (o: unknown) => (o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o) : []);

export function requestedLanguage(
	application: ApplicationDefinition | null | undefined,
	params: URLSearchParams,
): string | undefined {
	const raw = params.get('lang')?.trim() ?? '';
	if (!application || !raw) return undefined;
	const langs = [...new Set([...keysOf(application.languages), ...keysOf(application.translations)])].filter(l =>
		LANGUAGE_TAG.test(l),
	);
	const lower = raw.toLowerCase();
	const hit = langs.find(l => l === raw) ?? langs.find(l => l.toLowerCase() === lower);
	return hit && hit !== application.defaultLanguage ? hit : undefined;
}
