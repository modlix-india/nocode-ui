import { PRESET_SCHEME, derivePalette, hslToHex, parseColor, schemeThemeColor } from '../palette';

describe('schemeThemeColor', () => {
	it('maps each platform scheme onto the theme colour the rest of the platform uses', () => {
		// Button, CheckBox and the others key _primary to backgroundColorOne,
		// which is itself <colorOne>. A scene picking a different colour for
		// the same scheme would put a hero out of step with the buttons on it.
		expect(schemeThemeColor('_primary')).toBe('<colorOne>');
		expect(schemeThemeColor('_secondary')).toBe('<colorTwo>');
		expect(schemeThemeColor('_tertiary')).toBe('<colorThree>');
		expect(schemeThemeColor('_quaternary')).toBe('<colorFour>');
		expect(schemeThemeColor('_quinary')).toBe('<colorFive>');
	});

	it('gives the preset scheme no colour at all, which is what leaves a scene alone', () => {
		expect(schemeThemeColor(PRESET_SCHEME)).toBeUndefined();
		expect(schemeThemeColor(undefined)).toBeUndefined();
		expect(schemeThemeColor('')).toBeUndefined();
	});

	it('does not invent a colour for a scheme it does not know', () => {
		expect(schemeThemeColor('_senary')).toBeUndefined();
	});
});

describe('parseColor', () => {
	it('reads every hex length', () => {
		expect(parseColor('#fff')).toMatchObject({ s: 0, l: 1 });
		expect(parseColor('#000000')).toMatchObject({ s: 0, l: 0 });
		expect(parseColor('#ff000080')?.a).toBeCloseTo(0.502, 2);
		expect(parseColor('#f008')?.a).toBeCloseTo(0.533, 2);
	});

	it('reads the rgb forms the platform colour picker actually emits', () => {
		// The picker writes `rgb(94, 192, 164)`. A pattern that only matched
		// hex is exactly how these colours were silently dropped before.
		const commas = parseColor('rgb(94, 192, 164)');
		const spaces = parseColor('rgb(94 192 164)');
		expect(commas).toBeDefined();
		expect(spaces).toEqual(commas);
		expect(parseColor('rgba(94, 192, 164, 0.5)')?.a).toBeCloseTo(0.5);
		expect(parseColor('rgb(94 192 164 / 50%)')?.a).toBeCloseTo(0.5);
	});

	it('reads a percentage channel against its own range, not as a bare number', () => {
		const pct = parseColor('rgb(100%, 0%, 0%)');
		expect(pct?.h).toBeCloseTo(0);
		expect(pct?.l).toBeCloseTo(0.5);
	});

	it('reads hsl and wraps a hue that has gone round', () => {
		expect(parseColor('hsl(120, 50%, 40%)')).toMatchObject({ h: 120 });
		expect(parseColor('hsl(480, 50%, 40%)')?.h).toBeCloseTo(120);
		expect(parseColor('hsl(-60 50% 40%)')?.h).toBeCloseTo(300);
	});

	it('returns undefined rather than guessing at something it cannot read', () => {
		// A named colour is a real gap, and saying so is the point: the caller
		// then keeps the preset's colours instead of rendering a black scene.
		expect(parseColor('rebeccapurple')).toBeUndefined();
		expect(parseColor('#ff')).toBeUndefined();
		expect(parseColor('rgb(1, 2)')).toBeUndefined();
		expect(parseColor('rgb(a, b, c)')).toBeUndefined();
		expect(parseColor('')).toBeUndefined();
		expect(parseColor(undefined)).toBeUndefined();
		expect(parseColor(42 as any)).toBeUndefined();
	});
});

describe('hslToHex', () => {
	it('round-trips the six hue corners', () => {
		for (const hex of ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff']) {
			expect(hslToHex(parseColor(hex)!)).toBe(hex);
		}
	});

	it('round-trips an arbitrary colour without drifting', () => {
		expect(hslToHex(parseColor('#52bd94')!)).toBe('#52bd94');
		expect(hslToHex(parseColor('rgb(94, 192, 164)')!)).toBe('#5ec0a4');
	});
});

describe('derivePalette', () => {
	const base = '#52bd94';

	it('keeps the brand colour itself as the middle tone', () => {
		// The scene has to still LOOK like the chosen colour. Three shades of
		// it with the original missing is a different colour.
		expect(derivePalette(base)!.b).toBe(base);
	});

	it('moves lightness only, so a derived palette stays on the theme hue', () => {
		const p = derivePalette(base)!;
		const h = (c: string) => parseColor(c)!.h;
		// Within a degree or two rather than exact: the shades round through
		// 8-bit channels on the way out, and a dark one has fewer of them to
		// land on. A hue SHIFT would be tens of degrees, not fractions.
		expect(Math.abs(h(p.a) - h(base))).toBeLessThan(2);
		expect(Math.abs(h(p.c) - h(base))).toBeLessThan(2);
	});

	it('orders the three from deep to bright', () => {
		const p = derivePalette(base)!;
		const l = (c: string) => parseColor(c)!.l;
		expect(l(p.a)).toBeLessThan(l(p.b));
		expect(l(p.b)).toBeLessThan(l(p.c));
	});

	it('never lets the deep end reach black', () => {
		// A gradient against pure black is indistinguishable from a canvas
		// that failed to render, which is the worst thing a scene can look
		// like: nothing reports an error.
		const p = derivePalette('#000000')!;
		expect(parseColor(p.a)!.l).toBeGreaterThan(0.05);
	});

	it('still separates the tones for a colour already at an extreme', () => {
		for (const c of ['#ffffff', '#000000', '#808080']) {
			const p = derivePalette(c)!;
			expect(new Set([p.a, p.b, p.c]).size).toBe(3);
		}
	});

	it('gives nothing back for a colour it cannot read', () => {
		expect(derivePalette('rebeccapurple')).toBeUndefined();
		expect(derivePalette(undefined)).toBeUndefined();
	});
});
