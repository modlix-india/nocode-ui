import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import ShaderBackgroundStyle from './ShaderBackgroundStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './shaderBackgroundProperties';
import { styleDefaults, styleProperties } from './shaderBackgroundStyleProperties';

/**
 * The definition is eager so the registry and the style system see it; only the
 * implementation is split, because that is what pulls three in.
 *
 * The chunk name must NOT match the `webgl` cache group in webpack.prod.js:
 * a named chunk and a cache group of the same name collide and fail the build
 * with "Cache group webgl conflicts with existing chunk". Per-component chunk
 * name, differently-named group, exactly as Chart does with `visualization`.
 */
const LazyShaderBackground = React.lazy(
	() => import(/* webpackChunkName: "ShaderBackground" */ './LazyShaderBackground'),
);

function LoadLazyShaderBackground(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<div className="comp compShaderBackground" />}>
			<LazyShaderBackground {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 27,
	name: 'ShaderBackground',
	displayName: 'Shader Background',
	description: 'A WebGL shader surface, for a hero backdrop or a section background.',
	component: LoadLazyShaderBackground,
	styleComponent: ShaderBackgroundStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	// Anything may sit on top of the shader: a headline, a Grid, a form.
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Uniform Overrides Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'ShaderBackground',
		type: 'ShaderBackground',
		properties: {
			preset: { value: 'aurora' },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
