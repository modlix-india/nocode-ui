import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SceneSurface } from '../util/three/SceneSurface';
import { attachEnvironment, attachModels } from '../util/three/modelLoader';
import { colorOr, resolveThemeColor, schemePalette } from '../util/three/themeColor';
import { resolveSceneDocument } from '../util/three/sceneDocument';
import { modelViewerDocument } from '../util/three/componentScenes';
import { parseColor, type SceneHandle } from '../util/three/sceneRuntime';
import type { ThreeBundle } from '../util/three/threeLoader';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './modelViewerProperties';

export default function LazyModelViewer(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			modelUrl,
			scene,
			environmentPreset = 'studio',
			hdriUrl,
			showEnvironment = false,
			controls = true,
			autoRotate = true,
			autoRotateSpeed = 2,
			zoom = 4,
			cameraHeight = 0.6,
			fov = 45,
			autoFit = true,
			speed = 1,
			fallbackColor,
			dprCap = 2,
			poster,
			highlightColor,
			onReady,
			onModelLoad,
			onError,
			onMeshClick,
			onMeshHover,
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

	// Rebuilds the GL scene, so it lists only what changes the scene graph.
	// autoRotateSpeed and speed are deliberately absent: they are read per
	// frame, and including them would tear down and reload the model every
	// time someone dragged the speed slider.
	const doc = useMemo(
		() =>
			resolveSceneDocument(scene, () =>
				modelViewerDocument({
					modelUrl,
					environmentPreset,
					hdriUrl,
					showEnvironment,
					controls,
					zoom,
					cameraHeight,
					fov,
				}),
			),
		[
			scene,
			modelUrl,
			environmentPreset,
			hdriUrl,
			showEnvironment,
			controls,
			zoom,
			cameraHeight,
			fov,
		],
	);

	const bindingPath =
		definition.bindingPath &&
		getPathFromLocation(definition.bindingPath, locationHistory, pageExtractor);

	const controlsRef = useRef<any>(null);
	// A loaded model arrives with its own materials, and recolouring it from a
	// theme would throw away the thing somebody exported. So the scheme reaches
	// exactly one colour here: the tint a picked mesh takes. That is this
	// component's own decoration rather than the model's, and it is the part
	// that should match the page around it.
	const tintColor = colorOr(highlightColor, schemePalette(colorScheme)?.c);
	const liveRef = useRef({ autoRotate, autoRotateSpeed, speed, autoFit, tintColor });
	liveRef.current = { autoRotate, autoRotateSpeed, speed, autoFit, tintColor };

	/** The mesh name the page currently considers selected. */
	const selectedRef = useRef<string>('');
	const hoveredRef = useRef<string>('');
	const handleRef = useRef<SceneHandle | null>(null);
	const threeRef = useRef<ThreeBundle | null>(null);

	const fireEvent = useCallback(
		(eventKey: string | undefined, args: Record<string, unknown>) => {
			const fn = eventKey ? pageDefinition.eventFunctions?.[eventKey] : undefined;
			if (!fn || !eventKey) return;
			import('../util/runEvent').then(({ runEvent }) =>
				runEvent(
					fn,
					eventKey,
					context.pageName,
					locationHistory,
					pageDefinition,
					new Map(Object.entries(args)),
				),
			);
		},
		[pageDefinition, context.pageName, locationHistory],
	);

	/**
	 * Tint whichever mesh the binding names, and put every other one back.
	 *
	 * The original colour is stashed on the material the first time it is
	 * touched. Recomputing "the colour before the tint" from the tinted value
	 * is not possible, so without the stash a second selection would tint a
	 * tint and the model would drift further from its authored colours with
	 * every click.
	 */
	const applyHighlight = useCallback((name: string) => {
		const handle = handleRef.current;
		const three = threeRef.current;
		if (!handle || !three) return;
		const tint = liveRef.current.tintColor;
		handle.scene.traverse((node: any) => {
			if (!node.isMesh || !node.material || Array.isArray(node.material)) return;
			const m = node.material;
			if (!m.userData) m.userData = {};
			if (m.userData.baseColor === undefined && m.color) {
				m.userData.baseColor = m.color.getHex();
			}
			if (!m.color) return;
			const isSelected = !!name && node.name === name;
			if (isSelected && tint) m.color.copy(parseColor(three, tint));
			else if (m.userData.baseColor !== undefined) m.color.setHex(m.userData.baseColor);
		});
	}, []);

	// Read the selection back out of the store, so a page can drive it as well
	// as observe it. Same two-way shape CheckBox uses.
	useEffect(() => {
		if (!bindingPath) return;
		return addListenerAndCallImmediately(
			context.pageName,
			(_, value) => {
				const name = typeof value === 'string' ? value : '';
				if (name === selectedRef.current) return;
				selectedRef.current = name;
				applyHighlight(name);
			},
			bindingPath,
		);
	}, [bindingPath, context.pageName, applyHighlight]);

	const afterBuild = useCallback(
		(three: ThreeBundle, handle: SceneHandle, ctx: any) => {
			threeRef.current = three;
			handleRef.current = handle;

			const models = attachModels(three, doc, handle, { autoFit: liveRef.current.autoFit });
			const env = attachEnvironment(three, doc, handle);

			models.promise.then(({ loaded, errors }) => {
				for (const e of errors) fireEvent(onError, { error: e });
				if (loaded.length) {
					// Re-applied here because the store listener above almost
					// always runs BEFORE the model exists: a selection restored
					// from page data would otherwise silently do nothing.
					applyHighlight(selectedRef.current);
					fireEvent(onModelLoad, { objectIds: loaded });
				}
			});
			env.promise.then(({ errors }) => {
				for (const e of errors) fireEvent(onError, { error: e });
			});

			let orbit: any = null;
			if (doc.camera.controls) {
				orbit = new three.OrbitControls(handle.camera, ctx.renderer.domElement);
				orbit.enableDamping = true;
				// Zooming with the wheel inside a page would otherwise swallow
				// the page scroll, trapping a visitor who scrolled onto the
				// model on their way down the page.
				orbit.enableZoom = false;
				orbit.target.set(0, 0, 0);
				controlsRef.current = orbit;
			}

			return () => {
				models.cancel();
				env.cancel();
				orbit?.dispose?.();
				controlsRef.current = null;
				handleRef.current = null;
				threeRef.current = null;
			};
		},
		[doc, fireEvent, onError, onModelLoad, applyHighlight],
	);

	const onFrameExtra = useCallback((handle: SceneHandle, _ctx: any, delta: number) => {
		const live = liveRef.current;
		const orbit = controlsRef.current;
		if (orbit) {
			orbit.autoRotate = !!live.autoRotate;
			orbit.autoRotateSpeed = live.autoRotateSpeed ?? 2;
			// Required every frame when damping or autoRotate is on; without it
			// the controls look inert and autoRotate never moves at all.
			orbit.update();
		} else if (live.autoRotate) {
			// No controls, but still asked to turn. Rotate the model itself.
			const model = handle.objects.get('model');
			if (model) model.rotation.y += (live.autoRotateSpeed ?? 2) * 0.01745 * delta;
		}
		for (const mixer of handle.mixers) {
			mixer.update(delta * (typeof live.speed === 'number' ? live.speed : 1));
		}
	}, []);

	const picking = useMemo(() => {
		if (!onMeshClick && !onMeshHover && !bindingPath) return undefined;
		return {
			click: (_id: string | undefined, hit: any) => {
				const meshName = hit?.object?.name ?? '';
				if (bindingPath) {
					setData(bindingPath, meshName, context.pageName);
				}
				if (!onMeshClick) return;
				fireEvent(onMeshClick, {
					meshName,
					point: hit?.point ? { x: hit.point.x, y: hit.point.y, z: hit.point.z } : null,
					distance: typeof hit?.distance === 'number' ? hit.distance : null,
				});
			},
			// Only present when an event wants it: SceneSurface raycasts on
			// every pointermove when a hover handler exists, and on a loaded
			// model that is the difference between 60fps and 30.
			hover: onMeshHover
				? (_id: string | undefined, hit: any) => {
						const meshName = hit?.object?.name ?? '';
						if (meshName === hoveredRef.current) return;
						hoveredRef.current = meshName;
						fireEvent(onMeshHover, { meshName });
					}
				: undefined,
		};
	}, [onMeshClick, onMeshHover, bindingPath, context.pageName, fireEvent]);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	if (!visibility) return <></>;

	return (
		<SceneSurface
			compClass="compModelViewer"
			rootClassExtra={`${colorScheme} ${doc.camera.controls ? '_orbitable' : ''}`}
			doc={doc}
			definition={definition}
			context={context}
			pageDefinition={pageDefinition}
			locationHistory={locationHistory}
			resolvedStyles={resolvedStyles}
			speed={speed}
			dprCap={dprCap}
			poster={poster}
			fallbackColor={resolveThemeColor(fallbackColor)}
			uniformOverrides={uniformOverrides}
			onReadyEvent={onReady}
			onErrorEvent={onError}
			afterBuild={afterBuild}
			onFrameExtra={onFrameExtra}
			picking={picking}
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
