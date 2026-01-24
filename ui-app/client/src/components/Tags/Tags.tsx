import React, { Suspense } from 'react';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tagsProperties';
import TagsStyle from './TagsStyles';
import { styleProperties, styleDefaults } from './TagsStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyTags = React.lazy(() => import(/* webpackChunkName: "Tags" */ './LazyTags'));
function LoadLazyTags(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyTags {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'Tags',
	displayName: 'Tags',
	description: 'Tags Component',
	component: LoadLazyTags,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TagsStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Tags',
		name: 'Tags',
		properties: {},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
