import { Chart as ChartJS, Plugin } from 'chart.js';
import { Gradient } from '../types/common';
import { createCanvasGradient } from './gradientHelper';

// Cache for canvas gradients per chart
const chartGradientCache = new WeakMap<ChartJS, Map<string, CanvasGradient>>();

// Store original gradient URLs per chart (so we can recreate gradients when bounds change)
const originalGradientUrls = new WeakMap<ChartJS, Map<string, string>>();

// Extend chart options type to include our custom gradients property
declare module 'chart.js' {
	interface PluginOptionsByType<TType> {
		gradientPlugin?: {
			// Array format for serialization (Chart.js clones options, Maps don't survive)
			gradients?: Array<[number, Gradient]>;
			// Gradient space: 'objectBoundingBox' (per-element) or 'userSpaceOnUse' (chart area)
			gradientSpace?: 'objectBoundingBox' | 'userSpaceOnUse';
		};
	}
}

/**
 * Sets gradient data for a chart instance (legacy support)
 */
export function setChartGradients(_chart: ChartJS, _gradients: Map<number, Gradient>): void {
	// No longer used - gradients are now passed via options
}

/**
 * Extracts gradient definition from URL reference
 */
function getGradientFromUrl(
	color: string,
	gradients: Map<number, Gradient>,
): Gradient | null {
	if (!color || typeof color !== 'string' || !color.startsWith('url(#gradient_')) {
		return null;
	}

	const match = /url\(#gradient_(\d+)\)/.exec(color);
	if (!match) return null;

	const hashCode = Number.parseInt(match[1], 10);
	return Array.from(gradients.values()).find(g => Math.abs(g.hashCode) === hashCode) || null;
}

/**
 * Resolves a gradient URL reference to a CanvasGradient (for userSpaceOnUse mode)
 */
function resolveGradientUserSpace(
	chart: ChartJS,
	color: string | CanvasGradient | undefined | null,
	gradients: Map<number, Gradient>,
	cache: Map<string, CanvasGradient>,
): string | CanvasGradient {
	if (!color || typeof color !== 'string') {
		return color as string | CanvasGradient;
	}

	if (!color.startsWith('url(#gradient_')) {
		return color;
	}

	// Check cache first
	const cacheKey = color;
	if (cache.has(cacheKey)) {
		return cache.get(cacheKey)!;
	}

	const ctx = chart.ctx;
	const chartArea = chart.chartArea;

	if (!ctx || !chartArea || chartArea.width === 0 || chartArea.height === 0) {
		return '#666666';
	}

	const gradient = getGradientFromUrl(color, gradients);
	if (!gradient) {
		return '#666666';
	}

	// Create canvas gradient using chart area
	const canvasGradient = createCanvasGradient(ctx, gradient, chartArea);
	if (typeof canvasGradient !== 'string') {
		cache.set(cacheKey, canvasGradient);
	}

	return canvasGradient;
}

/**
 * Creates a gradient for a specific element bounds (for objectBoundingBox mode)
 */
function createElementGradient(
	ctx: CanvasRenderingContext2D,
	gradient: Gradient,
	elementBounds: { left: number; right: number; top: number; bottom: number },
	cacheKey: string,
	cache: Map<string, CanvasGradient>,
): CanvasGradient | string {
	// Check cache first
	if (cache.has(cacheKey)) {
		return cache.get(cacheKey)!;
	}

	const canvasGradient = createCanvasGradient(ctx, gradient, elementBounds);
	if (typeof canvasGradient !== 'string') {
		cache.set(cacheKey, canvasGradient);
	}

	return canvasGradient;
}

/**
 * Process dataset colors for userSpaceOnUse mode (gradient spans chart area)
 */
function processUserSpaceGradients(chart: ChartJS, gradients: Map<number, Gradient>): void {
	let cache = chartGradientCache.get(chart);
	if (!cache) {
		cache = new Map();
		chartGradientCache.set(chart, cache);
	}

	chart.data.datasets.forEach((dataset: any) => {
		// Process backgroundColor
		if (Array.isArray(dataset.backgroundColor)) {
			dataset.backgroundColor = dataset.backgroundColor.map((color: string) =>
				resolveGradientUserSpace(chart, color, gradients, cache!),
			);
		} else if (typeof dataset.backgroundColor === 'string') {
			dataset.backgroundColor = resolveGradientUserSpace(chart, dataset.backgroundColor, gradients, cache!);
		}

		// Process borderColor
		if (Array.isArray(dataset.borderColor)) {
			dataset.borderColor = dataset.borderColor.map((color: string) =>
				resolveGradientUserSpace(chart, color, gradients, cache!),
			);
		} else if (typeof dataset.borderColor === 'string') {
			dataset.borderColor = resolveGradientUserSpace(chart, dataset.borderColor, gradients, cache!);
		}

		// Process pointBackgroundColor
		if (Array.isArray(dataset.pointBackgroundColor)) {
			dataset.pointBackgroundColor = dataset.pointBackgroundColor.map((color: string) =>
				resolveGradientUserSpace(chart, color, gradients, cache!),
			);
		} else if (typeof dataset.pointBackgroundColor === 'string') {
			dataset.pointBackgroundColor = resolveGradientUserSpace(chart, dataset.pointBackgroundColor, gradients, cache!);
		}

		// Process pointBorderColor
		if (Array.isArray(dataset.pointBorderColor)) {
			dataset.pointBorderColor = dataset.pointBorderColor.map((color: string) =>
				resolveGradientUserSpace(chart, color, gradients, cache!),
			);
		} else if (typeof dataset.pointBorderColor === 'string') {
			dataset.pointBorderColor = resolveGradientUserSpace(chart, dataset.pointBorderColor, gradients, cache!);
		}
	});
}

/**
 * Gets or creates the URL storage map for a chart
 */
function getUrlStorage(chart: ChartJS): Map<string, string> {
	let storage = originalGradientUrls.get(chart);
	if (!storage) {
		storage = new Map();
		originalGradientUrls.set(chart, storage);
	}
	return storage;
}

/**
 * Process dataset colors for objectBoundingBox mode (gradient per element)
 * Returns true if all gradients were applied, false if some were skipped due to invalid bounds
 */
function processObjectBoundingBoxGradients(chart: ChartJS, gradients: Map<number, Gradient>): boolean {
	const ctx = chart.ctx;
	if (!ctx) {
		return true;
	}

	let cache = chartGradientCache.get(chart);
	if (!cache) {
		cache = new Map();
		chartGradientCache.set(chart, cache);
	}

	// Get URL storage for this chart (persists original gradient URLs across renders)
	const urlStorage = getUrlStorage(chart);

	let allApplied = true;
	let totalElements = 0;
	let gradientsApplied = 0;
	let boundsNotReady = 0;

	chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
		const meta = chart.getDatasetMeta(datasetIndex);
		if (!meta || !meta.data) return;

		// Get the current colors (may be gradient URLs or already-converted CanvasGradients)
		const currentBgColors = dataset.backgroundColor;
		const currentBorderColors = dataset.borderColor;

		// Process each element
		meta.data.forEach((element: any, elementIndex: number) => {
			totalElements++;

			// Get current color values
			const bgColor = Array.isArray(currentBgColors)
				? currentBgColors[elementIndex]
				: currentBgColors;
			const borderColor = Array.isArray(currentBorderColors)
				? currentBorderColors[elementIndex]
				: currentBorderColors;

			// Storage keys for this element
			const bgKey = `bg_${datasetIndex}_${elementIndex}`;
			const borderKey = `border_${datasetIndex}_${elementIndex}`;

			// Check if current value is a gradient URL string
			const bgIsUrl = bgColor && typeof bgColor === 'string' && bgColor.startsWith('url(#gradient_');
			const borderIsUrl = borderColor && typeof borderColor === 'string' && borderColor.startsWith('url(#gradient_');

			// Store original URLs if we see them for the first time
			if (bgIsUrl) {
				urlStorage.set(bgKey, bgColor);
			}
			if (borderIsUrl) {
				urlStorage.set(borderKey, borderColor);
			}

			// Get the original URL (either from current value or storage)
			const bgUrl = bgIsUrl ? bgColor : urlStorage.get(bgKey);
			const borderUrl = borderIsUrl ? borderColor : urlStorage.get(borderKey);

			// Skip if no gradients to process
			if (!bgUrl && !borderUrl) {
				return;
			}

			// Get element bounds
			const bounds = getElementBounds(element);

			if (!bounds) {
				// Bounds not ready yet - mark as needing retry
				allApplied = false;
				boundsNotReady++;
				return;
			}

			// Process backgroundColor
			if (bgUrl) {
				const gradient = getGradientFromUrl(bgUrl, gradients);
				if (gradient) {
					// Include bounds in cache key so gradient is recreated when bounds change
					const cacheKey = `${bgKey}_${Math.round(bounds.left)}_${Math.round(bounds.top)}_${Math.round(bounds.right)}_${Math.round(bounds.bottom)}`;
					const canvasGradient = createElementGradient(ctx, gradient, bounds, cacheKey, cache);

					// Set on dataset for consistency
					if (Array.isArray(dataset.backgroundColor)) {
						dataset.backgroundColor[elementIndex] = canvasGradient;
					} else {
						// Convert single color to array for per-element gradients
						dataset.backgroundColor = new Array(meta.data.length).fill(dataset.backgroundColor);
						dataset.backgroundColor[elementIndex] = canvasGradient;
					}

					// Also set directly on element options for immediate rendering
					if (element.options) {
						element.options.backgroundColor = canvasGradient;
					}

					gradientsApplied++;
				}
			}

			// Process borderColor
			if (borderUrl) {
				const gradient = getGradientFromUrl(borderUrl, gradients);
				if (gradient) {
					const cacheKey = `${borderKey}_${Math.round(bounds.left)}_${Math.round(bounds.top)}_${Math.round(bounds.right)}_${Math.round(bounds.bottom)}`;
					const canvasGradient = createElementGradient(ctx, gradient, bounds, cacheKey, cache);

					// Set on dataset for consistency
					if (Array.isArray(dataset.borderColor)) {
						dataset.borderColor[elementIndex] = canvasGradient;
					} else {
						dataset.borderColor = new Array(meta.data.length).fill(dataset.borderColor);
						dataset.borderColor[elementIndex] = canvasGradient;
					}

					// Also set directly on element options for immediate rendering
					if (element.options) {
						element.options.borderColor = canvasGradient;
					}

					gradientsApplied++;
				}
			}
		});
	});

	return allApplied;
}

