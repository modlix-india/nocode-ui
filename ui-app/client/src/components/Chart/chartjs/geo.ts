/**
 * The world map, kept behind a dynamic import.
 *
 * `chartjs-chart-geo` and a world atlas together are a few hundred kilobytes,
 * and almost no chart is a map. Nothing in this file is reachable from
 * `LazyChart`'s static imports: it pulls the module in only when it sees
 * `chartType: 'geo'`, so every other chart on every other page pays nothing.
 * Keep it that way — a plain `import` at the top of `LazyChart` would put the
 * atlas in the chunk that every Chart loads.
 *
 * There are two atlases and the choice is not about how smooth the coastlines
 * look. Natural Earth's 110m file is 177 shapes for 37KB gzipped, and it simply
 * HAS NO SHAPE for Singapore, Hong Kong, Malta, Mauritius, Bahrain, the
 * Maldives, Monaco and a dozen other small states -- they are below its
 * resolution. For a site's traffic map those are not edge cases. The 50m file
 * carries all 241 for 224KB gzipped.
 *
 * So the resolution is a property, both files are imported at literal paths so
 * webpack emits a chunk each, and only the one asked for is ever fetched.
 */
import { Chart as ChartJS } from 'chart.js';

/** One country shape plus whatever the atlas knows about it. */
export interface CountryFeature {
	id?: string | number;
	properties?: { name?: string };
}

let registered = false;

/**
 * Register the geo controller, element and scales.
 *
 * Guarded because `LazyChart` calls this every time a geo chart mounts and
 * Chart.js keeps one global registry; registering twice is not an error but
 * there is no reason to do it.
 */
export async function registerGeo(): Promise<void> {
	if (registered) return;
	const geo = await import('chartjs-chart-geo');
	ChartJS.register(geo.ChoroplethController, geo.GeoFeature, geo.ColorScale, geo.ProjectionScale);
	registered = true;
}

export type GeoResolution = 'coarse' | 'detailed';

const countries: Map<GeoResolution, Promise<Array<CountryFeature>>> = new Map();

/**
 * The country shapes, fetched once per resolution per page load.
 *
 * The two `import()` calls take literal paths on purpose. A single call with a
 * computed path makes webpack build a context module over the whole package
 * directory, which would pull the 3.5MB 10m atlas in beside the other two.
 */
export async function loadCountries(
	resolution: GeoResolution = 'coarse',
): Promise<Array<CountryFeature>> {
	let pending = countries.get(resolution);
	if (!pending) {
		pending = (async () => {
			const [topojson, atlas] = await Promise.all([
				import('topojson-client'),
				resolution === 'detailed'
					? import(
							/* webpackChunkName: "chart-geo-atlas-detailed" */
							'world-atlas/countries-50m.json'
						)
					: import(
							/* webpackChunkName: "chart-geo-atlas-coarse" */
							'world-atlas/countries-110m.json'
						),
			]);
			const topo: any = (atlas as any).default ?? atlas;
			return (topojson.feature(topo, topo.objects.countries) as any).features;
		})();
		countries.set(resolution, pending);
	}
	return pending;
}

/**
 * ISO 3166-1 alpha-2 to the numeric code the atlas uses as a feature id.
 *
 * This table is the join. The analytics engine stores Cloudflare's
 * `CF-IPCountry`, which is alpha-2 ("IN", "US", "DE"); the atlas keys every
 * shape by the ISO NUMERIC code ("356", "840", "276") and by a display name.
 * "in" is not "356" and is not "india", so without this table EVERY row from
 * the engine misses every shape and the map comes back empty — not wrong in
 * one corner, blank everywhere, which is what it did.
 *
 * All 249 assigned alpha-2 codes are here so a code never falls through
 * silently. Values are zero padded to three digits because that is how the
 * atlas writes them ("020", not "20").
 */
