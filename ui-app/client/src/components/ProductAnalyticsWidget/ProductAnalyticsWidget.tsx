import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import ProductAnalyticsWidgetStyle from './ProductAnalyticsWidgetStyle';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './productAnalyticsWidgetProperties';
import { styleDefaults, styleProperties } from './productAnalyticsWidgetStyleProperties';

const LazyProductAnalyticsWidget = React.lazy(
	() => import(/* webpackChunkName: "ProductAnalyticsWidget" */ './LazyProductAnalyticsWidget'),
);

function LoadLazyProductAnalyticsWidget(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyProductAnalyticsWidget {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ProductAnalyticsWidget',
	displayName: 'Product Analytics Widget',
	description:
		'Pre-built product analytics widget (event timelines, top events, breakdowns, conversion funnels, retention cohorts). Tenant-scoped via the analytics proxy.',
	component: LoadLazyProductAnalyticsWidget,
	styleComponent: ProductAnalyticsWidgetStyle,
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
		type: 'ProductAnalyticsWidget',
		name: 'ProductAnalyticsWidget',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
