import { processStyleObjectToString } from '../../../util/styleProcessor';
import {
	ChartProperties,
	Dimension,
	ChartData,
	labelDimensions,
	maxDimensions,
} from '../types/common';

export function renderAxis(
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
	if (!properties.hideGrid && !properties.hideXAxis && xAxis) {
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
			top = chartHeight / 2;
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
			.attr('font-family', 'inherit')
			.attr('style', processStyleObjectToString(resolvedStyles.xAxis));
		if (properties.hideXAxisLine) xAxisGroup.selectAll('path.domain').attr('opacity', 0);
	} else {
		let xAxisGroup = chartGroup.select('.xAxisGroup');
		xAxisGroup.remove();
	}

	if (!properties.hideGrid && !properties.hideYAxis && yAxis) {
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
			left = chartWidth / 2;
		} else if (properties.yAxisStartPosition === 'x0') {
			left = xScale(0);
		} else if (properties.yAxisStartPosition === 'custom') {
			left =
				xScale(properties.yAxisStartCustomValue) ??
				xScale(parseFloat(properties.yAxisStartCustomValue ?? ''));
		}

		yAxisGroup.transition().duration(properties.animationTime).call(yAxis);
		yAxisGroup
			.selectAll('text')
			.attr('opacity', properties.yAxisHideLabels ? 0 : 1)
			.attr('style', processStyleObjectToString(resolvedStyles.yAxisLabel));
		yAxisGroup
			.attr('transform', `translate(${left}, ${top})`)
			.attr('font-size', 'inherit')
			.attr('font-family', 'inherit')
			.attr('style', processStyleObjectToString(resolvedStyles.yAxis));
		if (properties.hideYAxisLine) yAxisGroup.selectAll('path.domain').attr('opacity', 0);
	} else {
		let yAxisGroup = chartGroup.select('.yAxisGroup');
		yAxisGroup.remove();
	}
}

export function makeAxis(
	properties: ChartProperties,
	chartData: ChartData,
	d3: any,
	svg: any,
	xScale: any,
	yScale: any,
) {
	const xAxis = makeXAxis(properties, d3, xScale);

	const yAxis = makeYAxis(properties, d3, yScale);

	if (properties.xAxisHideTicks) xAxis?.tickSize(0);
	if (properties.yAxisHideTicks) yAxis?.tickSize(0);

	const xAxisTickValues = xAxisTicks(chartData, yAxis, xAxis, yScale, xScale, svg, properties);

	const yAxisTickValues = yAxisTicks(chartData, xAxis, yAxis, xScale, yScale, svg, properties);

	return { xAxis, yAxis, xAxisTickValues, yAxisTickValues };
}

function makeYAxis(properties: ChartProperties, d3: any, yScale: any): any {
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
	return yAxis;
}

function makeXAxis(properties: ChartProperties, d3: any, xScale: any): any {
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
	return xAxis;
}

function yAxisTicks(
	chartData: ChartData,
	xAxis: any,
	yAxis: any,
	xScale: any,
	yScale: any,
	svg: any,
	properties: ChartProperties,
): any[] {
	let yAxisTickValues: any[] = [];
	if (chartData.yAxisType !== 'ordinal') return yAxisTickValues;

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
					(_: any, index: number, arr: any[]) =>
						!(
							(properties.xAxisStartPosition === 'top' ? arr.length - index : index) %
							factor
						),
				)),
		);
	} else {
		yAxisTickValues = scale.domain();
	}

	return yAxisTickValues;
}

function xAxisTicks(
	chartData: ChartData,
	yAxis: any,
	xAxis: any,
	yScale: any,
	xScale: any,
	svg: any,
	properties: ChartProperties,
): any[] {
	let xAxisTickValues: any[] = [];
	if (chartData.xAxisType !== 'ordinal') return xAxisTickValues;

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
					(_: any, index: number, arr: any[]) =>
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

	return xAxisTickValues;
}
