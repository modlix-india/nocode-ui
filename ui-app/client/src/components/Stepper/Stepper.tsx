import React, { Suspense } from 'react';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './StepperProperties';
import { Component } from '../../types/common';
import StepperStyle from './StepperStyle';
import { styleProperties, styleDefaults } from './StepperStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyStepper = React.lazy(() => import(/* webpackChunkName: "Stepper" */ './LazyStepper'));
function LoadLazyStepper(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyStepper {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 11,
	name: 'Stepper',
	displayName: 'Stepper',
	description: 'Stepper component',
	component: LoadLazyStepper,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: StepperStyle,
	styleDefaults: styleDefaults,
	bindingPaths: {
		bindingPath: { name: 'Stepper Count' },
	},
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'Stepper',
		name: 'Stepper',
		properties: {
			titles: {
				Rmum33beKct0kVQkRrMM7: {
					key: 'Rmum33beKct0kVQkRrMM7',
					order: 1,
					property: { value: 'Step 1' },
				},
				'4CIx4eatNBBYeYau1jSgud': {
					key: '4CIx4eatNBBYeYau1jSgud',
					order: 2,
					property: { value: 'Step 2' },
				},
				Rmum33beKct0kVQkRrMM9: {
					key: 'Rmum33beKct0kVQkRrMM9',
					order: 1,
					property: { value: 'Step 3' },
				},
			},
		},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 12">
					<path
						d="M18 6L10 6"
						stroke="black"
						strokeOpacity="0.1"
						strokeLinecap="square"
						strokeDasharray="1 1"
					/>
					<circle className="_greenStepperInitialIcon" cx="6" cy="6" r="6" fill="white" />
					<path
						d="M6 12C7.5913 12 9.11742 11.3679 10.2426 10.2426C11.3679 9.11742 12 7.5913 12 6C12 4.4087 11.3679 2.88258 10.2426 1.75736C9.11742 0.632141 7.5913 0 6 0C4.4087 0 2.88258 0.632141 1.75736 1.75736C0.632141 2.88258 0 4.4087 0 6C0 7.5913 0.632141 9.11742 1.75736 10.2426C2.88258 11.3679 4.4087 12 6 12ZM8.64844 4.89844L5.64844 7.89844C5.42813 8.11875 5.07188 8.11875 4.85391 7.89844L3.35391 6.39844C3.13359 6.17813 3.13359 5.82188 3.35391 5.60391C3.57422 5.38594 3.93047 5.38359 4.14844 5.60391L5.25 6.70547L7.85156 4.10156C8.07187 3.88125 8.42812 3.88125 8.64609 4.10156C8.86406 4.32187 8.86641 4.67812 8.64609 4.89609L8.64844 4.89844Z"
						fill="#1CBA79"
						className="_greenStepperIcon"
					/>
					<circle className="_greenFinalStepIcon" cx="24" cy="6" r="6" fill="#E0E0E7" />
				</IconHelper>
			),
		},
		{
			name: 'listItem',
			displayName: 'Step',
			description: 'Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneListItem',
			displayName: 'Done Step',
			description: 'Done Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeListItem',
			displayName: 'Active Step',
			description: 'Active Step',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'itemContainer',
			displayName: 'Item Container',
			description: 'Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneItemContainer',
			displayName: 'Done Item Container',
			description: 'Done Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeItemContainer',
			displayName: 'Active Item Container',
			description: 'Active Item Container',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'step',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneStep',
			displayName: 'Done Icon',
			description: 'Done Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeStep',
			displayName: 'Active Icon',
			description: 'Active Icon',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'title',
			displayName: 'Text',
			description: 'Text',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneTitle',
			displayName: 'Done Text',
			description: 'Done Text',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeTitle',
			displayName: 'Active Text',
			description: 'Active Text',
			icon: 'fa-solid fa-list',
		},

		{
			name: 'line',
			displayName: 'Lines',
			description: 'Lines',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'doneLine',
			displayName: 'Done Lines',
			description: 'Done Lines',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeLine',
			displayName: 'Active Line',
			description: 'Active Line',
			icon: 'fa-solid fa-list',
		},
		{
			name: 'activeBeforeLine',
			displayName: 'Active Before Line',
			description: 'Active Before Line',
			icon: 'fa-solid fa-list',
		},
	],
	stylePropertiesForTheme: styleProperties,
	externalStylePropsForThemeJson: true,
};

export default component;
