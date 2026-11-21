import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../../types/common';
import ReportEditorStyle from './ReportEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './reportEditorProperties';
import { styleDefaults, styleProperties } from './reportEditorStyleProperties';

const LazyReportEditor = React.lazy(
	() => import(/* webpackChunkName: "ReportEditor" */ './LazyReportEditor'),
);

function LoadLazyReportEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyReportEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ReportEditor',
	displayName: 'Report Editor',
	description:
		'Builds a report widget from the report catalog of the app with a simple form, previews it live and saves it to the widget library and dashboard of the user.',
	component: LoadLazyReportEditor,
	styleComponent: ReportEditorStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: { bindingPath: { name: 'Saved widget (written on save)' } },
	defaultTemplate: {
		key: '',
		type: 'ReportEditor',
		name: 'ReportEditor',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
