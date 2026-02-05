import { ChartData as ChartJsChartData, ChartDataset } from 'chart.js';
import RepetetiveArray from '../../../util/RepetetiveArray';
import { ChartData, ChartProperties, DataSetData, DataSetStyle, Gradient } from '../types/common';
import { mapPointType, isFilledPointType } from './pointStyleMapper';

export type ChartJsType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'polarArea' | 'bubble';

/**
 * Determines the primary Chart.js chart type based on the dataset styles
 */
export function determineChartJsType(
	properties: ChartProperties,
	chartData: ChartData,
): ChartJsType {
	const { chartType } = properties;

	// Handle radial charts
	if (chartType === 'radial') {
		const firstStyle = chartData.dataSetData[0]?.dataSetStyle;
		if (firstStyle === DataSetStyle.Pie) return 'pie';
		if (firstStyle === DataSetStyle.Doughnut) return 'doughnut';
		if (firstStyle === DataSetStyle.PolarArea) return 'polarArea';
		return 'pie';
	}

	// Handle radar charts
	if (chartType === 'radar') {
		return 'radar';
	}

	// Handle regular charts - determine based on dataset styles
	const styles = chartData.dataSetData.map(d => d.dataSetStyle);

	// If all are bars, use bar
	if (styles.every(s => s === DataSetStyle.Bar || s === DataSetStyle.HorizontalBar)) {
		return 'bar';
	}

	// If all are dots/scatter
	if (styles.every(s => s === DataSetStyle.Dot)) {
		return 'scatter';
	}

	// If all are lines
	if (styles.every(s => isLineStyle(s))) {
		return 'line';
	}

	// Mixed chart - default to bar (Chart.js handles mixed charts)
	return 'bar';
}

function isLineStyle(style: DataSetStyle): boolean {
	return (
		style === DataSetStyle.Line ||
		style === DataSetStyle.SmoothLine ||
		style === DataSetStyle.SteppedLineBefore ||
		style === DataSetStyle.SteppedLineAfter ||
		style === DataSetStyle.SteppedLineMiddle
	);
}

/**
 * Converts RepetetiveArray to a regular array with safety checks
 */
function repArrayToArray<T>(repArray: RepetetiveArray<T> | undefined | null, length: number, defaultValue: T): T[] {
	const result: T[] = [];
	if (length <= 0) {
		return result;
	}
	if (!repArray) {
		// Return array filled with default value
		for (let i = 0; i < length; i++) {
			result.push(defaultValue);
		}
		return result;
	}
	for (let i = 0; i < length; i++) {
		const val = repArray.safeGet(i);
		result.push(val ?? defaultValue);
	}
	return result;
}

/**
 * Gets the dataset type for Chart.js
 */
function getDatasetType(style: DataSetStyle): 'line' | 'bar' | 'scatter' | undefined {
	switch (style) {
		case DataSetStyle.Line:
		case DataSetStyle.SmoothLine:
		case DataSetStyle.SteppedLineBefore:
		case DataSetStyle.SteppedLineAfter:
		case DataSetStyle.SteppedLineMiddle:
			return 'line';
		case DataSetStyle.Bar:
		case DataSetStyle.HorizontalBar:
			return 'bar';
		case DataSetStyle.Dot:
			return 'scatter';
		default:
			return undefined;
	}
}

/**
 * Gets stepped line configuration
 */
function getSteppedConfig(style: DataSetStyle): false | 'before' | 'after' | 'middle' {
	switch (style) {
		case DataSetStyle.SteppedLineBefore:
			return 'before';
		case DataSetStyle.SteppedLineAfter:
			return 'after';
		case DataSetStyle.SteppedLineMiddle:
			return 'middle';
		default:
			return false;
	}
}

/**
 * Checks if a value is a range pair [start, end]
 */
function isRangePair(value: any): value is [number, number] {
	return Array.isArray(value) && value.length === 2 &&
		typeof value[0] === 'number' && typeof value[1] === 'number';
}

/**
 * Checks if a value contains multiple range pairs [[start, end], [start, end], ...]
 */
function isMultipleRangePairs(value: any): value is [number, number][] {
	return Array.isArray(value) && value.length > 0 && value.every(isRangePair);
}

/**
 * Transforms ChartData to Chart.js data format
 */
