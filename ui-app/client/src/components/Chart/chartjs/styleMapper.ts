import { ChartOptions, ChartDataset } from 'chart.js';
import { ChartJsType } from './dataTransformer';

/**
 * Extracts a CSS color value from a style object
 * Handles: color, fill, stroke, backgroundColor, borderTopColor, borderColor
 * Prioritizes border-top properties for consistent border handling
 */
function extractColor(styles: any): string | undefined {
	if (!styles) return undefined;
	return styles.color || styles.fill || styles.stroke || styles.backgroundColor || styles.borderTopColor || styles.borderColor;
}

/**
 * Extracts font properties from a style object
 */
function extractFont(styles: any): { family?: string; size?: number; weight?: string | number; style?: string } | undefined {
	if (!styles) return undefined;

	const font: { family?: string; size?: number; weight?: string | number; style?: string } = {};

	if (styles.fontFamily) font.family = styles.fontFamily;
	if (styles.fontSize) {
		// Parse fontSize (could be "14px", "1rem", etc.)
		const size = Number.parseFloat(styles.fontSize);
		if (!Number.isNaN(size)) font.size = size;
	}
	if (styles.fontWeight) font.weight = styles.fontWeight;
	if (styles.fontStyle) font.style = styles.fontStyle;

	return Object.keys(font).length > 0 ? font : undefined;
}

/**
 * Extracts line width from a style object
 * Prioritizes border-top-width, then strokeWidth, then borderWidth
 */
function extractLineWidth(styles: any): number | undefined {
	if (!styles) return undefined;
	// Prioritize border-top-width for consistent border handling
	const width = styles.borderTopWidth || styles.strokeWidth || styles.borderWidth;
	if (width) {
		const parsed = Number.parseFloat(width);
		return Number.isNaN(parsed) ? undefined : parsed;
	}
	return undefined;
}

/**
 * Extracts opacity from a style object
 */
function extractOpacity(styles: any): number | undefined {
	if (!styles) return undefined;
	if (styles.opacity !== undefined) {
		const opacity = Number.parseFloat(styles.opacity);
		return Number.isNaN(opacity) ? undefined : opacity;
	}
	return undefined;
}

/**
 * Extracts border radius from a style object
 */
function extractBorderRadius(styles: any): number | undefined {
	if (!styles) return undefined;
	const radius = styles.borderRadius || styles.rx || styles.ry;
	if (radius) {
		const parsed = Number.parseFloat(radius);
		return Number.isNaN(parsed) ? undefined : parsed;
	}
	return undefined;
}

/**
 * Extracts dash pattern from styles
 * Supports: borderTopStyle, strokeDasharray
 */
function extractDashPattern(styles: any): number[] | undefined {
	if (!styles) return undefined;

	// Check for explicit dash array (strokeDasharray)
	const dashArray = styles.strokeDasharray || styles.strokeDashArray;
	if (dashArray) {
		if (Array.isArray(dashArray)) return dashArray;
		if (typeof dashArray === 'string') {
			// Parse "5 5" or "5, 5" or "5,5" format
			const parts = dashArray.split(/[\s,]+/).map((p: string) => Number.parseFloat(p)).filter((n: number) => !Number.isNaN(n));
			if (parts.length > 0) return parts;
		}
	}

	// Check for borderTopStyle (solid, dashed, dotted)
	const borderStyle = styles.borderTopStyle;
	if (borderStyle) {
		switch (borderStyle.toLowerCase()) {
			case 'dashed':
				return [5, 5];
			case 'dotted':
				return [2, 2];
			case 'solid':
			default:
				return undefined; // Solid line (no dash)
		}
	}

	return undefined;
}

/**
 * Applies opacity to a color string
 */