/**
 * Validates that bounds contain finite, valid numbers
 */
function isValidBounds(bounds: { left: number; right: number; top: number; bottom: number }): boolean {
	// Check all values are finite
	if (
		!Number.isFinite(bounds.left) ||
		!Number.isFinite(bounds.right) ||
		!Number.isFinite(bounds.top) ||
		!Number.isFinite(bounds.bottom)
	) {
		return false;
	}

	// Allow bounds with at least some size (>= 1px in at least one dimension)
	const width = bounds.right - bounds.left;
	const height = bounds.bottom - bounds.top;

	// Need positive size in both dimensions for gradient to be visible
	return width > 0 && height > 0;
}

/**
 * Gets the bounding box of a chart element (bar, arc, point, etc.)
 */
function getElementBounds(element: any): { left: number; right: number; top: number; bottom: number } | null {
	if (!element) return null;

	let bounds: { left: number; right: number; top: number; bottom: number } | null = null;

	// For bar elements with base - handles both horizontal and vertical bars
	if (element.base !== undefined && element.x !== undefined && element.y !== undefined) {
		// Check if this is a horizontal bar (Chart.js sets horizontal property)
		const isHorizontal = element.horizontal === true;

		if (isHorizontal) {
			// Horizontal bar: x and base are the horizontal extent, y is vertical center
			const left = Math.min(element.x, element.base);
			const right = Math.max(element.x, element.base);

			// Get height - try element.height first, then options.barThickness, then use a minimum
			let barHeight = element.height;
			if (!barHeight || barHeight <= 0) {
				// Try to get from options
				barHeight = element.options?.barThickness || element.options?.barPercentage;
			}
			// Use a reasonable minimum if still not available
			if (!barHeight || barHeight <= 0) {
				barHeight = 20; // Fallback minimum bar height
			}

			const halfHeight = barHeight / 2;
			bounds = {
				left,
				right,
				top: element.y - halfHeight,
				bottom: element.y + halfHeight,
			};
		} else {
			// Vertical bar: y and base are the vertical extent, x is horizontal center
			const top = Math.min(element.y, element.base);
			const bottom = Math.max(element.y, element.base);

			// Get width - try element.width first, then options, then use a minimum
			let barWidth = element.width;
			if (!barWidth || barWidth <= 0) {
				barWidth = element.options?.barThickness || element.options?.barPercentage;
			}
			if (!barWidth || barWidth <= 0) {
				barWidth = 20; // Fallback minimum bar width
			}

			const halfWidth = barWidth / 2;
			bounds = {
				left: element.x - halfWidth,
				right: element.x + halfWidth,
				top,
				bottom,
			};
		}
	}
	// For bar elements without base (fallback)
	else if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
		bounds = {
			left: element.x - element.width / 2,
			right: element.x + element.width / 2,
			top: element.y - element.height,
			bottom: element.y,
		};
	}
	// For arc elements (pie/doughnut)
	else if (element.innerRadius !== undefined && element.outerRadius !== undefined && element.x !== undefined && element.y !== undefined) {
		bounds = {
			left: element.x - element.outerRadius,
			right: element.x + element.outerRadius,
			top: element.y - element.outerRadius,
			bottom: element.y + element.outerRadius,
		};
	}
	// For point elements
	else if (element.x !== undefined && element.y !== undefined && element.options?.radius) {
		const r = element.options.radius;
		bounds = {
			left: element.x - r,
			right: element.x + r,
			top: element.y - r,
			bottom: element.y + r,
		};
	}

	// Validate bounds before returning
	if (bounds && isValidBounds(bounds)) {
		return bounds;
	}

	return null;
}

