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
);

export interface MarkClick {
	datasetIndex: number;
	index: number;
	/** Pointer position inside the chart box, for the menu. */
	x: number;
	y: number;
}

export interface ReportChartHandle {
	canvas(): HTMLCanvasElement | undefined;
}

interface Props {
	config: ReportChartConfig;
	onMarkClick?: (m: MarkClick) => void;
}

function ReportChart({ config, onMarkClick }: Props, ref: React.Ref<ReportChartHandle>) {
	const chartRef = useRef<ChartJS>(null);
	const { plugins, ready } = useChartPlugins(config.needs);
	const clickRef = useRef(onMarkClick);
	clickRef.current = onMarkClick;

	useImperativeHandle(ref, () => ({ canvas: () => chartRef.current?.canvas ?? undefined }), []);

	const options = useMemo(
		() => ({
			...config.options,
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
				if (ds?._trend) return;
				clickRef.current({
					datasetIndex: el.datasetIndex,
					index: el.index,
					x: event.x,
					y: event.y,
				});
			},
			onHover: (event: any, els: any[]) => {
				const t = event?.native?.target as HTMLElement | undefined;
				if (t?.style) t.style.cursor = clickRef.current && els?.length ? 'pointer' : '';
			},
		}),
		[config.options],
	);

	if (!ready) return null;
	return (
		<Chart
			// A new chart when the kind or the axes change: chart.js updates options in place
			// and would keep scales of the previous view (a switch to Bar showed two label axes).
			key={`${config.type}|${config.options?.indexAxis ?? 'x'}|${Object.keys(config.options?.scales ?? {}).join(',')}`}
			ref={chartRef}
			type={config.type}
			data={config.data as any}
			options={options}
			plugins={plugins}
		/>
	);
}

export default forwardRef(ReportChart);
