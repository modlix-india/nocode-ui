import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import SessionReplayPlayerStyle from './SessionReplayPlayerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sessionReplayPlayerProperties';
import { styleDefaults, styleProperties } from './sessionReplayPlayerStyleProperties';

const LazySessionReplayPlayer = React.lazy(
	() => import(/* webpackChunkName: "SessionReplayPlayer" */ './LazySessionReplayPlayer'),
);

function LoadLazySessionReplayPlayer(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazySessionReplayPlayer {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'SessionReplayPlayer',
	displayName: 'Session Replay Player',
	description:
		'Plays back a single PostHog session recording. Resolves a tenant-scoped sharing token from the analytics proxy and embeds the PostHog player iframe.',
	component: LoadLazySessionReplayPlayer,
	styleComponent: SessionReplayPlayerStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		type: 'SessionReplayPlayer',
		name: 'SessionReplayPlayer',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
