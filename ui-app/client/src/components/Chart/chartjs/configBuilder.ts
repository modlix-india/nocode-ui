import { ChartOptions, ScaleOptionsByType } from 'chart.js';
import { ChartData, ChartProperties, AxisType, Gradient } from '../types/common';
import { mapEasingFunction } from './pointStyleMapper';
import { ChartJsType } from './dataTransformer';
import { applyStylesToChartOptions } from './styleMapper';

/**
 * Extracts the first color stop from a CSS gradient string
 */
function extractFirstColorFromGradient(gradientStr: string): string | null {
	const linearMatch = gradientStr.match(/linear-gradient\(([^)]+)\)/i);
	const radialMatch = gradientStr.match(/radial-gradient\(([^)]+)\)/i);

	const content = linearMatch?.[1] || radialMatch?.[1];
	if (!content) return null;

	const parts = content.split(',').map(p => p.trim());

	// Skip angle/direction for linear gradients
	let colorStartIndex = 0;
	if (parts[0].match(/^\d+deg$/) || parts[0].startsWith('to ')) {
		colorStartIndex = 1;
	}
	// Skip shape for radial gradients
	if (parts[0].includes('circle') || parts[0].includes('ellipse')) {
		colorStartIndex = 1;
	}

	const firstColorPart = parts[colorStartIndex];
	if (!firstColorPart) return null;

	// Extract color (may have percentage after it)
	const stopMatch = firstColorPart.match(/^(.+?)\s+\d+%?$/);
	return stopMatch ? stopMatch[1].trim() : firstColorPart.trim();
}

/**
 * Gets the gradient definition for a gradient URL
 */
function getGradientDefinition(
	color: string | CanvasGradient | undefined | null,
	gradients: Map<number, Gradient> | undefined,
): Gradient | null {
	if (!color || typeof color !== 'string' || !gradients) return null;

	const match = /url\(#gradient_(\d+)\)/.exec(color);
	if (!match) return null;

	const hashCode = Number.parseInt(match[1], 10);
	return Array.from(gradients.values()).find(g => Math.abs(g.hashCode) === hashCode) || null;
}

/**
 * Creates a canvas gradient for the legend swatch
 */
function createLegendGradient(
	ctx: CanvasRenderingContext2D,
	gradient: Gradient,
	size: number = 12,
): CanvasGradient | string {
	const gradientStr = gradient.gradient.toLowerCase();
	const isLinear = gradientStr.includes('linear');

	// Parse the gradient to get stops
	const parsed = parseGradientForLegend(gradientStr);
	if (!parsed || parsed.stops.length === 0) {
		return extractFirstColorFromGradient(gradient.gradient) || '#666666';
	}

	let canvasGradient: CanvasGradient;

	if (isLinear) {
		// Create a linear gradient for the legend swatch
		const angle = ((parsed.angle || 180) * Math.PI) / 180;
		const halfSize = size / 2;
		const x0 = halfSize - Math.sin(angle) * halfSize;
		const y0 = halfSize - Math.cos(angle) * halfSize;
		const x1 = halfSize + Math.sin(angle) * halfSize;
		const y1 = halfSize + Math.cos(angle) * halfSize;
		canvasGradient = ctx.createLinearGradient(x0, y0, x1, y1);
	} else {
		// Create a radial gradient for the legend swatch
		const halfSize = size / 2;
		canvasGradient = ctx.createRadialGradient(halfSize, halfSize, 0, halfSize, halfSize, halfSize);
	}

	parsed.stops.forEach(stop => {
		try {
			canvasGradient.addColorStop(stop.offset, stop.color);
		} catch {
			// Invalid color, skip
		}
	});

	return canvasGradient;
}

/**
 * Parses a CSS gradient string for legend rendering
 */
function parseGradientForLegend(gradientStr: string): { angle?: number; stops: { offset: number; color: string }[] } | null {
	const linearMatch = gradientStr.match(/linear-gradient\(([^)]+)\)/i);
	const radialMatch = gradientStr.match(/radial-gradient\(([^)]+)\)/i);

	const content = linearMatch?.[1] || radialMatch?.[1];
	if (!content) return null;

	const parts = content.split(',').map(p => p.trim());
	let angle = 180;
	let colorStartIndex = 0;

	// Parse angle for linear gradients
	const angleMatch = parts[0].match(/^(\d+)deg$/);
	if (angleMatch) {
		angle = Number.parseInt(angleMatch[1], 10);
		colorStartIndex = 1;
	} else if (parts[0].startsWith('to ')) {
		const direction = parts[0].toLowerCase();
		if (direction === 'to top') angle = 0;
		else if (direction === 'to right') angle = 90;
		else if (direction === 'to bottom') angle = 180;
		else if (direction === 'to left') angle = 270;
		colorStartIndex = 1;
	}

	// Skip shape for radial gradients
	if (parts[0].includes('circle') || parts[0].includes('ellipse')) {
		colorStartIndex = 1;
	}

	const stops: { offset: number; color: string }[] = [];
	const colorParts = parts.slice(colorStartIndex);

	colorParts.forEach((part, index) => {
		const stopMatch = part.match(/^(.+?)\s+(\d+)%?$/);
		if (stopMatch) {
			stops.push({
				color: stopMatch[1].trim(),
				offset: parseInt(stopMatch[2], 10) / 100,
			});
		} else {
			stops.push({
				color: part.trim(),
				offset: index / (colorParts.length - 1 || 1),
			});
		}
	});

	return { angle, stops };
}

