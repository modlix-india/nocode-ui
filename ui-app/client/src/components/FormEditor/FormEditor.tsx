import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './formEditorProperties';
import FormEditorStyle from './FormEditorStyle';
import { styleProperties, styleDefaults } from './formEditorStyleProperties';

const LazyFormEditor = React.lazy(
	() => import(/* webpackChunkName: "FormEditor" */ './LazyFormEditor'),
);
function LoadLazyFormEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFormEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'FormEditor',
	displayName: 'Form Editor',
	description: 'Form Editor component',
	component: LoadLazyFormEditor,
	isHidden: false,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: FormEditorStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover'],
	bindingPaths: {
		bindingPath: { name: 'Form Schema Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M16.2958 6.09627V0H4.11268C2.94775 0 2 0.947747 2 2.11268V27.8873C2 29.0523 2.94775 30 4.11268 30H23.0963C24.2612 30 25.2089 29.0523 25.2089 27.8873V8.91317H19.1127C17.5594 8.91317 16.2958 7.64951 16.2958 6.09627Z"
						fill="#EDEAEA"
					/>
					<path
						d="M17.7056 6.09754C17.7056 6.87416 18.3374 7.50599 19.114 7.50599H24.1661L17.7056 1.07599V6.09754Z"
						fill="#EDEAEA"
					/>
					<path
						className="_FSEPen"
						d="M19.1195 19.1228L25.2009 13.0414C26.2286 12.0136 27.3659 12.0136 28.3936 13.0414C29.4213 14.0691 29.4213 15.2064 28.3936 16.2341L22.3122 22.3155L19.1195 19.1228ZM21.4957 22.7761L18.8652 23.0684C18.5776 23.1003 18.3346 22.8573 18.3666 22.5697L18.6589 19.9393L21.4957 22.7761Z"
						fill="#C23373"
					/>
				</IconHelper>
			),
		},
		{
			name: 'objectTypeEditor',
			displayName: 'Object Type Editor',
			description: 'Object Type Editor',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'addFieldButton',
			displayName: 'Add Field Button',
			description: 'Add Field Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'objectAddBar',
			displayName: 'Object Add Bar',
			description: 'Object Add Bar',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
