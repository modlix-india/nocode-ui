import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import AnalyticsHeatmapStyle from './AnalyticsHeatmapStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './analyticsHeatmapProperties';
import { styleDefaults, styleProperties } from './analyticsHeatmapStyleProperties';

const LazyAnalyticsHeatmap = React.lazy(
	() => import(/* webpackChunkName: "AnalyticsHeatmap" */ './LazyAnalyticsHeatmap'),
);

function LoadLazyAnalyticsHeatmap(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyAnalyticsHeatmap {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'AnalyticsHeatmap',
	displayName: 'Analytics Heatmap',
	description:
		'Loads a measured page in a frame and draws where people clicked on top of it. Per ' +
		'experiment variant and per layout width, with the overlay switchable so the live page ' +
		'underneath can still be used.',
	component: LoadLazyAnalyticsHeatmap,
	styleComponent: AnalyticsHeatmapStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: {},
	defaultTemplate: {
		key: '',
		type: 'AnalyticsHeatmap',
		name: 'AnalyticsHeatmap',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
