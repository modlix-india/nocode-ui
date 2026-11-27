import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import {
	ArcElement,
	BarController,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	DoughnutController,
	Filler,
	Legend,
	LinearScale,
	LineController,
	LineElement,
	LogarithmicScale,
	PieController,
	PointElement,
	ScatterController,
	Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useChartPlugins } from '../../Chart/chartjs/lazyPlugins';
import { chartLookPlugin } from '../../Chart/chartjs/chartLook';
import { ReportChartConfig } from '../reportChartConfig';

/**
 * The canvas part of a report widget, its own lazy chunk (chart.js is already split out with
 * the Chart component; registering again is a no-op). Data labels and reference lines come
 * from the same lazy plugin chunks the Chart component uses.
 */

ChartJS.register(
	BarController,
	LineController,
	PieController,
	DoughnutController,
	ScatterController,
	CategoryScale,
	LinearScale,
	LogarithmicScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
	Filler,
	// Draws nothing unless the config carries `plugins.chartLook` (the theme's report chart look).
	chartLookPlugin,
);

export interface MarkClick {
	datasetIndex: number;
	index: number;
	/** Pointer position inside the chart box, for the menu. */
	x: number;
	y: number;
	/** The parsed point (a treemap rectangle's group and its records). */
	raw?: any;
}

export interface ReportChartHandle {
	canvas(): HTMLCanvasElement | undefined;
	/** Back to the whole range after a zoom or pan. */
	resetZoom(): void;
}

interface Props {
	config: ReportChartConfig;
	onMarkClick?: (m: MarkClick) => void;
	/** Zoomed in (or panned) or back to the whole range. */
	onZoomChange?: (zoomed: boolean) => void;
}

function ReportChart(
	{ config, onMarkClick, onZoomChange }: Props,
	ref: React.Ref<ReportChartHandle>,
) {
	const chartRef = useRef<ChartJS>(null);
	const { plugins, ready } = useChartPlugins(config.needs);
	const clickRef = useRef(onMarkClick);
	clickRef.current = onMarkClick;
	const zoomRef = useRef(onZoomChange);
	zoomRef.current = onZoomChange;

	useImperativeHandle(
		ref,
		() => ({
			canvas: () => chartRef.current?.canvas ?? undefined,
			resetZoom: () => {
				const c: any = chartRef.current;
				if (!c?.resetZoom) return;
				c.resetZoom();
				if (c.options?.plugins?.zoom?.pan) c.options.plugins.zoom.pan.enabled = false;
				zoomRef.current?.(false);
			},
		}),
		[],
	);

	const options = useMemo(() => {
		const base = config.options ?? {};
		const zoom = base.plugins?.zoom;
		// Pan is switched on once zoomed (a finger then moves the range; before, it scrolls).
		const changed = ({ chart }: any) => {
			const zoomed = !!chart?.isZoomedOrPanned?.();
			if (chart?.options?.plugins?.zoom?.pan) chart.options.plugins.zoom.pan.enabled = zoomed;
			zoomRef.current?.(zoomed);
		};
		const plugins = zoom
			? {
					...base.plugins,
					zoom: {
						...zoom,
						pan: { ...zoom.pan, onPanComplete: changed },
						zoom: { ...zoom.zoom, onZoomComplete: changed },
					},
				}
			: base.plugins;
		return {
			...base,
			plugins,
			onClick: (event: any, _els: any[], chart: any) => {
				if (!clickRef.current) return;
				const hit = chart.getElementsAtEventForMode(
					event.native ?? event,
					'nearest',
					{ intersect: true },
					false,
				);
				const el = hit?.[0];
				if (!el) return;
				const ds = chart.data.datasets?.[el.datasetIndex];
				if (ds?._trend || ds?._ghost) return;
				let raw: any;
				try {
					raw = chart
						.getDatasetMeta(el.datasetIndex)
						?.controller?.getContext?.(el.index)?.raw;
				} catch {
					raw = undefined;
				}
				clickRef.current({
					datasetIndex: el.datasetIndex,
					index: el.index,
					x: event.x,
					y: event.y,
					raw,
				});
			},
			onHover: (event: any, els: any[]) => {
				const t = event?.native?.target as HTMLElement | undefined;
				if (t?.style) t.style.cursor = clickRef.current && els?.length ? 'pointer' : '';
			},
		};
	}, [config.options]);

	if (!ready) return null;
	return (
		<Chart
			// A new chart when the kind or the axes change: chart.js updates options in place
			// and would keep scales of the previous view (a switch to Bar showed two label axes).
			key={`${config.type}|${config.options?.indexAxis ?? 'x'}|${Object.keys(config.options?.scales ?? {}).join(',')}|${config.options?.plugins?.chartLook?.look ?? ''}`}
			ref={chartRef}
			type={config.type as any}
			data={config.data as any}
			options={options}
			plugins={plugins}
		/>
	);
}

export default forwardRef(ReportChart);
