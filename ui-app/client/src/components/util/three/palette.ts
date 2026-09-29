/**
 * Turning a colour scheme into the colours a scene can actually use.
 *
 * Every component in the platform carries a `colorScheme`, and for an ordinary
 * component it does its work through CSS: the scheme becomes a class on the
 * root (`._primary`), and the theme's style properties key off it. A canvas has
 * no such surface. A class on the container cannot reach a uniform inside a
 * fragment shader, so on the four scene components the control sat in the
 * property panel doing nothing at all.
 *
 * This is the missing half. The scheme names a theme colour -- the same
 * mapping every other component uses, `_primary` to Colour One, `_secondary` to
 * Colour Two and so on -- and the scene builds its palette around that one
 * colour by shading it. One brand colour in, three related colours out, so a
 * gradient still reads as a gradient rather than three flat repeats.
 *
 * Deriving rather than naming three separate theme variables is deliberate. The
 * platform palette is fourteen unrelated hues, not families, so "Colour One,
 * Two and Three" would hand a green, a dark green and a yellow to any scene set
 * to Primary. Shading one colour gives a result that holds together under any
 * theme, including one nobody has written yet.
 *
 * Pure, and imports nothing -- not three, not the store -- so it is testable on
 * its own. Resolving the theme variable to a value is the impure half and lives
 * in themeColor.ts.
 */

/**
 * `_preset` is not a platform colour scheme. It is this family's extra one, and
 * it means "leave the scene's own colours alone", which is what every scene
 * preset was tuned for. It is the default precisely so that turning the control
 * on is a choice somebody makes rather than a change that arrives on its own.
 */
export const PRESET_SCHEME = '_preset';

/** Which theme colour each scheme takes as its base. */
export const SCHEME_THEME_COLOR: Readonly<Record<string, string>> = {
	_primary: '<colorOne>',
	_secondary: '<colorTwo>',
	_tertiary: '<colorThree>',
	_quaternary: '<colorFour>',
	_quinary: '<colorFive>',
};

/** The theme variable a scheme reads, or undefined for `_preset` / anything unknown. */
export function schemeThemeColor(scheme: string | undefined): string | undefined {
	if (!scheme || scheme === PRESET_SCHEME) return undefined;
	return SCHEME_THEME_COLOR[scheme];
}

export interface Hsl {
	h: number;
	s: number;
	l: number;
	a: number;
}

const HEX = /^#([0-9a-f]{3,8})$/i;
const FUNC = /^(rgba?|hsla?)\(([^)]*)\)$/i;

/** Split `rgb(1 2 3 / 40%)` and `rgb(1, 2, 3, 0.4)` alike into their parts. */
function splitArgs(body: string): string[] {
	return body
		.replace('/', ' ')
		.split(/[\s,]+/)
		.map(s => s.trim())
		.filter(Boolean);
}

function num(token: string, scale: number): number {
	// A percentage is relative to the channel's own range, so `50%` is half of
	// 255 for rgb and half of 1 for alpha. Reading it as the bare 50 either
	// blows the channel out or makes a half-transparent colour opaque.
	if (token.endsWith('%')) return (parseFloat(token) / 100) * scale;
	return parseFloat(token);
}

function rgbToHsl(r: number, g: number, b: number, a: number): Hsl {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	const d = max - min;
	if (d === 0) return { h: 0, s: 0, l, a };
	const s = d / (1 - Math.abs(2 * l - 1));
	let h: number;
	if (max === rn) h = ((gn - bn) / d) % 6;
	else if (max === gn) h = (bn - rn) / d + 2;
	else h = (rn - gn) / d + 4;
	h *= 60;
	if (h < 0) h += 360;
	return { h, s, l, a };
}

/**
 * A CSS colour as HSL, or undefined if it is not one this understands.
 *
 * Undefined rather than a guess: a colour that cannot be read is the caller's
 * cue to leave the scene's own colours in place. Substituting black here would
 * turn a theme nobody could parse into a scene nobody can see.
 */
