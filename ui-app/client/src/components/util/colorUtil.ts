import { isNullValue } from '@fincity/kirun-js';

const REGEX_LIST: { [key: string]: RegExp } = {
	3: /([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i,
	4: /([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i,
	6: /([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
	8: /([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
};

export type ColorFormatTypeAlpha = 'hex' | 'rgba' | 'hsla' | 'hsva';

export interface RGBA {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export interface HSLA {
	h: number;
	s: number;
	l: number;
	a?: number;
}

export interface HSVA {
	h: number;
	s: number;
	v: number;
	a?: number;
}

export function HEX_RGBA(input: string) {
	if (input.startsWith('#')) input = input.slice(1);
	const result = REGEX_LIST[input.length].exec(input);
	const rgb: RGBA = {
		r: parseInt(result?.[1] ?? '', 16),
		g: parseInt(result?.[2] ?? '', 16),
		b: parseInt(result?.[3] ?? '', 16),
	};

	const single = input.length < 6;

	if (!(input.length % 4)) {
		rgb.a = parseInt(result?.[4] ?? '', 16);
		rgb.a /= single ? 15 : 255;
	}

	if (single) {
		rgb.r *= 17;
		rgb.g *= 17;
		rgb.b *= 17;
	}

	return rgb;
}

export function RGB_HSL({ r, g, b }: RGBA): HSLA {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0,
		s = 0,
		l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
}

export function RGBA_HEX({ r, g, b, a }: RGBA) {
	const rgb = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	if (a === undefined || a === null || a === 1) return rgb;
	return rgb + Math.floor(a * 255).toString(16);
}

export function HSLA_HEX(hsla: HSLA) {
	const rgb = HSL_RGB(hsla);
	return RGBA_HEX({ ...rgb, a: hsla.a });
}

function hue2rgb(p: number, q: number, t: number) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
}

function HSL_RGB({ h, s, l }: HSLA): RGBA {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0) {
		r = g = b = l;
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function HSV_RGB({ h, s, v }: HSVA): RGBA {
	h /= 360;
	s /= 100;
	v /= 100;
	let r, g, b;
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default:
			r = v;
			g = p;
			b = q;
			break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

export function HSV_HSL({ h, s, v }: HSVA): HSLA {
	const { s: ns, l: nl } = SV_SL({ s, v });
	return { h, s: ns, l: nl };
}

export interface SV {
	s: number;
	v: number;
}

export interface SL {
	s: number;
	l: number;
}

export function SV_SL({ s, v }: SV): SL {
	s /= 100;
	v /= 100;
	const l = v - (s * v) / 2;
	const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

	return { l: l * 100, s: sl * 100 };
}

export function SL_SV({ s, l }: SL): SV {
	s /= 100;
	l /= 100;
	const v = l + s * (l < 1 - l ? l : 1 - l);
	const sv = v === 0 ? 0 : 2 * (1 - l / v);
	return { v: v * 100, s: sv * 100 };
}

function parse(n: string): number {
	let div = 1;
	if (n.endsWith('%')) div = 100;
	else if (n.endsWith('deg')) div = 360;
	return parseFloat(n) / div;
}

export const COLOR_REGEX =
	/#(?:[a-f\d]{3,4}){1,2}\b|rgb\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*[, ]){2}\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)|\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%(?:\s*[, ]\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%){2})\s*\)|hsl\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:[, ]\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2}\)|(?:rgba\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*[, ]){3}|(?:\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*[, ]){3})|hsla\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:[, ]\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2},)\s*0*(?:1|0(?:\.\d+)?)\s*\)/i;

export function HSV_HSLAString({ h, s, v, a }: HSVA): string {
	const { s: ns, l: nl } = SV_SL({ s, v });
	if (a === 1 || isNullValue(a)) return `hsl(${h}, ${ns}%, ${nl}%)`;
	return `hsla(${h}, ${ns}%, ${nl}%, ${a})`;
}

export function HSV_RGBAString({ h, s, v, a }: HSVA): string {
	const { r, g, b } = HSV_RGB({ h, s, v });

	if (a == 1 || isNullValue(a)) return `rgb(${r}, ${g}, ${b})`;
	return `rgba(${r}, ${g}, ${b}, ${Math.round(a! * 100) / 100})`;
}

export function HSLA_RGBAString({ h, s, l, a }: HSLA): string {
	const { r, g, b } = HSL_RGB({ h, s, l });

	if (a == 1 || isNullValue(a)) return `rgb(${r}, ${g}, ${b})`;
	return `rgba(${r}, ${g}, ${b}, ${Math.round(a! * 100) / 100})`;
}

export function HSV_HexString({ h, s, v, a }: HSVA): string {
	const { r, g, b } = HSV_RGB({ h, s, v });
	return RGBA_HEX({ r, g, b, a });
}

export function HSLA_RGBA_TO_RGBAString(values: HSLA | RGBA): string {
	if ('r' in values) {
		const a = values.a;
		if (a === undefined || a === null || a === 1)
			return `rgb(${values.r}, ${values.g}, ${values.b})`;
		return `rgba(${values.r}, ${values.g}, ${values.b}, ${values.a})`;
	} else {
		const { r, g, b } = HSL_RGB(values);

		const a = values.a;
		if (a === undefined || a === null || a === 1) return `rgb(${r}, ${g}, ${b})`;
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}
}

export function RGBA_any(
	{ r, g, b, a }: RGBA,
	to: ColorFormatTypeAlpha,
): RGBA | HSLA | HSVA | string | undefined {
	if (to === 'rgba') return { r, g, b, a };
	if (to === 'hex') return RGBA_HEX({ r, g, b, a });

	const { h, s, l } = RGB_HSL({ r, g, b });
	if (to === 'hsla') return { h, s, l, a };
	if (to === 'hsva') return { h, ...SL_SV({ s, l }), a };

	return undefined;
}

export function HSLA_any(
	{ h, s, l, a }: HSLA,
	to: ColorFormatTypeAlpha,
): RGBA | HSLA | HSVA | string | undefined {
	if (to === 'hsla') return { h, s, l, a };
	if (to === 'hsva') return { h, ...SL_SV({ s, l }), a };
	if (to === 'hex') return HSLA_HEX({ h, s, l, a });
	if (to === 'rgba') return { ...HSL_RGB({ h, s, l }), a };

	return undefined;
}

export function HEXRGBHSL_any(
	rgbStr: string,
	to: ColorFormatTypeAlpha = 'hex',
): RGBA | HSLA | HSVA | string | undefined {
	console.log(rgbStr);
	if (!rgbStr?.trim()) return undefined;
	let strMatch = rgbStr.match(COLOR_REGEX);
	if (!strMatch) return undefined;
	let str = strMatch[0];

	try {
		if (str.startsWith('rgb')) {
			let nums = str
				.substring(str.indexOf('(') + 1, str.indexOf(')'))
				.split(' ')
				.flatMap(e => e.split(','))
				.filter(e => e != '/' && e);
			let a = undefined;
			if (nums.length >= 4) {
				a = parse(nums[3]);
			}
			return RGBA_any({ r: parse(nums[0]), g: parse(nums[1]), b: parse(nums[2]), a }, to);
		} else if (str.startsWith('hsl')) {
			let nums = str
				.substring(str.indexOf('(') + 1, str.indexOf(')'))
				.split(' ')
				.flatMap(e => e.split(','))
				.filter(e => e != '/' && e);
			let a = undefined;
			if (nums.length >= 4) {
				a = parse(nums[3]);
			}
			return HSLA_any({ h: parse(nums[0]), s: parse(nums[1]), l: parse(nums[2]), a }, to);
		} else {
			if (to === 'hex') {
				return str;
			}
			return RGBA_any(HEX_RGBA(str), to);
		}
	} catch (err) {
		return undefined;
	}
}
