/**
 * @jest-environment jsdom
 *
 * The choropleth's join, which is the only part of the map that can be wrong
 * without looking wrong: a label that matches no shape leaves the country
 * unpainted, and an unpainted country is indistinguishable from a country
 * nobody visited. The analytics engine stores Cloudflare's `CF-IPCountry`, so
 * alpha-2 is the case that actually ships.
 */
import { buildGeoData, CountryFeature } from '../geo';

/** Shaped exactly like the world-atlas features: numeric id, one name. */
const feature = (id: string | undefined, name: string): CountryFeature => ({
	id,
	properties: { name },
});

const FEATURES: Array<CountryFeature> = [
	feature('356', 'India'),
	feature('840', 'United States of America'),
	feature('276', 'Germany'),
	feature('250', 'France'),
	feature('578', 'Norway'),
	feature('020', 'Andorra'),
	feature('180', 'Dem. Rep. Congo'),
	feature('792', 'Turkey'),
	feature('784', 'United Arab Emirates'),
	feature('528', 'Netherlands'),
	feature('826', 'United Kingdom'),
	feature('446', 'Macao'),
	feature('132', 'Cabo Verde'),
	feature('136', 'Cayman Is.'),
	feature('028', 'Antigua and Barb.'),
	feature('580', 'N. Mariana Is.'),
	feature('850', 'U.S. Virgin Is.'),
	feature('178', 'Congo'),
	feature(undefined, 'Kosovo'),
	feature(undefined, 'Indian Ocean Ter.'),
];

const valuesByName = (points: Array<{ x: any; y: any }>) => {
	const built = buildGeoData(FEATURES, points, 'Visitors');
	const out: Record<string, number | null> = {};
	built.data.datasets[0].data.forEach((d: any, i: number) => {
		const v = d.value;
		if (v !== null && v !== undefined) out[built.data.labels[i]] = v;
	});
	return { values: out, unmatched: built.unmatched };
};