export function parseColor(value: string | undefined): Hsl | undefined {
	if (!value || typeof value !== 'string') return undefined;
	const v = value.trim().toLowerCase();

	const hex = HEX.exec(v);
	if (hex) {
		const h = hex[1];
		const expand = (c: string) => parseInt(c.length === 1 ? c + c : c, 16);
		if (h.length === 3 || h.length === 4) {
			return rgbToHsl(
				expand(h[0]),
				expand(h[1]),
				expand(h[2]),
				h.length === 4 ? expand(h[3]) / 255 : 1,
			);
		}
		if (h.length === 6 || h.length === 8) {
			return rgbToHsl(
				expand(h.slice(0, 2)),
				expand(h.slice(2, 4)),
				expand(h.slice(4, 6)),
				h.length === 8 ? expand(h.slice(6, 8)) / 255 : 1,
			);
		}
		return undefined;
	}

	const fn = FUNC.exec(v);
	if (!fn) return undefined;
	const kind = fn[1];
	const args = splitArgs(fn[2]);
	if (args.length < 3) return undefined;
	if (kind === 'rgb' || kind === 'rgba') {
		const [r, g, b] = [num(args[0], 255), num(args[1], 255), num(args[2], 255)];
		if ([r, g, b].some(n => Number.isNaN(n))) return undefined;
		const a = args.length > 3 ? num(args[3], 1) : 1;
		return rgbToHsl(r, g, b, Number.isNaN(a) ? 1 : a);
	}
	const h = parseFloat(args[0]);
	const s = num(args[1], 1);
	const l = num(args[2], 1);
	if ([h, s, l].some(n => Number.isNaN(n))) return undefined;
	const a = args.length > 3 ? num(args[3], 1) : 1;
	return {
		h: ((h % 360) + 360) % 360,
		s: Math.min(1, Math.max(0, s)),
		l: Math.min(1, Math.max(0, l)),
		a: Number.isNaN(a) ? 1 : a,
	};
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** HSL back to `#rrggbb`. Alpha is dropped: a shader uniform is a vec3. */
export function hslToHex({ h, s, l }: Hsl): string {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	const seg = Math.floor((((h % 360) + 360) % 360) / 60) % 6;
	const table: Array<[number, number, number]> = [
		[c, x, 0],
		[x, c, 0],
		[0, c, x],
		[0, x, c],
		[x, 0, c],
		[c, 0, x],
	];
	const [r, g, b] = table[seg];
	const hex = (n: number) =>
		Math.round(clamp01(n + m) * 255)
			.toString(16)
			.padStart(2, '0');
	return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export interface ScenePalette {
	/** The deep end. Backdrops, the far side of a gradient. */
	a: string;
	/** The brand colour itself, unshaded. */
	b: string;
	/** The bright end. Crests, highlights, the near side of a gradient. */
	c: string;
}

/**
 * Three related colours from one.
 *
 * The middle one is the brand colour untouched, so a scene set to a scheme
 * still visibly IS that colour rather than a pair of shades of it. The other
 * two move lightness only and leave hue alone, which is what keeps a derived
 * palette on-brand: shifting hue would quietly invent a colour the theme never
 * chose.
 *
 * Saturation is nudged with lightness because a very dark or very light colour
 * at full saturation reads as neon. The deep end also keeps a floor on
 * lightness: a pure black backdrop swallows a shader whose whole effect is
 * gradient, and the failure looks like the canvas not rendering.
 */
export function derivePalette(base: string | undefined): ScenePalette | undefined {
	const hsl = parseColor(base);
	if (!hsl) return undefined;
	const mid = hslToHex({ ...hsl, a: 1 });
	const deep = hslToHex({
		h: hsl.h,
		s: clamp01(hsl.s * 0.85),
		l: clamp01(Math.max(0.08, hsl.l * 0.32)),
		a: 1,
	});
	const bright = hslToHex({
		h: hsl.h,
		s: clamp01(hsl.s * 0.9),
		l: clamp01(Math.min(0.9, hsl.l + (1 - hsl.l) * 0.55)),
		a: 1,
	});
	return { a: deep, b: mid, c: bright };
}
