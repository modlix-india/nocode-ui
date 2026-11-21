import { useEffect, useMemo, useState } from 'react';
import type { Plugin } from 'chart.js';

/**
 * chart.js plugins that only some charts use, each loaded as its own chunk the first time a
 * chart asks for it (the same pattern as `geo.ts`): a page whose charts use neither loads
 * nothing new.
 *
 * - Data labels (chartjs-plugin-datalabels 2.2) is handed to the one chart that wants it
 *   (react-chartjs-2 `plugins` prop), never registered globally: registered globally it
 *   would label every chart on the page.
 * - Annotations (chartjs-plugin-annotation 3.1) must be registered (it registers its element
 *   types on register). Registered, it draws nothing unless a chart's options name
 *   annotations, so other charts are unchanged.
 */

let dataLabels: Promise<Plugin> | undefined;
let annotation: Promise<void> | undefined;

export function loadDataLabels(): Promise<Plugin> {
	dataLabels ??= import(
		/* webpackChunkName: "chart-datalabels" */ 'chartjs-plugin-datalabels'
	).then(m => m.default as unknown as Plugin);
	dataLabels.catch(() => (dataLabels = undefined));
	return dataLabels;
}

export function loadAnnotation(): Promise<void> {
	annotation ??= Promise.all([
		import(/* webpackChunkName: "chart-annotation" */ 'chartjs-plugin-annotation'),
		import('chart.js'),
	]).then(([m, c]) => {
		c.Chart.register(m.default);
	});
	annotation.catch(() => (annotation = undefined));
	return annotation;
}

export interface WantedPlugins {
	dataLabels: boolean;
	annotation: boolean;
}

export interface LoadedPlugins {
	/** Per-chart plugins for react-chartjs-2's `plugins` prop (stable reference). */
	plugins: Plugin[];
	/** Every wanted plugin is in; draw only then, so a chart is not drawn twice. */
	ready: boolean;
}

const NONE: Plugin[] = [];

/** Loads the wanted plugins; with nothing wanted it loads nothing and is ready at once. */
export function useChartPlugins(wanted: WantedPlugins): LoadedPlugins {
	const [dl, setDl] = useState<Plugin | undefined>(undefined);
	const [annReady, setAnnReady] = useState(false);

	useEffect(() => {
		if (!wanted.dataLabels || dl) return;
		let alive = true;
		loadDataLabels().then(
			p => alive && setDl(() => p),
			() => {},
		);
		return () => {
			alive = false;
		};
	}, [wanted.dataLabels, dl]);

	useEffect(() => {
		if (!wanted.annotation || annReady) return;
		let alive = true;
		loadAnnotation().then(
			() => alive && setAnnReady(true),
			() => {},
		);
		return () => {
			alive = false;
		};
	}, [wanted.annotation, annReady]);

	const plugins = useMemo(() => (wanted.dataLabels && dl ? [dl] : NONE), [wanted.dataLabels, dl]);

	const ready = (!wanted.dataLabels || !!dl) && (!wanted.annotation || annReady);
	return { plugins, ready };
}
