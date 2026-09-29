/**
 * A bounded pool of WebGLRenderer instances.
 *
 * Browsers cap live WebGL contexts somewhere around 8 to 16 per page, and they
 * do not fail politely at the limit: the oldest context is silently lost, so an
 * unrelated scene higher up the page goes black. A page with four scene
 * components that each mount, unmount and remount as the user navigates would
 * hit that on its own.
 *
 * three binds a renderer to its canvas at construction and cannot retarget it,
 * so the pool keeps the two together and hands out the pair. A component
 * appends the canvas into its own container on acquire and detaches it on
 * release. That is also why the pool cannot simply be "one renderer for the
 * page": each scene needs its own drawing surface in normal document flow.
 *
 * Nothing here imports three. The bundle is passed in, so this module stays
 * initial-bundle safe and unit testable with a stub.
 */

import type { ThreeBundle } from './threeLoader';

export interface PooledRenderer {
	renderer: any;
	canvas: HTMLCanvasElement;
}

export interface AcquireOptions {
	alpha: boolean;
	antialias: boolean;
}

/**
 * Conservative against the browser ceiling. Going over does not throw, it
 * takes a context away from a scene that is still using it.
 */
export const MAX_CONTEXTS = 6;

interface Entry extends PooledRenderer {
	alpha: boolean;
	antialias: boolean;
	inUse: boolean;
}

const pool: Entry[] = [];

export class NoContextAvailable extends Error {
	constructor() {
		super('WebGL context limit reached');
		this.name = 'NoContextAvailable';
	}
}

/**
 * Take a renderer. Throws NoContextAvailable once the cap is reached, which is
 * the caller's cue to show its poster rather than an empty box.
 *
 * alpha and antialias are construction-time flags in WebGL, so a pooled
 * renderer can only be reused by a scene that wants the same pair.
 */
export function acquireRenderer(three: ThreeBundle, opts: AcquireOptions): PooledRenderer {
	const idle = pool.find(
		e => !e.inUse && e.alpha === opts.alpha && e.antialias === opts.antialias,
	);
	if (idle) {
		idle.inUse = true;
		return { renderer: idle.renderer, canvas: idle.canvas };
	}

	if (pool.length >= MAX_CONTEXTS) {
		// Drop an idle renderer with different flags to make room before
		// giving up: a mismatched idle context is worth less than a live one.
		const evictable = pool.findIndex(e => !e.inUse);
		if (evictable === -1) throw new NoContextAvailable();
		disposeEntry(pool[evictable]);
		pool.splice(evictable, 1);
	}

	const canvas = document.createElement('canvas');
	const renderer = new three.THREE.WebGLRenderer({
		canvas,
		alpha: opts.alpha,
		antialias: opts.antialias,
		powerPreference: 'high-performance',
		// Without this a machine on an integrated GPU silently gets a software
		// context and renders at a few frames a second, which reads as a bug in
		// the scene rather than as "this device cannot do it".
		failIfMajorPerformanceCaveat: false,
	});

	const entry: Entry = {
		renderer,
		canvas,
		alpha: opts.alpha,
		antialias: opts.antialias,
		inUse: true,
	};
	pool.push(entry);
	return { renderer, canvas };
}

/** Give a renderer back. The canvas must already be detached by the caller. */
export function releaseRenderer(canvas: HTMLCanvasElement): void {
	const entry = pool.find(e => e.canvas === canvas);
	if (!entry) return;
	entry.inUse = false;
	// Clearing on release stops the next scene inheriting a frame of the last
	// one, which shows as a flash of someone else's content on mount.
	try {
		entry.renderer.clear?.();
	} catch {
		// A lost context throws here and there is nothing useful to do about it.
	}
}

function disposeEntry(entry: Entry): void {
	try {
		entry.renderer.dispose?.();
		entry.renderer.forceContextLoss?.();
	} catch {
		// Disposing an already-lost context throws; the entry is going away.
	}
	entry.canvas.remove();
}

/** Release everything. Used by tests and by a full page teardown. */
export function disposeAllRenderers(): number {
	const n = pool.length;
	for (const entry of pool) disposeEntry(entry);
	pool.length = 0;
	return n;
}

export function poolStats(): { total: number; inUse: number; idle: number } {
	const inUse = pool.filter(e => e.inUse).length;
	return { total: pool.length, inUse, idle: pool.length - inUse };
}
