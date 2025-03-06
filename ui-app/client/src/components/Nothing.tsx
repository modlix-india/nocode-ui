import React from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../types/common';
import { HelperComponent } from './HelperComponents/HelperComponent';

function Nothing(props: Readonly<ComponentProps>) {
	const { definition, context } = props;
	return (
		<div className="comp compNothing">
			<HelperComponent context={context} definition={definition} />
			No component with type {definition.type} found.
		</div>
	);
}

const component: Component = {
	name: 'Nothing',
	displayName: 'Nothing',
	description: 'Nothing component',
	component: Nothing,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: [],
	isHidden: true,
	styleDefaults: new Map<string, string>(),
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: 'fa-solid fa-skull-crossbones',
			mainComponent: true,
		},
	],
};

export default component;
