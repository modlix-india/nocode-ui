import React, { useMemo } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SceneSurface } from '../util/three/SceneSurface';
import { colorOr, resolveThemeColor, schemePalette } from '../util/three/themeColor';
import { resolveSceneDocument } from '../util/three/sceneDocument';
import { shaderBackgroundDocument } from '../util/three/componentScenes';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './shaderBackgroundProperties';

export default function LazyShaderBackground(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			preset = 'aurora',
			scene,
			fragmentShader,
			colorA,
			colorB,
			colorC,
			speed = 1,
			pointerInteraction = true,
			dprCap = 2,
			poster,
			fallbackColor,
			onReady,
			onError,
			onClick,
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
			resolveSceneDocument(scene, () => {
				// The scheme is a default under the author's own colours, not a
				// replacement for them, so each slot falls through
				// property -> scheme -> whatever the preset chose.
				const scheme = schemePalette(colorScheme);
				return shaderBackgroundDocument({
					preset,
					fragmentShader,
					colorA: colorOr(colorA, scheme?.a),
					colorB: colorOr(colorB, scheme?.b),
					colorC: colorOr(colorC, scheme?.c),
				});
			}),
		[scene, preset, fragmentShader, colorA, colorB, colorC, colorScheme],
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	if (!visibility) return <></>;

	return (
		<SceneSurface
			compClass="compShaderBackground"
			rootClassExtra={colorScheme}
			doc={doc}
			definition={definition}
			context={context}
			pageDefinition={pageDefinition}
			locationHistory={locationHistory}
			resolvedStyles={resolvedStyles}
			speed={speed}
			dprCap={dprCap}
			pointerInteraction={pointerInteraction}
			poster={poster}
			fallbackColor={resolveThemeColor(fallbackColor)}
			uniformOverrides={uniformOverrides}
			onReadyEvent={onReady}
			onErrorEvent={onError}
			onClickEvent={onClick}
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
