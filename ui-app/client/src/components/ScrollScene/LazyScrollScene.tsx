import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SceneSurface } from '../util/three/SceneSurface';
import { colorOr, resolveThemeColor, schemePalette } from '../util/three/themeColor';
import { resolveSceneDocument } from '../util/three/sceneDocument';
import { scrollSceneDocument } from '../util/three/componentScenes';
import { prefersReducedMotion } from '../util/three/useThreeCanvas';
import {
	observeScrollProgress,
	type ScrollAxis,
	type ScrollMode,
	type ScrollerRef,
} from '../util/scroll/scrollDriver';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './scrollSceneProperties';

export default function LazyScrollScene(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			preset = 'scrollSpin',
			scene,
			axis = 'block',
			mode = 'view',
			scroller = 'nearest',
			rangeStart = 0,
			rangeEnd = 1,
			colorA,
			fallbackColor,
			dprCap = 2,
			poster,
			pointerInteraction = true,
			reducedMotionProgress = 0.5,
			onReady,
			onError,
			onSceneEnter,
			onSceneExit,
			uniforms: uniformOverrides,
			colorScheme = '_preset',
			visibility = true,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const doc = useMemo(
		() =>
			resolveSceneDocument(scene, () =>
				scrollSceneDocument({
					preset,
					// The lit mid tone, not the deep end: this colour paints a
					// solid object under real lights, and the shade meant for
					// the far side of a gradient reads as black on one.
					colorA: colorOr(colorA, schemePalette(colorScheme)?.b),
				}),
			),
		[scene, preset, colorA, colorScheme],
	);

	const rootRef = useRef<HTMLDivElement | null>(null);
	const [progress, setProgress] = useState(0);

	const bindingPath =
		definition.bindingPath &&
		getPathFromLocation(definition.bindingPath, locationHistory, pageExtractor);

	const fireEvent = useCallback(
		(eventKey: string | undefined, args: Record<string, unknown>) => {
			const fn = eventKey ? pageDefinition.eventFunctions?.[eventKey] : undefined;
			if (!fn || !eventKey) return;
			(async () =>
				await runEvent(
					fn,
					eventKey,
					context.pageName,
					locationHistory,
					pageDefinition,
					new Map(Object.entries(args)),
				))();
		},
		[pageDefinition, context.pageName, locationHistory],
	);

	// Kept in refs so the subscription does not tear down and re-attach every
	// time an event property changes, which would drop a frame of scroll.
	const edgeRef = useRef({ entered: false, exited: false });
	const eventsRef = useRef({ onSceneEnter, onSceneExit, bindingPath, fireEvent });
	eventsRef.current = { onSceneEnter, onSceneExit, bindingPath, fireEvent };

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;

		// Reduced motion gets one still frame and no subscription at all. The
		// scroll driver is cheap, but a scene that scrubs under the pointer is
		// precisely the motion the preference asks us not to produce, and
		// pinning to the START usually shows a scene that has not arrived yet.
		if (prefersReducedMotion()) {
			setProgress(reducedMotionProgress);
			return;
		}

		edgeRef.current = { entered: false, exited: false };

		return observeScrollProgress(
			{
				target: el,
				axis: axis as ScrollAxis,
				mode: mode as ScrollMode,
				scroller: scroller as ScrollerRef,
				rangeStart,
				rangeEnd,
			},
			p => {
				setProgress(p);
				const ev = eventsRef.current;
				if (ev.bindingPath) setData(ev.bindingPath, p, context.pageName);
				// Edges fire once each per mount. A scene that scrubs back and
				// forth across the threshold would otherwise fire onSceneEnter
				// on every frame of a slow scroll.
				if (p > 0 && !edgeRef.current.entered) {
					edgeRef.current.entered = true;
					ev.fireEvent(ev.onSceneEnter, { progress: p });
				}
				if (p >= 1 && !edgeRef.current.exited) {
					edgeRef.current.exited = true;
					ev.fireEvent(ev.onSceneExit, { progress: p });
				}
			},
		);
	}, [axis, mode, scroller, rangeStart, rangeEnd, reducedMotionProgress, context.pageName]);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	if (!visibility) return <></>;

	return (
		<SceneSurface
			compClass="compScrollScene"
			rootClassExtra={colorScheme}
			rootRef={rootRef}
			doc={doc}
			definition={definition}
			context={context}
			pageDefinition={pageDefinition}
			locationHistory={locationHistory}
			resolvedStyles={resolvedStyles}
			dprCap={dprCap}
			pointerInteraction={pointerInteraction}
			poster={poster}
			fallbackColor={resolveThemeColor(fallbackColor)}
			uniformOverrides={uniformOverrides}
			scrollProgress={progress}
			onReadyEvent={onReady}
			onErrorEvent={onError}
		>
			{definition.children ? (
				<Children
					key={`${key}_chld`}
					pageDefinition={pageDefinition}
					renderableChildren={definition.children}
					context={context}
					locationHistory={locationHistory}
				/>
			) : null}
		</SceneSurface>
	);
}
