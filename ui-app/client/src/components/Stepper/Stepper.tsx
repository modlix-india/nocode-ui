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
		stylePropertiesForTheme: styleProperties,
	externalStylePropsForThemeJson: true,
};

export default component;
