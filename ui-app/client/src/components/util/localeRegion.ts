/** The region of the visitor's preferred language ("en-IN" gives "IN"), or undefined. */
export function localeRegion(): string | undefined {
	try {
		const langs: readonly string[] =
			globalThis.navigator?.languages?.length
				? globalThis.navigator.languages
				: [globalThis.navigator?.language ?? ''];
		for (const lang of langs) {
			const region = new Intl.Locale(lang).region;
			if (region) return region.toUpperCase();
		}
	} catch {
		// An unparseable tag or no Intl.Locale: fall back to the list's first country.
	}
	return undefined;
}
