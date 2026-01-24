import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './carouselProperties';
import CarouselStyle from './CarouselStyle';
import { styleProperties, styleDefaults } from './carouselStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyCarousel = React.lazy(
	() => import(/* webpackChunkName: "Carousel" */ './LazyCarousel'),
);
function LoadLazyCarousel(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyCarousel {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 9,
	name: 'Carousel',
	displayName: 'Carousel',
	description: 'Carousel component',
	component: LoadLazyCarousel,
	styleProperties: stylePropertiesDefinition,
	styleComponent: CarouselStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
		stylePropertiesForTheme: styleProperties,
};

export default component;
