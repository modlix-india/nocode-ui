import { deepEqual } from '@fincity/kirun-js';
import React from 'react';
import { ChartData, ChartProperties, Dimension } from './common';
import RegularDotChartGrid from './chartComponents/RegularDotChartGrid';

export default function Regular({
	properties,
	containerDimension,
	legendDimension,
	chartDimension,
	hiddenDataSets,
	chartData,
	xAxisLabelStyle,
	yAxisLabelStyle,
}: Readonly<{
	properties: ChartProperties;
	containerDimension: Dimension;
	legendDimension: Dimension;
	chartDimension: Dimension;
	hiddenDataSets: Set<number>;
	chartData?: ChartData;
	xAxisLabelStyle: React.CSSProperties;
	yAxisLabelStyle: React.CSSProperties;
}>) {
	const [drawAreaDimension, setDrawAreaDimension] = React.useState<Dimension>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

	if (!chartData) return <></>;

	if (containerDimension.width < 0 || containerDimension.height < 0) return <></>;

	return (
		<>
			<RegularDotChartGrid
				properties={properties}
				chartDimension={chartDimension}
				hiddenDataSets={hiddenDataSets}
				chartData={chartData}
				onDrawAreaDimensionChange={d =>
					setDrawAreaDimension(o => (deepEqual(d, o) ? o : d))
				}
				xAxisLabelStyle={xAxisLabelStyle}
				yAxisLabelStyle={yAxisLabelStyle}
			/>
		</>
	);
}
