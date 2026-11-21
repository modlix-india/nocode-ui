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
 * - Zoom and pan (chartjs-plugin-zoom 2.2, with hammerjs for pinch) is handed to the one chart
 *   that wants it, like data labels.
 * - Heatmap (chartjs-chart-matrix 3.1) and treemap (chartjs-chart-treemap 5.0) are new chart
 *   types: registering a controller only adds the type, other charts are unchanged.
 */

let dataLabels: Promise<Plugin> | undefined;
let annotation: Promise<void> | undefined;
let zoom: Promise<Plugin> | undefined;
let matrix: Promise<void> | undefined;
let treemap: Promise<void> | undefined;

export function loadZoom(): Promise<Plugin> {
	zoom ??= import(/* webpackChunkName: "chart-zoom" */ 'chartjs-plugin-zoom').then(
		m => m.default as unknown as Plugin,
	);
	zoom.catch(() => (zoom = undefined));
	return zoom;
}

export function loadMatrix(): Promise<void> {
	matrix ??= Promise.all([
		import(/* webpackChunkName: "chart-matrix" */ 'chartjs-chart-matrix'),
		import('chart.js'),
	]).then(([m, c]) => {
		c.Chart.register(m.MatrixController, m.MatrixElement);
	});
	matrix.catch(() => (matrix = undefined));
	return matrix;
}

export function loadTreemap(): Promise<void> {
	treemap ??= Promise.all([
		import(/* webpackChunkName: "chart-treemap" */ 'chartjs-chart-treemap'),
		import('chart.js'),
	]).then(([m, c]) => {
		c.Chart.register(m.TreemapController, m.TreemapElement);
	});
	treemap.catch(() => (treemap = undefined));
	return treemap;
}

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
	/** Report widgets only (CXZ-1780 P1b); the Chart component never asks for these. */
	zoom?: boolean;
	matrix?: boolean;
	treemap?: boolean;
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
	const [zm, setZm] = useState<Plugin | undefined>(undefined);
	const [matrixReady, setMatrixReady] = useState(false);
	const [treemapReady, setTreemapReady] = useState(false);

	useEffect(() => {
		if (!wanted.zoom || zm) return;
		let alive = true;
		loadZoom().then(
			p => alive && setZm(() => p),
			() => {},
		);
		return () => {
			alive = false;
		};
	}, [wanted.zoom, zm]);

	useEffect(() => {
		if (!wanted.matrix || matrixReady) return;
		let alive = true;
		loadMatrix().then(
			() => alive && setMatrixReady(true),
			() => {},
		);
		return () => {
			alive = false;
		};
	}, [wanted.matrix, matrixReady]);

	useEffect(() => {
		if (!wanted.treemap || treemapReady) return;
		let alive = true;
		loadTreemap().then(
			() => alive && setTreemapReady(true),
			() => {},
		);
		return () => {
			alive = false;
		};
	}, [wanted.treemap, treemapReady]);

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

	const plugins = useMemo(() => {
		const list: Plugin[] = [];
		if (wanted.dataLabels && dl) list.push(dl);
		if (wanted.zoom && zm) list.push(zm);
		return list.length ? list : NONE;
	}, [wanted.dataLabels, dl, wanted.zoom, zm]);

	const ready =
		(!wanted.dataLabels || !!dl) &&
		(!wanted.annotation || annReady) &&
		(!wanted.zoom || !!zm) &&
		(!wanted.matrix || matrixReady) &&
		(!wanted.treemap || treemapReady);
	return { plugins, ready };
}