function applyOpacityToColor(color: string, opacity: number): string {
	if (opacity >= 1) return color;
	if (opacity <= 0) return 'transparent';

	// Handle hex colors
	if (color.startsWith('#')) {
		const hex = color.slice(1);
		let r: number, g: number, b: number;

		if (hex.length === 3) {
			r = Number.parseInt(hex[0] + hex[0], 16);
			g = Number.parseInt(hex[1] + hex[1], 16);
			b = Number.parseInt(hex[2] + hex[2], 16);
		} else if (hex.length === 6) {
			r = Number.parseInt(hex.slice(0, 2), 16);
			g = Number.parseInt(hex.slice(2, 4), 16);
			b = Number.parseInt(hex.slice(4, 6), 16);
		} else {
			return color;
		}

		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}

	// Handle rgb colors
	const rgbMatch = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);
	if (rgbMatch) {
		return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
	}

	// Handle existing rgba
	const rgbaMatch = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/.exec(color);
	if (rgbaMatch) {
		return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
	}

	return color;
}

/**
 * Applies axis label styles to Chart.js options
 */
function applyAxisStyles(options: ChartOptions, resolvedStyles: any): void {
	if (!options.scales) return;

	const scales = options.scales as any;

	// X-axis label styles
	if (resolvedStyles.xAxisLabel && scales.x) {
		const color = extractColor(resolvedStyles.xAxisLabel);
		const font = extractFont(resolvedStyles.xAxisLabel);
		const opacity = extractOpacity(resolvedStyles.xAxisLabel);

		if (!scales.x.ticks) scales.x.ticks = {};
		if (color) {
			scales.x.ticks.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (font) scales.x.ticks.font = { ...scales.x.ticks.font, ...font };
	}

	// Y-axis label styles
	if (resolvedStyles.yAxisLabel && scales.y) {
		const color = extractColor(resolvedStyles.yAxisLabel);
		const font = extractFont(resolvedStyles.yAxisLabel);
		const opacity = extractOpacity(resolvedStyles.yAxisLabel);

		if (!scales.y.ticks) scales.y.ticks = {};
		if (color) {
			scales.y.ticks.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (font) scales.y.ticks.font = { ...scales.y.ticks.font, ...font };
	}

	// X-axis title styles
	if (resolvedStyles.xAxisTitle && scales.x) {
		const color = extractColor(resolvedStyles.xAxisTitle);
		const font = extractFont(resolvedStyles.xAxisTitle);
		const opacity = extractOpacity(resolvedStyles.xAxisTitle);

		if (!scales.x.title) scales.x.title = { display: true };
		if (color) {
			scales.x.title.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (font) scales.x.title.font = { ...scales.x.title.font, ...font };
	}

	// Y-axis title styles
	if (resolvedStyles.yAxisTitle && scales.y) {
		const color = extractColor(resolvedStyles.yAxisTitle);
		const font = extractFont(resolvedStyles.yAxisTitle);
		const opacity = extractOpacity(resolvedStyles.yAxisTitle);

		if (!scales.y.title) scales.y.title = { display: true };
		if (color) {
			scales.y.title.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (font) scales.y.title.font = { ...scales.y.title.font, ...font };
	}

	// X-axis line styles
	if (resolvedStyles.xAxis && scales.x) {
		const styles = resolvedStyles.xAxis;
		const color = extractColor(styles);
		const lineWidth = extractLineWidth(styles);
		const opacity = extractOpacity(styles);
		const dashPattern = extractDashPattern(styles);

		if (!scales.x.border) scales.x.border = {};
		if (color) {
			scales.x.border.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (lineWidth !== undefined) scales.x.border.width = lineWidth;
		if (dashPattern) scales.x.border.dash = dashPattern;
	}

	// Y-axis line styles
	if (resolvedStyles.yAxis && scales.y) {
		const styles = resolvedStyles.yAxis;
		const color = extractColor(styles);
		const lineWidth = extractLineWidth(styles);
		const opacity = extractOpacity(styles);
		const dashPattern = extractDashPattern(styles);

		if (!scales.y.border) scales.y.border = {};
		if (color) {
			scales.y.border.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (lineWidth !== undefined) scales.y.border.width = lineWidth;
		if (dashPattern) scales.y.border.dash = dashPattern;
	}
}

/**
 * Applies tick mark styles to Chart.js options
 */
function applyTickStyles(options: ChartOptions, resolvedStyles: any): void {
	if (!options.scales) return;

	const scales = options.scales as any;

	// X-axis tick marks
	if (resolvedStyles.xTicks && scales.x) {
		const styles = resolvedStyles.xTicks;
		const color = extractColor(styles);
		const lineWidth = extractLineWidth(styles);
		const opacity = extractOpacity(styles);
		const dashPattern = extractDashPattern(styles);

		if (!scales.x.grid) scales.x.grid = {};
		if (color) {
			scales.x.grid.tickColor = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (lineWidth !== undefined) scales.x.grid.tickWidth = lineWidth;
		if (dashPattern) scales.x.grid.tickBorderDash = dashPattern;

		// Tick length from height property
		if (styles.height) {
			const height = Number.parseFloat(styles.height);
			if (!Number.isNaN(height)) scales.x.grid.tickLength = height;
		}
	}

	// Y-axis tick marks
	if (resolvedStyles.yTicks && scales.y) {
		const styles = resolvedStyles.yTicks;
		const color = extractColor(styles);
		const lineWidth = extractLineWidth(styles);
		const opacity = extractOpacity(styles);
		const dashPattern = extractDashPattern(styles);

		if (!scales.y.grid) scales.y.grid = {};
		if (color) {
			scales.y.grid.tickColor = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (lineWidth !== undefined) scales.y.grid.tickWidth = lineWidth;
		if (dashPattern) scales.y.grid.tickBorderDash = dashPattern;

		// Tick length from height property
		if (styles.height) {
			const height = Number.parseFloat(styles.height);
			if (!Number.isNaN(height)) scales.y.grid.tickLength = height;
		}
	}
}

/**
 * Applies grid line styles to Chart.js options
 */
function applyGridStyles(options: ChartOptions, resolvedStyles: any): void {
	if (!options.scales) return;

	const scales = options.scales as any;

	// Horizontal grid lines (Y-axis grid)
	if (resolvedStyles.horizontalLines && scales.y) {
		const styles = resolvedStyles.horizontalLines;
		const color = extractColor(styles);
		const lineWidth = extractLineWidth(styles);
		const opacity = extractOpacity(styles);
		const dashPattern = extractDashPattern(styles);

		if (!scales.y.grid) scales.y.grid = {};
		if (color) {
			scales.y.grid.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (lineWidth !== undefined) scales.y.grid.lineWidth = lineWidth;
		if (dashPattern) scales.y.grid.borderDash = dashPattern;
	}

	// Vertical grid lines (X-axis grid)
	if (resolvedStyles.verticalLines && scales.x) {
		const styles = resolvedStyles.verticalLines;
		const color = extractColor(styles);
		const lineWidth = extractLineWidth(styles);
		const opacity = extractOpacity(styles);
		const dashPattern = extractDashPattern(styles);

		if (!scales.x.grid) scales.x.grid = {};
		if (color) {
			scales.x.grid.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
		}
		if (lineWidth !== undefined) scales.x.grid.lineWidth = lineWidth;
		if (dashPattern) scales.x.grid.borderDash = dashPattern;
	}
}

/**
 * Applies legend label styles to Chart.js options
 */
function applyLegendStyles(options: ChartOptions, resolvedStyles: any): void {
	if (!resolvedStyles.legendLabel) return;

	const plugins = options.plugins as any;
	if (!plugins || !plugins.legend) return;

	const color = extractColor(resolvedStyles.legendLabel);
	const font = extractFont(resolvedStyles.legendLabel);
	const opacity = extractOpacity(resolvedStyles.legendLabel);

	if (!plugins.legend.labels) plugins.legend.labels = {};
	if (color) {
		plugins.legend.labels.color = opacity !== undefined ? applyOpacityToColor(color, opacity) : color;
	}
	if (font) plugins.legend.labels.font = { ...plugins.legend.labels.font, ...font };
}

/**
 * Applies legend rectangle (color swatch) styles to Chart.js options
 */
function applyLegendRectangleStyles(options: ChartOptions, resolvedStyles: any): void {
	if (!resolvedStyles.legendRectangle) return;

	const plugins = options.plugins as any;
	if (!plugins?.legend) return;

	if (!plugins.legend.labels) plugins.legend.labels = {};

	const styles = resolvedStyles.legendRectangle;

	// Box dimensions (width and height of the legend color swatch)
	if (styles.width) {
		const width = Number.parseFloat(styles.width);
		if (!Number.isNaN(width)) plugins.legend.labels.boxWidth = width;
	}
	if (styles.height) {
		const height = Number.parseFloat(styles.height);
		if (!Number.isNaN(height)) plugins.legend.labels.boxHeight = height;
	}

	// Border radius for rounded legend swatches
	const borderRadius = styles.borderRadius || styles.rx;
	if (borderRadius) {
		const radius = Number.parseFloat(borderRadius);
		if (!Number.isNaN(radius)) {
			plugins.legend.labels.useBorderRadius = true;
			plugins.legend.labels.borderRadius = radius;
		}
	}

	// Padding between legend items
	if (styles.padding) {
		const padding = Number.parseFloat(styles.padding);
		if (!Number.isNaN(padding)) plugins.legend.labels.padding = padding;
	}
}

/**
 * Applies tooltip styles to Chart.js options
 */
function applyTooltipStyles(options: ChartOptions, resolvedStyles: any): void {
	if (!resolvedStyles.tooltip) return;

	const plugins = options.plugins as any;
	if (!plugins || !plugins.tooltip) return;

	const styles = resolvedStyles.tooltip;
	const textColor = styles.color;
	const bgColor = styles.backgroundColor;
	const font = extractFont(styles);
	const opacity = extractOpacity(styles);

	if (textColor) {
		const appliedColor = opacity !== undefined ? applyOpacityToColor(textColor, opacity) : textColor;
		plugins.tooltip.bodyColor = appliedColor;
		plugins.tooltip.titleColor = appliedColor;
	}
	if (bgColor) {
		plugins.tooltip.backgroundColor = opacity !== undefined ? applyOpacityToColor(bgColor, opacity) : bgColor;
	}
	if (font) {
		plugins.tooltip.bodyFont = { ...plugins.tooltip.bodyFont, ...font };
		plugins.tooltip.titleFont = { ...plugins.tooltip.titleFont, ...font };
	}

	// Border styles - prioritize border-top properties for consistency
	const borderColor = styles.borderTopColor || styles.borderColor;
	if (borderColor) {
		plugins.tooltip.borderColor = borderColor;
	}
	const borderWidthValue = styles.borderTopWidth || styles.borderWidth;
	if (borderWidthValue) {
		const borderWidth = Number.parseFloat(borderWidthValue);
		if (!Number.isNaN(borderWidth)) plugins.tooltip.borderWidth = borderWidth;
	}

	// Border radius (cornerRadius in Chart.js)
	const borderRadius = styles.borderRadius || styles.rx;
	if (borderRadius) {
		const radius = Number.parseFloat(borderRadius);
		if (!Number.isNaN(radius)) plugins.tooltip.cornerRadius = radius;
	}

	// Padding
	if (styles.padding) {
		const padding = Number.parseFloat(styles.padding);
		if (!Number.isNaN(padding)) plugins.tooltip.padding = padding;
	}

	// Width (maxWidth in Chart.js - tooltips auto-size but can be constrained)
	if (styles.width) {
		const width = Number.parseFloat(styles.width);
		if (!Number.isNaN(width)) plugins.tooltip.maxWidth = width;
	}
}

/**
 * Applies subcomponent styles to Chart.js options
 */
export function applyStylesToChartOptions(
	options: ChartOptions,
	resolvedStyles: any,
	_chartType: ChartJsType,
): ChartOptions {
	if (!resolvedStyles) return options;

	applyAxisStyles(options, resolvedStyles);
	applyGridStyles(options, resolvedStyles);
	applyTickStyles(options, resolvedStyles);
	applyLegendStyles(options, resolvedStyles);
	applyLegendRectangleStyles(options, resolvedStyles);
	applyTooltipStyles(options, resolvedStyles);

	return options;
}

/**
 * Gets dataset-specific styles based on chart type
 */
function getDatasetStyleKey(chartType: ChartJsType): string {
	switch (chartType) {
		case 'bar':
			return 'bar';
		case 'line':
			return 'line';
		case 'scatter':
			return 'point';
		case 'pie':
			return 'pie';
		case 'doughnut':
			return 'doughnut';
		case 'radar':
			return 'radar';
		case 'polarArea':
			return 'polarArea';
		default:
			return 'bar';
	}
}

/**
 * Applies subcomponent styles to Chart.js datasets
 */
export function applyStylesToDatasets(
	datasets: ChartDataset[],
	resolvedStyles: any,
	chartType: ChartJsType,
): ChartDataset[] {
	if (!resolvedStyles) return datasets;

	const styleKey = getDatasetStyleKey(chartType);
	const elementStyles = resolvedStyles[styleKey];

	if (!elementStyles) return datasets;

	const backgroundColor = elementStyles.fill || elementStyles.backgroundColor;
	const borderColor = elementStyles.stroke || elementStyles.borderColor;
	const borderWidth = extractLineWidth(elementStyles);
	const opacity = extractOpacity(elementStyles);
	const borderRadius = extractBorderRadius(elementStyles);

	return datasets.map((dataset: any) => {
		const modified = { ...dataset };

		// Only apply style if dataset doesn't already have specific colors set
		// (data-driven colors take precedence over subcomponent styles)
		if (backgroundColor && !isDataDrivenColor(dataset.backgroundColor)) {
			modified.backgroundColor = opacity !== undefined
				? applyOpacityToColor(backgroundColor, opacity)
				: backgroundColor;
		}

		if (borderColor && !isDataDrivenColor(dataset.borderColor)) {
			modified.borderColor = borderColor;
		}

		// Apply borderWidth from subcomponent styles (line thickness)
		// This overrides the default borderWidth set in dataTransformer
		if (borderWidth !== undefined) {
			modified.borderWidth = borderWidth;
		}

		// Apply border radius for bar charts
		// borderSkipped: false ensures rounded corners appear on each stacked bar segment
		if (chartType === 'bar' && borderRadius !== undefined && dataset.borderRadius === undefined) {
			modified.borderRadius = borderRadius;
			// For stacked bars, set borderSkipped to false so each segment shows rounded corners
			modified.borderSkipped = false;
		}

		// Apply point-specific styles for line charts
		if (chartType === 'line' && resolvedStyles.point) {
			const pointStyles = resolvedStyles.point;
			const pointBgColor = pointStyles.fill || pointStyles.backgroundColor;
			// Prioritize border-top properties for consistent border handling
			const pointBorderColor = pointStyles.borderTopColor || pointStyles.stroke || pointStyles.borderColor;
			const pointOpacity = extractOpacity(pointStyles);

			if (pointBgColor && !isDataDrivenColor(dataset.pointBackgroundColor)) {
				modified.pointBackgroundColor = pointOpacity !== undefined
					? applyOpacityToColor(pointBgColor, pointOpacity)
					: pointBgColor;
				// Also apply to hover state
				modified.pointHoverBackgroundColor = modified.pointBackgroundColor;
			}
			if (pointBorderColor && !isDataDrivenColor(dataset.pointBorderColor)) {
				modified.pointBorderColor = pointBorderColor;
				modified.pointHoverBorderColor = pointBorderColor;
			}

			// Point radius (size) - from width, r, or fontSize
			// This overrides the default set in dataTransformer to allow subcomponent styling
			const pointRadius = pointStyles.width || pointStyles.r || pointStyles.fontSize;
			if (pointRadius) {
				const radius = Number.parseFloat(pointRadius);
				if (!Number.isNaN(radius)) {
					// If pointRadius is currently 0 (showOnHover mode), keep it 0 but set hover radius
					if (dataset.pointRadius === 0) {
						modified.pointHoverRadius = radius;
					} else {
						modified.pointRadius = radius;
						modified.pointHoverRadius = radius + 2;
					}
				}
			}

			// Point border width - always apply from styles
			const pointBorderWidth = extractLineWidth(pointStyles);
			if (pointBorderWidth !== undefined) {
				modified.pointBorderWidth = pointBorderWidth;
				modified.pointHoverBorderWidth = pointBorderWidth;
			}
		}

		return modified;
	});
}

/**
 * Checks if a color value is data-driven (array or gradient URL)
 */
function isDataDrivenColor(color: any): boolean {
	if (!color) return false;
	if (Array.isArray(color)) return true;
	if (typeof color === 'string' && color.startsWith('url(')) return true;
	return false;
}
