/**
 * The canvas lifecycle every WebGL component shares.
 *
 * This is the one place the runtime policy lives, so that all four components
 * inherit it rather than each remembering to implement it:
 *
 *  - reduced motion renders a single frame and never starts the loop;
 *  - a scene scrolled out of view stops rendering (same IntersectionObserver
 *    idea Video.tsx already uses for playInViewport);
 *  - a hidden tab stops rendering;
 *  - device pixel ratio is capped, which is the biggest single perf lever on a
 *    retina laptop;
 *  - the page editor renders one frame instead of a live loop, so the canvas
 *    stays responsive with several scenes on it;
 *  - anything that goes wrong resolves to a status the component can show its
 *    poster for. Never a blank box.
 *
 * SSR: index.tsx hydrates rather than mounts, so nothing here may run during
 * the server render. Everything touching window or document is inside an
 * effect, and three itself arrives through the dynamic loader.
 */

import { useEffect, useRef, useState } from 'react';
import { loadThree, type ThreeBundle } from './threeLoader';
import {
	NoContextAvailable,
	acquireRenderer,
	releaseRenderer,
	type PooledRenderer,
} from './rendererPool';

export type ThreeCanvasStatus = 'loading' | 'ready' | 'unsupported' | 'error';

export interface ThreeCanvasContext {
	three: ThreeBundle;
	renderer: any;
	canvas: HTMLCanvasElement;
	width: number;
	height: number;
}

export interface UseThreeCanvasOptions {
	alpha?: boolean;
	antialias?: boolean;
	dprCap?: number;
	/** Built once the context exists. Return a cleanup to dispose scene objects. */
	onInit?: (ctx: ThreeCanvasContext) => void | (() => void);
	/** Called per frame while running. `elapsed` and `delta` are seconds. */
	onFrame?: (ctx: ThreeCanvasContext, elapsed: number, delta: number) => void;
	onResize?: (ctx: ThreeCanvasContext, width: number, height: number) => void;
	onReady?: () => void;
	onError?: (error: Error) => void;
	/** Caller-driven pause, on top of the automatic ones. */
	paused?: boolean;
}

export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPageEditor(): boolean {
	return (globalThis as any).designMode === 'PAGE';
}

/** Cheap capability probe, so a component can show its poster without a pool slot. */
export function isWebGLAvailable(): boolean {
	if (typeof document === 'undefined') return false;
	try {
		const c = document.createElement('canvas');
		return !!(c.getContext('webgl2') || c.getContext('webgl'));
	} catch {
		return false;
	}
}

export interface ThreeCanvasHandle {
	containerRef: React.RefObject<HTMLDivElement | null>;
	status: ThreeCanvasStatus;
	error: Error | null;
	/** Draw one frame now. For a static scene, or after a property change. */
	requestFrame: () => void;
}

