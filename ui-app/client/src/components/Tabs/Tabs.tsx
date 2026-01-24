import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tabsProperties';
import TabsStyles from './TabsStyle';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './tabsStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

const LazyTabs = React.lazy(() => import(/* webpackChunkName: "Tabs" */ './LazyTabs'));
function LoadLazyTabs(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyTabs {...props} />
		</Suspense>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	name: 'Tabs',
	displayName: 'Tabs',
	description: 'Tabs Component',
	component: LoadLazyTabs,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TabsStyles,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	stylePseudoStates: ['hover'],
	bindingPaths: {
		bindingPath: { name: 'Active Tab Binding' },
	},

	defaultTemplate: {
		key: '',
		name: 'Tabs',
		type: 'Tabs',
		properties: {
			tabs: {
				'3iFvRBg47fg0Mk7OR7Oshz': {
					key: '3iFvRBg47fg0Mk7OR7Oshz',
					order: 1,
					property: {
						value: 'Tab1',
					},
				},
				'5sEds41k2jvLbJgcOsDyVZ': {
					key: '5sEds41k2jvLbJgcOsDyVZ',
					order: 2,
					property: {
						value: 'Tab2',
					},
				},
				'3fmhmBLHzvC5yFJGK7IRmx': {
					key: '3fmhmBLHzvC5yFJGK7IRmx',
					order: 3,
					property: {
						value: 'Tab3',
					},
				},
			},
			icon: {
				'1gweTkTDaBOAUFGHDSV77J': {
					key: '1gweTkTDaBOAUFGHDSV77J',
					order: 1,
					property: {
						value: 'mi material-icons-outlined demoicons mio-demoicon1',
					},
				},
				'2Sr6eN2CeR1tOnODcFuoEB': {
					key: '2Sr6eN2CeR1tOnODcFuoEB',
					order: 2,
					property: {
						value: 'mi material-icons-outlined demoicons mio-demoicon2',
					},
				},
				'5oxu4PeICV9XbUM8uaUUGn': {
					key: '5oxu4PeICV9XbUM8uaUUGn',
					order: 3,
					property: {
						value: 'mi material-icons-outlined demoicons mio-demoicon3',
					},
				},
			},
			defaultActive: {
				value: 'Tab1',
			},
		},
	},
	sections: [{ name: 'Tabs', pageName: 'tab' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect x="4.28577" width="25.7143" height="25.7143" rx="4" fill="#EDEAEA" />
					<rect y="4.28516" width="25.7143" height="25.7143" rx="4" fill="#3792FE" />
					<path
						className="_tabs"
						d="M12.8572 24.6426C14.8463 24.6426 16.754 23.8524 18.1605 22.4459C19.567 21.0394 20.3572 19.1317 20.3572 17.1426C20.3572 15.1535 19.567 13.2458 18.1605 11.8393C16.754 10.4328 14.8463 9.64258 12.8572 9.64258C10.8681 9.64258 8.9604 10.4328 7.55388 11.8393C6.14735 13.2458 5.35718 15.1535 5.35718 17.1426C5.35718 19.1317 6.14735 21.0394 7.55388 22.4459C8.9604 23.8524 10.8681 24.6426 12.8572 24.6426ZM12.1541 19.7207V17.8457H10.2791C9.8894 17.8457 9.57593 17.5322 9.57593 17.1426C9.57593 16.7529 9.8894 16.4395 10.2791 16.4395H12.1541V14.5645C12.1541 14.1748 12.4675 13.8613 12.8572 13.8613C13.2468 13.8613 13.5603 14.1748 13.5603 14.5645V16.4395H15.4353C15.825 16.4395 16.1384 16.7529 16.1384 17.1426C16.1384 17.5322 15.825 17.8457 15.4353 17.8457H13.5603V19.7207C13.5603 20.1104 13.2468 20.4238 12.8572 20.4238C12.4675 20.4238 12.1541 20.1104 12.1541 19.7207Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'tabsContainer',
			displayName: 'Tabs Container',
			description: 'Tabs Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tab',
			displayName: 'Tab',
			description: 'Tab',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabHighlighter',
			displayName: 'Tab Highlighter',
			description: 'Tab Highlighter',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'childContainer',
			displayName: 'Child Container',
			description: 'Child Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabsSeperator',
			displayName: 'Tabs Seperator',
			description: 'Tabs Seperator',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [designType, colorScheme],
};

export default component;
