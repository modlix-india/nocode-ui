import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import FillerDefinitionEditorStyle from './FillerDefinitionEditorStyle';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './fillerDefinitionEditorProperties';
import { styleProperties, styleDefaults } from './fillerDefinitionEditorStyleProperties';

const LazyFillerDefinitionEditor = React.lazy(
	() => import(/* webpackChunkName: "FillerDefinitionEditor" */ './LazyFillerDefinitionEditor'),
);
function LoadLazyFillerDefinitionEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFillerDefinitionEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'FillerDefinitionEditor',
	displayName: 'Filler Definition Editor',
	description: 'Filler Definition Editor Component',
	component: LoadLazyFillerDefinitionEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: FillerDefinitionEditorStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Filler Definition' },
	},
	defaultTemplate: {
		key: '',
		name: 'Filler Definition Editor',
		type: 'FillerDefinitionEditor',
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