/**
 * Maps axis type to Chart.js scale type
 */
function mapAxisType(axisType: AxisType | 'time'): 'category' | 'linear' | 'logarithmic' | 'time' {
	switch (axisType) {
		case 'ordinal':
			return 'category';
		case 'value':
			return 'linear';
		case 'log':
			return 'logarithmic';
		case 'time':
			return 'time';
		default:
			return 'category';
	}
}

/**
 * Maps tooltip position to Chart.js position
 */
/**
 * Maps tooltip position to Chart.js xAlign/yAlign values
 * - 'top': tooltip appears above the point
 * - 'bottom': tooltip appears below the point
 * - 'left': tooltip appears to the left of the point
 * - 'right': tooltip appears to the right of the point
 */
function getTooltipAlignment(position: string): { xAlign?: string; yAlign?: string } {
	switch (position) {
		case 'top':
			return { yAlign: 'bottom' };
		case 'bottom':
			return { yAlign: 'top' };
		case 'left':
			return { xAlign: 'right' };
		case 'right':
			return { xAlign: 'left' };
		default:
			return {};
	}
}

/**
 * Builds Chart.js options from ChartProperties
 */
export function buildChartJsOptions(
	properties: ChartProperties,
	chartData: ChartData,
	chartType: ChartJsType,
	resolvedStyles?: any,
): ChartOptions {
	const isRadial = chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea';
	const isRadar = chartType === 'radar';
	const isStacked = properties.stackedAxis !== 'none';
	const isHorizontalBar = chartData.hasHorizontalBar;

	// Extract original dataset colors before they get converted by the gradient plugin
	const originalDatasetColors = chartData.dataSetData.map(dataSet => ({
		bg: dataSet.dataColors?.get(0) ?? null,
		border: dataSet.dataStrokeColors?.get(0) ?? null,
	}));

	const options: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: isHorizontalBar ? 'y' : 'x',

		// Animation
		animation: properties.animationTime > 0
			? {
					duration: properties.animationTime,
					easing: mapEasingFunction(properties.animationTimingFunction) as any,
				}
			: false,

		// Plugins
		plugins: {
			legend: buildLegendOptions(properties, chartData.gradients, originalDatasetColors),
			tooltip: buildTooltipOptions(properties),
			gradientPlugin: {
				// Convert Map to array for serialization (Chart.js clones options)
				gradients: Array.from(chartData.gradients?.entries() || []),
				// Gradient space: 'objectBoundingBox' (per-element) or 'userSpaceOnUse' (chart area)
				gradientSpace: properties.gradientSpace || 'userSpaceOnUse',
			},
		},
	};

	// Add scales for non-radial charts
	if (!isRadial && !isRadar) {
		(options as any).scales = buildScalesOptions(properties, chartData, isStacked, isHorizontalBar);
	}

	// Radar-specific options
	if (isRadar) {
		(options as any).scales = {
			r: buildRadarScaleOptions(properties, chartData),
		};
	}

	// Apply subcomponent styles from resolvedStyles
	if (resolvedStyles) {
		applyStylesToChartOptions(options, resolvedStyles, chartType);
	}

	return options;
}