export function transformToChartJsData(
	properties: ChartProperties,
	chartData: ChartData,
	dataSetLabels: string[],
): ChartJsChartData {
	const { chartType } = properties;

	// Handle radial charts (pie, doughnut, polarArea)
	if (chartType === 'radial') {
		return transformRadialData(properties, chartData, dataSetLabels);
	}

	// Handle radar charts
	if (chartType === 'radar') {
		return transformRadarData(properties, chartData, dataSetLabels);
	}

	// Handle regular charts (line, bar, scatter)
	return transformRegularData(properties, chartData, dataSetLabels);
}

function transformRegularData(
	properties: ChartProperties,
	chartData: ChartData,
	dataSetLabels: string[],
): ChartJsChartData {
	const datasets: ChartDataset[] = [];
	const isStacked = properties.stackedAxis !== 'none';

	// Note: Axis reversal is handled by Chart.js through scales.x.reverse and scales.y.reverse
	// in configBuilder.ts. We should NOT reverse data here as it causes double-reversal issues.

	// Determine if we should use category (ordinal) or point data format
	const useOrdinalFormat = chartData.xAxisType === 'ordinal' || chartData.hasBar;

	// Check if Y values are actually ordinal (strings like "Summer", "Winter") - need special handling for bar charts
	// Use yDataIsActuallyOrdinal which checks if data contains non-numeric values,
	// not just whether yAxisType is configured as 'ordinal'
	const hasOrdinalYValues = chartData.yDataIsActuallyOrdinal;

	// Create a mapping from Y values to their index in yUniqueData (for ordinal Y values)
	// Use index + 1 so that the first category (index 0) has a visible bar length
	const yValueIndexMap = new Map<any, number>();
	if (hasOrdinalYValues && chartData.yUniqueData) {
		chartData.yUniqueData.forEach((val, idx) => {
			yValueIndexMap.set(val, idx + 1);
		});
	}

	// Check if sorting was requested (only then do we need to reorder data)
	const isSortingRequested = properties.xAxisLabelsSort && properties.xAxisLabelsSort !== 'none';

	// Get the labels (xUniqueData is already sorted in common.ts if sorting was requested)
	const labels = [...chartData.xUniqueData];

	// Create a mapping from x-value to index in labels for reordering data (only if sorting)
	const labelIndexMap = new Map<any, number>();
	if (isSortingRequested) {
		labels.forEach((label, idx) => {
			labelIndexMap.set(label, idx);
		});
	}

	// Check if any dataset has multiple range pairs that need to be split into multiple datasets
	const hasMultipleRangePairs = chartData.dataSetData.some(dataSet =>
		dataSet.data.some(d => isMultipleRangePairs(d.y))
	);

	if (hasMultipleRangePairs) {
		// Handle multiple range pairs by creating separate datasets for each range "layer"
		return transformMultiRangeData(properties, chartData, dataSetLabels, labels);
	}

	chartData.dataSetData.forEach((dataSet: DataSetData, index: number) => {
		// Don't skip hidden datasets - Chart.js handles visibility via legend clicks

		const dataLength = dataSet.data.length;
		const colors = repArrayToArray(dataSet.dataColors, dataLength, '#666666');
		const strokeColors = repArrayToArray(dataSet.dataStrokeColors, dataLength, '#666666');
		const fillOpacities = repArrayToArray(dataSet.fillOpacity, dataLength, 1);
		const strokeOpacities = repArrayToArray(dataSet.strokeOpacity, dataLength, 1);
		const pointTypes = repArrayToArray(dataSet.pointType, dataLength, 'circle' as any);
		const pointSizes = repArrayToArray(dataSet.pointSize, dataLength, 3);

		// Get the raw data
		const rawData = [...dataSet.data];

		const datasetType = getDatasetType(dataSet.dataSetStyle);
		const isLine = isLineStyle(dataSet.dataSetStyle);
		const isBar = dataSet.dataSetStyle === DataSetStyle.Bar || dataSet.dataSetStyle === DataSetStyle.HorizontalBar;
		const stepped = getSteppedConfig(dataSet.dataSetStyle);
		const tension = dataSet.dataSetStyle === DataSetStyle.SmoothLine ? 0.4 : 0;

		// Map data to Chart.js format
		// For bar/line charts with ordinal x-axis, use simple values
		// For scatter or numeric axes, use {x, y} objects
		let data: any[];
		let reorderedColors = colors;
		let reorderedStrokeColors = strokeColors;
		let reorderedFillOpacities = fillOpacities;
		let reorderedStrokeOpacities = strokeOpacities;
		let reorderedPointTypes = pointTypes;
		let reorderedPointSizes = pointSizes;

		if (useOrdinalFormat || isBar) {
			if (isSortingRequested) {
				// When sorting is requested, reorder data to match sorted labels
				// Create an array with slots for each label position
				const reorderedData: any[] = new Array(labels.length).fill(null);
				const reorderedColorsArr: string[] = new Array(labels.length).fill('#666666');
				const reorderedStrokeColorsArr: string[] = new Array(labels.length).fill('#666666');
				const reorderedFillOpacitiesArr: number[] = new Array(labels.length).fill(1);
				const reorderedStrokeOpacitiesArr: number[] = new Array(labels.length).fill(1);
				const reorderedPointTypesArr: any[] = new Array(labels.length).fill('circle');
				const reorderedPointSizesArr: number[] = new Array(labels.length).fill(3);

				// Place each data point at its correct position based on its x value
				rawData.forEach((d, i) => {
					const labelIdx = labelIndexMap.get(d.x);
					if (labelIdx !== undefined) {
						// If Y values are ordinal (strings), convert to index
						let yValue = d.y;
						if (hasOrdinalYValues && yValueIndexMap.size > 0) {
							yValue = yValueIndexMap.get(d.y) ?? d.y;
						}
						reorderedData[labelIdx] = yValue;
						reorderedColorsArr[labelIdx] = colors[i];
						reorderedStrokeColorsArr[labelIdx] = strokeColors[i];
						reorderedFillOpacitiesArr[labelIdx] = fillOpacities[i];
						reorderedStrokeOpacitiesArr[labelIdx] = strokeOpacities[i];
						reorderedPointTypesArr[labelIdx] = pointTypes[i];
						reorderedPointSizesArr[labelIdx] = pointSizes[i];
					}
				});

				data = reorderedData;
				reorderedColors = reorderedColorsArr;
				reorderedStrokeColors = reorderedStrokeColorsArr;
				reorderedFillOpacities = reorderedFillOpacitiesArr;
				reorderedStrokeOpacities = reorderedStrokeOpacitiesArr;
				reorderedPointTypes = reorderedPointTypesArr;
				reorderedPointSizes = reorderedPointSizesArr;
			} else if (hasOrdinalYValues && yValueIndexMap.size > 0) {
				// No sorting requested - use original positional order
				// Y values are ordinal (strings), convert to index
				data = rawData.map(d => yValueIndexMap.get(d.y) ?? d.y);
			} else {
				// No sorting requested - use original positional order
				data = rawData.map(d => d.y);
			}
		} else {
			// For numeric/scatter, use point format (no reordering needed, x values define position)
			data = rawData.map(d => {
				if (chartData.axisInverted) {
					return { x: d.y, y: d.x };
				}
				return { x: d.x, y: d.y };
			});
		}

		// Build background colors with opacity - resolve gradient references
		const backgroundColors = reorderedColors.map((color, i) => {
			// Convert gradient url references to actual colors
			const resolvedColor = resolveGradientRef(color, chartData.gradients);
			const opacity = reorderedFillOpacities[i] ?? 1;
			return applyOpacity(resolvedColor, opacity);
		});

		// Build border colors with opacity
		const borderColors = reorderedStrokeColors.map((color, i) => {
			const resolvedColor = resolveGradientRef(color, chartData.gradients);
			const opacity = reorderedStrokeOpacities[i] ?? 1;
			return applyOpacity(resolvedColor, opacity);
		});

		// Map point styles
		const pointStyles = reorderedPointTypes.map(pt => mapPointType(pt));
		const pointBackgroundColors = reorderedPointTypes.map((pt, i) =>
			isFilledPointType(pt) ? backgroundColors[i] : 'transparent',
		);

		// Handle point visibility - if showOnHover is true, hide points by default and show on hover
		const showPointsOnHover = properties.dataSetPointShowOnHover === true;
		const pointRadius = showPointsOnHover ? 0 : reorderedPointSizes;
		// When showing points on hover, set hover radius to the configured sizes
		// Also set a larger hit radius to make hover detection easier when points are hidden
		const pointHoverRadius = showPointsOnHover ? reorderedPointSizes : undefined;
		const pointHitRadius = showPointsOnHover ? 10 : undefined;
		// When showing on hover, use the line color for point background so it's visible
		const hoverPointBackgroundColors = showPointsOnHover ? borderColors : pointBackgroundColors;

		const dataset: any = {
			label: dataSetLabels[index] || `Dataset ${index + 1}`,
			data,
			backgroundColor: isLine ? backgroundColors[0] : backgroundColors,
			borderColor: isLine ? borderColors[0] : borderColors,
			borderWidth: 2,
			fill: isLine ? false : undefined,
			tension,
			stepped,
			pointStyle: pointStyles,
			pointRadius,
			pointHoverRadius,
			pointHitRadius,
			pointBackgroundColor: isLine ? hoverPointBackgroundColors[0] : hoverPointBackgroundColors,
			pointBorderColor: isLine ? borderColors[0] : borderColors,
			pointHoverBackgroundColor: isLine ? borderColors[0] : borderColors,
			pointHoverBorderColor: isLine ? borderColors[0] : borderColors,
			stack: isStacked ? 'stack0' : undefined,
		};

		if (datasetType) {
			dataset.type = datasetType;
		}

		datasets.push(dataset);
	});

	return {
		labels,
		datasets,
	};
}

