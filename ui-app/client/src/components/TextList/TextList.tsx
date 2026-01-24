import React, { Suspense } from 'react';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './textListProperties';
import { Component } from '../../types/common';
import TextListStyle from './TextListStyle';
import { styleProperties, styleDefaults } from './textListStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyTextList = React.lazy(() => import(/* webpackChunkName: "TextList" */ './LazyTextList'));
function LoadLazyTextList(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyTextList {...props} />
		</Suspense>
	);
}


const component: Component = {
	name: 'TextList',
	displayName: 'Text List',
	description: 'TextList component',
	component: LoadLazyTextList,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextListStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'TextList',
		name: 'TextList',
		properties: {
			text: { value: 'Text1,Text2,Text3' },
		},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
