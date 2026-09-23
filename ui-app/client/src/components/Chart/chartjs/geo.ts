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
	ChartJS.register(
		geo.ChoroplethController,
		geo.GeoFeature,
		geo.ColorScale,
		geo.ProjectionScale,
	);
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
	'ivory coast': 'Côte d\'Ivoire',
	"cote d'ivoire": 'Côte d\'Ivoire',
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
	'lao people\'s democratic republic': 'Laos',
	'syrian arab republic': 'Syria',
	'iran, islamic republic of': 'Iran',
	'tanzania, united republic of': 'Tanzania',
	'republic of moldova': 'Moldova',
	'bolivia, plurinational state of': 'Bolivia',
	'venezuela, bolivarian republic of': 'Venezuela',
	'brunei darussalam': 'Brunei',
};

/**
 * Everything one country can be called, lowercased.
 *
 * The join is the whole problem with a choropleth. The analytics engine stores
 * whatever Cloudflare's `CF-IPCountry` header said, which is an ISO 3166-1
 * alpha-2 code; the atlas knows each shape by a numeric ISO code and by Natural
 * Earth's own display name, which is not always the name anyone else uses
 * ("United States of America", "W. Sahara", "Dem. Rep. Congo"). So rather than
 * pick one and silently drop everything that does not match, a feature answers
 * to every key it has and the caller's label is tried against all of them.
 *
 * A label that matches nothing is not an error and not a zero — it is a country
 * the map has no shape for, and it is counted so `unmatched` can say so.
 */
function keysOf(f: CountryFeature): Array<string> {
	const keys: Array<string> = [];
	const name = f.properties?.name;
	if (name) keys.push(name.trim().toLowerCase());
	if (f.id !== undefined && f.id !== null) keys.push(String(f.id).trim().toLowerCase());
	return keys;
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
	const byKey = new Map<string, CountryFeature>();
	for (const f of features) for (const k of keysOf(f)) if (!byKey.has(k)) byKey.set(k, f);

	const valueOf = new Map<CountryFeature, number>();
	const unmatched: Array<string> = [];
	for (const p of points) {
		const raw = p?.x;
		if (raw === undefined || raw === null || raw === '') continue;
		const key = String(raw).trim().toLowerCase();
		// Straight match first, then the alias table. An alias never shadows a
		// real atlas name, so a caller already speaking Natural Earth is
		// unaffected by anything added to ALIASES.
		const f = byKey.get(key) ?? byKey.get((ALIASES[key] ?? '').toLowerCase());
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
