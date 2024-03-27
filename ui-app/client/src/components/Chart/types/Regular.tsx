import React, { useEffect, useMemo } from 'react';
import { ChartData, ChartProperties, Dimension, makeChartDataFromProperties } from './common';
import { PageStoreExtractor } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { deepEqual } from '@fincity/kirun-js';
import Grid from './chartComponents/Grid';

export default function Regular({
	properties,
	chartDimension: { width, height },
	legendDimension,
	locationHistory,
	pageExtractor,
}: Readonly<{
	properties: ChartProperties;
	chartDimension: Dimension;
	legendDimension: Dimension;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
}>) {
	const [props, setProps] = React.useState<ChartProperties | undefined>();
	const [chartData, setChartData] = React.useState<ChartData | undefined>(undefined);

	if (!chartData) return <></>;

	if (width < 0 || height < 0) return <></>;

	return <> </>;

	// return (
	// 	<svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
	// 		<Grid chartData={chartData} properties={properties} width={width} height={height} />
	// 	</svg>
	// );
}