/**
 * Transforms data with multiple range pairs per category into separate datasets
 * e.g., Jan: [[10,20], [24,29]], Feb: [[13,15], [26,28]] becomes:
 * - Dataset 1: Jan=[10,20], Feb=[13,15]
 * - Dataset 2: Jan=[24,29], Feb=[26,28]
 */
function transformMultiRangeData(
	properties: ChartProperties,
	chartData: ChartData,
	dataSetLabels: string[],
	labels: any[],
): ChartJsChartData {
	const datasets: ChartDataset[] = [];
	const isStacked = properties.stackedAxis !== 'none';

	// Process each original dataset
	chartData.dataSetData.forEach((dataSet: DataSetData, dataSetIndex: number) => {
		const rawData = dataSet.data;
		const dataLength = rawData.length;
		const colors = repArrayToArray(dataSet.dataColors, dataLength, '#666666');
		const strokeColors = repArrayToArray(dataSet.dataStrokeColors, dataLength, '#666666');
		const fillOpacities = repArrayToArray(dataSet.fillOpacity, dataLength, 1);
		const strokeOpacities = repArrayToArray(dataSet.strokeOpacity, dataLength, 1);

		// Find the maximum number of range pairs in this dataset
		let maxRangePairs = 1;
		rawData.forEach(d => {
			if (isMultipleRangePairs(d.y)) {
				maxRangePairs = Math.max(maxRangePairs, d.y.length);
			}
		});

		// Create a dataset for each "layer" of range pairs
		for (let layerIndex = 0; layerIndex < maxRangePairs; layerIndex++) {
			// Build data array for this layer, aligned with unique labels
			const layerData: (number | [number, number] | null)[] = [];
			const layerColors: string[] = [];
			const layerStrokeColors: string[] = [];
			const layerFillOpacities: number[] = [];
			const layerStrokeOpacities: number[] = [];

			// Create a map from x values to their data for this layer
			const xToDataMap = new Map<any, { y: any; colorIdx: number }>();
			rawData.forEach((d, i) => {
				let yValue: any = null;
				if (isMultipleRangePairs(d.y)) {
					// Get the range pair for this layer (if exists)
					yValue = d.y[layerIndex] ?? null;
				} else if (layerIndex === 0) {
					// Single value or single range pair - only include in first layer
					yValue = d.y;
				}
				xToDataMap.set(d.x, { y: yValue, colorIdx: i });
			});

			// Align data with labels (unique x values)
			labels.forEach(label => {
				const dataPoint = xToDataMap.get(label);
				if (dataPoint && dataPoint.y !== null) {
					layerData.push(dataPoint.y);
					layerColors.push(colors[dataPoint.colorIdx]);
					layerStrokeColors.push(strokeColors[dataPoint.colorIdx]);
					layerFillOpacities.push(fillOpacities[dataPoint.colorIdx]);
					layerStrokeOpacities.push(strokeOpacities[dataPoint.colorIdx]);
				} else {
					layerData.push(null);
					layerColors.push(colors[0] || '#666666');
					layerStrokeColors.push(strokeColors[0] || '#666666');
					layerFillOpacities.push(1);
					layerStrokeOpacities.push(1);
				}
			});

			// Build background colors with opacity
			const backgroundColors = layerColors.map((color, i) => {
				const resolvedColor = resolveGradientRef(color, chartData.gradients);
				const opacity = layerFillOpacities[i] ?? 1;
				return applyOpacity(resolvedColor, opacity);
			});

			// Build border colors with opacity
			const borderColors = layerStrokeColors.map((color, i) => {
				const resolvedColor = resolveGradientRef(color, chartData.gradients);
				const opacity = layerStrokeOpacities[i] ?? 1;
				return applyOpacity(resolvedColor, opacity);
			});

			// Only add dataset if it has at least one non-null value
			if (layerData.some(v => v !== null)) {
				const dataset: any = {
					label: maxRangePairs > 1
						? `${dataSetLabels[dataSetIndex] || `Dataset ${dataSetIndex + 1}`} (Range ${layerIndex + 1})`
						: dataSetLabels[dataSetIndex] || `Dataset ${dataSetIndex + 1}`,
					data: layerData,
					backgroundColor: backgroundColors,
					borderColor: borderColors,
					borderWidth: 2,
					type: 'bar' as const,
					stack: isStacked ? `stack${dataSetIndex}` : undefined,
				};

				datasets.push(dataset);
			}
		}
	});

	return {
		labels,
		datasets,
	};
}

