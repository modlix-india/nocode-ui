import { ChartData, ChartProperties, Dimension } from './types/common';
import { makeRegularChart } from './types/regular';

export function makeChart(
	properties: ChartProperties,
	chartData: ChartData,
	svgRef: SVGElement,
	resolvedStyles: any,
	chartDimension: Dimension,
	hiddenDataSets: Set<number>,
) {
	const type = `${properties.chartType}-${chartData.hasBar}`;

	if (globalThis.d3.select(svgRef).attr('data-chart-type') !== type) {
		globalThis.d3.select(svgRef).attr('data-chart-type', type);
		globalThis.d3.select(svgRef).select('g.chartGroup').selectAll('*').remove();
	}

	if (properties.chartType === 'regular') {
		makeRegularChart(
			properties,
			chartData,
			svgRef,
			resolvedStyles,
			chartDimension,
			hiddenDataSets,
		);
	}
}
