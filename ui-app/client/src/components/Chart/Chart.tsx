import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import ChartStyle from './ChartStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './chartProperties';
import { styleDefaults } from './chartStyleProperties';

const LazyChart = React.lazy(() => import(/* webpackChunkName: "Chart" */ './LazyChart'));
function LoadLazyChart(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyChart {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'Chart',
	displayName: 'Chart',
	description: 'Chart component',
	component: LoadLazyChart,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: ChartStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	allowedChildrenType: new Map([['Grid', 1]]),
	bindingPaths: {
		bindingPath: { name: 'Selection Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						className="_chartbars"
						y="14"
						width="5"
						height="15"
						rx="1"
						fill="#FFAA47"
					/>
					<rect
						className="_chartbars1"
						x="8"
						y="23"
						width="5"
						height="6"
						rx="1"
						fill="#86D171"
					/>
					<rect
						className="_chartbars"
						x="16"
						width="5"
						height="29"
						rx="1"
						fill="#F6332A"
					/>
					<rect
						className="_chartbars1"
						x="24"
						y="14"
						width="5"
						height="15"
						rx="1"
						fill="#89C2F5"
					/>
				</IconHelper>
			),
		},
		{
			name: 'xAxisLabel',
			displayName: 'X Axis Label',
			description: 'X Axis Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxisLabel',
			displayName: 'Y Axis Label',
			description: 'Y Axis Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xAxisTitle',
			displayName: 'X Axis Title',
			description: 'X Axis Title',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxisTitle',
			displayName: 'Y Axis Title',
			description: 'Y Axis Title',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'xAxis',
			displayName: 'X Axis',
			description: 'X Axis',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'yAxis',
			displayName: 'Y Axis',
			description: 'Y Axis',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'legendLabel',
			displayName: 'Legend Label',
			description: 'Legend Label',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'legendRectangle',
			displayName: 'Legend Rectangle',
			description: 'Legend Rectangle',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'tooltip',
			displayName: 'Tooltip',
			description: 'Tooltip',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'horizontalLines',
			displayName: 'Horizontal Lines',
			description: 'Horizontal Lines',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'verticalLines',
			displayName: 'Vertical Lines',
			description: 'Vertical Lines',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'bar',
			displayName: 'Bar',
			description: 'Bar',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
