import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './formEditorProperties';
import FormEditorStyle from './FormEditorStyle';
import { styleProperties, styleDefaults } from './formEditorStyleProperties';

const LazyFormEditor = React.lazy(
	() => import(/* webpackChunkName: "FormEditor" */ './LazyFormEditor'),
);
function LoadLazyFormEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFormEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'FormEditor',
	displayName: 'Form Editor',
	description: 'Form Editor component',
	component: LoadLazyFormEditor,
	isHidden: false,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: FormEditorStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover'],
	bindingPaths: {
		bindingPath: { name: 'Form Schema Binding' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
