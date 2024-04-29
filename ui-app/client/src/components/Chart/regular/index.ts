import { isNullValue } from '@fincity/kirun-js';
import { processStyleObjectToString } from '../../../util/styleProcessor';
import { ChartData, ChartProperties, DataSetStyle, MakeChartProps } from '../types/common';
import { makeAxis, renderAxis } from './axis';
import computeChartDimensions from './computeChartDimensions';
import makeScale from './makeScale';
import renderGrid from './grid';
import { renderBars } from './render';

export function makeRegularChart(props: MakeChartProps) {
	const {
		properties,
		svgRef,
		chartData,
		chartDimension,
		resolvedStyles,
		focusedDataSet,
		hiddenDataSets,
	} = props;

	const d3 = globalThis.d3;
	const svg = d3.select(svgRef);
	const chartGroup = svg.select('g.chartGroup');

	let {
		xAxisMaxDimensions,
		yAxisMaxDimensions,
		chartDimension: { width: chartWidth, height: chartHeight },
	} = computeChartDimensions(
		chartData.xUniqueData,
		chartData.yUniqueData,
		properties,
		chartData,
		svg,
		chartDimension,
	);

	let chart = chartGroup.select('g.chart');
	if (!chart.node()) {
		chartGroup.append('g').attr('class', 'chart');
		chart = chartGroup.select('g.chart');
	}

	chart.attr(
		'transform',
		`translate(${properties.yAxisStartPosition === 'left' ? yAxisMaxDimensions.width : 0}, ${
			properties.xAxisStartPosition === 'top' ? xAxisMaxDimensions.height : 0
		})`,
	);

	const { xScale, yScale } = makeScale(properties, chartData, d3, chartHeight, chartWidth);

	const { xAxis, yAxis, xAxisTickValues, yAxisTickValues } = makeAxis(
		properties,
		chartData,
		d3,
		svg,
		xScale,
		yScale,
	);

	renderAxis(
		properties,
		xAxis,
		chartGroup,
		yAxisMaxDimensions,
		xAxisMaxDimensions,
		chartHeight,
		yScale,
		chart,
		yAxis,
		chartWidth,
		xScale,
		resolvedStyles,
	);

	renderGrid(
		properties,
		chartData,
		chart,
		chartWidth,
		chartHeight,
		xScale,
		yScale,
		xAxisTickValues,
		yAxisTickValues,
		resolvedStyles,
	);

	const barIndexes: number[] = [];
	const otherIndexes: number[] = [];

	chartData.dataSetData.forEach((data, index) => {
		if (hiddenDataSets.has(index)) return;
		if (
			data.dataSetStyle === DataSetStyle.Bar ||
			data.dataSetStyle === DataSetStyle.HorizontalBar
		)
			barIndexes.push(index);
		else otherIndexes.push(index);
	});

	if (barIndexes.length) {
		renderBars({
			chart,
			barIndexes,
			chartData,
			d3,
			properties,
			xScale,
			yScale,
			chartWidth,
			chartHeight,
			resolvedStyles,
			focusedDataSet,
			onFocusDataSet: props.onFocusDataSet,
		});
	} else {
		chart.selectAll('g.barDataSetGroup').remove();
	}
}
