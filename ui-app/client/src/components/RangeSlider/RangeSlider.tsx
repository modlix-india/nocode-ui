import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './rangeSliderProperties';
import RangeSliderStyle from './RangeSliderStyle';
import { styleDefaults } from './rangeSliderStyleProperties';

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
		bindingPath: { name: 'Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'RangeSlider',
		name: 'RangeSlider',
		properties: { value: { value: 'RangeSlider' } },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 12">
					<rect
						className="_RangeSliderTrack"
						y="3"
						width="28"
						height="3"
						rx="0.5"
						fill="#EDEAEA"
					/>
					<path
						className="_RangeSliderRangeTrack"
						d="M0 3.5C0 3.22386 0.223858 3 0.5 3H15V6H0.5C0.223858 6 0 5.77614 0 5.5V3.5Z"
						fill="#A170FF"
					/>
					<circle
						className="_RangeSliderThumbPit"
						cx="15"
						cy="4"
						r="3"
						fill="white"
						stroke="#A170FF"
						strokeWidth="2"
					/>
				</IconHelper>
			),
		},
		{
			name: 'track',
			displayName: 'Track',
			description: 'Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rangeTrack',
			displayName: 'Range Track',
			description: 'Range Track',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumb',
			displayName: 'Thumb',
			description: 'Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbPit',
			displayName: 'Thumb Pit',
			description: 'Thumb Pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'minLabel',
			displayName: 'Min Label',
			description: 'Min Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'maxLabel',
			displayName: 'Max Label',
			description: 'Max Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'topLabelContainer',
			displayName: 'Top Label Container',
			description: 'Top Label Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'bottomLabelContainer',
			displayName: 'Bottom Label Container',
			description: 'Bottom Label Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markThumb',
			displayName: 'Mark Thumb',
			description: 'Mark Thumb',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markThumbPit',
			displayName: 'Mark Thumb Pit',
			description: 'Mark Thumb Pit',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'markLabel',
			displayName: 'Mark Label',
			description: 'Mark Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ticksContainer',
			displayName: 'Ticks Container',
			description: 'Ticks Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tickContainer',
			displayName: 'Tick Container',
			description: 'Tick Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tick',
			displayName: 'Tick',
			description: 'Tick',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tickLabel',
			displayName: 'Tick Label',
			description: 'Tick Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolTip',
			displayName: 'Tool Tip',
			description: 'Tool Tip',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
