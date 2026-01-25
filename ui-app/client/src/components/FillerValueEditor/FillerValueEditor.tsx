import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import FillerValueEditorStyle from './FillerValueEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './fillerValueEditorProperties';
import { styleProperties, styleDefaults } from './fillerValueEditorStyleProperties';

const LazyFillerValueEditor = React.lazy(
	() => import(/* webpackChunkName: "FillerValueEditor" */ './LazyFillerValueEditor'),
);
function LoadLazyFillerValueEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFillerValueEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'FillerValueEditor',
	displayName: 'Filler Value Editor',
	description: 'Filler Value Editor Component',
	component: LazyFillerValueEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: FillerValueEditorStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'UI Filler' },
		bindingPath2: { name: 'Server Filler' },
		bindingPath3: { name: 'Personalization' },
		bindingPath4: { name: 'Application' },
	},
	defaultTemplate: {
		key: '',
		name: 'Fillter Value Editor',
		type: 'FillerValueEditor',
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