// prettier-ignore
const ALPHA2_TO_NUMERIC: Record<string, string> = {
	ad: '020', ae: '784', af: '004', ag: '028', ai: '660', al: '008', am: '051',
	ao: '024', aq: '010', ar: '032', as: '016', at: '040', au: '036', aw: '533',
	ax: '248', az: '031', ba: '070', bb: '052', bd: '050', be: '056', bf: '854',
	bg: '100', bh: '048', bi: '108', bj: '204', bl: '652', bm: '060', bn: '096',
	bo: '068', bq: '535', br: '076', bs: '044', bt: '064', bv: '074', bw: '072',
	by: '112', bz: '084', ca: '124', cc: '166', cd: '180', cf: '140', cg: '178',
	ch: '756', ci: '384', ck: '184', cl: '152', cm: '120', cn: '156', co: '170',
	cr: '188', cu: '192', cv: '132', cw: '531', cx: '162', cy: '196', cz: '203',
	de: '276', dj: '262', dk: '208', dm: '212', do: '214', dz: '012', ec: '218',
	ee: '233', eg: '818', eh: '732', er: '232', es: '724', et: '231', fi: '246',
	fj: '242', fk: '238', fm: '583', fo: '234', fr: '250', ga: '266', gb: '826',
	gd: '308', ge: '268', gf: '254', gg: '831', gh: '288', gi: '292', gl: '304',
	gm: '270', gn: '324', gp: '312', gq: '226', gr: '300', gs: '239', gt: '320',
	gu: '316', gw: '624', gy: '328', hk: '344', hm: '334', hn: '340', hr: '191',
	ht: '332', hu: '348', id: '360', ie: '372', il: '376', im: '833', in: '356',
	io: '086', iq: '368', ir: '364', is: '352', it: '380', je: '832', jm: '388',
	jo: '400', jp: '392', ke: '404', kg: '417', kh: '116', ki: '296', km: '174',
	kn: '659', kp: '408', kr: '410', kw: '414', ky: '136', kz: '398', la: '418',
	lb: '422', lc: '662', li: '438', lk: '144', lr: '430', ls: '426', lt: '440',
	lu: '442', lv: '428', ly: '434', ma: '504', mc: '492', md: '498', me: '499',
	mf: '663', mg: '450', mh: '584', mk: '807', ml: '466', mm: '104', mn: '496',
	mo: '446', mp: '580', mq: '474', mr: '478', ms: '500', mt: '470', mu: '480',
	mv: '462', mw: '454', mx: '484', my: '458', mz: '508', na: '516', nc: '540',
	ne: '562', nf: '574', ng: '566', ni: '558', nl: '528', no: '578', np: '524',
	nr: '520', nu: '570', nz: '554', om: '512', pa: '591', pe: '604', pf: '258',
	pg: '598', ph: '608', pk: '586', pl: '616', pm: '666', pn: '612', pr: '630',
	ps: '275', pt: '620', pw: '585', py: '600', qa: '634', re: '638', ro: '642',
	rs: '688', ru: '643', rw: '646', sa: '682', sb: '090', sc: '690', sd: '729',
	se: '752', sg: '702', sh: '654', si: '705', sj: '744', sk: '703', sl: '694',
	sm: '674', sn: '686', so: '706', sr: '740', ss: '728', st: '678', sv: '222',
	sx: '534', sy: '760', sz: '748', tc: '796', td: '148', tf: '260', tg: '768',
	th: '764', tj: '762', tk: '772', tl: '626', tm: '795', tn: '788', to: '776',
	tr: '792', tt: '780', tv: '798', tw: '158', tz: '834', ua: '804', ug: '800',
	um: '581', us: '840', uy: '858', uz: '860', va: '336', vc: '670', ve: '862',
	vg: '092', vi: '850', vn: '704', vu: '548', wf: '876', ws: '882', ye: '887',
	yt: '175', za: '710', zm: '894', zw: '716',
};

/**
 * Codes whose land the atlas draws inside another country's shape.
 *
 * Natural Earth has no separate polygon for Réunion or French Guiana — the
 * coordinates fall inside the France feature, and the same goes for Guadeloupe,
 * Martinique and Mayotte. Svalbard is inside Norway, Bonaire inside the
 * Netherlands, and Christmas and Cocos are the one shape Natural Earth calls
 * "Indian Ocean Ter.". Their own ISO numerics therefore key nothing, so a real
 * visitor from Réunion would drop out of the map entirely.
 *
 * Only consulted after `ALPHA2_TO_NUMERIC` finds no shape, so nothing here can
 * steal a hit from a country that has its own polygon. Values are whatever the
 * shape answers to — a numeric id, or a name where the shape has no id.
 */
