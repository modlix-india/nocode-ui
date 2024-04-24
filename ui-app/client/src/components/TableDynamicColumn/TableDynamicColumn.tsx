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
	// const arraytdc: React.JSX.Element[] = [];

	// const newPageDefinition = useMemo(() => {
	// 	const newPageDefinition = duplicate(pageDefinition);
	// 	let columns = Array.from<string>(
	// 		(context.table.data ?? []).reduce((a: Set<string>, c: any) => {
	// 			if (!c) return a;
	// 			for (const eachKey of Object.keys(c)) a.add(eachKey);
	// 			return a;
	// 		}, new Set<string>()),
	// 	);
	// 	console.log('includecols', includeColumns);
	// 	const includedColumns = new Set<string>(includeColumns);
	// 	const excludedColumns = new Set<string>(excludeColumns);

	// 	if (dontShowOtherColumns && includeColumns.length) {
	// 		columns = columns.filter(c => {
	// 			// console.log('after filtering', includeColumns.has(c));
	// 			return includedColumns.has(c);
	// 		});
	// 	} else if (excludeColumns.length) {
	// 		columns = columns.filter(c => !excludedColumns.has(c));
	// 	}

	// 	if (includeColumns.length) {
	// 		columns = [...columns, ...Array.from(difference(includedColumns, new Set(columns)))];
	// 		// console.log('cols', columns);
	// 	}

	// 	let columnNamesIndex = columns.reduce((a: { [key: string]: string }, c: string) => {
	// 		a[c] = fieldToName(c);
	// 		return a;
	// 	}, {} as { [key: string]: string });

	// 	columns = columns.sort((a: string, b: string) =>
	// 		columnNamesIndex[a].localeCompare(columnNamesIndex[b]),
	// 	);

	// 	const index = columnsOrder.reduce((a: { [key: string]: number }, c: string, i: number) => {
	// 		a[c] = i + 1;
	// 		return a;
	// 	}, {} as { [key: string]: number });

	// 	columns = columns.sort(
	// 		(a: string, b: string) =>
	// 			(index[a] ??
	// 				(includedColumns.has(a)
	// 					? Number.MAX_SAFE_INTEGER - 200
	// 					: Number.MAX_SAFE_INTEGER)) -
	// 			(index[b] ??
	// 				(includedColumns.has(b)
	// 					? Number.MAX_SAFE_INTEGER - 200
	// 					: Number.MAX_SAFE_INTEGER)),
	// 	);

	// 	let isFirstRow = true;
	// 	// console.log('col', columns);
	// 	for (let i = 0; i < columns.length; i++) {
	// 		const eachField = columns[i];
	// 		console.log('eachField ', eachField);
	// 		// console.log('key ', key);

	// 		const childRendererKey = `${key}${eachField}_renderer`;
	// 		key;
	// 		// console.log('childRendererKey ', childRendererKey);

	// 		const eachRenderer = {
	// 			key: childRendererKey,
	// 			type: 'Text',
	// 			name: eachField + 'Text',
	// 			properties: {
	// 				text: {
	// 					location: { type: 'EXPRESSION', expression: `Parent.${eachField}` },
	// 				},
	// 			},
	// 		};

	// 		const eachChild: ComponentDefinition = {
	// 			//defining each children componentdefintion for current column
	// 			key: `${key}${eachField}`,
	// 			type: 'TableColumn',
	// 			name: eachField,
	// 			displayOrder: i,
	// 			properties: {
	// 				label: {
	// 					value: columnNamesIndex[eachField],
	// 				},
	// 			},
	// 			children: { [eachRenderer.key]: true },
	// 		};

	// 		// newPageDefinition.componentDefinition[eachRenderer.key] = eachRenderer;
	// 		// newPageDefinition.componentDefinition[eachChild.key] = eachChild;

	// 		// console.log('newdef', newPageDefinition?.componentDefinition);
	// 		// arraytdc.push(
	// 		// 	<TableColumn.component
	// 		// 		definition={newPageDefinition?.componentDefinition[eachChild.key]}
	// 		// 		pageDefinition={newPageDefinition}
	// 		// 		locationHistory={locationHistory}
	// 		// 		context={context}
	// 		// 	/>,
	// 		// );
	// 		console.log('npd', newPageDefinition);
	// 		console.log('npcd', newPageDefinition?.componentDefinition[eachChild.key]);
	// 		console.log('arr', arraytdc);
	// 	}
	// 	return newPageDefinition;
	// }, [context.table.data, dontShowOtherColumns, includeColumns, columnsOrder, excludeColumns]);

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
