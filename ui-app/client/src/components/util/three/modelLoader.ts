/**
 * The asynchronous half of building a scene: glTF models and HDRI environments.
 *
 * Kept out of `buildScene` on purpose. That function is synchronous so the
 * first frame draws immediately, which is what lets a scene show its lights and
 * its backdrop while a 4MB model is still downloading. Everything here attaches
 * to a handle that is already on screen.
 *
 * Two rules run through all of it:
 *
 *  - **A load can outlive its scene.** A page editor re-renders a component on
 *    every keystroke, so a model download is routinely still in flight when the
 *    handle it was for has been disposed. Every completion therefore checks a
 *    cancellation flag before touching the scene, and disposes what it loaded if
 *    it lost the race. Without that, an abandoned model leaks its geometries and
 *    textures on the GPU and, worse, gets added to a disposed scene where it
 *    renders as nothing and reports no error.
 *  - **Nothing here throws at the caller.** A missing model is a content
 *    mistake, not a crash: it resolves to an error string the component can put
 *    through its own onError event, and the rest of the scene keeps rendering.
 */

import getSrcUrl from '../getSrcUrl';
import type { SceneDocument, SceneObject } from './sceneDocument';
import type { ThreeBundle } from './threeLoader';
import type { SceneHandle } from './sceneRuntime';

export interface ModelLoadResult {
	/** Scene object ids that loaded and are now in the scene. */
	loaded: string[];
	/** One sentence per object that failed, safe to show an author. */
	errors: string[];
}

/** A load in progress, which the caller cancels on unmount. */
export interface ModelLoadHandle {
	promise: Promise<ModelLoadResult>;
	cancel: () => void;
}

export interface FitResult {
	scale: number;
	center: [number, number, number];
}

/**
 * The normalisation decision, given a measured bounding box.
 *
 * Split out from `fitToUnitBox` so it can be tested: three is ESM and this
 * project's Jest setup transforms only TypeScript, so a test that imports three
 * dies before it runs. Every other module here follows the same split -- the
 * maths is separated from the three calls, because the maths is the part with
 * the bugs in it and the only part testable without a GPU.
 */
export function fitTransform(
	size: { x: number; y: number; z: number },
	center: { x: number; y: number; z: number },
	targetSize = 2,
): FitResult {
	const largest = Math.max(size.x, size.y, size.z);

	// A degenerate box means an empty model or one made only of lights. Scaling
	// by targetSize/0 would set every matrix to Infinity and take the whole
	// scene down with it, so leave it alone and let it render as nothing.
	if (!Number.isFinite(largest) || largest <= 0) {
		return { scale: 1, center: [0, 0, 0] };
	}

	return { scale: targetSize / largest, center: [center.x, center.y, center.z] };
}

/**
 * Scale and centre a loaded model so it is actually visible.
 *
 * glTF carries no convention about authored scale: the same chair arrives as 0.9
 * units tall from one exporter and 900 from another, and a camera framed for one
 * shows a speck or an interior wall for the other. Normalising to a known size
 * means a builder who drops in any model sees the model, and the transform in
 * the scene document then means the same thing whatever the source.
 */
export function fitToUnitBox(three: ThreeBundle, root: any, targetSize = 2): FitResult {
	const T = three.THREE;
	const box = new T.Box3().setFromObject(root);
	return fitTransform(box.getSize(new T.Vector3()), box.getCenter(new T.Vector3()), targetSize);
}

/**
 * Compose the document's transform ON TOP of whatever autoFit already wrote.
 *
 * Both position and scale have to compose rather than assign. autoFit puts a
 * normalising scale and a recentring offset on the node, and the document's
 * defaults are position [0,0,0] and scale [1,1,1] -- so assigning would silently
 * undo the recentring for every model that did not set an explicit position,
 * which is all of them. Rotation assigns, because autoFit never writes it.
 */
function applyObjectTransform(node: any, obj: SceneObject) {
	node.position.set(
		node.position.x + obj.transform.position[0],
		node.position.y + obj.transform.position[1],
		node.position.z + obj.transform.position[2],
	);
	node.rotation.set(
		obj.transform.rotation[0],
		obj.transform.rotation[1],
		obj.transform.rotation[2],
	);
	node.scale.set(
		node.scale.x * obj.transform.scale[0],
		node.scale.y * obj.transform.scale[1],
		node.scale.z * obj.transform.scale[2],
	);
}

