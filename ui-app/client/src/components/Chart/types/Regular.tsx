import React, { useEffect, useMemo } from 'react';
import { ChartData, ChartProperties, makeChartDataFromProperties } from './common';
import { PageStoreExtractor } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { deepEqual } from '@fincity/kirun-js';
import Grid from './chartComponents/Grid';

export default function Regular({
	properties,
	width,
	height,
	locationHistory,
	pageExtractor,
}: Readonly<{
	properties: ChartProperties;
	width: number;
	height: number;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
}>) {
	const [props, setProps] = React.useState<ChartProperties | undefined>();
	const [chartData, setChartData] = React.useState<ChartData | undefined>(undefined);

	useEffect(() => {
		if (deepEqual(properties, props)) return;
		console.log('Setting props', properties);
		setProps(properties);
		setChartData(makeChartDataFromProperties(properties, locationHistory, pageExtractor));
	}, [props, properties, locationHistory, pageExtractor]);

	if (!chartData) return <></>;

	if (width < 0 || height < 0) return <></>;

	return (
		<svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
			<Grid chartData={chartData} properties={properties} />
		</svg>
	);
}
