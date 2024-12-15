import { processStyleObjectToString } from '../../../util/styleProcessor';
import { ChartData, ChartProperties } from '../types/common';

export default function renderGrid(
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
		const ys = (
			yScale.ticks
				? yScale.ticks()
				: chartData.axisInverted
					? xAxisTickValues
					: yAxisTickValues
		).map((d: any) => yScale(d));
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
		const xs = (
			xScale.ticks
				? xScale.ticks()
				: chartData.axisInverted
					? yAxisTickValues
					: xAxisTickValues
		).map((d: any) => xScale(d));
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
