import { PointStyle } from 'chart.js';
import { PointType } from '../types/common';

/**
 * Maps custom PointType enum values to Chart.js point styles
 */
export function mapPointType(pointType: PointType): PointStyle | false {
	switch (pointType) {
		case PointType.Circle:
		case PointType.FilledCircle:
			return 'circle';
		case PointType.Cross:
			return 'cross';
		case PointType.X:
			return 'crossRot';
		case PointType.Dash:
			return 'dash';
		case PointType.Line:
			return 'line';
		case PointType.VerticalLine:
			return 'line'; // Chart.js doesn't have vertical line, use line
		case PointType.Square:
		case PointType.FilledSquare:
			return 'rect';
		case PointType.SquareRounded:
		case PointType.FilledSquareRounded:
			return 'rectRounded';
		case PointType.SquareRot:
		case PointType.FilledSquareRot:
			return 'rectRot';
		case PointType.Star:
		case PointType.FilledStar:
			return 'star';
		case PointType.Triangle:
		case PointType.FilledTriangle:
			return 'triangle';
		case PointType.TriangleRot:
		case PointType.FilledTriangleRot:
			return 'triangle'; // Chart.js doesn't have rotated triangle
		case PointType.None:
			return false;
		default:
			return 'circle';
	}
}

/**
 * Determines if the point should be filled based on PointType
 */
export function isFilledPointType(pointType: PointType): boolean {
	return (
		pointType === PointType.FilledCircle ||
		pointType === PointType.FilledSquare ||
		pointType === PointType.FilledSquareRounded ||
		pointType === PointType.FilledSquareRot ||
		pointType === PointType.FilledStar ||
		pointType === PointType.FilledTriangle ||
		pointType === PointType.FilledTriangleRot
	);
}

/**
 * Maps D3 easing functions to Chart.js easing functions
 */
export function mapEasingFunction(
	d3Easing:
		| 'easeLinear'
		| 'easePoly'
		| 'easeQuad'
		| 'easeCubic'
		| 'easeSin'
		| 'easeExp'
		| 'easeCircle'
		| 'easeElastic'
		| 'easeBack'
		| 'easeBounce',
): string {
	const easingMap: Record<string, string> = {
		easeLinear: 'linear',
		easePoly: 'easeOutQuart',
		easeQuad: 'easeOutQuad',
		easeCubic: 'easeOutCubic',
		easeSin: 'easeOutSine',
		easeExp: 'easeOutExpo',
		easeCircle: 'easeOutCirc',
		easeElastic: 'easeOutElastic',
		easeBack: 'easeOutBack',
		easeBounce: 'easeOutBounce',
	};
	return easingMap[d3Easing] || 'easeOutQuart';
}
