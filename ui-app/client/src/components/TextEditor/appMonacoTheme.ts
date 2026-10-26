/**
 * The TextEditor's "app" theme: a Monaco theme built from CSS variables the app theme sets on the
 * editor (the Editor Palette in textEditorStyleProperies.ts), so a code pane wears the app's own
 * colours instead of Monaco's white. Monaco cannot read CSS variables, so they are resolved here and
 * re-read whenever the page's styles change (a light/dark switch rewrites the theme's <style>).
 *
 * The same idea as kirun-ui's app theme for the KIRun Editor (editorTheme.ts there); it is not
 * imported from kirun-ui because that package pulls the whole of monaco-editor in on load, and this
 * editor uses @monaco-editor/react's own instance.
 */

export const APP_THEME_NAME = 'mlx-text-editor-app';

/** Monaco token -> CSS variable. JSON, HTML, CSS and TypeScript share these token roots. */
const TOKENS: Array<[string, string]> = [
	['string.key.json', '--te-key'],
	['string.value.json', '--te-string'],
	['string', '--te-string'],
	['number', '--te-number'],
	['keyword', '--te-keyword'],
	['keyword.json', '--te-keyword'],
	['delimiter', '--te-delimiter'],
	['delimiter.bracket', '--te-delimiter'],
	['comment', '--te-comment'],
	['tag', '--te-keyword'],
	['attribute.name', '--te-key'],
	['attribute.value', '--te-string'],
	['identifier', '--te-fg'],
	['type', '--te-number'],
];

const COLORS: Array<[string, string[]]> = [
	['editor.background', ['--te-bg']],
	['editor.foreground', ['--te-fg']],
	['editor.lineHighlightBackground', ['--te-line-highlight']],
	['editor.lineHighlightBorder', ['--te-line-highlight']],
	['editor.selectionBackground', ['--te-selection']],
	['editorCursor.foreground', ['--te-cursor']],
	['editorLineNumber.foreground', ['--te-line-number', '--te-comment']],
	['editorLineNumber.activeForeground', ['--te-fg']],
	['editorGutter.background', ['--te-bg']],
	['editorIndentGuide.background1', ['--te-line-highlight']],
];

export type ColorReader = (variable: string) => string | undefined;

function luminance(hex: string): number {
	const [r, g, b] = [0, 2, 4].map(i => {
		const c = parseInt(hex.substring(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function buildAppTheme(read: ColorReader) {
	const bg = read('--te-bg');
	const dark = bg ? luminance(bg.substring(0, 6)) < 0.25 : false;
	const rules = TOKENS.map(([token, v]) => ({ token, colour: read(v) }))
		.filter(r => !!r.colour)
		.map(r => ({ token: r.token, foreground: r.colour!.substring(0, 6) }));
	const colors: Record<string, string> = {};
	for (const [key, vars] of COLORS) {
		const c = vars.map(read).find(Boolean);
		if (c) colors[key] = `#${c}`;
	}
	return { base: (dark ? 'vs-dark' : 'vs') as 'vs' | 'vs-dark', inherit: true, rules, colors };
}

/** `rgb()`, `rgba()` or `color(srgb ...)` from getComputedStyle -> `RRGGBB` / `RRGGBBAA`. */
export function cssColorToMonaco(value: string): string | undefined {
	const v = value.trim();
	if (!v || v === 'transparent') return undefined;
	const hex = (n: number) =>
		Math.max(0, Math.min(255, Math.round(n)))
			.toString(16)
			.padStart(2, '0');
	const alpha = (a?: string) =>
		a === undefined ? 1 : a.endsWith('%') ? Number(a.slice(0, -1)) / 100 : Number(a);
	let m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(
		v,
	);
	let rgb: number[];
	let a: number;
	if (m) {
		rgb = [m[1], m[2], m[3]].map(Number);
		a = alpha(m[4]);
	} else {
		m = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(
			v,
		);
		if (!m) return undefined;
		rgb = [m[1], m[2], m[3]].map(x => Number(x) * 255);
		a = alpha(m[4]);
	}
	if (a <= 0) return undefined;
	return (rgb.map(hex).join('') + (a < 1 ? hex(a * 255) : '')).toUpperCase();
}

/** Resolves --te-* variables on `root` through a hidden probe (custom properties come back raw). */
export function readAppTheme(root: HTMLElement) {
	const probe = document.createElement('span');
	probe.style.display = 'none';
	root.appendChild(probe);
	const style = getComputedStyle(root);
	try {
		const theme = buildAppTheme(variable => {
			if (!style.getPropertyValue(variable).trim()) return undefined;
			probe.style.color = `var(${variable})`;
			return cssColorToMonaco(getComputedStyle(probe).color);
		});
		const fontFamily = style.getPropertyValue('--te-font-family').trim() || undefined;
		return { theme, fontFamily };
	} finally {
		probe.remove();
	}
}

/** Calls `onChange` (debounced) when a <style>/<link> changes or <html>/<body> change class or theme. */
export function watchHostStyles(onChange: () => void, delay = 120): () => void {
	if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return () => {};
	let timer: ReturnType<typeof setTimeout> | undefined;
	const fire = () => {
		clearTimeout(timer);
		timer = setTimeout(onChange, delay);
	};
	const isStyle = (n: Node | null) => !!n && (n.nodeName === 'STYLE' || n.nodeName === 'LINK');
	const styles = new MutationObserver(mutations => {
		if (
			mutations.some(
				m =>
					isStyle(m.target) ||
					isStyle(m.target.parentNode) ||
					Array.from(m.addedNodes).some(isStyle) ||
					Array.from(m.removedNodes).some(isStyle),
			)
		)
			fire();
	});
	styles.observe(document.documentElement, {
		childList: true,
		subtree: true,
		characterData: true,
	});
	const attrs = new MutationObserver(fire);
	const attributeFilter = ['class', 'style', 'data-theme', 'data-mlx-theme'];
	attrs.observe(document.documentElement, { attributes: true, attributeFilter });
	if (document.body) attrs.observe(document.body, { attributes: true, attributeFilter });
	return () => {
		clearTimeout(timer);
		styles.disconnect();
		attrs.disconnect();
	};
}
