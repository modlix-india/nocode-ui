import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './rangeSliderProperties';
import RangeSliderStyle from './RangeSliderStyle';
import { styleProperties, styleDefaults } from './rangeSliderStyleProperties';

const LazyRangeSlider = React.lazy(
	() => import(/* webpackChunkName: "RangeSlider" */ './LazyRangeSlider'),
);
function LoadLazyRangeSlider(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyRangeSlider {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'RangeSlider',
	displayName: 'RangeSlider',
	description: 'RangeSlider component',
	component: LoadLazyRangeSlider,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: RangeSliderStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	sections: [{ name: 'rangeSlider', pageName: 'rangeSlider' }],
	stylePseudoStates: ['hover', 'readOnly'],
	bindingPaths: {
		bindingPath: { name: 'Slider 1 Binding' },
		bindingPath2: { name: 'Slider 2 Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'RangeSlider',
		name: 'RangeSlider',
		properties: { value: { value: 'RangeSlider' } },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