/**
 * Keeps gradient url references as-is for the gradient plugin to resolve at render time
 * Non-gradient colors are returned unchanged
 */
function resolveGradientRef(color: string, _gradients: Map<number, Gradient>): string {
	// Keep gradient URL references as-is - the gradient plugin will resolve them
	// at render time when we have access to the canvas context
	return color;
}

function transformRadialData(
	_properties: ChartProperties,
	chartData: ChartData,
	dataSetLabels: string[],
): ChartJsChartData {
	// For pie/doughnut/polarArea, data is structured differently
	// Each data point becomes a slice, not each dataset

	const firstDataSet = chartData.dataSetData[0];
	if (!firstDataSet) {
		return { labels: [], datasets: [] };
	}

	const labels = chartData.xUniqueData.length
		? chartData.xUniqueData
		: firstDataSet.data.map((_, i) => `Item ${i + 1}`);

	const dataLength = firstDataSet.data.length;
	const colors = repArrayToArray(firstDataSet.dataColors, dataLength, '#666666')
		.map(c => resolveGradientRef(c, chartData.gradients));
	const strokeColors = repArrayToArray(firstDataSet.dataStrokeColors, dataLength, '#666666')
		.map(c => resolveGradientRef(c, chartData.gradients));

	return {
		labels,
		datasets: [
			{
				label: dataSetLabels[0] || 'Dataset',
				data: firstDataSet.data.map(d => d.y),
				backgroundColor: colors,
				borderColor: strokeColors,
				borderWidth: 2,
			},
		],
	};
}

