import React, { useCallback, useEffect, useRef, useState } from 'react';
import { attachEnvironment, attachModels } from '../../../util/three/modelLoader';
import type { SceneDocument, Vec3 } from '../../../util/three/sceneDocument';
import {
	applyTimeline,
	buildScene,
	resizeCamera,
	updateSharedUniforms,
	type SceneHandle,
} from '../../../util/three/sceneRuntime';
import { useThreeCanvas, type ThreeCanvasContext } from '../../../util/three/useThreeCanvas';
import {
	attachViewportControls,
	canOrbit,
	type GizmoMode,
	type ViewportControls,
} from './viewportControls';

/**
 * The editor's live preview of a scene document.
 *
 * Deliberately NOT SceneSurface. The page component's surface renders one frame
 * in the page editor, hides the canvas until it is ready, honours reduced
 * motion by freezing, and stops when scrolled out of view -- every one of which
 * is correct on a page and wrong in an editor, where the author is asking to
 * watch the thing move while they change it. It also has to scrub to an
 * arbitrary progress on demand, which a page never does.
 *
 * It shares everything below the surface: the same buildScene, the same
 * timeline, the same loaders. What differs is only the policy.
 *
 * ## Why the rebuild is an effect and not a remount
 *
 * This used to be keyed on a summary of the document -- object count, ids,
 * shader source lengths -- so that a structural edit remounted it. The summary
 * is what a summary always is: a list of the changes somebody thought of.
 * Changing an object's colour, its metalness, a light's intensity or the
 * environment left the key identical, so the preview did not move and the
 * author's only conclusion was that the field did nothing.
 *
 * Rebuilding on ANY change removes the guess. The camera is carried across, or
 * every edit would throw away the angle the author had just found -- which is
 * the same complaint in a different place.
 */