export function useThreeCanvas(options: UseThreeCanvasOptions): ThreeCanvasHandle {
	const {
		alpha = true,
		antialias = true,
		dprCap = 2,
		onInit,
		onFrame,
		onResize,
		onReady,
		onError,
		paused = false,
	} = options;

	const containerRef = useRef<HTMLDivElement | null>(null);
	const [status, setStatus] = useState<ThreeCanvasStatus>('loading');
	const [error, setError] = useState<Error | null>(null);

	// Callbacks live in refs so that a component re-rendering with a new
	// closure does not tear down and rebuild the whole GL context.
	const cbs = useRef({ onInit, onFrame, onResize, onReady, onError });
	cbs.current = { onInit, onFrame, onResize, onReady, onError };

	const ctxRef = useRef<ThreeCanvasContext | null>(null);
	const frameRef = useRef(0);
	const visibleRef = useRef(true);
	const pausedRef = useRef(paused);
	pausedRef.current = paused;

	const drawOnce = useRef<() => void>(() => {});

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let disposed = false;
		let pooled: PooledRenderer | null = null;
		let userCleanup: (() => void) | void;
		let resizeObserver: ResizeObserver | null = null;
		let intersectionObserver: IntersectionObserver | null = null;
		// Declared up here, not beside the promise chain that fills it: the
		// teardown below can run before loadThree resolves, and it must always
		// have something safe to call.
		const cleanupRef: { current: () => void } = { current: () => {} };

		const fail = (e: Error, s: ThreeCanvasStatus = 'error') => {
			if (disposed) return;
			setError(e);
			setStatus(s);
			cbs.current.onError?.(e);
		};

		if (!isWebGLAvailable()) {
			fail(new Error('WebGL is not available in this browser'), 'unsupported');
			return;
		}

		loadThree()
			.then(three => {
				if (disposed) return;

				try {
					pooled = acquireRenderer(three, { alpha, antialias });
				} catch (e) {
					// The pool is full. Not an error in this scene: it is the
					// page asking for more contexts than the browser allows.
					fail(
						e instanceof NoContextAvailable
							? new Error('Too many 3D scenes on this page')
							: (e as Error),
						'unsupported',
					);
					return;
				}

				const { renderer, canvas } = pooled;
				canvas.style.display = 'block';
				canvas.style.width = '100%';
				canvas.style.height = '100%';
				container.appendChild(canvas);

				const ctx: ThreeCanvasContext = {
					three,
					renderer,
					canvas,
					width: container.clientWidth || 1,
					height: container.clientHeight || 1,
				};
				ctxRef.current = ctx;

				const applySize = () => {
					const w = Math.max(1, container.clientWidth);
					const h = Math.max(1, container.clientHeight);
					ctx.width = w;
					ctx.height = h;
					// Capped rather than raw: an uncapped DPR of 3 asks the GPU
					// for nine times the pixels of DPR 1.
					renderer.setPixelRatio(
						Math.min(
							dprCap,
							(typeof window !== 'undefined' && window.devicePixelRatio) || 1,
						),
					);
					renderer.setSize(w, h, false);
					cbs.current.onResize?.(ctx, w, h);
				};

				applySize();

				try {
					userCleanup = cbs.current.onInit?.(ctx);
				} catch (e) {
					fail(e as Error);
					return;
				}

				// A lost context is recoverable in principle, but a half-rebuilt
				// scene looks worse than the poster, so treat it as terminal.
				const onContextLost = (e: Event) => {
					e.preventDefault();
					stop();
					fail(new Error('The 3D context was lost'), 'unsupported');
				};
				canvas.addEventListener('webglcontextlost', onContextLost);

				let last = 0;
				let elapsed = 0;

				const renderFrame = (timestamp: number) => {
					const delta = last ? Math.min(0.1, (timestamp - last) / 1000) : 0;
					last = timestamp;
					elapsed += delta;
					try {
						cbs.current.onFrame?.(ctx, elapsed, delta);
					} catch (e) {
						stop();
						fail(e as Error);
					}
				};

				drawOnce.current = () => {
					if (disposed) return;
					renderFrame(
						typeof performance !== 'undefined' ? performance.now() : Date.now(),
					);
				};

				const loop = (timestamp: number) => {
					if (disposed) return;
					frameRef.current = requestAnimationFrame(loop);
					if (pausedRef.current || !visibleRef.current) return;
					renderFrame(timestamp);
				};

				const start = () => {
					if (disposed || frameRef.current) return;
					frameRef.current = requestAnimationFrame(loop);
				};

				function stop() {
					if (frameRef.current) {
						cancelAnimationFrame(frameRef.current);
						frameRef.current = 0;
					}
				}

				// Reduced motion and the page editor both get exactly one frame:
				// the scene is composed and correct, it simply does not animate.
				const staticOnly = prefersReducedMotion() || isPageEditor();

				resizeObserver = new ResizeObserver(() => {
					applySize();
					if (staticOnly) drawOnce.current();
				});
				resizeObserver.observe(container);

				if (staticOnly) {
					drawOnce.current();
				} else {
					intersectionObserver = new IntersectionObserver(
						entries => {
							visibleRef.current = entries.some(e => e.isIntersecting);
						},
						{ threshold: 0 },
					);
					intersectionObserver.observe(container);
					start();
				}

				const onVisibility = () => {
					// A background tab throttles rAF anyway, but stopping
					// outright also stops the GPU work behind it.
					if (document.hidden) stop();
					else if (!staticOnly) start();
				};
				document.addEventListener('visibilitychange', onVisibility);

				setStatus('ready');
				cbs.current.onReady?.();

				cleanupRef.current = () => {
					stop();
					canvas.removeEventListener('webglcontextlost', onContextLost);
					document.removeEventListener('visibilitychange', onVisibility);
					if (typeof userCleanup === 'function') userCleanup();
				};
			})
			.catch(e => fail(e as Error));

		return () => {
			disposed = true;
			cleanupRef.current();
			resizeObserver?.disconnect();
			intersectionObserver?.disconnect();
			ctxRef.current = null;
			if (pooled) {
				// Detach before releasing: the pool hands this canvas to the
				// next scene, and a canvas still parented here would vanish
				// from under it when this container unmounts.
				pooled.canvas.remove();
				releaseRenderer(pooled.canvas);
			}
		};
		// Only construction-time flags belong here. Everything else is read
		// through refs so a re-render never rebuilds the GL context.
	}, [alpha, antialias, dprCap]);

	return {
		containerRef,
		status,
		error,
		requestFrame: () => drawOnce.current(),
	};
}