function transformRadarData(
	_properties: ChartProperties,
	chartData: ChartData,
	dataSetLabels: string[],
): ChartJsChartData {
	const labels = chartData.xUniqueData;
	const datasets: ChartDataset<'radar'>[] = [];

	chartData.dataSetData.forEach((dataSet: DataSetData, index: number) => {
		// Don't skip hidden datasets - Chart.js handles visibility via legend clicks

		const dataLength = dataSet.data.length;
		const colors = repArrayToArray(dataSet.dataColors, dataLength, '#666666')
			.map(c => resolveGradientRef(c, chartData.gradients));
		const strokeColors = repArrayToArray(dataSet.dataStrokeColors, dataLength, '#666666')
			.map(c => resolveGradientRef(c, chartData.gradients));
		const fillOpacities = repArrayToArray(dataSet.fillOpacity, dataLength, 0.2);

		const backgroundColor = applyOpacity(colors[0] || '#000', fillOpacities[0]);

		datasets.push({
			label: dataSetLabels[index] || `Dataset ${index + 1}`,
			data: dataSet.data.map(d => d.y),
			backgroundColor,
			borderColor: strokeColors[0] || colors[0],
			borderWidth: 2,
			pointBackgroundColor: colors[0],
			pointBorderColor: strokeColors[0],
		});
	});

	return {
		labels,
		datasets,
	};
}

/**
 * Applies opacity to a color string
 */
function applyOpacity(color: string, opacity: number): string {
	if (opacity >= 1) return color;
	if (opacity <= 0) return 'transparent';

	// Handle gradient references - return as-is
	if (color.startsWith('url(')) return color;

	// Handle hex colors
	if (color.startsWith('#')) {
		const hex = color.slice(1);
		let r: number, g: number, b: number;

		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16);
			g = parseInt(hex[1] + hex[1], 16);
			b = parseInt(hex[2] + hex[2], 16);
		} else if (hex.length === 6) {
			r = parseInt(hex.slice(0, 2), 16);
			g = parseInt(hex.slice(2, 4), 16);
			b = parseInt(hex.slice(4, 6), 16);
		} else {
			return color;
		}

		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}

	// Handle rgb/rgba colors
	const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
	if (rgbMatch) {
		return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
	}

	// For named colors or other formats, wrap in rgba if possible
	return color;
}
