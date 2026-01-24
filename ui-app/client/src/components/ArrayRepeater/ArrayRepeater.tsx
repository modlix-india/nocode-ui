import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './arrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import { styleProperties, styleDefaults } from './arrayRepeaterStyleProperties';

const LazyArrayRepeater = React.lazy(
	() => import(/* webpackChunkName: "ArrayRepeater" */ './LazyArrayRepeater'),
);
function LoadLazyArrayRepeater(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyArrayRepeater {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 6,
	name: 'ArrayRepeater',
	displayName: 'Repeater',
	description: 'Array Repeater component',
	component: LoadLazyArrayRepeater,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: ArrayRepeaterStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	bindingPaths: {
		bindingPath: { name: 'Array/Object Binding' },
		bindingPath2: { name: 'Dropped Data Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Repeator',
		type: 'ArrayRepeater',
		properties: {},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
