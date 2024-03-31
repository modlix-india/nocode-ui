import React, { useEffect, useRef, useState } from 'react';
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

		makeChart(
			properties,
			chartData,
			svgRef.current,
			resolvedStyles,
			{
				width: chartWidth - CHART_PADDING * 2,
				height: chartHeight - CHART_PADDING * 2,
			},
			hiddenDataSets,
		);
	}, [svgRef.current, globalThis.d3, chartData, legendDimension, render, resolvedStyles]);

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

	return (
		<div className={`comp compChart `} style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<svg
				className="chart"
				ref={svgRef}
				viewBox={`0 0 ${svgDimension.width} ${svgDimension.height}`}
				xmlns="http://www.w3.org/2000/svg"
			>
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
					}}
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
				<IconHelper viewBox="0 0 22 24">
					<g id="Group_109" data-name="Group 109" transform="translate(-1387 -336.204)">
						<rect
							id="Rectangle_38"
							data-name="Rectangle 38"
							width="22"
							height="22"
							rx="1"
							transform="translate(1387 338)"
							fill="currentColor"
							fillOpacity="0.2"
						/>
						<rect
							id="Rectangle_39"
							data-name="Rectangle 39"
							width="15"
							height="2"
							rx="0.4"
							transform="translate(1391.5 342.796) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_40"
							data-name="Rectangle 40"
							width="17"
							height="2"
							rx="0.4"
							transform="translate(1389.5 355.796)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_41"
							data-name="Rectangle 41"
							width="9.452"
							height="1.718"
							rx="0.4"
							transform="translate(1394.993 344.876) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_42"
							data-name="Rectangle 42"
							width="6.391"
							height="1.718"
							rx="0.4"
							transform="translate(1401.978 347.937) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_43"
							data-name="Rectangle 43"
							width="3.867"
							height="1.718"
							rx="0.4"
							transform="translate(1398.485 350.461) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_44"
							data-name="Rectangle 44"
							width="18.124"
							height="1.718"
							rx="0.4"
							transform="translate(1405.471 336.204) rotate(90)"
							fill="currentColor"
						/>
					</g>
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
			name: 'bar',
			displayName: 'Bar',
			description: 'Bar',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
