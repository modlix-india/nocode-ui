import React, { Suspense } from 'react';
import { ComponentProps } from '../../types/common';
import SSEventListenerStyle from './SSEventListenerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sseventListenerProperties';
import { styleProperties, styleDefaults } from './sseventListenerStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazySSEventListener = React.lazy(
	() => import(/* webpackChunkName: "SSEventListener" */ './LazySSEventListener'),
);
// The listener draws nothing outside the editor, so neither does its loading state. A "..."
// there was a 12 px flex item in the shell's row until the chunk arrived, and the whole
// main column moved sideways when it went (ADZ-1496).
function LoadLazySSEventListener(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={globalThis.designMode ? <>...</> : null}>
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
	stylePropertiesForTheme: styleProperties,
};

export default component;
