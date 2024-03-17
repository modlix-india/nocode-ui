import { isNullValue } from '@fincity/kirun-js';
import { processStyleObjectToString } from '../../../util/styleProcessor';
import { ChartData, ChartProperties, Dimension, labelDimensions, maxDimensions } from './common';

export function makeRegularChart(
	properties: ChartProperties,
	chartData: ChartData,
	svgRef: SVGElement,
	resolvedStyles: any,
	chartDimension: Dimension,
	hiddenDataSets: Set<number>,
) {
	const d3 = globalThis.d3;
	const svg = d3.select(svgRef);
	const chartGroup = svg.select('g.chartGroup');

	const yFlatData = Array.from(
		new Set(chartData.yAxisData.filter((_, i) => !hiddenDataSets.has(i)).flat(Infinity)),
	);

	let {
		xAxisMaxDimensions,
		yAxisMaxDimensions,
		chartDimension: { width: chartWidth, height: chartHeight },
	} = computeChartDimensions(
		chartData.xAxisData,
		yFlatData,
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

	const { xScale, yScale } = makeScale(
		properties,
		chartData,
		d3,
		chartHeight,
		chartWidth,
		yFlatData,
	);

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

	// let chartRect = chart.select('rect.chartRect');
	// if (!chartRect.node()) {
	// 	chart.append('rect').attr('class', 'chartRect');
	// 	chartRect = chart.select('rect.chartRect');
	// }
	// chartRect
	// 	.attr('width', chartWidth)
	// 	.attr('height', chartHeight)
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'black');
}

function renderGrid(
	properties: ChartProperties,
	chartData: ChartData,
	chart: any,
	chartWidth: number,
	chartHeight: number,
	xScale: any,
	yScale: any,
	xAxisTickValues: any[],
	yAxisTickValues: any[],
	resolvedStyles: any,
) {
	if (properties.hideGrid) {
		let grid = chart.select('.grid');
		if (grid.node()) {
			grid.remove();
		}
		return;
	}

	let grid = chart.select('.grid');
	if (!grid.node()) {
		chart.append('g').attr('class', 'grid');
		grid = chart.select('.grid');
	}

	if (!properties.hideXLines) {
		grid.selectAll('line.horizontalGrid').remove();
		const ys = (yScale.ticks ? yScale.ticks() : yAxisTickValues).map((d: any) => yScale(d));
		ys.indexOf(chartHeight) === -1 && ys.push(chartHeight);
		ys.indexOf(0) === -1 && ys.push(0);
		grid.selectAll('line.horizontalGrid')
			.data(ys)
			.enter()
			.append('line')
			.attr('class', 'horizontalGrid')
			.attr('x1', 0)
			.attr('x2', chartWidth)
			.attr('y1', (d: any) => d)
			.attr('y2', (d: any) => d)
			.attr('stroke', 'currentColor')
			.attr('style', processStyleObjectToString(resolvedStyles.horizontalLines));
	} else {
		grid.selectAll('line.horizontalGrid').remove();
	}
	if (!properties.hideYLines) {
		grid.selectAll('line.verticalGrid').remove();
		const xs = (xScale.ticks ? xScale.ticks() : xAxisTickValues).map((d: any) => xScale(d));
		xs.indexOf(chartWidth) === -1 && xs.push(chartWidth);
		xs.indexOf(0) === -1 && xs.push(0);
		grid.selectAll('line.verticalGrid')
			.data(xs)
			.enter()
			.append('line')
			.attr('class', 'verticalGrid')
			.attr('x1', (d: any) => d)
			.attr('x2', (d: any) => d)
			.attr('y1', 0)
			.attr('y2', chartHeight)
			.attr('stroke', 'currentColor')
			.attr('style', processStyleObjectToString(resolvedStyles.verticalLines));
	} else {
		grid.selectAll('line.verticalGrid').remove();
	}
}

