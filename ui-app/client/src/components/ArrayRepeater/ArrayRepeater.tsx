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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper id="_arrayRepeaterIcon" viewBox="0 0 30 30">
					<rect id="_rect1" width="13" height="13" rx="1" fill="#3aad6c" />
					<rect id="_rect5" y="15" width="13" height="13" rx="1" fill="#008FDD" />
					<rect id="_rect3" x="15" width="13" height="13" rx="1" fill="#3aad6c" />
					<rect id="_rect7" x="15" y="15" width="13" height="13" rx="1" fill="#008FDD" />
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'repeaterProperties',
			displayName: 'Each Repeater Container',
			description: 'Each Repeater Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'repeatedComp',
			displayName: 'Repeated Component',
			description: 'Repeated Component',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'iconGrid',
			displayName: 'Icon Grid',
			description: 'Icon Grid',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'add',
			displayName: 'Add Button',
			description: 'Add Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'remove',
			displayName: 'Delete Button',
			description: 'Delete Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'move',
			displayName: 'Move Button',
			description: 'Move Button',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
