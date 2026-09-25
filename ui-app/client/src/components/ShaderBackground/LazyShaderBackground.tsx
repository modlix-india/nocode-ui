import React, { useMemo } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SceneSurface } from '../util/three/SceneSurface';
import { presetScene } from '../util/three/presets';
import { resolveThemeColor, resolveThemeColors } from '../util/three/themeColor';
import { createSceneDocument, type SceneDocument } from '../util/three/sceneDocument';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './shaderBackgroundProperties';

/** Turn this component's flat properties into a scene document. */
function documentFor(
	preset: string,
	fragmentShader: string | undefined,
	colors: Array<string | undefined>,
): SceneDocument {
	const doc =
		preset === 'custom'
			? createSceneDocument({
					camera: { type: 'fullscreen', position: [0, 0, 1] },
					environment: { preset: '' },
					lights: [],
					shaders: [{ id: 'custom', fragment: fragmentShader ?? '', uniforms: [] }],
					objects: [
						{
							id: 'backdrop',
							name: 'Backdrop',
							source: { kind: 'quad' },
							material: { shaderId: 'custom' },
						},
					],
				} as unknown as Partial<SceneDocument>)
			: presetScene(preset);

	// Colours are overrides, not replacements: a preset that uses only two
	// keeps its third, and an empty property leaves the preset's own value.
	const names = ['uColorA', 'uColorB', 'uColorC'];
	for (const shader of doc.shaders) {
		names.forEach((name, i) => {
			const value = colors[i];
			if (!value) return;
			const existing = shader.uniforms.find(u => u.name === name);
			if (existing) existing.value = value;
			else shader.uniforms.push({ name, type: 'color', value });
		});
	}
	return doc;
}

export default function LazyShaderBackground(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			preset = 'aurora',
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
		() => documentFor(preset, fragmentShader, resolveThemeColors([colorA, colorB, colorC])),
		[preset, fragmentShader, colorA, colorB, colorC],
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