function renderAxis(
	properties: ChartProperties,
	xAxis: any,
	chartGroup: any,
	yAxisMaxDimensions: Dimension | { width: number; height: number },
	xAxisMaxDimensions: Dimension | { width: number; height: number },
	chartHeight: number,
	yScale: any,
	chart: any,
	yAxis: any,
	chartWidth: number,
	xScale: any,
	resolvedStyles: any,
) {
	if (!properties.hideXAxis && xAxis) {
		let xAxisGroup = chartGroup.select('.xAxisGroup');
		if (xAxisGroup.node()) {
			xAxisGroup.remove();
		}
		chartGroup.append('g').attr('class', 'xAxisGroup');
		xAxisGroup = chartGroup.select('.xAxisGroup');

		let left = 0,
			top = 0;
		if (properties.yAxisStartPosition === 'left') {
			left = yAxisMaxDimensions.width;
		}

		if (properties.xAxisStartPosition === 'top') {
			top = xAxisMaxDimensions.height;
		} else if (properties.xAxisStartPosition === 'center') {
			top = (chartHeight - xAxisMaxDimensions.height) / 2;
		} else if (properties.xAxisStartPosition === 'y0') {
			top = yScale(0);
		} else if (properties.xAxisStartPosition === 'bottom') {
			top = chartHeight;
		} else if (properties.xAxisStartPosition === 'custom') {
			top =
				yScale(properties.xAxisStartCustomValue) ??
				yScale(parseFloat(properties.xAxisStartCustomValue ?? ''));
		}

		xAxisGroup.transition().duration(properties.animationTime).call(xAxis);
		xAxisGroup
			.selectAll('text')
			.attr('opacity', properties.xAxisHideLabels ? 0 : 1)
			.attr('style', processStyleObjectToString(resolvedStyles.xAxisLabel));
		xAxisGroup
			.attr('transform', `translate(${left}, ${top})`)
			.attr('font-size', 'inherit')
			.attr('font-family', 'inherit');
		if (properties.hideXAxisLine) xAxisGroup.selectAll('path.domain').attr('opacity', 0);
	} else {
		let xAxisGroup = chartGroup.select('.xAxisGroup');
		xAxisGroup.remove();
	}

	if (!properties.hideYAxis && yAxis) {
		let yAxisGroup = chartGroup.select('.yAxisGroup');
		if (yAxisGroup.node()) {
			yAxisGroup.remove();
		}
		chartGroup.append('g').attr('class', 'yAxisGroup');
		yAxisGroup = chartGroup.select('.yAxisGroup');

		let left = 0,
			top = 0;
		if (properties.xAxisStartPosition === 'top') {
			top = xAxisMaxDimensions.height;
		}

		if (properties.yAxisStartPosition === 'left') {
			left = yAxisMaxDimensions.width;
		} else if (properties.yAxisStartPosition === 'right') {
			left = chartWidth;
		} else if (properties.yAxisStartPosition === 'center') {
			left = (chartWidth - yAxisMaxDimensions.width) / 2;
		} else if (properties.yAxisStartPosition === 'x0') {
			left = xScale(0);
		} else if (properties.yAxisStartPosition === 'custom') {
			left = xScale(properties.yAxisStartCustomValue);
		}

		yAxisGroup.transition().duration(properties.animationTime).call(yAxis);
		yAxisGroup
			.selectAll('text')
			.attr('opacity', properties.yAxisHideLabels ? 0 : 1)
			.attr('style', processStyleObjectToString(resolvedStyles.yAxisLabel));
		yAxisGroup
			.attr('transform', `translate(${left}, ${top})`)
			.attr('font-size', 'inherit')
			.attr('font-family', 'inherit');
		if (properties.hideYAxisLine) yAxisGroup.selectAll('path.domain').attr('opacity', 0);
	} else {
		let yAxisGroup = chartGroup.select('.yAxisGroup');
		yAxisGroup.remove();
	}
}

