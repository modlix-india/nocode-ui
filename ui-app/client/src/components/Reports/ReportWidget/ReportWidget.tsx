import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../../types/common';
import ReportWidgetStyle from './ReportWidgetStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './reportWidgetProperties';
import { styleDefaults, styleProperties } from './reportWidgetStyleProperties';

const LazyReportWidget = React.lazy(
	() => import(/* webpackChunkName: "ReportWidget" */ './LazyReportWidget'),
);

function LoadLazyReportWidget(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyReportWidget {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ReportWidget',
	displayName: 'Report Widget',
	description:
		'Runs a report spec through the report functions of the app and shows it as a number, table, list or chart, with chart type switching, styling, drill down and full screen.',
	component: LoadLazyReportWidget,
	styleComponent: ReportWidgetStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: { bindingPath: { name: 'Spec (optional, read and written)' } },
	defaultTemplate: {
		key: '',
		type: 'ReportWidget',
		name: 'ReportWidget',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
