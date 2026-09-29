/**
 * Moving things by dragging them, and looking at them from somewhere else.
 *
 * Everything here is editor-only. The page runtime never orbits a camera it was
 * not told to and never shows a handle, so none of this belongs in
 * sceneRuntime; keeping it out is also what keeps TransformControls out of the
 * chunk every page with a scene downloads.
 *
 * Two separate jobs, together because they FIGHT and the fix is one line in
 * each direction: dragging a handle would otherwise also orbit the camera
 * underneath it, so the orbit control is switched off for the duration of a
 * drag. Left alone, every attempt to nudge an object spins the view instead,
 * which reads as the handles not working.
 */

import { loadTransformControls } from '../../../util/three/threeLoader';
import type { SceneDocument, Vec3 } from '../../../util/three/sceneDocument';
import type { SceneHandle } from '../../../util/three/sceneRuntime';
import type { ThreeCanvasContext } from '../../../util/three/useThreeCanvas';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

export interface ViewportControls {
	/** Put the handles on this object, or take them off with ''. */
	select: (objectId: string) => void;
	setMode: (mode: GizmoMode) => void;
	/** Per frame, before the render. */
	update: () => void;
	dispose: () => void;
}

const RAD = 180 / Math.PI;
const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Whether orbiting this document's camera would make sense.
 *
 * A 'fullscreen' camera is a fixed -1..1 frustum that a 2x2 plane fills
 * exactly at any aspect ratio. Orbiting it does not show the shader from
 * another angle -- it slides the quad out of frame and leaves the author
 * looking at nothing, with no way back but reopening the editor.
 */
export const canOrbit = (doc: SceneDocument): boolean => doc.camera.type !== 'fullscreen';

export interface ViewportControlsOptions {
	ctx: ThreeCanvasContext;
	handle: SceneHandle;
	doc: SceneDocument;
	/**
	 * A finished drag, in the document's own units: degrees for rotation, to
	 * match what the Inspector shows and what a hand-written document carries.
	 *
	 * Fires on drag END, not on every frame of the drag. A commit per frame
	 * would put sixty entries on the undo stack for one nudge, and Undo would
	 * stop being the thing that takes a change back.
	 */
	onTransform: (
		objectId: string,
		transform: { position: Vec3; rotation: Vec3; scale: Vec3 },
	) => void;
}

export async function attachViewportControls({
	ctx,
	handle,
	doc,
	onTransform,
}: ViewportControlsOptions): Promise<ViewportControls> {
	const { OrbitControls } = ctx.three;
	const orbit = canOrbit(doc) ? new OrbitControls(handle.camera, ctx.canvas) : null;
	if (orbit) {
		orbit.enableDamping = true;
		orbit.target.set(...(doc.camera.target as unknown as [number, number, number]));
		orbit.update();
	}

	const TransformControls = await loadTransformControls();
	const gizmo: any = new TransformControls(handle.camera, ctx.canvas);
	// r0.169 moved the visible part out of the control itself: the control is
	// now a Controls, and what goes in the scene is its helper. Adding the
	// control directly is silently a no-op -- no handles, no error.
	handle.scene.add(gizmo.getHelper());
	gizmo.size = 0.8;

	let attachedId = '';

	gizmo.addEventListener('dragging-changed', (e: any) => {
		if (orbit) orbit.enabled = !e.value;
		if (e.value || !attachedId) return;
		const node = handle.objects.get(attachedId);
		if (!node) return;
		onTransform(attachedId, {
			position: [round(node.position.x), round(node.position.y), round(node.position.z)],
			// Degrees out, because that is what the document stores and what
			// the Inspector shows. Radians in a hand-written scene document
			// are the trap this whole model was written to avoid.
			rotation: [
				round(node.rotation.x * RAD),
				round(node.rotation.y * RAD),
				round(node.rotation.z * RAD),
			],
			scale: [round(node.scale.x), round(node.scale.y), round(node.scale.z)],
		});
	});

	return {
		select(objectId: string) {
			const node = objectId ? handle.objects.get(objectId) : undefined;
			if (node) {
				attachedId = objectId;
				gizmo.attach(node);
			} else {
				attachedId = '';
				gizmo.detach();
			}
		},
		setMode(mode: GizmoMode) {
			gizmo.mode = mode;
		},
		update() {
			orbit?.update();
		},
		dispose() {
			const helper = gizmo.getHelper?.();
			if (helper?.parent) helper.parent.remove(helper);
			gizmo.detach();
			gizmo.dispose?.();
			orbit?.dispose();
		},
	};
}
