import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaFormProperties';
import SchemaFormStyle from './SchemaFormStyle';
import { styleProperties, styleDefaults } from './schemaFormStyleProperies';

const LazySchemaForm = React.lazy(
	() => import(/* webpackChunkName: "SchemaForm" */ './LazySchemaForm'),
);
function LoadLazySchemaForm(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazySchemaForm {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'SchemaForm',
	displayName: 'Schema Form',
	description: 'Schema Form component',
	component: LoadLazySchemaForm,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SchemaFormStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'SchemaForm',
		name: 'SchemaForm',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Schema value binding' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
