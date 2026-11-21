import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../../types/common';
import DashboardStyle from './DashboardStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './dashboardProperties';
import { styleDefaults, styleProperties } from './dashboardStyleProperties';

const LazyDashboard = React.lazy(
	() => import(/* webpackChunkName: "Dashboard" */ './LazyDashboard'),
);

function LoadLazyDashboard(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyDashboard {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'Dashboard',
	displayName: 'Dashboard',
	description:
		'A per-user dashboard of report widgets from the report catalog of the app: default widgets, a 12 column tile grid to move and resize, a period and quick filter bar, and the saved widget library.',
	component: LoadLazyDashboard,
	styleComponent: DashboardStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		type: 'Dashboard',
		name: 'Dashboard',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
