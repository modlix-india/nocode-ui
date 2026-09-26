/**
 * A 0-to-1 scroll progress signal, batched to one animation frame.
 *
 * Shared deliberately: the WebGL ScrollScene and the CSS scroll-driven
 * animation fallback both need exactly this, and building it twice would give
 * them two different ideas of what "half way" means.
 *
 * Two things this fixes about how scroll progress is measured in the codebase
 * today. Grid writes to the store on every scroll event with no batching and
 * rounds to an integer percent, so scrubbing off it would step in 100 stages;
 * see Grid.tsx onScrollFunction. And nothing anywhere measures an element's
 * progress ACROSS the viewport, which is what a reveal or a parallax actually
 * needs -- only a container's own scrollTop.
 *
 * The geometry is pure and exported separately from the DOM plumbing, because
 * the plumbing cannot be tested under jsdom (no layout) and the geometry is
 * where the bugs live.
 */

export type ScrollAxis = 'block' | 'inline';
export type ScrollMode = 'scroll' | 'view';

/** 'nearest' walks up for a scrollable ancestor, 'root' is the document. */
export type ScrollerRef = 'nearest' | 'root' | 'self' | HTMLElement;

export interface ScrollDriverOptions {
	target: HTMLElement;
	scroller?: ScrollerRef;
	axis?: ScrollAxis;
	mode?: ScrollMode;
	/** Sub-range of the full sweep to map onto 0..1, e.g. 0.0 to 0.3. */
	rangeStart?: number;
	rangeEnd?: number;
}

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Rescale `p` so that `start` reads 0 and `end` reads 1, then clamp.
 * A zero-width range would divide by zero, so it degrades to a step.
 */
export function remap(p: number, start: number, end: number): number {
	if (end <= start) return p >= end ? 1 : 0;
	return clamp01((p - start) / (end - start));
}

export interface ScrollMetrics {
	/** scrollTop or scrollLeft. */
	scrollPos: number;
	/** scrollHeight or scrollWidth. */
	scrollSize: number;
	/** clientHeight or clientWidth. */
	clientSize: number;
}

/** How far through its own scrollable extent a container is. */
export function scrollProgress(m: ScrollMetrics): number {
	const travel = m.scrollSize - m.clientSize;
	// Content that fits needs no scrolling, and is therefore fully "through".
	if (travel <= 0) return 1;
	return clamp01(m.scrollPos / travel);
}

export interface ViewMetrics {
	/** Target's leading edge relative to the viewport's leading edge. */
	targetStart: number;
	targetSize: number;
	viewportSize: number;
}

/**
 * How far the target has travelled across the viewport, matching the CSS
 * `view()` cover range: 0 the moment before it begins to enter, 1 the moment
 * after it has completely left. Total travel is therefore viewport + target,
 * not viewport alone -- getting that wrong is what makes a reveal fire early.
 */
export function viewProgress(m: ViewMetrics): number {
	const travel = m.viewportSize + m.targetSize;
	if (travel <= 0) return 0;
	return clamp01((m.viewportSize - m.targetStart) / travel);
}

const OVERFLOW_SCROLLS = /(auto|scroll|overlay)/;

/** Nearest ancestor that actually scrolls on this axis, or null for the page. */
export function findScroller(target: HTMLElement, axis: ScrollAxis): HTMLElement | null {
	const prop = axis === 'inline' ? 'overflowX' : 'overflowY';
	let node = target.parentElement;
	while (node && node !== document.body && node !== document.documentElement) {
		const style = getComputedStyle(node);
		const scrolls = OVERFLOW_SCROLLS.test(style[prop]);
		const size =
			axis === 'inline'
				? node.scrollWidth > node.clientWidth
				: node.scrollHeight > node.clientHeight;
		if (scrolls && size) return node;
		node = node.parentElement;
	}
	return null;
}

function resolveScroller(
	target: HTMLElement,
	ref: ScrollerRef,
	axis: ScrollAxis,
): HTMLElement | null {
	if (ref === 'self') return target;
	if (ref === 'root') return null;
	if (ref === 'nearest') return findScroller(target, axis);
	return ref;
}

/** One frame loop for every subscriber on the page, not one each. */
const subscribers = new Set<() => void>();
let frame = 0;

function tick() {
	frame = 0;
	// Copied because a callback may unsubscribe itself mid-iteration.
	for (const read of Array.from(subscribers)) read();
}

function schedule() {
	if (frame || typeof requestAnimationFrame !== 'function') return;
	frame = requestAnimationFrame(tick);
}

/**
 * Report the target's scroll progress, at most once per frame. Returns the
 * unsubscribe function. Fires once immediately so a caller never has to render
 * a frame at the wrong position while waiting for the first scroll.
 */
export function observeScrollProgress(
	options: ScrollDriverOptions,
	onProgress: (progress: number) => void,
): () => void {
	const {
		target,
		scroller = 'nearest',
		axis = 'block',
		mode = 'view',
		rangeStart = 0,
		rangeEnd = 1,
	} = options;

	const host = resolveScroller(target, scroller, axis);
	const inline = axis === 'inline';
	let last = -1;

	const read = () => {
		let raw: number;
		if (mode === 'scroll') {
			const el = host ?? document.scrollingElement ?? document.documentElement;
			raw = scrollProgress({
				scrollPos: inline ? el.scrollLeft : el.scrollTop,
				scrollSize: inline ? el.scrollWidth : el.scrollHeight,
				clientSize: inline ? el.clientWidth : el.clientHeight,
			});
		} else {
			const rect = target.getBoundingClientRect();
			// In a scrolling container the viewport is that container, not the
			// window, or a reveal inside a sidebar would fire on page scroll.
			const box = host?.getBoundingClientRect();
			const viewportSize = box
				? inline
					? box.width
					: box.height
				: inline
					? window.innerWidth
					: window.innerHeight;
			const origin = box ? (inline ? box.left : box.top) : 0;
			raw = viewProgress({
				targetStart: (inline ? rect.left : rect.top) - origin,
				targetSize: inline ? rect.width : rect.height,
				viewportSize,
			});
		}

		const progress = remap(raw, rangeStart, rangeEnd);
		// Float noise would otherwise push a store write every single frame.
		if (Math.abs(progress - last) < 0.0005) return;
		last = progress;
		onProgress(progress);
	};

	subscribers.add(read);

	const emitter: EventTarget = host ?? window;
	const onScroll = () => schedule();
	emitter.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });

	read();

	return () => {
		subscribers.delete(read);
		emitter.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onScroll);
		if (!subscribers.size && frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}
	};
}
