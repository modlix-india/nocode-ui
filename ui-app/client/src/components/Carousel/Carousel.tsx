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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M7.41416 8.17383H5.06702C4.51473 8.17383 4.06702 8.62154 4.06702 9.17383V21.1865C4.06702 21.7388 4.51473 22.1865 5.06702 22.1865H7.41416C7.96644 22.1865 8.41416 21.7388 8.41416 21.1865V9.17383C8.41416 8.62154 7.96644 8.17383 7.41416 8.17383Z"
						fill="#EF7E3440"
						className="_carouselsecondframe"
					/>
					<path
						d="M24.9327 8.17383H22.5852C22.0329 8.17383 21.5852 8.62154 21.5852 9.17383V21.1865C21.5852 21.7388 22.0329 22.1865 22.5852 22.1865H24.9327C25.485 22.1865 25.9327 21.7388 25.9327 21.1865V9.17383C25.9327 8.62154 25.485 8.17383 24.9327 8.17383Z"
						fill="#EF7E3440"
						className="_carouselthirdframe"
					/>
					<path
						d="M29.0001 9.66992H28.0828C27.5305 9.66992 27.0828 10.1176 27.0828 10.6699V19.6934C27.0828 20.2457 27.5305 20.6934 28.0828 20.6934H29C29.5523 20.6934 30.0001 20.2457 30.0001 19.6934V10.6699C30.0001 10.1176 29.5523 9.66992 29.0001 9.66992Z"
						fill="#EF7E3440"
						className="_carouselfourthframe"
					/>
					<path
						d="M1.91763 9.66992H1C0.447715 9.66992 0 10.1176 0 10.6699V19.6934C0 20.2457 0.447716 20.6934 1 20.6934H1.91763C2.46991 20.6934 2.91763 20.2457 2.91763 19.6934V10.6699C2.91763 10.1176 2.46991 9.66992 1.91763 9.66992Z"
						fill="#EF7E3440"
						className="_carouselfirstframe"
					/>
					<path
						d="M19.4348 6H10.5673C10.015 6 9.56726 6.44771 9.56726 7V23.3598C9.56726 23.9121 10.015 24.3598 10.5673 24.3598H19.4348C19.9871 24.3598 20.4348 23.9121 20.4348 23.3598V7C20.4348 6.44772 19.9871 6 19.4348 6Z"
						fill="#EF7E34"
						className="_carouselmainframe"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'arrowButtonsContainer',
			displayName: 'Arrow Buttons Container',
			description: 'Arrow Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowButtons',
			displayName: 'Arrow Buttons',
			description: 'Arrow Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideButtonsContainer',
			displayName: 'Slide Buttons Container',
			description: 'Slide Buttons Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'indicatorContainer',
			displayName: 'Indicator Container',
			description: 'Container for slide indicators',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButton',
			displayName: 'Indicator Button',
			description: 'Individual indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorButtonActive',
			displayName: 'Indicator Button Active',
			description: 'Active indicator button',
			icon: 'fa-solid fa-circle',
		},
		{
			name: 'indicatorNavBtn',
			displayName: 'Indicator Navigation Arrow',
			description: 'Indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
		{
			name: 'indicatorNavBtnActive',
			displayName: 'Active Indicator Navigation Arrow',
			description: 'Active indicator navigation arrow button',
			icon: 'fa-solid fa-arrow-right-arrow-left',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