const DRAWN_INSIDE: Record<string, string> = {
	gf: '250', // French Guiana
	gp: '250', // Guadeloupe
	mq: '250', // Martinique
	re: '250', // Réunion
	yt: '250', // Mayotte
	sj: '578', // Svalbard and Jan Mayen
	bq: '528', // Bonaire, Sint Eustatius and Saba
	cx: 'indian ocean ter.', // Christmas Island
	cc: 'indian ocean ter.', // Cocos (Keeling) Islands
};

/**
 * ISO 3166-1 alpha-3 to alpha-2.
 *
 * Deliberately not alpha-3 to numeric: routing through alpha-2 means alpha-3
 * inherits `DRAWN_INSIDE`, so REU lands on France exactly as RE does and the
 * two code systems can never drift apart.
 *
 * Nothing in the platform emits alpha-3 today — Cloudflare is alpha-2 — but
 * `USA` already resolved because it happened to sit in `ALIASES`, which made
 * alpha-3 look supported to anyone who tested with the US and then silently
 * dropped IND, DEU and GBR. Either all of them work or none should.
 *
 * Safe to try before the name table: no country name is three letters and no
 * numeric id is alphabetic, so an alpha-3 key can collide with nothing.
 */
// prettier-ignore
const ALPHA3_TO_ALPHA2: Record<string, string> = {
	abw: 'aw', afg: 'af', ago: 'ao', aia: 'ai', ala: 'ax', alb: 'al', and: 'ad',
	are: 'ae', arg: 'ar', arm: 'am', asm: 'as', ata: 'aq', atf: 'tf', atg: 'ag',
	aus: 'au', aut: 'at', aze: 'az', bdi: 'bi', bel: 'be', ben: 'bj', bes: 'bq',
	bfa: 'bf', bgd: 'bd', bgr: 'bg', bhr: 'bh', bhs: 'bs', bih: 'ba', blm: 'bl',
	blr: 'by', blz: 'bz', bmu: 'bm', bol: 'bo', bra: 'br', brb: 'bb', brn: 'bn',
	btn: 'bt', bvt: 'bv', bwa: 'bw', caf: 'cf', can: 'ca', cck: 'cc', che: 'ch',
	chl: 'cl', chn: 'cn', civ: 'ci', cmr: 'cm', cod: 'cd', cog: 'cg', cok: 'ck',
	col: 'co', com: 'km', cpv: 'cv', cri: 'cr', cub: 'cu', cuw: 'cw', cxr: 'cx',
	cym: 'ky', cyp: 'cy', cze: 'cz', deu: 'de', dji: 'dj', dma: 'dm', dnk: 'dk',
	dom: 'do', dza: 'dz', ecu: 'ec', egy: 'eg', eri: 'er', esh: 'eh', esp: 'es',
	est: 'ee', eth: 'et', fin: 'fi', fji: 'fj', flk: 'fk', fra: 'fr', fro: 'fo',
	fsm: 'fm', gab: 'ga', gbr: 'gb', geo: 'ge', ggy: 'gg', gha: 'gh', gib: 'gi',
	gin: 'gn', glp: 'gp', gmb: 'gm', gnb: 'gw', gnq: 'gq', grc: 'gr', grd: 'gd',
	grl: 'gl', gtm: 'gt', guf: 'gf', gum: 'gu', guy: 'gy', hkg: 'hk', hmd: 'hm',
	hnd: 'hn', hrv: 'hr', hti: 'ht', hun: 'hu', idn: 'id', imn: 'im', ind: 'in',
	iot: 'io', irl: 'ie', irn: 'ir', irq: 'iq', isl: 'is', isr: 'il', ita: 'it',
	jam: 'jm', jey: 'je', jor: 'jo', jpn: 'jp', kaz: 'kz', ken: 'ke', kgz: 'kg',
	khm: 'kh', kir: 'ki', kna: 'kn', kor: 'kr', kwt: 'kw', lao: 'la', lbn: 'lb',
	lbr: 'lr', lby: 'ly', lca: 'lc', lie: 'li', lka: 'lk', lso: 'ls', ltu: 'lt',
	lux: 'lu', lva: 'lv', mac: 'mo', maf: 'mf', mar: 'ma', mco: 'mc', mda: 'md',
	mdg: 'mg', mdv: 'mv', mex: 'mx', mhl: 'mh', mkd: 'mk', mli: 'ml', mlt: 'mt',
	mmr: 'mm', mne: 'me', mng: 'mn', mnp: 'mp', moz: 'mz', mrt: 'mr', msr: 'ms',
	mtq: 'mq', mus: 'mu', mwi: 'mw', mys: 'my', myt: 'yt', nam: 'na', ncl: 'nc',
	ner: 'ne', nfk: 'nf', nga: 'ng', nic: 'ni', niu: 'nu', nld: 'nl', nor: 'no',
	npl: 'np', nru: 'nr', nzl: 'nz', omn: 'om', pak: 'pk', pan: 'pa', pcn: 'pn',
	per: 'pe', phl: 'ph', plw: 'pw', png: 'pg', pol: 'pl', pri: 'pr', prk: 'kp',
	prt: 'pt', pry: 'py', pse: 'ps', pyf: 'pf', qat: 'qa', reu: 're', rou: 'ro',
	rus: 'ru', rwa: 'rw', sau: 'sa', sdn: 'sd', sen: 'sn', sgp: 'sg', sgs: 'gs',
	shn: 'sh', sjm: 'sj', slb: 'sb', sle: 'sl', slv: 'sv', smr: 'sm', som: 'so',
	spm: 'pm', srb: 'rs', ssd: 'ss', stp: 'st', sur: 'sr', svk: 'sk', svn: 'si',
	swe: 'se', swz: 'sz', sxm: 'sx', syc: 'sc', syr: 'sy', tca: 'tc', tcd: 'td',
	tgo: 'tg', tha: 'th', tjk: 'tj', tkl: 'tk', tkm: 'tm', tls: 'tl', ton: 'to',
	tto: 'tt', tun: 'tn', tur: 'tr', tuv: 'tv', twn: 'tw', tza: 'tz', uga: 'ug',
	ukr: 'ua', umi: 'um', ury: 'uy', usa: 'us', uzb: 'uz', vat: 'va', vct: 'vc',
	ven: 've', vgb: 'vg', vir: 'vi', vnm: 'vn', vut: 'vu', wlf: 'wf', wsm: 'ws',
	yem: 'ye', zaf: 'za', zmb: 'zm', zwe: 'zw',
};

