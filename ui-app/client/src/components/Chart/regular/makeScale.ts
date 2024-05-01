import { isNullValue } from '@fincity/kirun-js';
import { ChartProperties, ChartData } from '../types/common';

export default function makeScale(
	properties: ChartProperties,
	chartData: ChartData,
	d3: any,
	chartHeight: number,
	chartWidth: number,
) {
	let xScale, yScale;

	if (chartData.xAxisType === 'value') {
		let extent = d3.extent(chartData.xUniqueData);

		let min = extent[0];
		let max = extent[1];
		if (!isNullValue(properties.xAxisSuggestedMin) && properties.xAxisSuggestedMin! < min)
			min = properties.xAxisSuggestedMin!;
		if (!isNullValue(properties.xAxisSuggestedMax) && properties.xAxisSuggestedMax! > max)
			max = properties.xAxisSuggestedMax!;
		if (!isNullValue(properties.xAxisMin)) min = properties.xAxisMin!;
		if (!isNullValue(properties.xAxisMax)) max = properties.xAxisMax!;
		extent = [min, max];

		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleLinear()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'ordinal') {
		let data = [...chartData.xUniqueData];
		if (properties.xAxisLabelsSort != 'none') {
			let sortLogic;
			if (chartData.actualXAxisType === 'value')
				sortLogic =
					properties.xAxisLabelsSort === 'ascending'
						? (a: number, b: number) => a - b
						: (a: number, b: number) => b - a;
			else
				sortLogic =
					properties.xAxisLabelsSort === 'ascending'
						? (a: any, b: any) => (a.localeCompare ? a.localeCompare(b) : a - b)
						: (a: any, b: any) => (b.localeCompare ? b.localeCompare(a) : b - a);

			data = data.sort(sortLogic);
		}
		if (properties.xAxisReverse) data = data.reverse();
		if (
			(chartData.hasBar && !chartData.axisInverted) ||
			(chartData.hasHorizontalBar && chartData.axisInverted)
		) {
			xScale = d3
				.scaleBand()
				.domain(data)
				.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
		} else {
			let size = chartData.axisInverted ? chartHeight : chartWidth;
			const gap = size / (data.length + 2);
			xScale = d3
				.scalePoint()
				.domain(data)
				.range([gap, size - gap]);
		}
	} else if (chartData.xAxisType === 'log') {
		let extent = d3.extent(chartData.xUniqueData);
		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleLog()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'time') {
		let extent = d3.extent(chartData.xUniqueData);
		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleTime()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	}

	const yUniqueData = chartData.yUniqueData;

	if (chartData.yAxisType === 'value') {
		let extent = d3.extent(yUniqueData);

		let min = extent[0];
		let max = extent[1];
		if (!isNullValue(properties.yAxisSuggestedMin) && properties.yAxisSuggestedMin! < min)
			min = properties.yAxisSuggestedMin!;
		if (!isNullValue(properties.yAxisSuggestedMax) && properties.yAxisSuggestedMax! > max)
			max = properties.yAxisSuggestedMax!;
		if (!isNullValue(properties.yAxisMin)) min = properties.yAxisMin!;
		if (!isNullValue(properties.yAxisMax)) max = properties.yAxisMax!;
		extent = [min, max];

		if (properties.yAxisReverse) extent = extent.reverse();
		yScale = d3
			.scaleLinear()
			.domain(extent)
			.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
	} else if (chartData.yAxisType === 'ordinal') {
		let data = [...yUniqueData];
		if (properties.yAxisLabelsSort != 'none') {
			let sortLogic;
			if (chartData.actualYAxisType === 'value')
				sortLogic =
					properties.yAxisLabelsSort === 'ascending'
						? (a: number, b: number) => a - b
						: (a: number, b: number) => b - a;
			else
				sortLogic =
					properties.yAxisLabelsSort === 'ascending'
						? (a: any, b: any) => (a.localeCompare ? a.localeCompare(b) : a - b)
						: (a: any, b: any) => (b.localeCompare ? b.localeCompare(a) : b - a);

			data = data.sort(sortLogic);
		}
		if (properties.yAxisReverse) data = [...data].reverse();

		if (
			(chartData.hasBar && chartData.axisInverted) ||
			(chartData.hasHorizontalBar && !chartData.axisInverted)
		) {
			yScale = d3
				.scaleBand()
				.domain(data)
				.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
		} else {
			let size = chartData.axisInverted ? chartWidth : chartHeight;
			const gap = size / (data.length + 2);
			yScale = d3
				.scalePoint()
				.domain(data)
				.range([gap, size - gap]);
		}
	} else if (chartData.yAxisType === 'log') {
		let extent = d3.extent(yUniqueData);
		if (properties.yAxisReverse) extent = extent.reverse();
		yScale = d3
			.scaleLog()
			.domain(extent)
			.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
	}

	if (chartData.axisInverted) {
		[xScale, yScale] = [yScale, xScale];
	}

	if (xScale.nice) xScale = xScale.nice();
	if (yScale.nice) yScale = yScale.nice();

	return { xScale, yScale };
}
