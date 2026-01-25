import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './formProperties';
import FormStyle from './FormStyle';
import { styleProperties, styleDefaults } from './formStyleProperies';

const LazyForm = React.lazy(() => import(/* webpackChunkName: "Form" */ './LazyForm'));
function LoadLazyForm(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyForm {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'Form',
	displayName: 'Form',
	description: 'Form component',
	component: LoadLazyForm,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: FormStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'Form',
		name: 'Form',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'value binding' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