// Track if we're in an update cycle (to prevent infinite loops)
const updateInProgress = new WeakSet<ChartJS>();
// Track charts that need a post-render gradient application
const needsGradientReapply = new WeakSet<ChartJS>();
// Track retry count per chart to prevent infinite loops
const retryCount = new WeakMap<ChartJS, number>();
const MAX_RETRIES = 3;

/**
 * Forces an immediate chart re-render to apply gradients
 */
function forceGradientUpdate(chart: ChartJS): void {
	// Prevent recursive updates
	if (updateInProgress.has(chart)) {
		return;
	}

	// Mark that we need to reapply gradients
	needsGradientReapply.add(chart);
}

/**
 * Actually performs the gradient update after render is complete
 */
function executeGradientUpdate(chart: ChartJS): void {
	if (!needsGradientReapply.has(chart) || updateInProgress.has(chart)) {
		return;
	}

	needsGradientReapply.delete(chart);

	// Track retry count to prevent infinite loops
	const currentRetries = retryCount.get(chart) ?? 0;
	if (currentRetries >= MAX_RETRIES) {
		// Max retries reached, give up to prevent infinite loops
		retryCount.delete(chart);
		return;
	}
	retryCount.set(chart, currentRetries + 1);

	// Use requestAnimationFrame for better timing with browser paint cycle
	requestAnimationFrame(() => {
		if (!chart.canvas || updateInProgress.has(chart)) {
			retryCount.delete(chart);
			return;
		}

		// Clear gradient cache to force recreation with current bounds
		const cache = chartGradientCache.get(chart);
		if (cache) {
			cache.clear();
		}

		updateInProgress.add(chart);
		// Use update('none') instead of render() to recalculate element bounds
		// render() only redraws without recalculating - that's why gradients failed on first load
		chart.update('none');

		// Clear retry count on successful update, allow updateInProgress cleanup
		requestAnimationFrame(() => {
			updateInProgress.delete(chart);
			// Only clear retry count if no more reapply is pending
			if (!needsGradientReapply.has(chart)) {
				retryCount.delete(chart);
			}
		});
	});
}

