import { makeRegularChart } from './regular';
import {
	ChartData,
	ChartProperties,
	ChartType,
	DataSetStyle,
	MakeChartProps,
	VALID_COMBINATIONS,
} from './types/common';

export function makeChart(props: MakeChartProps) {
	const { properties, chartData, svgRef, chartDimension } = props;
	const type = `${properties.chartType}-${chartData.hasBar}`;

	if (globalThis.d3.select(svgRef).attr('data-chart-type') !== type) {
		globalThis.d3.select(svgRef).attr('data-chart-type', type);
		globalThis.d3.select(svgRef).select('g.chartGroup').selectAll('*').remove();
	}

	const invalidMessage = checkDataValidity(properties, chartData);

	if (invalidMessage) {
		globalThis.d3.select(svgRef).attr('data-chart-type', 'invalid');
		globalThis.d3.select(svgRef).select('g.chartGroup').selectAll('*').remove();

		globalThis.d3
			.select(svgRef)
			.select('g.chartGroup')
			.append('text')
			.attr('x', chartDimension.width / 2)
			.attr('y', chartDimension.height / 2)
			.attr('class', 'errorMessage')
			.attr('fill', 'currentColor')
			.attr('text-anchor', 'middle')
			.text(invalidMessage);

		return;
	}

	if (properties.chartType === 'regular') {
		makeRegularChart(props);
	}
}

function checkDataValidity(properties: ChartProperties, chartData: ChartData) {
	if (chartData.hasBar && chartData.hasHorizontalBar)
		return 'Bar and Horizontal Bar data set styles cannot be used together';

	const combination = VALID_COMBINATIONS.get(properties.chartType);
	if (!combination) return `Invalid chart type: ${properties.chartType}`;

	for (const dataSet of chartData.dataSetData) {
		if (!combination.has(dataSet.dataSetStyle))
			return `Invalid data set style: ${dataSet.dataSetStyle} for chart type: ${properties.chartType}`;
	}

	let msg = radialChartCheck(properties, chartData);
	if (msg) return msg;

	msg = barChartCheck(properties, chartData);
	if (msg) return msg;

	return undefined;
}

function radialChartCheck(properties: ChartProperties, chartData: ChartData) {
	if (properties.chartType !== ChartType.Radial) return;

	const combos = new Set(chartData.dataSetData.map(d => d.dataSetStyle));
	if (combos.size > 1 && combos.has(DataSetStyle.PolarArea))
		return 'Polar Area cannot be used with other data set styles like Pie and Doughnut';
	return undefined;
}

function barChartCheck(properties: ChartProperties, chartData: ChartData) {
	if (chartData.hasHorizontalBar) {
		if (
			properties.stackedAxis === 'x' &&
			((chartData.xAxisType === 'ordinal' && !chartData.axisInverted) ||
				(chartData.yAxisType === 'ordinal' && chartData.axisInverted))
		)
			return 'Stacked bar chart cannot be used with ordinal x-axis';
	} else if (
		chartData.hasBar &&
		properties.stackedAxis === 'y' &&
		((chartData.yAxisType === 'ordinal' && !chartData.axisInverted) ||
			(chartData.xAxisType === 'ordinal' && chartData.axisInverted))
	) {
		return 'Stacked bar chart cannot be used with ordinal y-axis';
	}
}