/**
 * Builds legend configuration
 */
function buildLegendOptions(
	properties: ChartProperties,
	gradients: Map<number, Gradient> | undefined,
	originalDatasetColors: { bg: string | null; border: string | null }[],
): any {
	const legendPosition = properties.legendPosition || 'top';

	if (legendPosition === 'none') {
		return { display: false };
	}

	const legendOptions: any = {
		display: true,
		position: legendPosition,
		labels: {
			usePointStyle: true,
			padding: 15,
		},
	};

	// Add custom label generator to handle gradient colors
	if (gradients && gradients.size > 0 && originalDatasetColors.length > 0) {
		legendOptions.labels.generateLabels = (chart: any) => {
			// Get default labels from Chart.js
			const defaultLabels = chart.constructor.defaults.plugins.legend.labels.generateLabels(chart);
			const ctx = chart.ctx;

			// Process each label to create gradient swatches
			return defaultLabels.map((label: any) => {
				const datasetIndex = label.datasetIndex;
				const originalColors = originalDatasetColors[datasetIndex];

				if (!originalColors || !ctx) return label;

				// Use stored original colors to find gradients
				const fillGradient = getGradientDefinition(originalColors.bg, gradients);
				if (fillGradient) {
					label.fillStyle = createLegendGradient(ctx, fillGradient);
				}

				const strokeGradient = getGradientDefinition(originalColors.border, gradients);
				if (strokeGradient) {
					label.strokeStyle = createLegendGradient(ctx, strokeGradient);
				}

				return label;
			});
		};
	}

	return legendOptions;
}

/**
 * Builds tooltip configuration
 */
function buildTooltipOptions(properties: ChartProperties): any {
	const tooltipMode =
		properties.tooltipData === 'allDataSets' ? 'index' : 'nearest';
	const intersect = properties.tooltipTrigger !== 'hoverOnAxis';
	const alignment = getTooltipAlignment(properties.tooltipPosition);

	const tooltipOptions: any = {
		enabled: true,
		mode: tooltipMode,
		intersect,
		position: 'nearest',
		...alignment,
	};

	// Add custom label callback if tooltipLabel is specified
	if (properties.tooltipLabel) {
		// Hide legend color box when custom label is provided
		tooltipOptions.displayColors = false;
		tooltipOptions.callbacks = {
			// Hide title when custom label is provided
			title: () => '',
			label: (context: any) => {
				// Build Data object from tooltip context
				const Data: Record<string, any> = {
					x: context.parsed?.x ?? context.label,
					y: context.parsed?.y ?? context.raw,
					label: context.label,
					value: context.formattedValue,
					raw: context.raw,
					datasetLabel: context.dataset?.label,
					dataIndex: context.dataIndex,
					datasetIndex: context.datasetIndex,
				};

				// Evaluate expression by replacing Data.property references
				try {
					// Simple expression evaluation using Function constructor
					// eslint-disable-next-line no-new-func
					const evalFn = new Function('Data', `return ${properties.tooltipLabel}`);
					return evalFn(Data);
				} catch {
					// Fallback to default label format
					return `${context.dataset?.label || ''}: ${context.formattedValue}`;
				}
			},
		};
	}

	return tooltipOptions;
}

/**
 * Builds scales configuration for regular charts
 */
