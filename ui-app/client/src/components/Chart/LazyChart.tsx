import { deepEqual } from '@fincity/kirun-js';
import React, { useEffect, useMemo, useRef } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	LogarithmicScale,
	TimeScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	RadialLinearScale,
	Tooltip,
	Legend,
	Filler,
	BarController,
	LineController,
	PieController,
	DoughnutController,
	RadarController,
	PolarAreaController,
	BubbleController,
	ScatterController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './chartProperties';
import { ChartData, makeChartDataFromProperties } from './types/common';
import {
	transformToChartJsData,
	determineChartJsType,
	buildChartJsOptions,
	applyStylesToDatasets,
} from './chartjs';
import { gradientPlugin } from './chartjs/gradientPlugin';
import { getDataFromPath } from '../../context/StoreContext';
import type { CountryFeature, GeoBuild } from './chartjs/geo';

// Register Chart.js components, controllers and plugins
ChartJS.register(
	// Controllers
	BarController,
	LineController,
	PieController,
	DoughnutController,
	RadarController,
	PolarAreaController,
	BubbleController,
	ScatterController,
	// Scales
	CategoryScale,
	LinearScale,
	LogarithmicScale,
	TimeScale,
	RadialLinearScale,
	// Elements
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	// Plugins
	Tooltip,
	Legend,
	Filler,
	gradientPlugin,
);

/** `buildGeoOptions` lives in the lazily-loaded module, so it is reached through it. */
function buildGeoOptionsSafe(
	geo: { mod: typeof import('./chartjs/geo') } | undefined,
	o: Parameters<typeof import('./chartjs/geo').buildGeoOptions>[0],
): any {
	return geo ? geo.mod.buildGeoOptions(o) : {};
}

export default function LazyChart(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates, properties } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	// Binding path listener for selection binding (currently unused but preserved for future use)
	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			props.context.pageName,
			() => {
				// Selection binding - can be used for click interactions
			},
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const processedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [resolvedStyles, setResolvedStyles] = React.useState<any>({});

	useEffect(() => {
		setResolvedStyles((old: any) => (deepEqual(old, processedStyles) ? old : processedStyles));
	}, [processedStyles]);

	const [oldProperties, setOldProperties] = React.useState<any>(undefined);
	const [chartData, setChartData] = React.useState<ChartData | undefined>(undefined);

	const chartRef = useRef<ChartJS>(null);

	// Empty set - Chart.js handles dataset visibility internally via legend clicks
	const emptyHiddenSet = useMemo(() => new Set<number>(), []);

	useEffect(() => {
		if (deepEqual(properties, oldProperties)) return;
		setOldProperties(properties);
		const cd = makeChartDataFromProperties(
			properties,
			locationHistory,
			pageExtractor,
			emptyHiddenSet,
		);
		setChartData(cd);
	}, [oldProperties, properties, locationHistory, pageExtractor, emptyHiddenSet]);

	// The world map, and only when one is asked for.
	//
	// `chartjs-chart-geo` plus the atlas are a few hundred kilobytes and almost
	// no chart is a map, so the module is pulled in here rather than imported at
	// the top of this file — a static import would put the atlas in the chunk
	// every Chart loads.
	const isGeo = properties.chartType === 'geo';
	const [geo, setGeo] = React.useState<
		{ features: Array<CountryFeature>; mod: typeof import('./chartjs/geo') } | undefined
	>(undefined);

	useEffect(() => {
		if (!isGeo || geo) return;
		let alive = true;
		(async () => {
			const mod = await import(/* webpackChunkName: "chart-geo" */ './chartjs/geo');
			await mod.registerGeo();
			const features = await mod.loadCountries(properties.geoResolution ?? 'coarse');
			if (alive) setGeo({ features, mod });
		})();
		return () => {
			alive = false;
		};
	}, [isGeo, geo, properties.geoResolution]);

	// Determine Chart.js type and prepare data
	const chartJsType = useMemo(() => {
		if (isGeo) return 'choropleth' as any;
		if (!chartData) return 'bar';
		return determineChartJsType(properties, chartData);
	}, [properties, chartData]);

	// Prepare dataset labels
	const dataSetLabels = useMemo(() => {
		return properties.dataSetLabels || [];
	}, [properties.dataSetLabels]);

	// The map's own data, built from the FIRST dataset only. A choropleth has one
	// value per country and no second series to put anywhere.
	const geoBuild: GeoBuild | undefined = useMemo(() => {
		if (!isGeo || !geo || !chartData) return undefined;
		const points = chartData.dataSetData[0]?.data ?? [];
		return geo.mod.buildGeoData(geo.features, points, dataSetLabels[0] ?? '');
	}, [isGeo, geo, chartData, dataSetLabels]);

	// Transform data to Chart.js format and apply subcomponent styles
	const chartJsData = useMemo(() => {
		if (isGeo) return geoBuild?.data ?? { labels: [], datasets: [] };
		if (!chartData) return { labels: [], datasets: [] };
		const data = transformToChartJsData(properties, chartData, dataSetLabels);
		// Apply subcomponent styles (bar, line, point, etc.) to datasets
		data.datasets = applyStylesToDatasets(data.datasets, resolvedStyles, chartJsType);
		return data;
	}, [isGeo, geoBuild, properties, chartData, dataSetLabels, resolvedStyles, chartJsType]);

	// Build Chart.js options
	const chartJsOptions = useMemo(() => {
		if (isGeo) {
			// The high end is the theme's first chart colour, so a map matches the
			// bars beside it without anyone configuring anything. The low end is a
			// pale wash of the same hue rather than a second colour: a map shows
			// how much, and two hues would say "which".
			const themeHigh = getDataFromPath('Theme.chartPrimaryDataColor1', []);
			const high = properties.geoHighColor || themeHigh || '#2a78d6';
			return buildGeoOptionsSafe(geo, {
				projection: properties.geoProjection || 'naturalEarth1',
				lowColor: properties.geoLowColor || '#FFFFFF',
				highColor: high,
				noDataColor: properties.geoNoDataColor || 'rgba(10,10,10,.06)',
				borderColor: 'rgba(10,10,10,.18)',
				showLegend: properties.legendPosition !== 'none',
			});
		}
		if (!chartData) return {};
		return buildChartJsOptions(properties, chartData, chartJsType, resolvedStyles);
	}, [isGeo, geo, properties, chartData, chartJsType, resolvedStyles]);

	// Handle legend click to toggle dataset visibility
	// Chart.js has built-in support for strikethrough on hidden datasets
	const options = useMemo(() => {
		const legendOptions = (chartJsOptions as any).plugins?.legend || {};

		return {
			...chartJsOptions,
			plugins: {
				...chartJsOptions.plugins,
				legend: {
					...legendOptions,
					// Only override onClick if legend interaction is disabled
					onClick: properties.disableLegendInteraction
						? () => {} // Do nothing
						: undefined, // Use Chart.js default behavior (toggle + strikethrough)
				},
			},
		};
	}, [chartJsOptions, properties.disableLegendInteraction]);

	return (
		<div
			className="comp compChart"
			style={{
				...resolvedStyles.comp,
				padding: properties.padding || 10,
			}}
		>
			<HelperComponent context={props.context} definition={definition} />
			{isGeo && !geo ? null : (
				<Chart
					ref={chartRef}
					type={chartJsType}
					data={chartJsData}
					options={options}
				/>
			)}
		</div>
	);
}
