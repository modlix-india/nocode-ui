import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import ModelViewerStyle from './ModelViewerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './modelViewerProperties';
import { styleDefaults, styleProperties } from './modelViewerStyleProperties';

/**
 * The definition is eager so the registry and the style system see it; only the
 * implementation is split, because that is what pulls three in.
 *
 * The chunk name must NOT match the `webgl` cache group in webpack.prod.js:
 * a named chunk and a cache group of the same name collide and fail the build
 * with "Cache group webgl conflicts with existing chunk".
 */
const LazyModelViewer = React.lazy(
	() => import(/* webpackChunkName: "ModelViewer" */ './LazyModelViewer'),
);

function LoadLazyModelViewer(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<div className="comp compModelViewer" />}>
			<LazyModelViewer {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 29,
	name: 'ModelViewer',
	displayName: 'Model Viewer',
	description: 'A 3D model the visitor can turn, with clickable parts.',
	component: LoadLazyModelViewer,
	styleComponent: ModelViewerStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	// Captions, hotspot labels and calls to action sit over the model.
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Selected Part' },
	},
	defaultTemplate: {
		key: '',
		name: 'ModelViewer',
		type: 'ModelViewer',
		properties: {
			environmentPreset: { value: 'studio' },
			controls: { value: true },
			autoRotate: { value: true },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
