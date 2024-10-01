import React from 'react';
import { Component, ComponentPropertyDefinition } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableDynamicColumnProperties';
import TableDynamicColumnStyle from './TableDynamicColumnStyle';
import { styleDefaults } from './tableDynamicColumnStyleProperties';

function TableDynamicColumnComponent() {
	return <></>;
}
const component: Component = {
	name: 'TableDynamicColumn',
	displayName: 'Table Dynamic Column',
	description: 'Table Dynamic Column component',
	component: TableDynamicColumnComponent,
	styleProperties: stylePropertiesDefinition,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableDynamicColumnStyle,
	styleDefaults: styleDefaults,
	parentType: 'TableColumns',
	stylePseudoStates: ['hover'],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-table-columns',
		},
		{
			name: 'row',
			displayName: 'Row',
			description: 'Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'header',
			displayName: 'Header',
			description: 'Header',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
