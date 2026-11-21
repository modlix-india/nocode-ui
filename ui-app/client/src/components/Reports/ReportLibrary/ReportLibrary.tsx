import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../../types/common';
import ReportLibraryStyle from './ReportLibraryStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './reportLibraryProperties';
import { styleDefaults, styleProperties } from './reportLibraryStyleProperties';

const LazyReportLibrary = React.lazy(
	() => import(/* webpackChunkName: "ReportLibrary" */ './LazyReportLibrary'),
);

function LoadLazyReportLibrary(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyReportLibrary {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ReportLibrary',
	displayName: 'Report Library',
	description:
		'The saved report widgets of the user (the same saved document as the Dashboard of that name): edit, duplicate, delete, add to or remove from the dashboard.',
	component: LoadLazyReportLibrary,
	styleComponent: ReportLibraryStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		type: 'ReportLibrary',
		name: 'ReportLibrary',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