function disposeSubtree(root: any) {
	if (!root?.traverse) return;
	root.traverse((n: any) => {
		n.geometry?.dispose?.();
		const mats = Array.isArray(n.material) ? n.material : n.material ? [n.material] : [];
		for (const m of mats) {
			for (const v of Object.values(m)) {
				if (v && typeof v === 'object' && 'isTexture' in (v as any)) {
					(v as any).dispose?.();
				}
			}
			m.dispose?.();
		}
	});
}

/**
 * Load every glTF object in the document and add it to the live scene.
 *
 * `autoFit` normalises each model's size; turn it off once a scene's transforms
 * have been authored deliberately, or the fit will fight them.
 */
export function attachModels(
	three: ThreeBundle,
	doc: SceneDocument,
	handle: SceneHandle,
	options: { autoFit?: boolean; onProgress?: (loaded: number, total: number) => void } = {},
): ModelLoadHandle {
	const { autoFit = true, onProgress } = options;
	const targets = doc.objects.filter(o => o.source.kind === 'gltf' && o.source.url);
	let cancelled = false;

	const promise = (async (): Promise<ModelLoadResult> => {
		const loaded: string[] = [];
		const errors: string[] = [];
		if (!targets.length) return { loaded, errors };

		const loader = new three.GLTFLoader();

		for (const obj of targets) {
			try {
				const url = getSrcUrl(obj.source.url!);
				const gltf: any = await loader.loadAsync(url);
				const root = gltf.scene ?? gltf.scenes?.[0];
				if (!root) {
					errors.push(`Model '${obj.name}' loaded but contains no scene.`);
					continue;
				}

				// Checked AFTER the await, not before: the handle may have been
				// disposed while this was downloading, and adding to a disposed
				// scene strands everything it brought with it on the GPU.
				if (cancelled) {
					disposeSubtree(root);
					return { loaded, errors };
				}

				if (autoFit) {
					const { scale, center } = fitToUnitBox(three, root);
					root.scale.setScalar(scale);
					// Recentre AFTER scaling, in the scaled frame: subtracting
					// the unscaled centre would leave the model off by exactly
					// the factor it was just scaled by.
					root.position.set(-center[0] * scale, -center[1] * scale, -center[2] * scale);
				}
				applyObjectTransform(root, obj);

				root.visible = obj.visible;
				// The id lives on the ROOT, and interactionBridge walks up to it
				// from whichever deep mesh a raycast actually hit.
				root.userData.sceneObjectId = obj.id;

				if (gltf.animations?.length) {
					const mixer = new three.THREE.AnimationMixer(root);
					for (const clip of gltf.animations) mixer.clipAction(clip).play();
					handle.mixers.push(mixer);
				}

				handle.scene.add(root);
				handle.objects.set(obj.id, root);
				loaded.push(obj.id);
				onProgress?.(loaded.length, targets.length);
			} catch (e) {
				// Named, because "failed to load" with no name is useless when a
				// scene has four models and one URL is wrong.
				errors.push(
					`Model '${obj.name}' failed to load from ${obj.source.url}: ` +
						`${e instanceof Error ? e.message : String(e)}`,
				);
			}
		}

		return { loaded, errors };
	})();

	return {
		promise,
		cancel: () => {
			cancelled = true;
		},
	};
}

/**
 * Light the scene from an HDRI, and optionally show it behind the model.
 *
 * The texture mapping MUST be set to equirectangular reflection: an HDRI loaded
 * with the default mapping lights the scene as a flat rectangle pasted on one
 * side, which reads as "the environment did not load" rather than as a mistake.
 */
export function attachEnvironment(
	three: ThreeBundle,
	doc: SceneDocument,
	handle: SceneHandle,
): ModelLoadHandle {
	const url = doc.environment.hdriUrl;
	let cancelled = false;

	const promise = (async (): Promise<ModelLoadResult> => {
		if (!url) return { loaded: [], errors: [] };
		try {
			const texture: any = await new three.RGBELoader().loadAsync(getSrcUrl(url));
			if (cancelled) {
				texture.dispose?.();
				return { loaded: [], errors: [] };
			}
			texture.mapping = three.THREE.EquirectangularReflectionMapping;
			handle.scene.environment = texture;
			if (doc.environment.background) handle.scene.background = texture;
			return { loaded: ['environment'], errors: [] };
		} catch (e) {
			return {
				loaded: [],
				errors: [
					`Environment failed to load from ${url}: ` +
						`${e instanceof Error ? e.message : String(e)}`,
				],
			};
		}
	})();

	return { promise, cancel: () => (cancelled = true) };
}