function buildScalesOptions(
	properties: ChartProperties,
	chartData: ChartData,
	isStacked: boolean,
	isHorizontalBar: boolean = false,
): Record<string, ScaleOptionsByType<any>> {
	// For horizontal bar charts, swap the axis types
	// X-axis becomes the value axis, Y-axis becomes the category axis
	let xAxisType = mapAxisType(chartData.xAxisType);
	let yAxisType = mapAxisType(chartData.yAxisType);

	// Check if Y values are actually ordinal (strings like "Summer", "Winter")
	// Use yDataIsActuallyOrdinal which checks the actual data, not just configured type
	const hasOrdinalYValues = chartData.yDataIsActuallyOrdinal;

	// Disable stacking when Y values are ordinal - stacking doesn't make sense for categorical values
	// because they represent discrete categories, not quantities that should be cumulated
	const effectiveStacked = isStacked && !hasOrdinalYValues;

	if (isHorizontalBar) {
		// For horizontal bars: y-axis shows categories, x-axis shows values
		// If Y values are ordinal, x-axis stays linear but with custom tick labels
		// (category scale doesn't work for bar lengths - it treats values as positions, not lengths)
		xAxisType = 'linear';
		yAxisType = 'category';
	} else if (chartData.hasBar && hasOrdinalYValues) {
		// For vertical bars with ordinal Y values: y-axis stays linear with custom tick labels
		yAxisType = 'linear';
	}

	// Build custom ticks for ordinal Y values
	const xAxisOrdinalTicks = isHorizontalBar && hasOrdinalYValues ? {
		display: !properties.xAxisHideLabels,
		stepSize: 1,
		callback: function(value: number) {
			// Show ordinal labels at positions 1, 2, 3, etc. (index 0 is the origin)
			if (value === 0) return '';
			const index = value - 1;
			return chartData.yUniqueData[index] || '';
		},
	} : { display: !properties.xAxisHideLabels };

	const yAxisOrdinalTicks = !isHorizontalBar && chartData.hasBar && hasOrdinalYValues ? {
		display: !properties.yAxisHideLabels,
		stepSize: 1,
		callback: function(value: number) {
			// Show ordinal labels at positions 1, 2, 3, etc. (index 0 is the origin)
			if (value === 0) return '';
			const index = value - 1;
			return chartData.yUniqueData[index] || '';
		},
	} : { display: !properties.yAxisHideLabels };

	const scales: Record<string, any> = {
		x: {
			type: xAxisType,
			display: !properties.hideXAxis,
			position: mapAxisPosition(properties.xAxisStartPosition, 'x'),
			reverse: !!properties.xAxisReverse, // Ensure boolean
			stacked: effectiveStacked,
			// For horizontal bars with ordinal Y values, set min/max for linear scale
			...(isHorizontalBar && hasOrdinalYValues ? {
				min: 0,
				max: chartData.yUniqueData.length + 1,
			} : {}),
			title: {
				display: !!chartData.xAxisTitle,
				text: chartData.xAxisTitle || '',
			},
			grid: {
				display: !properties.hideXLines,
				drawBorder: !properties.hideXAxisLine,
				tickLength: properties.xAxisHideTicks ? 0 : undefined,
			},
			ticks: xAxisOrdinalTicks,
		},
		y: {
			type: yAxisType,
			display: !properties.hideYAxis,
			position: mapAxisPosition(properties.yAxisStartPosition, 'y'),
			reverse: !!properties.yAxisReverse, // Ensure boolean
			stacked: effectiveStacked,
			// For vertical bars with ordinal Y values, set min/max for linear scale
			...(!isHorizontalBar && chartData.hasBar && hasOrdinalYValues ? {
				min: 0,
				max: chartData.yUniqueData.length + 1,
			} : {}),
			title: {
				display: !!chartData.yAxisTitle,
				text: chartData.yAxisTitle || '',
			},
			grid: {
				display: !properties.hideYLines,
				drawBorder: !properties.hideYAxisLine,
				tickLength: properties.yAxisHideTicks ? 0 : undefined,
			},
			ticks: yAxisOrdinalTicks,
		},
	};

	// Apply min/max constraints for x-axis
	if (xAxisType !== 'category') {
		if (isHorizontalBar) {
			// For horizontal bars, X-axis is the value axis
			// Accept both xAxisMin/Max (intuitive for X) and yAxisMin/Max (semantic value range)
			// xAxisMin/Max takes precedence if both are set
			const xMin = properties.xAxisMin ?? properties.yAxisMin;
			const xMax = properties.xAxisMax ?? properties.yAxisMax;
			const xSuggestedMin = properties.xAxisSuggestedMin ?? properties.yAxisSuggestedMin;
			const xSuggestedMax = properties.xAxisSuggestedMax ?? properties.yAxisSuggestedMax;
			if (xMin !== undefined) scales.x.min = xMin;
			if (xMax !== undefined) scales.x.max = xMax;
			if (xSuggestedMin !== undefined) scales.x.suggestedMin = xSuggestedMin;
			if (xSuggestedMax !== undefined) scales.x.suggestedMax = xSuggestedMax;
		} else {
			if (properties.xAxisMin !== undefined) scales.x.min = properties.xAxisMin;
			if (properties.xAxisMax !== undefined) scales.x.max = properties.xAxisMax;
			if (properties.xAxisSuggestedMin !== undefined)
				scales.x.suggestedMin = properties.xAxisSuggestedMin;
			if (properties.xAxisSuggestedMax !== undefined)
				scales.x.suggestedMax = properties.xAxisSuggestedMax;
		}
	}

	// Apply min/max constraints for y-axis
	if (yAxisType !== 'category') {
		if (isHorizontalBar) {
			// For horizontal bars, Y-axis is category, but if it's somehow linear
			// (mixed chart scenario), accept both xAxisMin/Max and yAxisMin/Max
			const yMin = properties.yAxisMin ?? properties.xAxisMin;
			const yMax = properties.yAxisMax ?? properties.xAxisMax;
			const ySuggestedMin = properties.yAxisSuggestedMin ?? properties.xAxisSuggestedMin;
			const ySuggestedMax = properties.yAxisSuggestedMax ?? properties.xAxisSuggestedMax;
			if (yMin !== undefined) scales.y.min = yMin;
			if (yMax !== undefined) scales.y.max = yMax;
			if (ySuggestedMin !== undefined) scales.y.suggestedMin = ySuggestedMin;
			if (ySuggestedMax !== undefined) scales.y.suggestedMax = ySuggestedMax;
		} else {
			if (properties.yAxisMin !== undefined) scales.y.min = properties.yAxisMin;
			if (properties.yAxisMax !== undefined) scales.y.max = properties.yAxisMax;
			if (properties.yAxisSuggestedMin !== undefined)
				scales.y.suggestedMin = properties.yAxisSuggestedMin;
			if (properties.yAxisSuggestedMax !== undefined)
				scales.y.suggestedMax = properties.yAxisSuggestedMax;
		}
	}

	// Auto-reverse value axis based on category axis position for bar charts
	// This makes bars start from the axis position (e.g., bars grow down when x-axis is at top)
	if (chartData.hasBar && !isHorizontalBar) {
		// Vertical bars: if x-axis (category) is at top, reverse y-axis (value) to make bars grow down
		if (properties.xAxisStartPosition === 'top' && properties.yAxisReverse === undefined) {
			scales.y.reverse = true;
		}
	}
	if (isHorizontalBar) {
		// Horizontal bars: if y-axis (category) is at right, reverse x-axis (value) to make bars grow left
		if (properties.yAxisStartPosition === 'right' && properties.xAxisReverse === undefined) {
			scales.x.reverse = true;
		}
	}

	return scales;
}

/**
 * Builds radar scale options
 */
function buildRadarScaleOptions(properties: ChartProperties, _chartData?: ChartData): any {
	return {
		angleLines: {
			display: !properties.hideGrid,
		},
		grid: {
			display: !properties.hideGrid,
		},
		pointLabels: {
			display: true,
		},
		ticks: {
			display: !properties.hideYAxis,
		},
	};
}

/**
 * Maps axis position from properties to Chart.js position
 */
function mapAxisPosition(
	position: string,
	axis: 'x' | 'y',
): 'top' | 'bottom' | 'left' | 'right' | 'center' {
	if (axis === 'x') {
		switch (position) {
			case 'top':
				return 'top';
			case 'center':
			case 'y0':
				return 'center';
			default:
				return 'bottom';
		}
	} else {
		switch (position) {
			case 'right':
				return 'right';
			case 'center':
			case 'x0':
				return 'center';
			default:
				return 'left';
		}
	}
}
