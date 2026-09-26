import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import ParticleFieldStyle from './ParticleFieldStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './particleFieldProperties';
import { styleDefaults, styleProperties } from './particleFieldStyleProperties';

/**
 * Chunk name must not collide with a splitChunks cache group name: `webgl`
 * fails the build loudly, and `three` fails it silently. See the comment on
 * the `three` group in webpack.prod.js.
 */
const LazyParticleField = React.lazy(
	() => import(/* webpackChunkName: "ParticleField" */ './LazyParticleField'),
);

function LoadLazyParticleField(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<div className="comp compParticleField" />}>
			<LazyParticleField {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 28,
	name: 'ParticleField',
	displayName: 'Particle Field',
	description: 'A WebGL cloud of particles that reacts to the pointer.',
	component: LoadLazyParticleField,
	styleComponent: ParticleFieldStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Uniform Overrides Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'ParticleField',
		type: 'ParticleField',
		properties: {
			preset: { value: 'orbField' },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
