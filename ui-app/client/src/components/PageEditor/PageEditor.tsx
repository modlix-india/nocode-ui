import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import PageEditorStyle from './PageEditorStyle';
import { styleDefaults } from './pageEditorStyleProperties';

const LazyPageEditor = React.lazy(
	() => import(/* webpackChunkName: "PageEditor" */ './LazyPageEditor'),
);
function LoadLazyPageEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyPageEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'PageEditor',
	displayName: 'Page Editor',
	description: 'Page Editor component',
	component: LoadLazyPageEditor,
	isHidden: false,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: PageEditorStyle,
	styleDefaults: styleDefaults,
	bindingPaths: {
		bindingPath: { name: 'Definition' },
		bindingPath2: { name: 'Personalization' },
		bindingPath3: { name: 'Application Definition' },
		bindingPath4: { name: 'Theme Definition' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 34">
					<rect
						x="0.75"
						y="2.8125"
						width="23.4375"
						height="27.1875"
						rx="2"
						fill="#F2599B"
						fill-opacity="0.1"
					/>
					<path
						d="M13.6033 6.56857C13.6033 7.20566 14.1956 7.72397 14.9237 7.72397H19.66L13.6033 2.44922V6.56857Z"
						fill="#00ADB7"
					/>
					<rect x="3.5625" width="23.4375" height="27.1875" rx="2" fill="#F2599B" />
					<ellipse cx="7.12526" cy="2.62526" rx="0.750265" ry="0.750265" fill="white" />
					<ellipse cx="10.125" cy="2.62526" rx="0.750265" ry="0.750265" fill="white" />
					<rect
						x="6.375"
						y="5.625"
						width="16.875"
						height="1.40625"
						rx="0.703125"
						fill="white"
					/>
					<rect
						x="6.375"
						y="21.6875"
						width="16.875"
						height="1.40625"
						rx="0.703125"
						fill="white"
					/>
					<path
						className="_PageEditorPen"
						d="M7.77165 17.4134L11.4667 13.7183C12.0912 13.0939 12.7822 13.0939 13.4067 13.7183C14.0311 14.3428 14.0311 15.0338 13.4067 15.6583L9.71158 19.3533L7.77165 17.4134ZM9.21546 19.6332L7.61719 19.8108C7.44245 19.8302 7.29481 19.6825 7.31422 19.5078L7.49181 17.9095L9.21546 19.6332Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
