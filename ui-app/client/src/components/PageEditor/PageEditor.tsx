import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import PageEditorStyle from './PageEditorStyle';
import { styleProperties, styleDefaults } from './pageEditorStyleProperties';

const LazyPageEditor = React.lazy(
	() => import(/* webpackChunkName: "PageEditor" */ './LazyPageEditor'),
);
function LoadLazyPageEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyPageEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'PageEditor',
	displayName: 'Page Editor',
	description: 'Page Editor component',
	component: LoadLazyPageEditor,
	isHidden: false,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: PageEditorStyle,
	styleDefaults: styleDefaults,
	bindingPaths: {
		bindingPath: { name: 'Definition' },
		bindingPath2: { name: 'Personalization' },
		bindingPath3: { name: 'Application Definition' },
		bindingPath4: { name: 'Theme Definition' },
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
