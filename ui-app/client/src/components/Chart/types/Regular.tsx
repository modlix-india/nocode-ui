import React from 'react';
import { ChartProperties, makeChartDataFromProperties } from './common';
import { PageStoreExtractor } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';

export default function Regular({
	properties,
	containerRef,
	locationHistory,
	pageExtractor,
}: {
	properties: ChartProperties;
	containerRef: HTMLDivElement | null;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
}) {
	return (
		<pre>
			{JSON.stringify(
				makeChartDataFromProperties(properties, locationHistory, pageExtractor),
				null,
				2,
			)}
		</pre>
	);
}
