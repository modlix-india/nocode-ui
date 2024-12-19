import { duplicate } from '@fincity/kirun-js';
import { useMemo } from 'react';
import { PageStoreExtractor } from '../../../context/StoreContext';
import { ComponentDefinition, ComponentProps } from '../../../types/common';
import { difference } from '../../../util/setOperations';
import useDefinition from '../../util/useDefinition';
import TableColumns from '../TableColumns/TableColumns';
import { stylePropertiesDefinition } from '../TableColumns/tableColumnsProperties';
import { propertiesDefinition } from './tableDynamicColumnsProperties';

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

export default function TableDynamicColumnsComponent(props: Readonly<ComponentProps>) {
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
			columns = columns.filter(c => includedColumns.has(c));
		} else if (excludeColumns.length) {
			columns = columns.filter(c => !excludedColumns.has(c));
		}

		if (includeColumns.length) {
			columns = [...columns, ...Array.from(difference(includedColumns, new Set(columns)))];
		}

		let columnNamesIndex = columns.reduce(
			(a: { [key: string]: string }, c: string) => {
				a[c] = fieldToName(c);
				return a;
			},
			{} as { [key: string]: string },
		);

		columns = columns.sort((a: string, b: string) =>
			columnNamesIndex[a].localeCompare(columnNamesIndex[b]),
		);

		const index = columnsOrder.reduce(
			(a: { [key: string]: number }, c: string, i: number) => {
				a[c] = i + 1;
				return a;
			},
			{} as { [key: string]: number },
		);

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

		const children: { [key: string]: boolean } = {};
		for (let i = 0; i < columns.length; i++) {
			const eachField = columns[i];
			const childRendererKey = `${key}${eachField}_renderer`;

			const eachChild: ComponentDefinition = {
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
				key: childRendererKey,
				type: 'Text',
				name: eachField + 'Text',
				properties: {
					text: {
						location: { type: 'EXPRESSION', expression: `Parent.${eachField}` },
					},
				},
			};

			children[eachChild.key] = true;
			newPageDefinition.componentDefinition[eachChild.key] = eachChild;

			newPageDefinition.componentDefinition[eachRenderer.key] = eachRenderer;
		}

		newPageDefinition.componentDefinition[key].type = 'TableColumns';
		newPageDefinition.componentDefinition[key].children = children;
		return newPageDefinition;
	}, [context.table.data, dontShowOtherColumns, includeColumns, columnsOrder, excludeColumns]);

	return (
		<TableColumns
			definition={newPageDefinition.componentDefinition[key]}
			pageDefinition={newPageDefinition}
			locationHistory={locationHistory}
			context={context}
		/>
	);
}
