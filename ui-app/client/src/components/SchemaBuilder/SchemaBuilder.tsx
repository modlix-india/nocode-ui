import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaBuilderProperties';
import SchemaFormStyle from './SchemaBuilderStyle';
import { styleProperties, styleDefaults } from './schemaBuilderStyleProperies';

const LazySchemaBuilder = React.lazy(
	() => import(/* webpackChunkName: "SchemaBuilder" */ './LazySchemaBuilder'),
);
function LoadLazyKIRunEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazySchemaBuilder {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'SchemaBuilder',
	displayName: 'Schema Builder',
	description: 'Schema Builder component',
	component: LoadLazyKIRunEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SchemaFormStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'SchemaBuilder',
		name: 'SchemaBuilder',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Schema binding' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
