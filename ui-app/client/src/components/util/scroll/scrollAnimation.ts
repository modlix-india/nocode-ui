/**
 * Turning an `animation` property entry into scroll-driven CSS.
 *
 * Two implementations, and they have to agree. Where the browser has
 * scroll-driven timelines the animation is handed to `animation-timeline` and
 * runs off the main thread; where it does not, the same animation is scrubbed
 * from JS by setting a NEGATIVE `animation-delay` on a paused animation.
 *
 * That fallback is worth spelling out, because it is what makes this change
 * cheap: it scrubs using the ordinary CSS animation engine, so all 68 existing
 * `@keyframes` in dist/css/App.css, and every name in ANIMATIONS_LIST, become
 * scroll-scrubbable with no new CSS and no new keyframes. One style write per
 * frame per element.
 *
 * Pure, so the mapping can be tested without a browser. The bug this guards
 * against is the two paths disagreeing: a design tuned on Chrome looking
 * different on Safari is exactly the kind of thing nobody notices until a
 * customer does.
 */

import { clamp01 } from './scrollDriver';

/** One entry of the multi-valued `animation` property, loosely typed. */
export interface AnimationEntry {
	animationName?: string;
	animationDuration?: number;
	animationDelay?: number;
	animationIterationCount?: string | number;
	animationDirection?: string;
	animationFillMode?: string;
	animationTimingFunction?: string;
	timingFunctionExtra?: string;
	condition?: boolean;
	observation?: string;
	/** 'none' | 'view' | 'scroll'. Absent means 'none'. */
	timeline?: string;
	axis?: string;
	scroller?: string;
	rangeStart?: number;
	rangeEnd?: number;
}

export const isScrollDriven = (a: AnimationEntry): boolean => !!a.timeline && a.timeline !== 'none';

/**
 * Whether this browser can run the animation itself.
 *
 * Probed rather than assumed: `animation-timeline` is Chromium-strong and
 * weaker elsewhere, and the whole point of having a fallback is that we do not
 * know which half of the traffic is which.
 */
export function supportsScrollTimeline(): boolean {
	if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
	try {
		return CSS.supports('animation-timeline', 'scroll()');
	} catch {
		return false;
	}
}

export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The CSS `animation-timeline` value for one entry.
 *
 * `view()` takes an axis but NOT a scroller: it is always measured against the
 * element's own nearest scrollport. Passing a scroller there is invalid and the
 * whole declaration is dropped, which reads as the animation not being
 * scroll-driven at all.
 */
export function timelineValue(a: AnimationEntry): string {
	const axis = a.axis === 'inline' ? 'inline' : 'block';
	if (a.timeline === 'scroll') {
		const scroller =
			a.scroller === 'root' ? 'root' : a.scroller === 'self' ? 'self' : 'nearest';
		return `scroll(${scroller} ${axis})`;
	}
	return `view(${axis})`;
}

/**
 * The CSS `animation-range` value for one entry.
 *
 * Plain percentages of the timeline rather than `entry`/`cover` keywords,
 * because that is the one form which means the same thing under both a
 * `scroll()` and a `view()` timeline AND maps exactly onto the JS fallback's
 * remap of the same two numbers. Keyword ranges have no fallback equivalent, so
 * using them would guarantee the two paths diverge.
 */
export function rangeValue(a: AnimationEntry): string {
	const start = clamp01(typeof a.rangeStart === 'number' ? a.rangeStart : 0);
	const end = clamp01(typeof a.rangeEnd === 'number' ? a.rangeEnd : 1);
	if (start === 0 && end === 1) return 'normal';
	return `${start * 100}% ${end * 100}%`;
}

/**
 * The negative delay that parks a paused animation at `progress`.
 *
 * Negative because a positive delay postpones the start; a negative one seeks
 * into the animation, which is the only way to scrub a CSS animation from JS
 * without the Web Animations API.
 */
export function scrubDelay(a: AnimationEntry, progress: number): string {
	const duration = Math.max(1, a.animationDuration ?? 0);
	return `${-clamp01(progress) * duration}ms`;
}

/**
 * The still frame a reduced-motion visitor should see.
 *
 * The END of the animation, not the start. A reveal's first frame is usually
 * "invisible", so pinning to 0 would hide the content from exactly the people
 * who asked for less motion, which is worse than the motion was.
 */
export const REDUCED_MOTION_PROGRESS = 1;
