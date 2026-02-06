import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './textEditorProperties';
import TextEditorStyle from './TextEditorStyle';
import { styleProperties, styleDefaults } from './textEditorStyleProperies';

const LazyTextEditor = React.lazy(
	() => import(/* webpackChunkName: "TextEditor" */ './LazyTextEditor'),
);

function LoadLazyTextEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<div className="comp compTextEditor _loading">Loading editor...</div>}>
			<LazyTextEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'TextEditor',
	displayName: 'Text Editor',
	description: 'Text Editor component',
	component: LoadLazyTextEditor,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'TextEditor',
		name: 'TextEditor',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Text binding' },
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
