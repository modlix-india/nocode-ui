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

// Register Chart.js components and plugins
ChartJS.register(
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
	gradientPlugin,
);

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

	// Determine Chart.js type and prepare data
	const chartJsType = useMemo(() => {
		if (!chartData) return 'bar';
		return determineChartJsType(properties, chartData);
	}, [properties, chartData]);

	// Prepare dataset labels
	const dataSetLabels = useMemo(() => {
		return properties.dataSetLabels || [];
	}, [properties.dataSetLabels]);

	// Transform data to Chart.js format and apply subcomponent styles
	const chartJsData = useMemo(() => {
		if (!chartData) return { labels: [], datasets: [] };
		const data = transformToChartJsData(properties, chartData, dataSetLabels);
		// Apply subcomponent styles (bar, line, point, etc.) to datasets
		data.datasets = applyStylesToDatasets(data.datasets, resolvedStyles, chartJsType);
		return data;
	}, [properties, chartData, dataSetLabels, resolvedStyles, chartJsType]);

	// Build Chart.js options
	const chartJsOptions = useMemo(() => {
		if (!chartData) return {};
		return buildChartJsOptions(properties, chartData, chartJsType, resolvedStyles);
	}, [properties, chartData, chartJsType, resolvedStyles]);

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
			<Chart
				ref={chartRef}
				type={chartJsType}
				data={chartJsData}
				options={options}
			/>
		</div>
	);
}
