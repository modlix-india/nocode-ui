import React, { useMemo } from 'react';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import TableDynamicColumnsStyle from './TableDynamicColumnsStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './tableDynamicColumnsProperties';
import { PageStoreExtractor } from '../../context/StoreContext';
import useDefinition from '../util/useDefinition';
import { duplicate } from '@fincity/kirun-js';
import TableColumns from '../TableColumns/TableColumns';
import { difference } from '../../util/setOperations';
import { styleDefaults } from './tableDynamicColumnsStyleProperties';
import TableColumn from '../TableColumn/TableColumn';

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

function TableDynamicColumnsComponent(props: ComponentProps) {
	// This is a dummy component, it will not render anything

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

	const newPageDefinition = useMemo(() => {
		const newPageDefinition = duplicate(pageDefinition);

		let columns = Array.from<string>(
			(context.table.data ?? []).reduce((a: Set<string>, c: any) => {
				if (!c) return a;
				for (const eachKey of Object.keys(c)) a.add(eachKey);
				return a;
			}, new Set<string>()),
		);

		const includedColumns = new Set<string>(includeColumns);
		const excludedColumns = new Set<string>(excludeColumns);

		if (dontShowOtherColumns && includeColumns.length) {
			columns = columns.filter(c => {
				return includedColumns.has(c);
			});
		} else if (excludeColumns.length) {
			columns = columns.filter(c => !excludedColumns.has(c));
		}

		if (includeColumns.length) {
			columns = [...columns, ...Array.from(difference(includedColumns, new Set(columns)))];
		}

		let columnNamesIndex = columns.reduce((a: { [key: string]: string }, c: string) => {
			a[c] = fieldToName(c);
			return a;
		}, {} as { [key: string]: string });

		columns = columns.sort((a: string, b: string) =>
			columnNamesIndex[a].localeCompare(columnNamesIndex[b]),
		);

		const index = columnsOrder.reduce((a: { [key: string]: number }, c: string, i: number) => {
			a[c] = i + 1;
			return a;
		}, {} as { [key: string]: number });

		columns = columns.sort(
			(a: string, b: string) =>
				(index[a] ??
					(includedColumns.has(a)
						? Number.MAX_SAFE_INTEGER - 200
						: Number.MAX_SAFE_INTEGER)) -
				(index[b] ??
					(includedColumns.has(b)
						? Number.MAX_SAFE_INTEGER - 200
						: Number.MAX_SAFE_INTEGER)),
		);

		const children: { [key: string]: boolean } = {}; //intialize  empty obj to store children
		for (let i = 0; i < columns.length; i++) {
			// iterate through columns
			const eachField = columns[i]; //get each col
			const childRendererKey = `${key}${eachField}_renderer`; //unique key for render component

			const eachChild: ComponentDefinition = {
				//defining each children componentdefintion for current column
				key: `${key}${eachField}`,
				type: 'TableColumn',
				name: eachField,
				displayOrder: i,
				properties: {
					label: {
						value: columnNamesIndex[eachField],
					},
				},
				children: { [childRendererKey]: true },
			};

			const eachRenderer = {
				//defining render component for current column
				key: childRendererKey,
				type: 'Text',
				name: eachField + 'Text',
				properties: {
					text: {
						location: { type: 'EXPRESSION', expression: `Parent.${eachField}` },
					},
				},
			};

			children[eachChild.key] = true; //adding key of child comp to children obj
			newPageDefinition.componentDefinition[eachChild.key] = eachChild; //adding child comp def to pgdef

			newPageDefinition.componentDefinition[eachRenderer.key] = eachRenderer; //adding render comp def to pgdef
		}

		newPageDefinition.componentDefinition[key].type = 'TableColumns'; //set type of comp to table columns
		newPageDefinition.componentDefinition[key].children = children; //set the children of comp to children we get

		return newPageDefinition;
	}, [context.table.data, dontShowOtherColumns, includeColumns, columnsOrder, excludeColumns]);

	return (
		<TableColumns.component
			definition={newPageDefinition.componentDefinition[key]}
			pageDefinition={newPageDefinition}
			locationHistory={locationHistory}
			context={context}
		/>
	);
}

const component: Component = {
	name: 'TableDynamicColumns',
	displayName: 'Table Dynamic Columns',
	description: 'Table Dynamic Columns component',
	component: TableDynamicColumnsComponent,
	styleProperties: stylePropertiesDefinition,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableDynamicColumnsStyle,
	styleDefaults: styleDefaults,
	parentType: 'Table',
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
