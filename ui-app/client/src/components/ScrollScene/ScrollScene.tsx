import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import ScrollSceneStyle from './ScrollSceneStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './scrollSceneProperties';
import { styleDefaults, styleProperties } from './scrollSceneStyleProperties';

/**
 * The definition is eager so the registry and the style system see it; only the
 * implementation is split, because that is what pulls three in.
 *
 * The chunk name must NOT match the `webgl` cache group in webpack.prod.js:
 * a named chunk and a cache group of the same name collide and fail the build
 * with "Cache group webgl conflicts with existing chunk".
 */
const LazyScrollScene = React.lazy(
	() => import(/* webpackChunkName: "ScrollScene" */ './LazyScrollScene'),
);

function LoadLazyScrollScene(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<div className="comp compScrollScene" />}>
			<LazyScrollScene {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 30,
	name: 'ScrollScene',
	displayName: 'Scroll Scene',
	description: 'A 3D scene scrubbed by scroll position, vertical or horizontal.',
	component: LoadLazyScrollScene,
	styleComponent: ScrollSceneStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	// Copy that scrolls past the scene sits inside it.
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Scroll Progress' },
	},
	defaultTemplate: {
		key: '',
		name: 'ScrollScene',
		type: 'ScrollScene',
		properties: {
			preset: { value: 'scrollSpin' },
			axis: { value: 'block' },
			mode: { value: 'view' },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
