import React from 'react';
import { ChartProperties, Dimension, ChartData } from '../common';

export default function RegularDotChartGrid({
	properties,
	chartDimension,
	hiddenDataSets,
	chartData,
	xAxisLabelStyle,
	yAxisLabelStyle,
}: Readonly<{
	properties: ChartProperties;
	chartDimension: Dimension;
	hiddenDataSets: Set<number>;
	chartData?: ChartData;
	onDrawAreaDimensionChange: (dimension: Dimension) => void;
	xAxisLabelStyle?: React.CSSProperties;
	yAxisLabelStyle?: React.CSSProperties;
}>) {
	const xAxisLabelRef = React.useRef<SVGTextElement>(null);
	const yAxisLabelRef = React.useRef<SVGTextElement>(null);

	if (
		properties.hideGrid ||
		(properties.chartType !== 'regular' && properties.chartType !== 'dot')
	)
		return <></>;
	return <></>;
}
