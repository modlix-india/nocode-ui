const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalize a CSS hex to lowercase #rrggbb (expanding #rgb), or null when the
 *  string isn't a plain hex color (named colors, rgb(), gradients, etc.). */
export function normHex(raw: unknown): string | null {
	if (typeof raw !== 'string') return null;
	const s = raw.trim().toLowerCase();
	if (!HEX_RE.test(s)) return null;
	if (s.length === 4) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
	return s;
}
