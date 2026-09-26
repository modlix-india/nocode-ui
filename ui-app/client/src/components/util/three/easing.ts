/**
 * Easing for timeline tracks.
 *
 * Deliberately a small named set rather than arbitrary cubic-bezier input: the
 * names are what the Scene Editor puts in a dropdown and what a scene document
 * stores, so they have to survive being round-tripped through JSON by hand and
 * by the AppBuilder agent. A malformed bezier would fail at render time with a
 * blank canvas, which is the failure mode this whole design tries to avoid.
 *
 * Every function maps 0..1 to 0..1 and is pure, so it is all unit testable.
 */

export type EasingName =
	| 'linear'
	| 'easeInQuad'
	| 'easeOutQuad'
	| 'easeInOutQuad'
	| 'easeInCubic'
	| 'easeOutCubic'
	| 'easeInOutCubic'
	| 'easeOutExpo'
	| 'easeInOutExpo'
	| 'easeOutBack'
	| 'easeOutElastic';

export type EasingFn = (t: number) => number;

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

// Overshoot constant from the standard easing set; 1.70158 gives roughly 10%.
const BACK = 1.70158;
const ELASTIC = (2 * Math.PI) / 3;

export const EASINGS: Record<EasingName, EasingFn> = {
	linear: t => t,

	easeInQuad: t => t * t,
	easeOutQuad: t => 1 - (1 - t) * (1 - t),
	easeInOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

	easeInCubic: t => t * t * t,
	easeOutCubic: t => 1 - Math.pow(1 - t, 3),
	easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),

	easeOutExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
	easeInOutExpo: t => {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
	},

	// Overshoots past 1 before settling. Fine for a transform, wrong for
	// opacity, which is why the editor warns rather than forbidding it.
	easeOutBack: t => 1 + (BACK + 1) * Math.pow(t - 1, 3) + BACK * Math.pow(t - 1, 2),

	easeOutElastic: t => {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC) + 1;
	},
};

/** Easings whose output leaves 0..1, so a caller can refuse them per property. */
export const OVERSHOOTING_EASINGS: ReadonlySet<EasingName> = new Set<EasingName>([
	'easeOutBack',
	'easeOutElastic',
]);

export const DEFAULT_EASING: EasingName = 'easeOutCubic';

/** Look up an easing, falling back rather than throwing on an unknown name. */
export function easingFor(name: string | undefined): EasingFn {
	if (!name) return EASINGS[DEFAULT_EASING];
	return EASINGS[name as EasingName] ?? EASINGS[DEFAULT_EASING];
}

/** Interpolate with the named easing. `t` is clamped; the result may overshoot. */
export function ease(from: number, to: number, t: number, name?: string): number {
	return from + (to - from) * easingFor(name)(clamp01(t));
}

export const EASING_NAMES = Object.keys(EASINGS) as EasingName[];