export function SceneViewport({
	doc,
	progress,
	playing,
	selectedObjectId = '',
	gizmoMode = 'translate',
	onTransform,
	onError,
}: Readonly<{
	doc: SceneDocument;
	/** 0..1 for a scroll-driven document; ignored when the driver is time. */
	progress: number;
	playing: boolean;
	/** The object the drag handles sit on, or '' for none. */
	selectedObjectId?: string;
	gizmoMode?: GizmoMode;
	/** A finished drag, in the document's units. */
	onTransform?: (
		objectId: string,
		transform: { position: Vec3; rotation: Vec3; scale: Vec3 },
	) => void;
	onError?: (messages: string[]) => void;
}>) {
	const handleRef = useRef<SceneHandle | null>(null);
	const controlsRef = useRef<ViewportControls | null>(null);
	const ctxRef = useRef<ThreeCanvasContext | null>(null);
	const builtDocRef = useRef<SceneDocument | null>(null);
	const teardownRef = useRef<(() => void) | null>(null);
	/** Where the author last left the camera, carried across rebuilds. */
	const viewRef = useRef<{ position: any; quaternion: any; type: string } | null>(null);
	const liveRef = useRef({ progress, playing, doc });
	liveRef.current = { progress, playing, doc };
	// Handlers and UI state live in refs so the build closure reads the CURRENT
	// ones without being rebuilt when they change. In a dependency list they
	// would tear the scene down on every parent render.
	const transformRef = useRef(onTransform);
	transformRef.current = onTransform;
	const errorRef = useRef(onError);
	errorRef.current = onError;
	const desiredRef = useRef({ selectedObjectId, gizmoMode });
	desiredRef.current = { selectedObjectId, gizmoMode };
	const [status, setStatus] = useState<string>('');

	const buildInto = useCallback((ctx: ThreeCanvasContext, next: SceneDocument) => {
		try {
			teardownRef.current?.();
		} catch {
			/* a failed teardown must not stop the rebuild */
		}
		teardownRef.current = null;

		const handle = buildScene(ctx.three, next, ctx.width / Math.max(1, ctx.height));
		handleRef.current = handle;
		builtDocRef.current = next;

		// Put the camera back where it was. Only when the type matches: a
		// document switching to a fullscreen camera means the old position is
		// meaningless, and restoring it would slide the quad out of frame.
		const saved = viewRef.current;
		if (saved && handle.camera?.position && saved.type === handle.camera.type) {
			handle.camera.position.copy(saved.position);
			handle.camera.quaternion.copy(saved.quaternion);
		}

		const models = attachModels(ctx.three, next, handle);
		const env = attachEnvironment(ctx.three, next, handle);
		Promise.all([models.promise, env.promise]).then(results => {
			const errors = results.flatMap(r => r.errors);
			if (errors.length) errorRef.current?.(errors);
		});

		let controls: ViewportControls | null = null;
		let cancelled = false;
		attachViewportControls({
			ctx,
			handle,
			doc: next,
			onTransform: (id, t) => transformRef.current?.(id, t),
		})
			.then(c => {
				// The chunk is async and a rebuild can land first, in which
				// case this gizmo belongs to a scene that is already gone.
				if (cancelled) {
					c.dispose();
					return;
				}
				controls = c;
				controlsRef.current = c;
				c.select(desiredRef.current.selectedObjectId);
				c.setMode(desiredRef.current.gizmoMode);
			})
			.catch(() =>
				setStatus('The drag handles could not be loaded; the number fields still work.'),
			);

		teardownRef.current = () => {
			cancelled = true;
			// Saved BEFORE disposal, because disposal is the only moment the
			// camera still exists and the next build is the only thing that
			// wants it.
			if (handle.camera?.position) {
				viewRef.current = {
					position: handle.camera.position.clone(),
					quaternion: handle.camera.quaternion.clone(),
					type: String(handle.camera.type ?? ''),
				};
			}
			controls?.dispose();
			if (controlsRef.current === controls) controlsRef.current = null;
			models.cancel();
			env.cancel();
			handle.dispose();
			if (handleRef.current === handle) handleRef.current = null;
		};
	}, []);

	const onInit = useCallback(
		(ctx: ThreeCanvasContext) => {
			ctxRef.current = ctx;
			buildInto(ctx, liveRef.current.doc);
			return () => {
				teardownRef.current?.();
				teardownRef.current = null;
				builtDocRef.current = null;
				ctxRef.current = null;
			};
		},
		[buildInto],
	);

	useEffect(() => {
		const ctx = ctxRef.current;
		if (!ctx) return;
		// Identity, not a summary: the modal's edits are non-mutating, so a new
		// object IS a change and an unchanged one is the same reference.
		if (builtDocRef.current === doc) return;
		setStatus('');
		buildInto(ctx, doc);
	}, [doc, buildInto]);

	const onResize = useCallback((ctx: ThreeCanvasContext, width: number, height: number) => {
		const handle = handleRef.current;
		if (!handle) return;
		resizeCamera(handle.camera, width, height);
		updateSharedUniforms(handle, { width, height });
	}, []);

	const onFrame = useCallback((ctx: ThreeCanvasContext, elapsed: number, delta: number) => {
		const handle = handleRef.current;
		if (!handle) return;
		const live = liveRef.current;
		const d = live.doc;

		// A scroll document is scrubbed by the editor's own slider, because
		// there is nothing to scroll here. A time document plays, unless the
		// author has paused it to look at one frame.
		const p =
			d.timeline.driver === 'scroll'
				? live.progress
				: live.playing
					? (elapsed % (Math.max(1, d.timeline.duration) / 1000)) /
						(Math.max(1, d.timeline.duration) / 1000)
					: live.progress;

		updateSharedUniforms(handle, {
			time: live.playing ? elapsed : live.progress * (d.timeline.duration / 1000),
			width: ctx.width,
			height: ctx.height,
			// Parked and flagged inactive: the editor has no pointer over the
			// scene most of the time, and a shader that pulls toward the
			// pointer would otherwise read the parked value as a real position.
			pointer: { x: 1000, y: 1000 },
			pointerActive: false,
			progress: p,
		});

		// Before the timeline, so a track writing a transform still wins: the
		// orbit damping only moves the camera, and an author scrubbing a track
		// expects the track to be what they see.
		controlsRef.current?.update();

		if (d.timeline.tracks.length) applyTimeline(handle, d, p);
		for (const mixer of handle.mixers) mixer.update(live.playing ? delta : 0);

		ctx.renderer.render(handle.scene, handle.camera);
	}, []);

	const { containerRef, status: canvasStatus } = useThreeCanvas({
		alpha: true,
		antialias: true,
		dprCap: 2,
		// The editor is the one place a scene must keep running: the author is
		// watching it while they change it.
		forceLive: true,
		onInit,
		onFrame,
		onResize,
		onError: e => setStatus(e.message),
	});

	// The handles follow the selection rather than the scene being rebuilt for
	// it: a rebuild per click in the tree would be work for nothing.
	useEffect(() => {
		controlsRef.current?.select(selectedObjectId);
	}, [selectedObjectId, doc]);

	useEffect(() => {
		controlsRef.current?.setMode(gizmoMode);
	}, [gizmoMode, doc]);

	useEffect(() => {
		if (canvasStatus === 'unsupported') {
			setStatus('WebGL is unavailable in this browser, so the preview cannot render.');
		}
	}, [canvasStatus]);

	return (
		<div className="_sceneViewport">
			<div className="_sceneViewportCanvas" ref={containerRef} />
			{canOrbit(doc) ? (
				<div className="_sceneViewportHint">Drag to orbit · scroll to zoom</div>
			) : null}
			{status ? <div className="_sceneViewportError">{status}</div> : null}
		</div>
	);
}
