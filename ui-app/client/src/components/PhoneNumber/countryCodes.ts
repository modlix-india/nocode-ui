import { COUNTRY_LIST } from './components/listOfCountries';

const COUNTRY_CODE_BY_NAME = new Map<string, string>(
	COUNTRY_LIST.flatMap((c: any) => [
		[String(c.N).toLowerCase(), c.C],
		[String(c.C).toLowerCase(), c.C],
	]),
);

/** A countries / topCountries list as ISO codes: names ("India") and any case accepted; unknowns kept as written. */
export function toCountryCodes(list: any): string[] | undefined {
	if (!Array.isArray(list)) return undefined;
	return list
		.filter(e => typeof e === 'string' && e.trim())
		.map(e => COUNTRY_CODE_BY_NAME.get(e.trim().toLowerCase()) ?? e);
}
