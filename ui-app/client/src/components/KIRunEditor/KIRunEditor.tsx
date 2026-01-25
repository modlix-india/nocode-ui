import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './KIRunEditorProperties';
import KIRunEditorStyle from './KIRunEditorStyle';
import { styleProperties, styleDefaults } from './KIRunEditorStyleProperties';

const LazyKIRunEditor = React.lazy(
	() => import(/* webpackChunkName: "KIRunEditor" */ './LazyKIRunEditor'),
);
function LoadLazyKIRunEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyKIRunEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'KIRun Editor',
	displayName: 'KIRun Editor',
	description: 'KIRun Editor component',
	component: LoadLazyKIRunEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: KIRunEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Function Binding' },
		bindingPath2: { name: 'Personalization' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
