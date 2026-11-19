import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './automationFlowProperties';
import AutomationFlowStyle from './AutomationFlowStyle';
import { styleDefaults, stylePropertiesForTheme } from './automationFlowStyleProperties';

const LazyAutomationFlow = React.lazy(
	() => import(/* webpackChunkName: "AutomationFlow" */ './LazyAutomationFlow'),
);

function LoadLazyAutomationFlow(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyAutomationFlow {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 102,
	name: 'AutomationFlow',
	displayName: 'Automation Flow',
	description:
		'An automation drawn as plain sentence cards on a rail: WHEN, DO, WAIT, IF with Yes and Otherwise lanes, AT THE SAME TIME, END. Views, edits and shows a run of one Automation document.',
	component: LoadLazyAutomationFlow,
	styleComponent: AutomationFlowStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'focus'],
	bindingPaths: {
		// The Automation document. Read, and written back on every edit.
		bindingPath: { name: 'Automation Binding' },
		// GET /api/core/automations/catalog?appCode= : triggers and actions.
		bindingPath2: { name: 'Catalog Binding' },
		// A run (GET /api/core/eventRuns/automations/{id}); used in run mode.
		bindingPath3: { name: 'Run Binding' },
		// POST /api/core/automations/check answer; badges the cards it names.
		bindingPath4: { name: 'Check Report Binding' },
		// The selected node key ("__trigger" for WHEN). Read and written.
		bindingPath5: { name: 'Selected Node Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'automationFlow',
		type: 'AutomationFlow',
		properties: {
			mode: { value: 'view' },
		},
	},
	stylePropertiesForTheme: stylePropertiesForTheme,
};

export default component;
