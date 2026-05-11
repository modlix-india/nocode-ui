import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import SessionReplayListStyle from './SessionReplayListStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sessionReplayListProperties';
import { styleDefaults, styleProperties } from './sessionReplayListStyleProperties';

const LazySessionReplayList = React.lazy(
	() => import(/* webpackChunkName: "SessionReplayList" */ './LazySessionReplayList'),
);

function LoadLazySessionReplayList(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazySessionReplayList {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'SessionReplayList',
	displayName: 'Session Replay List',
	description:
		'Lists session recordings for a tenant. Click a row to select a session — the id is written to the binding path so a SessionReplayPlayer can render it.',
	component: LoadLazySessionReplayList,
	styleComponent: SessionReplayListStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: {
		bindingPath: { name: 'Selected Session Id Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'SessionReplayList',
		name: 'SessionReplayList',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
