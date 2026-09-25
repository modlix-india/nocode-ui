import React, { useMemo } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SceneSurface } from '../util/three/SceneSurface';
import { presetScene } from '../util/three/presets';
import { resolveThemeColor } from '../util/three/themeColor';
import { normalizeSceneDocument, type SceneDocument } from '../util/three/sceneDocument';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './particleFieldProperties';

interface Overrides {
	count?: number;
	distribution?: string;
	colorA?: string;
	colorB?: string;
	particleSize?: number;
	pointerStrength?: number;
}

/**
 * Start from the preset, then apply only the properties the author actually
 * set. An unset property must leave the preset's own value rather than
 * resetting it to a type default, or choosing a preset and then touching one
 * field would silently flatten the rest of it.
 */
function documentFor(preset: string, o: Overrides): SceneDocument {
	const doc = presetScene(preset, 'orbField');
	const field = doc.objects[0];

	if (field) {
		if (typeof o.count === 'number' && o.count > 0) field.source.count = Math.round(o.count);
		if (o.distribution) field.source.distribution = o.distribution as any;
	}

	const set = (name: string, value: unknown, type: 'color' | 'float') => {
		if (value === undefined || value === null || value === '') return;
		for (const shader of doc.shaders) {
			const existing = shader.uniforms.find(u => u.name === name);
			if (existing) existing.value = value as any;
			else shader.uniforms.push({ name, type, value: value as any });
		}
	};

	set('uColorA', o.colorA, 'color');
	set('uColorB', o.colorB, 'color');
	set('uSize', typeof o.particleSize === 'number' ? o.particleSize : undefined, 'float');
	// Zero is meaningful here (it turns the pointer effect off), so it must not
	// be filtered out the way an empty colour string is.
	if (typeof o.pointerStrength === 'number') {
		set('uPointerStrength', o.pointerStrength, 'float');
	}

	// Re-normalised, not returned as-is: `count` arrives straight from a user
	// property and a typo of 20000000 would otherwise reach the GPU untouched.
	// This puts it back through the same 200k clamp and enum fallback that any
	// other document goes through.
	return normalizeSceneDocument(doc);
}

export default function LazyParticleField(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			preset = 'orbField',
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
			documentFor(preset, {
				count,
				distribution,
				colorA: resolveThemeColor(colorA),
				colorB: resolveThemeColor(colorB),
				particleSize,
				pointerStrength,
			}),
		[preset, count, distribution, colorA, colorB, particleSize, pointerStrength],
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
