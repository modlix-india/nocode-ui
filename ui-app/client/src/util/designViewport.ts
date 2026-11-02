import { PAGE_ROUTE_DESIGN_PARAM } from './pageRouting';

/**
 * The screen height a page is being looked at "as", when it is framed for the click map.
 *
 * The click map frames the measured page and makes the frame as tall as the whole page, so
 * that the frame never scrolls out from under the canvas drawn over it. That works for any
 * page laid out in pixels and breaks every page that uses viewport units: inside a frame,
 * `100vh` is the height of the FRAME. A hero of `height: 100vh` grows to the frame's height,
 * the page grows with it, the beacon reports the new height, the frame is made that tall,
 * and the hero grows again, until the viewer's cap. What is left is a header, then thousands
 * of pixels of an empty hero, with every click drawn over nothing.
 *
 * Visitors recorded those clicks on screens of an ordinary height. So the viewer says which
 * height it means (`mlxVh=<px>` next to `modlixDesign=1`), and the framed page resolves its
 * viewport units against that number instead of against the frame. The page then lays out
 * exactly as a visitor saw it, its height stops depending on the frame, and the loop is gone.
 *
 * Only honoured when the page is both a design request and actually framed: an ordinary
 * visit, or somebody opening the same link in a tab, keeps real viewport units.
 */
export const DESIGN_VIEWPORT_HEIGHT_PARAM = 'mlxVh';

/** A typical screen height for each click-map width band, in CSS px. */
export function typicalViewportHeight(width: number): number {
	if (width <= 480) return 844;
	if (width <= 1024) return 1180;
	return 900;
}

let cached: number | null | undefined;

export function designViewportHeight(): number | undefined {
	if (cached !== undefined) return cached ?? undefined;
	cached = null;
	try {
		if (typeof window === 'undefined' || !window.location) return undefined;
		if (window.parent === window) return undefined;
		const q = new URLSearchParams(window.location.search);
		const design = q.get(PAGE_ROUTE_DESIGN_PARAM);
		if (!design || design === 'false' || design === '0') return undefined;
		const h = Number(q.get(DESIGN_VIEWPORT_HEIGHT_PARAM));
		if (!Number.isFinite(h) || h < 200 || h > 4000) return undefined;
		cached = Math.round(h);
	} catch {
		cached = null;
	}
	return cached ?? undefined;
}

/** For tests: forget what was read from the location. */
export function resetDesignViewportHeight() {
	cached = undefined;
}

const VIEWPORT_HEIGHT_UNIT = /(-?\d*\.?\d+)(?:[dsl])?vh\b/g;

/** `100vh` -> `900px` (and dvh/svh/lvh) when a height is pinned; anything else unchanged. */
export function pinViewportHeightUnits(value: string, height: number): string {
	if (!value || value.indexOf('vh') === -1) return value;
	return value.replace(VIEWPORT_HEIGHT_UNIT, (_, n: string) => {
		const px = (Number(n) * height) / 100;
		return `${Math.round(px * 100) / 100}px`;
	});
}

/**
 * Pins viewport-height units in a component's resolved style objects ({ target: { prop: v } }).
 * Returns the same object when nothing is pinned, so the common path allocates nothing.
 */
export function pinViewportHeightInStyle<T>(style: T): T {
	const h = designViewportHeight();
	if (!h || !style || typeof style !== 'object') return style;
	let changed = false;
	const out: any = {};
	for (const [target, obj] of Object.entries(style as any)) {
		if (!obj || typeof obj !== 'object') {
			out[target] = obj;
			continue;
		}
		let copy: any = obj;
		for (const [k, v] of Object.entries(obj as any)) {
			if (typeof v !== 'string' || v.indexOf('vh') === -1) continue;
			const pinned = pinViewportHeightUnits(v, h);
			if (pinned === v) continue;
			if (copy === obj) copy = { ...(obj as any) };
			copy[k] = pinned;
			changed = true;
		}
		out[target] = copy;
	}
	return changed ? out : style;
}