function makeAxis(
	properties: ChartProperties,
	chartData: ChartData,
	d3: any,
	svg: any,
	xScale: any,
	yScale: any,
) {
	let xAxis;

	if (properties.xAxisStartPosition === 'top') {
		xAxis = d3.axisTop(xScale);
	} else if (properties.xAxisStartPosition === 'center') {
		xAxis = d3.axisTop(xScale);
	} else if (
		properties.xAxisStartPosition === 'y0' ||
		properties.xAxisStartPosition === 'custom'
	) {
		xAxis = d3.axisBottom(xScale);
	} else if (properties.xAxisStartPosition === 'bottom') {
		xAxis = d3.axisBottom(xScale);
	}

	let yAxis;
	if (properties.yAxisStartPosition === 'right') {
		yAxis = d3.axisRight(yScale);
	} else if (properties.yAxisStartPosition === 'center') {
		yAxis = d3.axisLeft(yScale);
	} else if (
		properties.yAxisStartPosition === 'x0' ||
		properties.yAxisStartPosition === 'custom'
	) {
		yAxis = d3.axisRight(yScale);
	} else if (properties.yAxisStartPosition === 'left') {
		yAxis = d3.axisLeft(yScale);
	}
	if (properties.xAxisHideTicks) xAxis?.tickSize(0);
	if (properties.yAxisHideTicks) yAxis?.tickSize(0);

	let xAxisTickValues = [];

	if (chartData.xAxisType === 'ordinal') {
		const axis = chartData.axisInverted ? yAxis : xAxis;
		const scale = chartData.axisInverted ? yScale : xScale;
		const sizes = labelDimensions(scale.domain(), svg.select('.xAxisLabelSampler').node());
		const maxLabelSize = maxDimensions(sizes);
		const range = scale.range();

		const number = Math.floor(
			Math.abs(range[0] - range[1]) /
				(chartData.axisInverted ? maxLabelSize.height : maxLabelSize.width),
		);

		if (number < sizes.length) {
			const factor = Math.floor(sizes.length / number);
			axis?.tickValues(
				(xAxisTickValues = scale
					.domain()
					.filter(
						(_, index: number, arr: any[]) =>
							!(
								(properties.yAxisStartPosition === 'right'
									? arr.length - index
									: index) % factor
							),
					)),
			);
		} else {
			xAxisTickValues = scale.domain();
		}
	}

	let yAxisTickValues = [];
	if (chartData.yAxisType === 'ordinal') {
		const axis = chartData.axisInverted ? xAxis : yAxis;
		const scale = chartData.axisInverted ? xScale : yScale;
		const sizes = labelDimensions(scale.domain(), svg.select('.yAxisLabelSampler').node());
		const maxLabelSize = maxDimensions(sizes);
		const range = scale.range();

		const number = Math.floor(
			Math.abs(range[0] - range[1]) /
				(chartData.axisInverted ? maxLabelSize.width : maxLabelSize.height),
		);

		if (number < sizes.length) {
			const factor = Math.floor(sizes.length / number);
			axis?.tickValues(
				(yAxisTickValues = scale
					.domain()
					.filter(
						(_, index: number, arr: any[]) =>
							!(
								(properties.xAxisStartPosition === 'top'
									? arr.length - index
									: index) % factor
							),
					)),
			);
		} else {
			yAxisTickValues = scale.domain();
		}
	}

	return { xAxis, yAxis, xAxisTickValues, yAxisTickValues };
}

