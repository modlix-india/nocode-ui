import {
	ChartProperties,
	ChartData,
	Dimension,
	labelDimensions,
	maxDimensions,
} from '../types/common';

const CHART_PADDING = 10;

export default function computeChartDimensions(
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

	if (chartData.xAxisTitle) {
		const node = svg.select('.xAxisTitle').node();
		const [{ width, height }] = labelDimensions([chartData.xAxisTitle], node);
		let y = 0;
		if (properties.xAxisStartPosition !== 'top') {
			y = chartDimension.height + height - CHART_PADDING;
		}
		const x = (chartWidth - width) / 2;
		svg.select('.xAxisTitle').attr('transform', `translate(${x}, ${y})`);
		chartHeight -= height;
	}

	if (chartData.yAxisTitle) {
		const node = svg.select('.yAxisTitle').node();
		svg.select('.yAxisTitle').attr('transform', '');
		const [{ width, height }] = labelDimensions([chartData.yAxisTitle], node);

		let x = 0;
		if (properties.yAxisStartPosition !== 'left') {
			x = chartDimension.width + height - CHART_PADDING;
		}
		const y = (chartDimension.height - width) / 2;
		svg.select('.yAxisTitle').attr('transform', `translate(${x}, ${y}) rotate(-90)`);
		chartWidth -= height;
	}

	return {
		xAxisMaxDimensions,
		yAxisMaxDimensions,
		chartDimension: { width: chartWidth, height: chartHeight },
	};
}