/**
 * Everyday English names that the atlas does not use.
 *
 * Natural Earth abbreviates ("W. Sahara", "Bosnia and Herz.", "Dem. Rep.
 * Congo") and occasionally picks the less common of two names ("Macedonia",
 * "eSwatini", "Czechia"). Twenty-four ordinary names miss on a straight
 * comparison, so a caller emitting the names a person would write gets a map
 * with holes in it and no error to explain them.
 *
 * Keys are lowercased on lookup, so only the spelling matters here, not case.
 */
const ALIASES: Record<string, string> = {
	'united states': 'United States of America',
	usa: 'United States of America',
	'russian federation': 'Russia',
	'viet nam': 'Vietnam',
	burma: 'Myanmar',
	'north macedonia': 'Macedonia',
	eswatini: 'eSwatini',
	swaziland: 'eSwatini',
	'east timor': 'Timor-Leste',
	'czech republic': 'Czechia',
	'ivory coast': "Côte d'Ivoire",
	"cote d'ivoire": "Côte d'Ivoire",
	turkiye: 'Turkey',
	'bosnia and herzegovina': 'Bosnia and Herz.',
	'western sahara': 'W. Sahara',
	'democratic republic of the congo': 'Dem. Rep. Congo',
	'dr congo': 'Dem. Rep. Congo',
	'republic of the congo': 'Congo',
	'south sudan': 'S. Sudan',
	'solomon islands': 'Solomon Is.',
	'falkland islands': 'Falkland Is.',
	'equatorial guinea': 'Eq. Guinea',
	'dominican republic': 'Dominican Rep.',
	'central african republic': 'Central African Rep.',
	'northern cyprus': 'N. Cyprus',
	'french southern and antarctic lands': 'Fr. S. Antarctic Lands',
	'united kingdom of great britain and northern ireland': 'United Kingdom',
	'korea, republic of': 'South Korea',
	"korea, democratic people's republic of": 'North Korea',
	"lao people's democratic republic": 'Laos',
	'syrian arab republic': 'Syria',
	'iran, islamic republic of': 'Iran',
	'tanzania, united republic of': 'Tanzania',
	'republic of moldova': 'Moldova',
	'bolivia, plurinational state of': 'Bolivia',
	'venezuela, bolivarian republic of': 'Venezuela',
	'brunei darussalam': 'Brunei',

	// Names people and other data sources actually write, which the atlas and
	// the ISO long forms above both miss.
	türkiye: 'Turkey', // ICU's English name carries the umlaut; `turkiye` above does not
	uae: 'United Arab Emirates',
	holland: 'Netherlands',
	'the netherlands': 'Netherlands',
	macau: 'Macao',
	'cape verde': 'Cabo Verde',
	bosnia: 'Bosnia and Herz.',
	// Abbreviation expansion cannot reach these: the atlas spells the word
	// differently ("Faeroe"), accents it, or drops words the real name has.
	'faroe islands': 'Faeroe Is.',
	'sao tome and principe': 'São Tomé and Principe',
	'saint vincent and the grenadines': 'St. Vin. and Gren.',
	'south georgia and the south sandwich islands': 'S. Geo. and the Is.',
	'british indian ocean territory': 'Br. Indian Ocean Ter.',
	'french southern territories': 'Fr. S. Antarctic Lands',
	'u.s.a.': 'United States of America',
	'u.s.': 'United States of America',
	'united states of america': 'United States of America',
	'vatican city': 'Vatican',
	'holy see': 'Vatican',
	// The four are not the same thing as the UK, but a country choropleth has
	// exactly one shape covering them, and dropping the row is worse than
	// pointing at the shape their land is drawn in.
	britain: 'United Kingdom',
	'great britain': 'United Kingdom',
	england: 'United Kingdom',
	scotland: 'United Kingdom',
	wales: 'United Kingdom',
	'northern ireland': 'United Kingdom',
	// Not ISO — Cloudflare says GB — but the commonest code a person types by
	// hand, and it costs one line to not lose the country.
	uk: 'United Kingdom',
	// Kosovo has no ISO numeric and Natural Earth gives its feature no id at
	// all, so the name is the only key it has. Cloudflare sends the
	// user-assigned XK.
	xk: 'Kosovo',
};

