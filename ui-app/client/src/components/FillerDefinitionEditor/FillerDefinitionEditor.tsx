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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 27 27">
					<path
						d="M0 1C0 0.447715 0.447715 0 1 0H20C20.5523 0 21 0.447715 21 1V2C21 2.55228 20.5523 3 20 3H1C0.447715 3 0 2.55228 0 2V1Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 9C0 8.44772 0.447715 8 1 8H20C20.5523 8 21 8.44772 21 9V10C21 10.5523 20.5523 11 20 11H1C0.447715 11 0 10.5523 0 10V9Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 17C0 16.4477 0.447715 16 1 16H20C20.5523 16 21 16.4477 21 17V18C21 18.5523 20.5523 19 20 19H1C0.447715 19 0 18.5523 0 18V17Z"
						fill="#EDEAEA"
					/>
					<path
						d="M0 25C0 24.4477 0.447715 24 1 24H20C20.5523 24 21 24.4477 21 25V26C21 26.5523 20.5523 27 20 27H1C0.447715 27 0 26.5523 0 26V25Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FDEPen"
						d="M3.10547 21.0239L12.0018 12.1276C13.5053 10.6241 15.169 10.6241 16.6724 12.1276C18.1759 13.631 18.1759 15.2947 16.6724 16.7982L7.77607 25.6945L3.10547 21.0239ZM6.5816 26.3683L2.73357 26.7959C2.31287 26.8426 1.9574 26.4871 2.00414 26.0664L2.4317 22.2184L6.5816 26.3683Z"
						fill="#00B5B9"
					/>
				</IconHelper>
			),
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
