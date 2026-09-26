/**
 * Turning a pointer event into "which object did they hit, and what runs".
 *
 * The maths is separated from the three calls for the usual reason: NDC
 * conversion is where the off-by-one-axis bugs live (WebGL's Y points up, the
 * DOM's points down), and it is the only part testable without a GPU.
 *
 * A hit runs an ordinary page event function through runEvent, exactly as a
 * Button click does, so a mesh pick is not a special kind of event in the
 * platform. The picked object's id and name are bound into the event args so a
 * KIRun function can branch on which mesh was clicked.
 */

import type { SceneDocument, SceneInteraction } from './sceneDocument';

export interface NDC {
	x: number;
	y: number;
}

export interface PointerLike {
	clientX: number;
	clientY: number;
}

export interface RectLike {
	left: number;
	top: number;
	width: number;
	height: number;
}

/**
 * Canvas-relative pointer position in normalised device coordinates: -1..1 on
 * both axes, with Y flipped because WebGL's origin is bottom-left and the
 * DOM's is top-left. Feeding un-flipped Y to a raycaster picks the object
 * mirrored about the horizontal centre, which looks like the raycast working
 * everywhere except where you clicked.
 */
export function toNDC(pointer: PointerLike, rect: RectLike): NDC {
	if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
	return {
		x: ((pointer.clientX - rect.left) / rect.width) * 2 - 1,
		// The `+ 0` is not noise: negating an exact zero yields -0, which is
		// arithmetically identical but compares unequal to 0 and would surface
		// as "-0" anywhere a pointer position is bound out to the store.
		y: -(((pointer.clientY - rect.top) / rect.height) * 2 - 1) + 0,
	};
}

/** Whether a pointer landed inside the canvas at all. */
export function isInside(pointer: PointerLike, rect: RectLike): boolean {
	const { x, y } = toNDC(pointer, rect);
	return x >= -1 && x <= 1 && y >= -1 && y <= 1;
}

/**
 * Walk up from a hit object to the one the scene document actually named.
 * A glTF hit lands on a deep child mesh, not on the node the author gave an
 * id to, so without this every model pick reports an anonymous sub-mesh.
 */
export function resolveSceneObjectId(hit: any): string | undefined {
	let node = hit;
	while (node) {
		const id = node.userData?.sceneObjectId;
		if (id) return id as string;
		node = node.parent;
	}
	return undefined;
}

/** Interactions that should fire for a gesture on a given object. */
export function matchInteractions(
	doc: SceneDocument,
	gesture: SceneInteraction['on'],
	objectId: string | undefined,
): SceneInteraction[] {
	return doc.interactions.filter(i => {
		if (i.on !== gesture || !i.event) return false;
		// An empty targetId means anywhere on the canvas, which is how a
		// background shader gets a click handler with no objects to hit.
		if (!i.targetId) return true;
		return i.targetId === objectId;
	});
}

export interface HitEventArgs {
	objectId: string;
	objectName: string;
	/** Intersection point in world space, useful for placing a marker. */
	point: { x: number; y: number; z: number } | null;
	distance: number | null;
}

/** The argument map handed to a page event function on a hit. */
export function hitEventArgs(doc: SceneDocument, objectId: string, hit?: any): HitEventArgs {
	const obj = doc.objects.find(o => o.id === objectId);
	const p = hit?.point;
	return {
		objectId,
		objectName: obj?.name ?? '',
		point: p ? { x: p.x, y: p.y, z: p.z } : null,
		distance: typeof hit?.distance === 'number' ? hit.distance : null,
	};
}

/**
 * Cheap gate before raycasting. Raycasting every pointermove across a scene
 * with a loaded model is the easy way to drop a page to 30fps, so a caller
 * that has no hover interactions should never pay for it.
 */
export function needsHoverRaycast(doc: SceneDocument): boolean {
	return doc.interactions.some(i => i.on === 'hover' && !!i.event);
}

export function needsClickRaycast(doc: SceneDocument): boolean {
	return doc.interactions.some(i => i.on !== 'hover' && !!i.event && !!i.targetId);
}
