import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import ChartStyle from './ChartStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './chartProperties';
import { styleDefaults } from './chartStyleProperties';
import { deepEqual, isNullValue } from '@fincity/kirun-js';
import { ChartData, Dimension, makeChartDataFromProperties } from './types/common';
import { makeChart } from './d3Chart';
import Legends from './types/chartComponents/Legends';
import Gradient from './types/chartComponents/Gradient';

const CHART_PADDING = 10;

function Chart(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		definition: { bindingPath, children },
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

const component: Component = {
	name: 'Chart',
	displayName: 'Chart',
	description: 'Chart component',
	component: Chart,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: ChartStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	allowedChildrenType: new Map([['Grid', 1]]),
	bindingPaths: {
		bindingPath: { name: 'Selection Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="url(#paint0_linear_3214_9501)" />
					<path
						className="_chartbars"
						d="M12.3933 7.1395C12.3933 6.09454 13.2412 5.24664 14.2862 5.24664H15.7148C16.7597 5.24664 17.6076 6.09454 17.6076 7.1395V22.8538C17.6076 23.8987 16.7597 24.7466 15.7148 24.7466H14.2862C13.2412 24.7466 12.3933 23.8987 12.3933 22.8538V7.1395ZM5.25049 15.7109C5.25049 14.666 6.09838 13.8181 7.14335 13.8181H8.57192C9.61688 13.8181 10.4648 14.666 10.4648 15.7109V22.8538C10.4648 23.8987 9.61688 24.7466 8.57192 24.7466H7.14335C6.09838 24.7466 5.25049 23.8987 5.25049 22.8538V15.7109ZM21.4291 8.10379H22.8576C23.9026 8.10379 24.7505 8.95168 24.7505 9.99664V22.8538C24.7505 23.8987 23.9026 24.7466 22.8576 24.7466H21.4291C20.3841 24.7466 19.5362 23.8987 19.5362 22.8538V9.99664C19.5362 8.95168 20.3841 8.10379 21.4291 8.10379Z"
						fill="url(#paint1_linear_3214_9501)"
						stroke="#EAECF0"
						strokeWidth="0.5"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9501"
							x1="15"
							y1="0"
							x2="15"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9501"
							x1="15.0005"
							y1="4.99664"
							x2="15.0005"
							y2="24.9966"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0.225" stopColor="#68D2FF" />
							<stop offset="1" stopColor="#31728D" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
		{
			name: 'xAxisLabel',
			displayName: 'X Axis Label',
			description: 'X Axis Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxisLabel',
			displayName: 'Y Axis Label',
			description: 'Y Axis Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xAxisTitle',
			displayName: 'X Axis Title',
			description: 'X Axis Title',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxisTitle',
			displayName: 'Y Axis Title',
			description: 'Y Axis Title',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xAxis',
			displayName: 'X Axis',
			description: 'X Axis',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxis',
			displayName: 'Y Axis',
			description: 'Y Axis',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'legendLabel',
			displayName: 'Legend Label',
			description: 'Legend Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'legendRectangle',
			displayName: 'Legend Rectangle',
			description: 'Legend Rectangle',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'tooltip',
			displayName: 'Tooltip',
			description: 'Tooltip',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'horizontalLines',
			displayName: 'Horizontal Lines',
			description: 'Horizontal Lines',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'verticalLines',
			displayName: 'Vertical Lines',
			description: 'Vertical Lines',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'bar',
			displayName: 'Bar',
			description: 'Bar',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
