import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import AnalyticsQueryStyle from './AnalyticsQueryStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './analyticsQueryProperties';
import { styleDefaults, styleProperties } from './analyticsQueryStyleProperties';

const LazyAnalyticsQuery = React.lazy(
	() => import(/* webpackChunkName: "AnalyticsQuery" */ './LazyAnalyticsQuery'),
);

function LoadLazyAnalyticsQuery(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyAnalyticsQuery {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'AnalyticsQuery',
	displayName: 'Analytics Query',
	description:
		'Runs a PostHog query through the tenant-scoped backend proxy. Renders a counter, table, or stays invisible (data-only) and writes the result to its binding path.',
	component: LoadLazyAnalyticsQuery,
	styleComponent: AnalyticsQueryStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: {
		bindingPath: { name: 'Result Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'AnalyticsQuery',
		name: 'AnalyticsQuery',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
