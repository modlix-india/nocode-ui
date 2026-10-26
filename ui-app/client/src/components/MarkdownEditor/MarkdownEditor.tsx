import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import MarkdownEditorStyle from './MarkdownEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './markdownEditorProperties';
import { styleDefaults, stylePropertiesForTheme } from './markdownEditorStyleProperties';

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
	description: 'Block editor that stores markdown: type "/" for blocks, select text to format it.',
	component: LoadLazyMarkdownEditor,
	propertyValidation: (): Array<string> => [],
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
	stylePropertiesForTheme: stylePropertiesForTheme,
};

export default component;
