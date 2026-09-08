import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition, stylePropertiesDefinition } from './treeProperties';
import TreeStyle from './TreeStyle';
import { styleDefaults, stylePropertiesForTheme } from './treeStyleProperties';

const LazyTree = React.lazy(() => import(/* webpackChunkName: "Tree" */ './LazyTree'));

function LoadLazyTree(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyTree {...props} />
		</Suspense>
	);
}

const { treeDesign, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'treeDesign',
	'colorScheme',
);

const component: Component = {
	order: 8,
	name: 'Tree',
	displayName: 'Tree',
	description:
		'Renders hierarchical data with one child template re-used at every depth, in four designs, with expand/collapse, selection binding and optional editing.',
	component: LoadLazyTree,
	styleComponent: TreeStyle,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'selected', 'disabled', 'dragover'],
	styleDefaults: styleDefaults,
	// One child of any type: it is the node template, re-rendered per node.
	allowedChildrenType: new Map<string, number>([['', 1]]),
	bindingPaths: {
		bindingPath: { name: 'Tree Data Binding' },
		bindingPath2: { name: 'Selection Binding' },
		bindingPath3: { name: 'Expanded Keys Binding' },
		bindingPath4: { name: 'Active Path Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Tree',
		type: 'Tree',
		properties: {},
	},
	propertiesForTheme: [treeDesign, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