/**
 * Everything one country can be called, lowercased.
 *
 * The join is the whole problem with a choropleth. A feature answers to Natural
 * Earth's own display name, which is not always the name anyone else uses
 * ("United States of America", "W. Sahara", "Dem. Rep. Congo"), and to its ISO
 * numeric id. It does NOT answer to an alpha-2 code — that translation happens
 * on the caller's label in `resolve`, because two of these shapes have no id to
 * derive a code from and seven codes share a shape with their parent.
 */
function keysOf(f: CountryFeature): Array<string> {
	const keys: Array<string> = [];
	const name = f.properties?.name;
	if (name) keys.push(normalize(name));
	if (f.id !== undefined && f.id !== null) keys.push(normalize(String(f.id)));
	return keys;
}

/**
 * How Natural Earth shortens a word, and what it was.
 *
 * 31 of the 241 shapes are abbreviated, so "Cayman Islands", "Antigua and
 * Barbuda" and "Northern Mariana Islands" — the names anyone would actually
 * write — all miss. Expanding the atlas's tokens covers those 31 with 18
 * entries instead of 31 aliases, and keeps covering them if the atlas adds more.
 *
 * Some shorthands stand for two words ("N." is North in one name and Northern
 * in another), so a token can offer several expansions and `expansionsOf`
 * emits every combination.
 */
const ABBREVIATIONS: Record<string, Array<string>> = {
	'is.': ['islands'],
	'i.': ['island'],
	'st.': ['saint'],
	'n.': ['north', 'northern'],
	's.': ['south', 'southern'],
	'w.': ['west', 'western'],
	'e.': ['east', 'eastern'],
	'eq.': ['equatorial'],
	'fr.': ['french'],
	'br.': ['british'],
	'dem.': ['democratic'],
	'rep.': ['republic'],
	'ter.': ['territory', 'territories'],
	'geo.': ['georgia'],
	'herz.': ['herzegovina'],
	'gren.': ['grenadines'],
	'vin.': ['vincent'],
	'barb.': ['barbuda'],
	'u.s.': ['us', 'united states'],
};

