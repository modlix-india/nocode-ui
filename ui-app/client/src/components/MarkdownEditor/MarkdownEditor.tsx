import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import MarkdownEditorStyle from './MarkdownEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './markdownEditorProperties';
import { styleProperties, styleDefaults } from './markdownEditorStyleProperties';

const LazyMarkdownEditor = React.lazy(
	() => import(/* webpackChunkName: "MarkdownEditor" */ './LazyMarkdownEditor'),
);
function LoadLazyMarkdownEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyMarkdownEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'MarkdownEditor',
	displayName: 'Markdown Editor',
	description: 'Markdown Editor',
	component: LoadLazyMarkdownEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: MarkdownEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		type: 'MarkdownEditor',
		name: 'Markdown Editor',
	},
	bindingPaths: {
		bindingPath: { name: 'Markdown Text' },
	},
	sections: [],
		stylePropertiesForTheme: styleProperties,
};

export default component;
