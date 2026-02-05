import { Chart as ChartJS } from 'chart.js';
import { Gradient } from '../types/common';

interface ColorStop {
	offset: number;
	color: string;
}

interface ParsedGradient {
	type: 'linear' | 'radial';
	angle?: number;
	stops: ColorStop[];
}

/**
 * Parses a CSS gradient string into a structured format
 */
function parseGradientString(gradientStr: string): ParsedGradient | null {
	const linearMatch = gradientStr.match(/linear-gradient\(([^)]+)\)/i);
	const radialMatch = gradientStr.match(/radial-gradient\(([^)]+)\)/i);

	if (linearMatch) {
		return parseLinearGradient(linearMatch[1]);
	} else if (radialMatch) {
		return parseRadialGradient(radialMatch[1]);
	}

	return null;
}

function parseLinearGradient(content: string): ParsedGradient {
	const parts = content.split(',').map(p => p.trim());
	let angle = 180; // default: top to bottom
	let colorStartIndex = 0;

	// Check if first part is an angle
	const angleMatch = parts[0].match(/^(\d+)deg$/);
	if (angleMatch) {
		angle = Number.parseInt(angleMatch[1], 10);
		colorStartIndex = 1;
	} else if (parts[0].startsWith('to ')) {
		// Handle direction keywords
		const direction = parts[0].toLowerCase();
		if (direction === 'to top') angle = 0;
		else if (direction === 'to right') angle = 90;
		else if (direction === 'to left') angle = 270;
		else if (direction === 'to right top' || direction === 'to top right') angle = 45;
		else if (direction === 'to right bottom' || direction === 'to bottom right') angle = 135;
		else if (direction === 'to left bottom' || direction === 'to bottom left') angle = 225;
		else if (direction === 'to left top' || direction === 'to top left') angle = 315;
		colorStartIndex = 1;
	}

	const stops: ColorStop[] = [];
	const colorParts = parts.slice(colorStartIndex);

	colorParts.forEach((part, index) => {
		const stopMatch = part.match(/^(.+?)\s+(\d+)%?$/);
		if (stopMatch) {
			stops.push({
				color: stopMatch[1].trim(),
				offset: parseInt(stopMatch[2], 10) / 100,
			});
		} else {
			// No percentage specified, distribute evenly
			stops.push({
				color: part.trim(),
				offset: index / (colorParts.length - 1 || 1),
			});
		}
	});

	return { type: 'linear', angle, stops };
}

function parseRadialGradient(content: string): ParsedGradient {
	const parts = content.split(',').map(p => p.trim());
	const stops: ColorStop[] = [];

	// Skip shape/size specifications and extract colors
	let colorStartIndex = 0;
	if (parts[0].includes('circle') || parts[0].includes('ellipse')) {
		colorStartIndex = 1;
	}

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

	return { type: 'radial', stops };
}

/**
 * Creates a Canvas gradient from a Gradient object
 */
export function createCanvasGradient(
	ctx: CanvasRenderingContext2D,
	gradient: Gradient,
	chartArea: { left: number; right: number; top: number; bottom: number },
): CanvasGradient | string {
	const parsed = parseGradientString(gradient.gradient);

	if (!parsed) {
		return '#000000'; // fallback
	}

	let canvasGradient: CanvasGradient;

	if (parsed.type === 'linear') {
		const angle = ((parsed.angle || 180) * Math.PI) / 180;
		const centerX = (chartArea.left + chartArea.right) / 2;
		const centerY = (chartArea.top + chartArea.bottom) / 2;
		const width = chartArea.right - chartArea.left;
		const height = chartArea.bottom - chartArea.top;
		const length = Math.sqrt(width * width + height * height) / 2;

		const x0 = centerX - Math.sin(angle) * length;
		const y0 = centerY - Math.cos(angle) * length;
		const x1 = centerX + Math.sin(angle) * length;
		const y1 = centerY + Math.cos(angle) * length;

		canvasGradient = ctx.createLinearGradient(x0, y0, x1, y1);
	} else {
		const centerX = (chartArea.left + chartArea.right) / 2;
		const centerY = (chartArea.top + chartArea.bottom) / 2;
		const radius = Math.max(
			chartArea.right - chartArea.left,
			chartArea.bottom - chartArea.top,
		) / 2;

		canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
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
 * Resolves gradient references in color arrays
 * Returns the actual color or creates canvas gradient if needed
 */
export function resolveGradientColor(
	color: string,
	gradients: Map<number, Gradient>,
	ctx: CanvasRenderingContext2D | null,
	chartArea: { left: number; right: number; top: number; bottom: number } | null,
): string | CanvasGradient {
	// Check if color is a gradient reference (url(#gradient_xxx))
	const gradientMatch = color.match(/url\(#gradient_(\d+)\)/);

	if (gradientMatch && ctx && chartArea) {
		const hashCode = parseInt(gradientMatch[1], 10);
		const gradient = Array.from(gradients.values()).find(
			g => Math.abs(g.hashCode) === hashCode,
		);

		if (gradient) {
			return createCanvasGradient(ctx, gradient, chartArea);
		}
	}

	return color;
}

/**
 * Creates a gradient cache for a chart instance
 */
export function createGradientCache(
	chart: ChartJS,
	gradients: Map<number, Gradient>,
): Map<number, CanvasGradient | string> {
	const cache = new Map<number, CanvasGradient | string>();
	const ctx = chart.ctx;
	const chartArea = chart.chartArea;

	if (!ctx || !chartArea) return cache;

	gradients.forEach((gradient, key) => {
		cache.set(key, createCanvasGradient(ctx, gradient, chartArea));
	});

	return cache;
}
