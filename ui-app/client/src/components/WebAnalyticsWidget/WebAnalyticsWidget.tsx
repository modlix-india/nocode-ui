import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import WebAnalyticsWidgetStyle from './WebAnalyticsWidgetStyle';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './webAnalyticsWidgetProperties';
import { styleDefaults, styleProperties } from './webAnalyticsWidgetStyleProperties';

const LazyWebAnalyticsWidget = React.lazy(
	() => import(/* webpackChunkName: "WebAnalyticsWidget" */ './LazyWebAnalyticsWidget'),
);

function LoadLazyWebAnalyticsWidget(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyWebAnalyticsWidget {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'WebAnalyticsWidget',
	displayName: 'Web Analytics Widget',
	description:
		'Pre-built web analytics widget (top pages, top referrers, channel/device/browser/OS/country breakdowns, pageviews over time). Tenant-scoped via the analytics proxy.',
	component: LoadLazyWebAnalyticsWidget,
	styleComponent: WebAnalyticsWidgetStyle,
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
		type: 'WebAnalyticsWidget',
		name: 'WebAnalyticsWidget',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
