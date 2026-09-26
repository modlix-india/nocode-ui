import { loadThree } from './threeLoader';
import { presetScene } from './presets';
import { buildScene, updateSharedUniforms } from './sceneRuntime';

/**
 * Render a still of a preset, for the editor's preset picker.
 *
 * One canvas and one renderer for ALL thumbnails, created here rather than
 * taken from rendererPool. The pool exists to hand live contexts to components
 * on the page and caps at six; a picker showing six presets would consume the
 * entire budget and starve the very scene being edited. This one is offscreen,
 * reused for every preset in turn, and never handed out.
 *
 * Results are cached by preset name because the source of a preset cannot
 * change without a reload: presets.ts is a module, not data.
 */

const cache = new Map<string, string>();
let shared: { renderer: any; canvas: HTMLCanvasElement } | null = null;
let inFlight: Promise<void> = Promise.resolve();

const WIDTH = 160;
const HEIGHT = 100;

/** Seconds into the animation to sample, so a preset is not caught at t=0. */
const SAMPLE_AT = 2.4;

/** Preview-only backdrop. See the setClearColor call for why. */
const PREVIEW_BACKDROP = '#0b1020';

async function ensureRenderer() {
	const three = await loadThree();
	if (!shared) {
		const canvas = document.createElement('canvas');
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		const renderer = new three.THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			// Required: without it the drawing buffer is cleared before
			// toDataURL can read it and every thumbnail comes back blank.
			preserveDrawingBuffer: true,
		});
		renderer.setPixelRatio(1);
		renderer.setSize(WIDTH, HEIGHT, false);
		shared = { renderer, canvas };
	}
	return { three, ...shared };
}

/**
 * A data URL for the named preset, or undefined if anything goes wrong. Never
 * throws: a picker that loses its thumbnails should still list its presets.
 *
 * Calls are serialised because they share one renderer; two overlapping
 * renders would read each other's pixels.
 */
export function presetThumbnail(name: string): Promise<string | undefined> {
	const cached = cache.get(name);
	if (cached) return Promise.resolve(cached);

	const result = inFlight.then(async () => {
		const again = cache.get(name);
		if (again) return again;
		try {
			const { three, renderer, canvas } = await ensureRenderer();
			const doc = presetScene(name, name);
			const handle = buildScene(three, doc, WIDTH / HEIGHT);
			try {
				updateSharedUniforms(handle, {
					time: SAMPLE_AT,
					width: WIDTH,
					height: HEIGHT,
					progress: 0.5,
					// Exactly the at-rest state of a live surface: parked away
					// so a repelling preset has no hole bitten out of its
					// centre, and flagged inactive so an attracting preset
					// does not read the parked value as a real position.
					pointer: { x: 1000, y: 1000 },
					pointerActive: false,
				});
				renderer.render(handle.scene, handle.camera);
				const url = canvas.toDataURL('image/png');
				cache.set(name, url);
				return url;
			} finally {
				// Always disposed: the picker builds a scene per preset and
				// these would otherwise accumulate on the GPU for the session.
				handle.dispose();
			}
		} catch {
			return undefined;
		}
	});

	inFlight = result.then(
		() => undefined,
		() => undefined,
	);
	return result;
}

/** Drop the shared context, for a page editor teardown. */
export function disposePresetThumbnails(): void {
	cache.clear();
	try {
		shared?.renderer.dispose?.();
		shared?.renderer.forceContextLoss?.();
	} catch {
		/* already gone */
	}
	shared = null;
}
