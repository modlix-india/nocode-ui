import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './chartProperties';
import { makeChart } from './d3Chart';
import Gradient from './types/chartComponents/Gradient';
import Legends from './types/chartComponents/Legends';
import { ChartData, Dimension, makeChartDataFromProperties } from './types/common';

const CHART_PADDING = 10;

export default function Chart(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates, properties } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [value, setValue] = React.useState<any>(undefined);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				if (isNullValue(v)) {
					setValue(undefined);
					return;
				}
				setValue(v);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const [render, setRender] = React.useState(Date.now());

	React.useEffect(() => {
		const element = document.getElementById('d3-7.9.0');
		if (element) {
			element.addEventListener('load', () => setRender(Date.now()));
			return;
		}
		const script = document.createElement('script');
		script.id = 'd3-7.9.0';
		script.src = '/api/files/static/file/SYSTEM/jslib/d3/d3%407.9.0.min.js';
		script.async = true;
		script.addEventListener('load', () => setRender(Date.now()));
		document.body.appendChild(script);
	}, [setRender]);

	const processedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [resolvedStyles, setResolvedStyles] = useState<any>({});

	useEffect(() => {
		setResolvedStyles((old: any) => (deepEqual(old, processedStyles) ? old : processedStyles));
	}, [processedStyles]);

	const [oldProperties, setOldProperties] = React.useState<any>(undefined);
	const [chartData, setChartData] = React.useState<ChartData | undefined>(undefined);

	const [hiddenDataSets, setHiddenDataSets] = React.useState<Set<number>>(new Set<number>());
	const [focusedDataSet, setFocusedDataSet] = React.useState<number | undefined>(undefined);

	const svgRef = useRef<SVGSVGElement | null>(null);

	const [svgDimension, setSvgDimension] = React.useState<Dimension>({ width: 0, height: 0 });
	const [legendDimension, setLegendDimension] = React.useState<Dimension>({
		width: 0,
		height: 0,
	});

	const chartWidth = Math.floor(
		svgDimension.width -
			(properties.legendPosition === 'left' || properties.legendPosition === 'right'
				? legendDimension.width
				: 0),
	);
	const chartHeight = Math.floor(
		svgDimension.height -
			(properties.legendPosition === 'top' || properties.legendPosition === 'bottom'
				? legendDimension.height
				: 0),
	);

	useEffect(() => {
		if (deepEqual(properties, oldProperties)) return;
		setOldProperties(properties);
		const cd = makeChartDataFromProperties(
			properties,
			locationHistory,
			pageExtractor,
			hiddenDataSets,
		);
		setChartData(cd);
	}, [oldProperties, properties, locationHistory, pageExtractor, hiddenDataSets]);

	useEffect(() => {
		const cd = makeChartDataFromProperties(
			properties,
			locationHistory,
			pageExtractor,
			hiddenDataSets,
		);
		setChartData(cd);
	}, [hiddenDataSets]);

	useEffect(() => {
		if (!globalThis.d3 || !svgRef.current || !chartData) return;

		makeChart({
			properties,
			chartData,
			svgRef: svgRef.current,
			resolvedStyles,
			chartDimension: {
				width: chartWidth - CHART_PADDING * 2,
				height: chartHeight - CHART_PADDING * 2,
			},
			hiddenDataSets,
			focusedDataSet,
			onFocusDataSet: (index: number | undefined) =>
				setFocusedDataSet(index === focusedDataSet ? undefined : index),
		});
	}, [
		svgRef.current,
		globalThis.d3,
		chartData,
		legendDimension,
		render,
		resolvedStyles,
		focusedDataSet,
	]);

	useEffect(() => {
		if (isNullValue(svgRef.current)) return;

		let rect = svgRef.current!.getBoundingClientRect();
		setSvgDimension({
			width: Math.floor(rect.width),
			height: Math.floor(rect.height),
		});
		const resizeObserver = new ResizeObserver(() => {
			setTimeout(() => {
				const newRect = svgRef.current?.getBoundingClientRect();
				if (!newRect) return;
				if (
					Math.abs(newRect.width - rect.width) < 8 &&
					Math.abs(newRect.height - rect.height) < 8
				)
					return;
				rect = newRect;
				setSvgDimension({
					width: Math.floor(newRect.width),
					height: Math.floor(newRect.height),
				});
			}, 2000);
		});
		resizeObserver.observe(svgRef.current!);
		return () => resizeObserver.disconnect();
	}, [svgRef.current, setSvgDimension]);

	useEffect(() => setHiddenDataSets(new Set()), [chartData?.dataSetData?.length]);

	const gradientDef = useMemo(
		() => (
			<defs>
				{Array.from(chartData?.gradients?.values() ?? []).map(g => (
					<Gradient
						key={'' + Math.abs(g.hashCode).toString(16)}
						gradient={g}
						gradientUnits={properties.gradientSpace}
					/>
				))}
			</defs>
		),
		[
			Array.from(chartData?.gradients?.values() ?? [])
				.map(e => e.hashCode)
				.reduce((a, c) => a + c, 0),
			properties.gradientSpace,
		],
	);

	return (
		<div className={`comp compChart `} style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<svg
				className="chart"
				ref={svgRef}
				viewBox={`0 0 ${svgDimension.width} ${svgDimension.height}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				{gradientDef}
				<text
					className="xAxisLabelSampler"
					x={0}
					y={0}
					style={{ ...resolvedStyles.xAxisLabel, transition: 'none' }}
					fillOpacity={0}
					strokeOpacity={0}
				></text>
				<text
					x={0}
					y={0}
					className="yAxisLabelSampler"
					style={{ ...resolvedStyles.yAxisLabel, transition: 'none' }}
					fillOpacity={0}
					strokeOpacity={0}
				></text>
				<g
					className="titleGroup"
					transform={`translate(${
						(properties.legendPosition === 'left' ? legendDimension.width : 0) +
						CHART_PADDING
					}, ${
						(properties.legendPosition === 'top' ? legendDimension.height : 0) +
						CHART_PADDING
					})`}
				>
					<text
						x={0}
						y={0}
						className="xAxisTitle"
						style={resolvedStyles.xAxisTitle ?? {}}
						fill="currentColor"
					>
						{chartData?.xAxisTitle ?? ''}
					</text>
					<text
						x={0}
						y={0}
						className="yAxisTitle"
						style={resolvedStyles.yAxisTitle ?? {}}
						fill="currentColor"
						textAnchor="end"
					>
						{chartData?.yAxisTitle ?? ''}
					</text>
				</g>

				<g
					className="chartGroup"
					transform={`translate(${
						(properties.legendPosition === 'left' ? legendDimension.width : 0) +
						CHART_PADDING
					}, ${
						(properties.legendPosition === 'top' ? legendDimension.height : 0) +
						CHART_PADDING
					})`}
				/>
				<Legends
					containerDimension={{ width: svgDimension.width, height: svgDimension.height }}
					legendDimension={legendDimension}
					properties={properties}
					chartData={chartData}
					onLegendDimensionChange={setLegendDimension}
					labelStyles={resolvedStyles.legendLabel ?? {}}
					rectangleStyles={resolvedStyles.legendRectangle ?? {}}
					hiddenDataSets={hiddenDataSets}
					onToggleDataSet={(index: number) => {
						const newSet = new Set(hiddenDataSets);
						if (newSet.has(index)) newSet.delete(index);
						else newSet.add(index);
						setHiddenDataSets(newSet);
						if (focusedDataSet) setFocusedDataSet(undefined);
					}}
					onShowOnlyDataSet={(index: number) =>
						setHiddenDataSets(
							new Set(
								chartData?.dataSetData?.map((_, i) => i).filter(i => i !== index),
							),
						)
					}
					onFocusDataSet={(index: number | undefined) =>
						setFocusedDataSet(
							index === focusedDataSet || hiddenDataSets.has(index ?? -1)
								? undefined
								: index,
						)
					}
				/>
			</svg>
		</div>
	);
}
