import React, { useMemo } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SceneSurface } from '../util/three/SceneSurface';
import { colorOr, resolveThemeColor, schemePalette } from '../util/three/themeColor';
import { resolveSceneDocument } from '../util/three/sceneDocument';
import { particleFieldDocument } from '../util/three/componentScenes';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './particleFieldProperties';

export default function LazyParticleField(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			preset = 'orbField',
			scene,
			count,
			distribution,
			colorA,
			colorB,
			particleSize,
			pointerStrength,
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

	// Rebuilds the GL scene, so it must depend only on things that change the
	// geometry or the shader, never on per-frame values like speed.
	const doc = useMemo(
		() =>
			resolveSceneDocument(scene, () => {
				// Two colours, not three: a particle shades between them along
				// its own depth. The scheme's deep and bright ends are the two
				// that give that shading somewhere to travel -- handing it the
				// mid tone as well would flatten it.
				const scheme = schemePalette(colorScheme);
				return particleFieldDocument({
					preset,
					count,
					distribution,
					colorA: colorOr(colorA, scheme?.c),
					colorB: colorOr(colorB, scheme?.a),
					particleSize,
					pointerStrength,
				});
			}),
		[
			scene,
			preset,
			count,
			distribution,
			colorA,
			colorB,
			particleSize,
			pointerStrength,
			colorScheme,
		],
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	if (!visibility) return <></>;

	return (
		<SceneSurface
			compClass="compParticleField"
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
