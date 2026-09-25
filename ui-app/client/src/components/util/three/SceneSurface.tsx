import React, { useCallback, useRef } from 'react';
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
import { toNDC } from './interactionBridge';
import type { SceneDocument } from './sceneDocument';
import {
	applyTimeline,
	buildScene,
	resizeCamera,
	updateSharedUniforms,
	type SceneHandle,
} from './sceneRuntime';
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
		children,
	} = props;

	const handleRef = useRef<SceneHandle | null>(null);
	const pointerRef = useRef({ ...POINTER_AWAY });

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

	const onInit = useCallback(
		(ctx: ThreeCanvasContext) => {
			const handle = buildScene(ctx.three, doc, ctx.width / Math.max(1, ctx.height));
			handleRef.current = handle;
			return () => {
				handle.dispose();
				handleRef.current = null;
			};
		},
		[doc],
	);

	const onResize = useCallback((ctx: ThreeCanvasContext, width: number, height: number) => {
		const handle = handleRef.current;
		if (!handle) return;
		resizeCamera(handle.camera, width, height);
		updateSharedUniforms(handle, { width, height });
	}, []);

	const onFrame = useCallback((ctx: ThreeCanvasContext, elapsed: number) => {
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

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const el = containerRef.current;
			if (!el) return;
			pointerRef.current = toNDC(e, el.getBoundingClientRect());
		},
		[containerRef],
	);

	const handlePointerLeave = useCallback(() => {
		pointerRef.current = { ...POINTER_AWAY };
	}, []);

	const handleClick = useCallback(() => fireEvent(onClickEvent), [fireEvent, onClickEvent]);
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
	const clickable = !!onClickEvent;
	// Decorative by default, but never hide something that is focusable or that
	// holds content: that would make it unreachable rather than quiet.
	const decorative = !clickable && !definition.children;

	return (
		<div
			className={`comp ${compClass} ${status === 'ready' ? '_ready' : ''}`}
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
