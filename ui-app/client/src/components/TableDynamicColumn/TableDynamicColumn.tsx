import React, {  } from 'react';
import {
	Component,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableDynamicColumnProperties';
import { PageStoreExtractor } from '../../context/StoreContext';
import useDefinition from '../util/useDefinition';
import { styleDefaults } from './tableDynamicColumnStyleProperties';
import TableDynamicColumnStyle from './TableDynamicColumnStyle';

function fieldToName(field: string): string {
	return field
		.replace('_', ' ')
		.trim()
		.replace(/([A-Z])/g, ' $1')
		.replace('.', ' ')
		.split(' ')
		.map(e => e.replace(/^./, str => str.toUpperCase()))
		.join(' ');
}

function TableDynamicColumnComponent(props: ComponentProps) {
	const {
		pageDefinition,
		locationHistory = [],
		context,
		definition,
		definition: { key },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			dontShowOtherColumns = false,
			includeColumns = [],
			columnsOrder = [],
			excludeColumns = [],
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	
	return null;
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