/**
 * Chart.js plugin to handle gradient rendering
 */
export const gradientPlugin: Plugin = {
	id: 'gradientPlugin',

	// Use beforeDatasetsDraw to process gradients
	beforeDatasetsDraw(chart: ChartJS) {
		const pluginOptions = (chart.options.plugins as any)?.gradientPlugin;
		const gradientsArray = pluginOptions?.gradients as Array<[number, Gradient]> | undefined;
		const gradientSpace = pluginOptions?.gradientSpace || 'userSpaceOnUse';

		if (!gradientsArray || gradientsArray.length === 0) {
			return;
		}

		// Convert array back to Map
		const gradients = new Map<number, Gradient>(gradientsArray);

		if (gradientSpace === 'objectBoundingBox') {
			const allApplied = processObjectBoundingBoxGradients(chart, gradients);

			// If some gradients couldn't be applied due to missing bounds, force an update
			if (!allApplied) {
				forceGradientUpdate(chart);
			}
		} else {
			processUserSpaceGradients(chart, gradients);
		}
	},

	// Execute pending gradient updates after render is complete
	afterRender(chart: ChartJS) {
		// Execute any pending gradient update
		executeGradientUpdate(chart);
	},

	// Clear cache and URL storage when chart is destroyed
	afterDestroy(chart: ChartJS) {
		chartGradientCache.delete(chart);
		originalGradientUrls.delete(chart);
		updateInProgress.delete(chart);
		needsGradientReapply.delete(chart);
		retryCount.delete(chart);
	},

	// Reset cache on resize (gradients need to be recalculated)
	resize(chart: ChartJS) {
		const cache = chartGradientCache.get(chart);
		if (cache) {
			cache.clear();
		}
	},
};