function makeScale(
	properties: ChartProperties,
	chartData: ChartData,
	d3: any,
	chartHeight: number,
	chartWidth: number,
	yFlatData: any[],
) {
	let xScale, yScale;

	if (chartData.xAxisType === 'value') {
		let extent = d3.extent(chartData.xAxisData);

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
			.domain([min, max])
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'ordinal') {
		let data = [...chartData.xAxisData];
		if (properties.xAxisLabelsSort != 'none')
			data = data.sort(
				properties.xAxisLabelsSort === 'ascending'
					? (a, b) => a.localeCompare(b)
					: (a, b) => b.localeCompare(a),
			);
		if (properties.xAxisReverse) data = data.reverse();
		xScale = chartData.hasBar
			? d3
					.scaleBand()
					.domain(data)
					.range([0, chartData.axisInverted ? chartHeight : chartWidth])
			: d3
					.scalePoint()
					.domain(data)
					.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'log') {
		let extent = d3.extent(chartData.xAxisData);
		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleLog()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	} else if (chartData.xAxisType === 'time') {
		let extent = d3.extent(chartData.xAxisData);
		if (properties.xAxisReverse) extent = extent.reverse();
		xScale = d3
			.scaleTime()
			.domain(extent)
			.range([0, chartData.axisInverted ? chartHeight : chartWidth]);
	}

	if (chartData.yAxisType === 'value') {
		let extent = d3.extent(yFlatData);

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
		let data = [...yFlatData];
		if (properties.xAxisLabelsSort != 'none')
			data = data.sort(
				properties.xAxisLabelsSort === 'ascending'
					? (a, b) => a.localeCompare(b)
					: (a, b) => b.localeCompare(a),
			);
		if (properties.yAxisReverse) data = [...data].reverse();
		yScale = chartData.hasBar
			? d3
					.scaleBand()
					.domain(data)
					.range([chartData.axisInverted ? chartWidth : chartHeight, 0])
			: d3
					.scalePoint()
					.domain(data)
					.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
	} else if (chartData.yAxisType === 'log') {
		let extent = d3.extent(yFlatData);
		if (properties.yAxisReverse) extent = extent.reverse();
		yScale = d3
			.scaleLog()
			.domain(extent)
			.range([chartData.axisInverted ? chartWidth : chartHeight, 0]);
	}

	if (chartData.axisInverted) {
		[xScale, yScale] = [yScale, xScale];
	}
	return { xScale, yScale };
}

function computeChartDimensions(
	xAxisData: any[],
	yFlatData: any[],
	properties: ChartProperties,
	chartData: ChartData,
	svg: any,
	chartDimension: Dimension,
) {
	if (properties.hideGrid) {
		return {
			yAxisMaxDimensions: { width: 0, height: 0 },
			xAxisMaxDimensions: { width: 0, height: 0 },
			chartDimension,
		};
	}

	const uniqueXAxisData = Array.from(new Set(xAxisData));
	const uniqueYAxisData = Array.from(new Set(yFlatData));

	let xAxisLabelsDimensions = labelDimensions(
		uniqueXAxisData,
		svg.select('.xAxisLabelSampler').node(),
	);
	let yAxisLabelsDimensions = labelDimensions(
		uniqueYAxisData,
		svg.select('.yAxisLabelSampler').node(),
	);

	let xAxisMaxDimensions = maxDimensions(xAxisLabelsDimensions);
	let yAxisMaxDimensions = maxDimensions(yAxisLabelsDimensions);

	if (chartData.axisInverted) {
		[xAxisMaxDimensions, yAxisMaxDimensions] = [yAxisMaxDimensions, xAxisMaxDimensions];
	}

	let chartWidth = chartDimension.width;
	let chartHeight = chartDimension.height;
	if (!properties.hideXAxis) {
		if (properties.xAxisStartPosition === 'top' || properties.xAxisStartPosition === 'bottom') {
			chartHeight -= xAxisMaxDimensions.height;
		}
		if (!properties.xAxisHideTicks) {
			chartHeight -= 10;
			xAxisMaxDimensions.height += 15;
		} else {
			chartHeight -= 5;
			xAxisMaxDimensions.height += 10;
		}
	}

	if (!properties.hideYAxis) {
		if (properties.yAxisStartPosition === 'left' || properties.yAxisStartPosition === 'right') {
			chartWidth -= yAxisMaxDimensions.width;
		}
		if (!properties.yAxisHideTicks) {
			chartWidth -= 20;
			yAxisMaxDimensions.width += 15;
		} else {
			chartWidth -= 10;
			yAxisMaxDimensions.width += 10;
		}
	}

	return {
		xAxisMaxDimensions,
		yAxisMaxDimensions,
		chartDimension: { width: chartWidth, height: chartHeight },
	};
}