describe('buildGeoData country join', () => {
	it('maps Cloudflare alpha-2 codes onto the atlas shapes', () => {
		const { values, unmatched } = valuesByName([
			{ x: 'IN', y: 12 },
			{ x: 'US', y: 7 },
			{ x: 'DE', y: 3 },
		]);
		expect(values).toEqual({ India: 12, 'United States of America': 7, Germany: 3 });
		expect(unmatched).toEqual([]);
	});

	it('accepts lowercase and padded codes', () => {
		const { values } = valuesByName([{ x: 'in' }, { x: ' de ' }].map(p => ({ ...p, y: 1 })));
		expect(values).toEqual({ India: 1, Germany: 1 });
	});

	it('still matches atlas names and numeric ids', () => {
		const { values, unmatched } = valuesByName([
			{ x: 'Germany', y: 1 },
			{ x: '356', y: 2 },
			{ x: 'Kosovo', y: 3 },
		]);
		expect(values).toEqual({ Germany: 1, India: 2, Kosovo: 3 });
		expect(unmatched).toEqual([]);
	});

	it('matches a numeric id written without the atlas zero padding', () => {
		expect(valuesByName([{ x: '20', y: 5 }]).values).toEqual({ Andorra: 5 });
	});

	it('resolves Kosovo from XK, which has no ISO numeric', () => {
		expect(valuesByName([{ x: 'XK', y: 4 }]).values).toEqual({ Kosovo: 4 });
	});

	it('folds dependencies onto the shape that actually draws their land', () => {
		// Natural Earth has no Réunion or Guadeloupe polygon; those coordinates
		// are inside France. Dropping them would lose real visitors.
		const { values, unmatched } = valuesByName([
			{ x: 'FR', y: 10 },
			{ x: 'RE', y: 2 },
			{ x: 'GP', y: 1 },
			{ x: 'SJ', y: 5 },
			{ x: 'CX', y: 6 },
		]);
		expect(values).toEqual({ France: 13, Norway: 5, 'Indian Ocean Ter.': 6 });
		expect(unmatched).toEqual([]);
	});

	it('keeps the everyday-name aliases working', () => {
		const { values } = valuesByName([
			{ x: 'United States', y: 1 },
			{ x: 'DR Congo', y: 2 },
		]);
		expect(values).toEqual({ 'United States of America': 1, 'Dem. Rep. Congo': 2 });
	});

	it('never lets an alias or code shadow a real atlas name', () => {
		// "Germany" is a real shape name; it must win before any table is read.
		expect(valuesByName([{ x: 'Germany', y: 9 }]).values).toEqual({ Germany: 9 });
	});

	it('maps alpha-3 codes, not just the one that used to work by accident', () => {
		// USA resolved before this table existed because it sat in ALIASES, which
		// made alpha-3 look supported and then dropped IND and DEU.
		const { values, unmatched } = valuesByName([
			{ x: 'IND', y: 1 },
			{ x: 'DEU', y: 2 },
			{ x: 'USA', y: 3 },
			{ x: 'FRA', y: 4 },
		]);
		expect(values).toEqual({
			India: 1,
			Germany: 2,
			'United States of America': 3,
			France: 4,
		});
		expect(unmatched).toEqual([]);
	});

	it('gives alpha-3 the same answer as alpha-2, including the folded ones', () => {
		// REU has no shape of its own, so it must reach France by the same path RE
		// does rather than fall out.
		expect(valuesByName([{ x: 'REU', y: 2 }]).values).toEqual({ France: 2 });
		expect(valuesByName([{ x: 'reu', y: 2 }]).values).toEqual(
			valuesByName([{ x: 'RE', y: 2 }]).values,
		);
	});

	it('matches an accented name whichever way the accent is encoded', () => {
		// 'Türkiye' composed vs. decomposed are different strings that look
		// identical. Built from code points rather than written out, because a
		// formatter or an editor would otherwise silently unify the two and the
		// test would stop testing anything.
		const nfc = 'T' + String.fromCharCode(0xfc) + 'rkiye';
		const nfd = 'Tu' + String.fromCharCode(0x308) + 'rkiye';
		expect(nfc).not.toEqual(nfd);
		expect(valuesByName([{ x: nfc, y: 1 }]).unmatched).toEqual([]);
		expect(valuesByName([{ x: nfd, y: 1 }]).unmatched).toEqual([]);
	});

	it('expands the atlas abbreviations so plain English lands', () => {
		const { values, unmatched } = valuesByName([
			{ x: 'Cayman Islands', y: 1 },
			{ x: 'Antigua and Barbuda', y: 2 },
			{ x: 'Northern Mariana Islands', y: 3 },
			{ x: 'United States Virgin Islands', y: 4 },
			{ x: 'Dem. Rep. Congo', y: 5 },
		]);
		expect(values).toEqual({
			'Cayman Is.': 1,
			'Antigua and Barb.': 2,
			'N. Mariana Is.': 3,
			'U.S. Virgin Is.': 4,
			'Dem. Rep. Congo': 5,
		});
		expect(unmatched).toEqual([]);
	});

	it('never lets an expansion claim a real name belonging to another shape', () => {
		// "Dem. Rep. Congo" expands to a string containing "congo"; the shape
		// actually NAMED Congo must still win its own name.
		expect(valuesByName([{ x: 'Congo', y: 1 }]).values).toEqual({ Congo: 1 });
	});

	it('accepts the everyday names people and other sources actually write', () => {
		const { unmatched } = valuesByName(
			['UAE', 'Holland', 'Britain', 'England', 'Macau', 'Cape Verde', 'U.S.A.'].map(x => ({
				x,
				y: 1,
			})),
		);
		expect(unmatched).toEqual([]);
	});

	it('sums labels that land on the same shape rather than overwriting', () => {
		expect(
			valuesByName([
				{ x: 'IN', y: 2 },
				{ x: 'India', y: 3 },
			]).values,
		).toEqual({
			India: 5,
		});
	});

	it('reports a label it cannot place instead of painting it somewhere', () => {
		const { values, unmatched } = valuesByName([
			{ x: 'XX', y: 5 },
			{ x: 'T1', y: 2 },
			{ x: 'IN', y: 1 },
		]);
		expect(values).toEqual({ India: 1 });
		expect(unmatched).toEqual(['XX', 'T1']);
	});

	it('leaves a country with no rows null, not zero', () => {
		const built = buildGeoData(FEATURES, [{ x: 'IN', y: 4 }], 'Visitors');
		const germany = built.data.datasets[0].data[built.data.labels.indexOf('Germany')];
		expect(germany.value).toBeNull();
	});
});
