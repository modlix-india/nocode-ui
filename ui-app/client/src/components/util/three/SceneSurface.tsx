import React, { useCallback, useEffect, useRef } from 'react';
import {
	ComponentDefinition,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../../types/common';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import getSrcUrl from '../getSrcUrl';
import { runEvent } from '../runEvent';
import { resolveSceneObjectId, toNDC } from './interactionBridge';
import type { SceneDocument } from './sceneDocument';
import {
	applyTimeline,
	buildScene,
	resizeCamera,
	updateSharedUniforms,
	type SceneHandle,
} from './sceneRuntime';
import type { ThreeBundle } from './threeLoader';
import { useThreeCanvas, type ThreeCanvasContext } from './useThreeCanvas';

/**
 * The shared body of every WebGL component: canvas lifecycle, the time and
 * scroll drivers, pointer uniforms, the poster fallback and the accessibility
 * rules.
 *
 * Extracted once there were two real consumers rather than on speculation. The
 * duplication it removes is not just the lifecycle wiring but the fiddly parts
 * that are easy to get wrong twice: a poster helper must be a SIBLING of the
 * img because img is a void element, an element that is clickable must not be
 * aria-hidden, and a click surface needs a keyboard path. Each of those was a
 * defect in the first component before it was fixed.
 *
 * What a component still owns is the only thing that actually differs: turning
 * its own flat properties into a SceneDocument.
 */
export interface SceneSurfaceProps {
	/** Root class, e.g. 'compShaderBackground'. */
	compClass: string;
	/** Extra root classes for state the surface itself cannot know about. */
	rootClassExtra?: string;
	/**
	 * Handed the root element. A scroll-driven scene needs to measure the
	 * component's own box, and wrapping the surface in another div to get a ref
	 * would break both the page editor's selection overlay, which positions
	 * against this element's offset parent, and the component's own CSS, which
	 * is written against `.comp.compX` as the outermost box.
	 */
	rootRef?: React.MutableRefObject<HTMLDivElement | null>;
	doc: SceneDocument;
	definition: ComponentDefinition;
	context: RenderContext;
	pageDefinition: PageDefinition;
	locationHistory: Array<LocationHistory>;
	/** Output of processComponentStylePseudoClasses. */
	resolvedStyles: any;

	speed?: number;
	dprCap?: number;
	pointerInteraction?: boolean;
	poster?: string;
	fallbackColor?: string;
	/** Uniform name to value, merged over the document's own each frame. */
	uniformOverrides?: Record<string, unknown>;
	/** 0..1 from a scroll driver; drives the timeline when driver is 'scroll'. */
	scrollProgress?: number;

	onReadyEvent?: string;
	onErrorEvent?: string;
	onClickEvent?: string;

	/**
	 * Run once the synchronous scene exists, for anything asynchronous: a glTF
	 * download, an HDRI, OrbitControls. Return a teardown, which runs before
	 * the handle is disposed. Deliberately generic: the alternative was a
	 * `controls` flag plus a `modelUrl` plus an `hdri` prop on a surface that
	 * three quarters of its callers do not use.
	 */
	afterBuild?: (
		three: ThreeBundle,
		handle: SceneHandle,
		ctx: ThreeCanvasContext,
	) => void | (() => void);

	/** Per-frame work before the render: controls.update, mixer.update. */
	onFrameExtra?: (handle: SceneHandle, ctx: ThreeCanvasContext, delta: number) => void;

	/**
	 * Turn on raycast picking. Hover is separate from click because hover
	 * raycasts on every pointermove, which is the easy way to drop a page with
	 * a loaded model to 30fps, so a component that only needs clicks never
	 * pays for it.
	 */
	picking?: {
		click?: (objectId: string | undefined, hit: any) => void;
		hover?: (objectId: string | undefined, hit: any) => void;
	};

	children?: React.ReactNode;
}

/**
 * Where uPointer sits before the pointer has arrived, and again once it leaves.
 *
 * NOT {0, 0}: in NDC that is the middle of the canvas, so any shader that
 * pushes away from uPointer starts with a hole bitten out of its centre before
 * the pointer has ever been near it -- which is exactly how the particle field
 * first rendered. Parked far outside the -1..1 range, a falloff like
 * exp(-d * d) is indistinguishable from the effect being off.
 */
const POINTER_AWAY = { x: 1000, y: 1000 };

export function SceneSurface(props: Readonly<SceneSurfaceProps>) {
	const {
		compClass,
		rootClassExtra,
		rootRef,
		doc,
		definition,
		context,
		pageDefinition,
		locationHistory,
		resolvedStyles,
		speed = 1,
		dprCap = 2,
		pointerInteraction = true,
		poster,
		fallbackColor,
		uniformOverrides,
		scrollProgress,
		onReadyEvent,
		onErrorEvent,
		onClickEvent,
		afterBuild,
		onFrameExtra,
		picking,
		children,
	} = props;

	const handleRef = useRef<SceneHandle | null>(null);
	const ctxRef = useRef<ThreeCanvasContext | null>(null);
	const raycasterRef = useRef<any>(null);
	/** Teardown returned by afterBuild, so a rebuild can run it first. */
	const teardownRef = useRef<(() => void) | void>(undefined);
	/** Which document the live handle was built from. */
	const builtDocRef = useRef<SceneDocument | null>(null);
	const pointerRef = useRef({ ...POINTER_AWAY });
	// Kept beside pointerRef rather than derived from it: a shader that pulls
	// toward the pointer cannot tell the parked sentinel from a real position.
	const pointerOnRef = useRef(false);

	// Read inside the frame callback rather than captured, so changing a colour
	// does not rebuild the GL scene on every keystroke.
	const liveRef = useRef({ speed, uniformOverrides, scrollProgress, doc });
	liveRef.current = { speed, uniformOverrides, scrollProgress, doc };

	const fireEvent = useCallback(
		(eventKey: string | undefined, args?: Record<string, unknown>) => {
			const fn = eventKey ? pageDefinition.eventFunctions?.[eventKey] : undefined;
			if (!fn || !eventKey) return;
			(async () =>
				await runEvent(
					fn,
					eventKey,
					context.pageName,
					locationHistory,
					pageDefinition,
					args ? new Map(Object.entries(args)) : undefined,
				))();
		},
		[pageDefinition, context.pageName, locationHistory],
	);

	// Read through a ref rather than captured, so adding an afterBuild does not
	// make the GL scene rebuild whenever the component re-renders.
	const hooksRef = useRef({ afterBuild, onFrameExtra, picking });
	hooksRef.current = { afterBuild, onFrameExtra, picking };

	/**
	 * Build the scene graph into an existing GL context.
	 *
	 * Separate from the canvas lifecycle on purpose: the renderer and its
	 * context are expensive and pooled, while the scene graph is cheap and
	 * changes every time an author touches a property.
	 */
	const buildInto = useCallback((ctx: ThreeCanvasContext, next: SceneDocument) => {
		// Teardown BEFORE dispose: OrbitControls has to let go of the DOM
		// element, and an in-flight model load has to be cancelled, while the
		// scene it refers to still exists.
		try {
			teardownRef.current?.();
		} catch {
			// A failing teardown must not strand the scene itself.
		}
		teardownRef.current = undefined;
		handleRef.current?.dispose();

		const handle = buildScene(ctx.three, next, ctx.width / Math.max(1, ctx.height));
		handleRef.current = handle;
		builtDocRef.current = next;
		teardownRef.current = hooksRef.current.afterBuild?.(ctx.three, handle, ctx);
	}, []);

	// Deliberately NOT dependent on `doc`. useThreeCanvas holds its callbacks
	// in refs and calls onInit exactly once, when the context is created, so a
	// `[doc]` dependency here only ever produced a new closure that nothing
	// invoked again. Rebuilding on a document change is the effect below.
	const onInit = useCallback(
		(ctx: ThreeCanvasContext) => {
			ctxRef.current = ctx;
			buildInto(ctx, liveRef.current.doc);
			return () => {
				try {
					teardownRef.current?.();
				} catch {
					// Already gone.
				}
				teardownRef.current = undefined;
				handleRef.current?.dispose();
				handleRef.current = null;
				builtDocRef.current = null;
				ctxRef.current = null;
			};
		},
		[buildInto],
	);

	/**
	 * Rebuild when the document changes.
	 *
	 * This is what makes the property panel work at all. Without it a scene was
	 * built once at mount and never again, so changing a preset or a colour
	 * updated the stored definition, re-rendered the component, re-ran the
	 * useMemo that produces the document -- and left the canvas showing
	 * whatever it happened to draw first. Every knob looked broken.
	 *
	 * The GL context is kept. Only the scene graph is thrown away and rebuilt,
	 * which is cheap and avoids giving a pooled renderer back and taking
	 * another one on every keystroke.
	 */
	useEffect(() => {
		const ctx = ctxRef.current;
		// No context yet: three is still loading and onInit will build from the
		// latest document when it arrives.
		if (!ctx) return;
		if (builtDocRef.current === doc) return;
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

		const progress =
			d.timeline.driver === 'scroll'
				? (live.scrollProgress ?? 0)
				: d.timeline.loop
					? (elapsed % (Math.max(1, d.timeline.duration) / 1000)) /
						(Math.max(1, d.timeline.duration) / 1000)
					: Math.min(1, elapsed / (Math.max(1, d.timeline.duration) / 1000));

		updateSharedUniforms(handle, {
			time: elapsed * (typeof live.speed === 'number' ? live.speed : 1),
			width: ctx.width,
			height: ctx.height,
			pointer: pointerRef.current,
			pointerActive: pointerOnRef.current,
			progress,
		});

		if (live.uniformOverrides && typeof live.uniformOverrides === 'object') {
			for (const material of handle.materials.values()) {
				for (const [name, value] of Object.entries(live.uniformOverrides)) {
					const u = material?.uniforms?.[name];
					if (!u) continue;
					if (u.value?.set && Array.isArray(value)) u.value.set(...value);
					else if (u.value?.set && typeof value === 'string') u.value.set(value);
					else u.value = value;
				}
			}
		}

		if (d.timeline.tracks.length) applyTimeline(handle, d, progress);

		hooksRef.current.onFrameExtra?.(handle, ctx, delta);

		ctx.renderer.render(handle.scene, handle.camera);
	}, []);

	const { containerRef, status } = useThreeCanvas({
		alpha: true,
		antialias: true,
		dprCap: typeof dprCap === 'number' ? dprCap : 2,
		onInit,
		onFrame,
		onResize,
		onReady: () => fireEvent(onReadyEvent),
		onError: e => fireEvent(onErrorEvent, { error: e.message }),
	});

	/**
	 * Raycast at the current pointer and hand back what was hit.
	 *
	 * The raycaster is made once and kept: constructing one per pointermove
	 * allocates on every frame of a drag, which is exactly the kind of garbage
	 * that shows up as stutter rather than as a slow function.
	 */
	const pick = useCallback((): { id: string | undefined; hit: any } | null => {
		const handle = handleRef.current;
		const ctx = ctxRef.current;
		if (!handle || !ctx) return null;
		if (!raycasterRef.current) raycasterRef.current = new ctx.three.THREE.Raycaster();
		const caster = raycasterRef.current;
		caster.setFromCamera(pointerRef.current, handle.camera);
		// Recursive: a glTF hit lands on a deep child mesh, and
		// resolveSceneObjectId walks back up to the node the document named.
		const hits = caster.intersectObjects(handle.scene.children, true);
		const hit = hits.find((h: any) => h.object?.visible);
		return { id: hit ? resolveSceneObjectId(hit.object) : undefined, hit };
	}, []);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const el = containerRef.current;
			if (!el) return;
			pointerRef.current = toNDC(e, el.getBoundingClientRect());
			pointerOnRef.current = true;
			const hover = hooksRef.current.picking?.hover;
			if (!hover) return;
			const result = pick();
			if (result) hover(result.id, result.hit);
		},
		[containerRef, pick],
	);

	const handlePointerLeave = useCallback(() => {
		pointerRef.current = { ...POINTER_AWAY };
		pointerOnRef.current = false;
	}, []);

	const handleClick = useCallback(() => {
		const onPick = hooksRef.current.picking?.click;
		if (onPick) {
			const result = pick();
			if (result) onPick(result.id, result.hit);
		}
		fireEvent(onClickEvent);
	}, [fireEvent, onClickEvent, pick]);
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			// A surface that responds to a click has to respond to a keyboard
			// too, or the interaction exists only for people using a mouse.
			if (e.key !== 'Enter' && e.key !== ' ') return;
			e.preventDefault();
			fireEvent(onClickEvent);
		},
		[fireEvent, onClickEvent],
	);

	const failed = status === 'error' || status === 'unsupported';
	const posterUrl = poster ? getSrcUrl(poster) : undefined;
	const clickable = !!onClickEvent || !!picking?.click;
	// Decorative by default, but never hide something that is focusable or that
	// holds content: that would make it unreachable rather than quiet.
	const decorative = !clickable && !definition.children;

	return (
		<div
			ref={rootRef}
			className={`comp ${compClass} ${status === 'ready' ? '_ready' : ''} ${
				rootClassExtra ?? ''
			}`}
			style={{ ...(resolvedStyles.comp ?? {}), background: fallbackColor || undefined }}
			onPointerMove={pointerInteraction && !failed ? handlePointerMove : undefined}
			onPointerLeave={pointerInteraction && !failed ? handlePointerLeave : undefined}
			onClick={clickable ? handleClick : undefined}
			onKeyDown={clickable ? handleKeyDown : undefined}
			role={clickable ? 'button' : undefined}
			tabIndex={clickable ? 0 : undefined}
			data-status={status}
			aria-hidden={decorative ? true : undefined}
		>
			{/* Must be INSIDE the root: the page editor positions its selection
			    overlay against this element's offset parent. Rendering it as a
			    sibling of the root leaves the outline in the wrong place. */}
			<HelperComponent context={context} definition={definition} />

			{failed && posterUrl ? (
				<>
					{/* Sibling, not a child: img is a void element. */}
					<img
						className="_poster"
						src={posterUrl}
						alt=""
						style={resolvedStyles.poster ?? {}}
					/>
					<SubHelperComponent definition={definition} subComponentName="poster" />
				</>
			) : null}

			{!failed ? (
				<div
					className="_canvasHolder"
					ref={containerRef}
					style={resolvedStyles.container ?? {}}
				>
					<SubHelperComponent definition={definition} subComponentName="container" />
				</div>
			) : null}

			<div className="_overlay" style={resolvedStyles.overlay ?? {}}>
				<SubHelperComponent definition={definition} subComponentName="overlay" />
			</div>

			{children ? <div className="_content">{children}</div> : null}
		</div>
	);
}
