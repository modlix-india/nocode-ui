import { useEffect, useState } from 'react';
import { STORE_PATH_THEME_PATH } from '../../constants';
import { addListener, getDataFromPath } from '../../context/StoreContext';
import { lookOf, type ChartLook } from '../Chart/chartjs/chartLook';
import { styleDefaults as chartStyleDefaults } from '../Chart/chartStyleProperties';
import type { ChartTheme } from './reportChartConfig';
import { REPORT_CHART_LOOK_VAR } from './reportStyle';

/**
 * Runtime theme reading for the report canvas (the lazy parts only: ReportWidgetView,
 * StylePanel). Kept out of reportStyle.ts, which every report entry loads with the page.
 */

/** A colour custom property resolved to rgb (a probe element evaluates color-mix and var()). */
function cssColor(el: Element | null | undefined, name: string): string {
	if (!el || typeof getComputedStyle !== 'function' || typeof document === 'undefined') return '';
	try {
		const probe = document.createElement('span');
		probe.style.color = `var(${name})`;
		probe.style.display = 'none';
		el.appendChild(probe);
		const c = getComputedStyle(probe).color;
		probe.remove();
		return c || '';
	} catch {
		return '';
	}
}

/** The theme chart palette for a scheme (`_primary` -> Theme.chartPrimaryDataColor1..12). */
export function themePalette(scheme: string | undefined): string[] {
	const s = scheme && scheme.length > 1 ? scheme : '_primary';
	const name = s[1].toUpperCase() + s.slice(2);
	const out: string[] = [];
	for (let i = 1; i <= 12; i++) {
		const key = `chart${name}DataColor${i}`;
		const v = getDataFromPath(`Theme.${key}`, []) ?? chartStyleDefaults.get(key);
		if (v) out.push(String(v));
	}
	if (!out.length && s !== '_primary') return themePalette('_primary');
	return out;
}

/**
 * The theme's chart look for report widgets (`Theme.reportChartLook`). Anything other than
 * dotMatrix, isometric or wave, and a theme without the variable, is `default`.
 */
export function themeChartLook(): ChartLook {
	return lookOf({ chartLook: getDataFromPath(`Theme.${REPORT_CHART_LOOK_VAR}`, []) });
}

/**
 * Canvas colours and the chart look from the widget's own theme variables, re-read when the
 * palette scheme changes and when the theme is switched (`Store.theme`).
 */
export function useChartTheme(
	ref: React.RefObject<HTMLElement | null>,
	scheme: string | undefined,
): ChartTheme {
	const [theme, setTheme] = useState<ChartTheme>(() => ({
		palette: themePalette(scheme),
		text: '',
		muted: '',
		grid: '',
		surface: '',
		look: themeChartLook(),
	}));
	// A theme switch repaints the style sheet with the new custom properties; read them on the
	// next frame, once it is in.
	const [switches, setSwitches] = useState(0);
	useEffect(() => {
		let frame: number | undefined;
		const later =
			typeof requestAnimationFrame === 'function'
				? (f: () => void) => (frame = requestAnimationFrame(f))
				: (f: () => void) => (frame = setTimeout(f, 0) as unknown as number);
		// Guarded: a store stand-in (tests) may not offer listeners.
		const off =
			typeof addListener === 'function'
				? addListener(
						undefined,
						() => later(() => setSwitches(n => n + 1)),
						STORE_PATH_THEME_PATH,
					)
				: undefined;
		return () => {
			off?.();
			if (frame === undefined) return;
			if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
			else clearTimeout(frame);
		};
	}, []);
	useEffect(() => {
		const el = ref.current;
		const color =
			el && typeof getComputedStyle === 'function' ? getComputedStyle(el).color : '';
		setTheme({
			palette: themePalette(scheme),
			text: cssColor(el, '--rp-text') || color,
			muted: cssColor(el, '--rp-muted') || color,
			grid: cssColor(el, '--rp-border') || color,
			surface: cssColor(el, '--rp-surface') || color,
			font:
				el && typeof getComputedStyle === 'function'
					? getComputedStyle(el).fontFamily
					: undefined,
			look: themeChartLook(),
		});
	}, [ref, scheme, switches]);
	return theme;
}