/** Longest first, so a run of abbreviations cannot blow up the candidate list. */
const MAX_EXPANSIONS = 8;

/**
 * Plain-English readings of an abbreviated atlas name, or nothing.
 *
 * Returns `[]` for a name with no abbreviation in it, which is 210 of the 241
 * shapes, so this costs almost nothing on the common path.
 */
function expansionsOf(name: string): Array<string> {
	const words = normalize(name).split(/\s+/);
	if (!words.some(w => ABBREVIATIONS[w])) return [];

	let variants: Array<Array<string>> = [[]];
	for (const w of words) {
		const options = ABBREVIATIONS[w] ?? [w];
		const next: Array<Array<string>> = [];
		for (const v of variants)
			for (const o of options) if (next.length < MAX_EXPANSIONS) next.push([...v, o]);
		variants = next;
	}
	return variants.map(v => v.join(' '));
}

/**
 * The one spelling every key and every lookup is reduced to.
 *
 * NFC matters as much as the case folding: "Côte d'Ivoire" and "Türkiye" can
 * arrive with the accent as a separate combining mark, and a decomposed "ü" is
 * a different string from a precomposed one no matter how identical they look
 * in a diff. Both sides of the comparison go through here, so the tables can be
 * written the readable way.
 */
function normalize(s: string): string {
	return s.trim().toLowerCase().normalize('NFC');
}

/** `ALIASES` with its keys normalized the same way a caller's label will be. */
const ALIAS_LOOKUP: Map<string, string> = new Map(
	Object.entries(ALIASES).map(([k, v]) => [normalize(k), v]),
);

/**
 * Find the shape a caller's label means, or nothing.
 *
 * Tried in order, and the order matters: a name or id the atlas already knows
 * wins outright, so nothing below can shadow a real shape. Only then is the
 * label read as a code — alpha-2, or alpha-3 translated to alpha-2 so both
 * reach `DRAWN_INSIDE` by the same path and can never disagree — and last as an
 * everyday name from `ALIASES`.
 *
 * A label that matches nothing is not an error and not a zero — it is a country
 * the map has no shape for, and the caller counts it in `unmatched` so it can
 * say so rather than paint a hole.
 */
function resolve(byKey: Map<string, CountryFeature>, raw: string): CountryFeature | undefined {
	const key = normalize(raw);
	if (!key) return undefined;

	const direct = byKey.get(key);
	if (direct) return direct;

	// A bare numeric written without the atlas's zero padding ("20" for
	// Andorra) is the same country as "020".
	if (/^\d{1,3}$/.test(key)) {
		const padded = byKey.get(key.padStart(3, '0'));
		if (padded) return padded;
	}

	// alpha-3 is answered by translating it to alpha-2 and falling through, not
	// by a table of its own: one join to keep correct instead of two.
	const code = key.length === 2 ? key : ALPHA3_TO_ALPHA2[key];
	const numeric = code ? ALPHA2_TO_NUMERIC[code] : undefined;
	if (code && numeric) {
		const byCode = byKey.get(numeric);
		if (byCode) return byCode;
		const parent = DRAWN_INSIDE[code];
		if (parent) return byKey.get(parent);
	}

	const alias = ALIAS_LOOKUP.get(key);
	return alias ? byKey.get(normalize(alias)) : undefined;
}

/** sRGB interpolation between two hex colours. */
function mix(low: string, high: string, t: number): string {
	const parse = (h: string) => {
		const s = h.replace('#', '');
		const n =
			s.length === 3
				? s
						.split('')
						.map(c => c + c)
						.join('')
				: s;
		return [
			Number.parseInt(n.slice(0, 2), 16),
			Number.parseInt(n.slice(2, 4), 16),
			Number.parseInt(n.slice(4, 6), 16),
		];
	};
	const [r1, g1, b1] = parse(low);
	const [r2, g2, b2] = parse(high);
	const c = Math.min(1, Math.max(0, t));
	const to = (a: number, b: number) => Math.round(a + (b - a) * c);
	return `rgb(${to(r1, r2)}, ${to(g1, g2)}, ${to(b1, b2)})`;
}

