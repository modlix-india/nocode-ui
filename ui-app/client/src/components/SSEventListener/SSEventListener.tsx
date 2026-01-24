import React, { Suspense } from 'react';
import { ComponentProps } from '../../types/common';
import SSEventListenerStyle from './SSEventListenerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sseventListenerProperties';
import { styleProperties, styleDefaults } from './sseventListenerStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazySSEventListener = React.lazy(
	() => import(/* webpackChunkName: "SSEventListener" */ './LazySSEventListener'),
);
function LoadLazySSEventListener(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazySSEventListener {...props} />
		</Suspense>
	);
}

const component = {
	name: 'SSEventListener',
	displayName: 'SSEventListener',
	description: 'SSEventListener component with user-defined function execution',
	component: LoadLazySSEventListener,
	styleComponent: SSEventListenerStyle,
	styleDefaults: styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Events Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'SSEventListener',
		name: 'SSEventListener',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',

			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path d="M15 0L5 10V20L15 30L25 20V10L15 0Z" fill="#FF7599" />
				</IconHelper>
			),
			mainComponent: true,
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
