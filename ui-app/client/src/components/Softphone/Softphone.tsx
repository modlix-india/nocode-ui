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
 * Browser calling for an agent.
 *
 * Belongs on the shell page, once. The shell's subtree survives navigation, so one instance rings
 * whichever page the agent happens to be on. A page with `wrapShell: false` unmounts the shell and
 * so opts out of the phone UI - the call itself survives, because the session lives in the
 * softphone registry rather than in this component.
 *
 * Takes a connection name and nothing else. The provider comes from the connection, by way of
 * `/browser/status`, so adding a second provider needs no page edits anywhere.
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