export interface GeoBuild {
	data: any;
	/** Labels that matched no shape on the map. */
	unmatched: Array<string>;
}

/**
 * Turn `{x: country, y: value}` points into a choropleth dataset.
 *
 * Every shape in the atlas is emitted, not just the ones with data: a map
 * showing only the countries that had traffic is a map of unrecognisable
 * fragments. Countries with no data get a null value, which the colour scale
 * paints in `noDataColor`.
 */
export function buildGeoData(
	features: Array<CountryFeature>,
	points: Array<{ x: any; y: any }>,
	label: string,
): GeoBuild {
	// Two passes, and they cannot be merged. Every real name and id is claimed
	// first so that a guessed expansion of one country can never take a key that
	// is another country's actual name.
	const byKey = new Map<string, CountryFeature>();
	for (const f of features) for (const k of keysOf(f)) if (!byKey.has(k)) byKey.set(k, f);
	for (const f of features)
		for (const k of expansionsOf(f.properties?.name ?? '')) if (!byKey.has(k)) byKey.set(k, f);

	const valueOf = new Map<CountryFeature, number>();
	const unmatched: Array<string> = [];
	for (const p of points) {
		const raw = p?.x;
		if (raw === undefined || raw === null || raw === '') continue;
		const f = resolve(byKey, String(raw));
		if (!f) {
			unmatched.push(String(raw));
			continue;
		}
		// Summed rather than replaced: two labels can land on one shape once
		// aliases are in play, and a map that shows the last of them is wrong in
		// a way nobody can see.
		const n = Number(p.y) || 0;
		valueOf.set(f, (valueOf.get(f) ?? 0) + n);
	}

	return {
		unmatched,
		data: {
			labels: features.map(f => f.properties?.name ?? String(f.id ?? '')),
			datasets: [
				{
					label,
					outline: features,
					data: features.map(f => ({
						feature: f,
						value: valueOf.has(f) ? valueOf.get(f) : null,
					})),
				},
			],
		},
	};
}

export interface GeoOptionOverrides {
	projection: string;
	lowColor: string;
	highColor: string;
	noDataColor: string;
	borderColor: string;
	showLegend: boolean;
}

/**
 * Options for the choropleth.
 *
 * The colour scale is a SEQUENTIAL ramp — one hue, light to dark — because a
 * choropleth encodes magnitude, not identity. The categorical palette the rest
 * of the charts use would be a rainbow map, where a reader cannot tell which of
 * two colours means "more".
 */
export function buildGeoOptions(o: GeoOptionOverrides): any {
	return {
		responsive: true,
		maintainAspectRatio: false,
		showOutline: true,
		showGraticule: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: any) => {
						const name = ctx.chart.data.labels?.[ctx.dataIndex] ?? '';
						const v = ctx.raw?.value;
						// A country with no rows reads as "no data", never as 0:
						// the engine did not say nobody visited, it said nothing.
						return `${name}: ${v === null || v === undefined ? 'no data' : v}`;
					},
				},
			},
		},
		scales: {
			projection: { axis: 'x', projection: o.projection },
			color: {
				axis: 'x',
				quantize: 5,
				missing: o.noDataColor,
				interpolate: (v: number) => mix(o.lowColor, o.highColor, v),
				// The scale is hidden with `display`, NEVER with `legend: false`.
				// The plugin destructures `legend.margin` unconditionally on draw,
				// so a false there throws "Cannot read properties of undefined
				// (reading 'left')" and takes the page down. The legend object
				// below therefore always exists, and carries every key the
				// plugin's own default has, because this REPLACES that default
				// rather than merging with it.
				display: o.showLegend,
				legend: {
					align: 'right',
					position: 'bottom-right',
					length: 90,
					width: 40,
					margin: 8,
					indicatorWidth: 10,
				},
			},
		},
		elements: {
			geoFeature: {
				outlineBorderColor: o.borderColor,
				outlineBorderWidth: 0.5,
				borderColor: o.borderColor,
				borderWidth: 0.5,
			},
		},
	};
}
