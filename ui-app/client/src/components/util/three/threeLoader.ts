/**
 * The single place three is imported, and the only place it may be.
 *
 * Everything is behind one cached dynamic import for two reasons. Four scene
 * components on one page must share one download, not take four. And three
 * must never appear in the initial bundle: the webpack `three` cache group is
 * `chunks: 'async'`, which only holds if nothing imports it statically.
 *
 * It also has to stay out of the server render. index.tsx hydrates rather than
 * mounts, so a module-scope `import * as THREE` would run during SSR, touch
 * globals that do not exist there, and break hydration for the whole page
 * rather than just the scene.
 *
 * Note for anyone upgrading: three 0.186 ships NO .d.ts of its own. Types come
 * from the pinned @types/three devDependency, and the two versions must be
 * bumped together or the jsm subpaths lose their types silently.
 */

import type * as THREE_NS from 'three';
import type { GLTFLoader as GLTFLoaderType } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls.js';
import type { RGBELoader as RGBELoaderType } from 'three/examples/jsm/loaders/RGBELoader.js';

export interface ThreeBundle {
	THREE: typeof THREE_NS;
	GLTFLoader: new () => GLTFLoaderType;
	OrbitControls: new (camera: THREE_NS.Camera, domElement: HTMLElement) => OrbitControlsType;
	RGBELoader: new () => RGBELoaderType;
}

let pending: Promise<ThreeBundle> | null = null;

/**
 * Resolve the three modules the scene runtime needs. Safe to call from every
 * component on the page: the first call downloads, the rest await the same
 * promise.
 */
export function loadThree(): Promise<ThreeBundle> {
	if (pending) return pending;

	pending = Promise.all([
		import(/* webpackChunkName: "three" */ 'three'),
		import(/* webpackChunkName: "three" */ 'three/examples/jsm/loaders/GLTFLoader.js'),
		import(/* webpackChunkName: "three" */ 'three/examples/jsm/controls/OrbitControls.js'),
		import(/* webpackChunkName: "three" */ 'three/examples/jsm/loaders/RGBELoader.js'),
	])
		.then(([THREE, gltf, orbit, rgbe]) => ({
			THREE: THREE as typeof THREE_NS,
			GLTFLoader: gltf.GLTFLoader as unknown as ThreeBundle['GLTFLoader'],
			OrbitControls: orbit.OrbitControls as unknown as ThreeBundle['OrbitControls'],
			RGBELoader: rgbe.RGBELoader as unknown as ThreeBundle['RGBELoader'],
		}))
		.catch(e => {
			// Clear the cache so a transient chunk failure (a deploy mid-session
			// invalidating the hashed filename) can be retried rather than
			// poisoning every scene on the page for good.
			pending = null;
			throw e;
		});

	return pending;
}

/** True once the chunk is in memory, so a caller can skip its loading state. */
export function isThreeLoaded(): boolean {
	return pending !== null;
}

/** Testing seam: drop the cache between cases. */
export function resetThreeLoaderForTests(): void {
	pending = null;
}
