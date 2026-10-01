import React, { Suspense } from 'react';
import { ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './softphoneProperties';
import SoftphoneStyle from './SoftphoneStyle';
import { styleDefaults, styleProperties } from './softphoneStyleProperties';

const LazySoftphone = React.lazy(
	() => import(/* webpackChunkName: "Softphone" */ './LazySoftphone'),
);

function LoadLazySoftphone(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<></>}>
			<LazySoftphone {...props} />
		</Suspense>
	);
}

/**
 * Belongs on the shell page, once, so it rings on whichever page the agent is on. A page with
 * `wrapShell: false` drops the phone UI, but the call survives in the registry.
 */
const component = {
	name: 'Softphone',
	displayName: 'Softphone',
	description: 'Places and receives calls in the browser for a provisioned agent',
	component: LoadLazySoftphone,
	styleComponent: SoftphoneStyle,
	styleDefaults: styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'Softphone',
		name: 'Softphone',
		properties: {
			autoRegister: { value: true },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
