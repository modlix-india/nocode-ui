import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import ThemeEditorStyle from './ThemeEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './themeEditorProperties';
import { styleDefaults, styleProperties } from './themeEditorStyleProperties';

const LazyThemeEditor = React.lazy(
	() => import(/* webpackChunkName: "ThemeEditor" */ './LazyThemeEditor'),
);
function LoadLazyThemeEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyThemeEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ThemeEditor',
	displayName: 'Theme Editor',
	description: 'Theme component',
	styleComponent: ThemeEditorStyle,
	styleDefaults: styleDefaults,
	component: LoadLazyThemeEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Theme Binding' },
	},
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		name: 'Theme Editor',
		type: 'ThemeEditor',
		properties: {},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
