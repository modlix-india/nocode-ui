import React from 'react';
import { ChartData, ChartProperties } from '../common';

export default function Grid({
	properties,
	chartData,
}: Readonly<{
	properties: ChartProperties;
	chartData: ChartData;
}>) {
	if (properties.hideGrid) return <></>;

	if (properties.chartType === 'waffle') return <></>;

	let dataSetStyle = [];
	if (chartData.dataSetStyles.length === 0) {
		switch (properties.chartType) {
			case 'regular':
				dataSetStyle = Array(chartData.yAxisData.length).fill('line');
				break;

			case 'radial':
				dataSetStyle = Array(chartData.yAxisData.length).fill('pie');
				break;

			case 'radar':
				dataSetStyle = Array(chartData.yAxisData.length).fill('radar');
				break;

			case 'dot':
				dataSetStyle = Array(chartData.yAxisData.length).fill('dot');
				break;

			default:
				break;
		}
	}

	const centerLabel = !dataSetStyle.some(style => style === 'bar');

	if (!properties.hideXAxis) {
	}

	return <></>;
}
