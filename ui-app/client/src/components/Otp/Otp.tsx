import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import { propertiesDefinition, stylePropertiesDefinition } from './otpProperties';
import OtpInputStyle from './OtpStyle';
import { styleDefaults, stylePropertiesForTheme } from './otpStyleProperties';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { MANDATORY } from './LazyOtp';

const LazyOtp = React.lazy(() => import(/* webpackChunkName: "Otp" */ './LazyOtp'));
function LoadLazyOtp(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyOtp {...props} />
		</Suspense>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	name: 'Otp',
	displayName: 'Otp',
	description: 'OtpInput component',
	component: LoadLazyOtp,
	styleComponent: OtpInputStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['focus', 'disabled'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'OTP Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Otp',
		name: 'Otp',
		properties: {
			label: { value: 'Otp' },
		},
	},
	validations: {
		MANDATORY,
	},
	sections: [{ name: 'Otp', pageName: 'otp' }],
		propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
