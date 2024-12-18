import React, { useMemo } from 'react';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../../types/common';
import TableDynamicColumnsStyle from './TableDynamicColumnsStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './tableDynamicColumnsProperties';
import { PageStoreExtractor } from '../../../context/StoreContext';
import useDefinition from '../../util/useDefinition';
import { duplicate } from '@fincity/kirun-js';
import TableColumns from '../TableColumns/TableColumns';
import { difference } from '../../../util/setOperations';
import { styleDefaults } from './tableDynamicColumnsStyleProperties';
import TableColumn from '../TableColumn/TableColumn';
import { IconHelper } from '../../util/IconHelper';

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

function TableDynamicColumnsComponent(props: Readonly<ComponentProps>) {
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
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H9.69492C9.8458 16.5726 9.99532 16.5433 10.1348 16.4859C10.2743 16.4284 10.4011 16.3439 10.5077 16.2372C10.6144 16.1305 10.6989 16.0038 10.7564 15.8643C10.8139 15.7248 10.8431 15.5753 10.8425 15.4244C10.842 15.2742 10.8119 15.1256 10.754 14.9871C10.696 14.8486 10.6113 14.7228 10.5048 14.617C10.3982 14.5112 10.2718 14.4275 10.1328 14.3705C9.99389 14.3136 9.84509 14.2846 9.69492 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H9.69492C9.8458 22.8617 9.99532 22.8324 10.1348 22.7749C10.2743 22.7174 10.4011 22.6329 10.5077 22.5263C10.6144 22.4196 10.6989 22.2928 10.7564 22.1533C10.8139 22.0138 10.8431 21.8643 10.8425 21.7134C10.842 21.5632 10.8119 21.4147 10.754 21.2761C10.696 21.1376 10.6113 21.0119 10.5048 20.9061C10.3982 20.8003 10.2718 20.7165 10.1328 20.6596C9.99389 20.6026 9.84509 20.5736 9.69492 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z" fill="#CFD8DD" />
					<path
						d="M2.54769 7.00001C2.39752 6.99941 2.24873 7.02842 2.10977 7.08535C1.97081 7.14229 1.84442 7.22606 1.73784 7.33185C1.63126 7.43765 1.54657 7.5634 1.48861 7.70193C1.43064 7.84047 1.40055 7.98906 1.40003 8.13923C1.39944 8.29011 1.4287 8.43961 1.48617 8.57913C1.54363 8.71864 1.62815 8.84539 1.73484 8.95208C1.84154 9.05877 1.96828 9.14329 2.10779 9.20075C2.24731 9.25822 2.39681 9.28749 2.54769 9.28689H27.6949C27.8458 9.28748 27.9953 9.25822 28.1348 9.20075C28.2743 9.14329 28.4011 9.05877 28.5078 8.95208C28.6145 8.84539 28.699 8.71864 28.7564 8.57913C28.8139 8.43962 28.8431 8.29011 28.8425 8.13923C28.842 7.98906 28.8119 7.84047 28.754 7.70193C28.696 7.5634 28.6113 7.43765 28.5048 7.33185C28.3982 7.22606 28.2718 7.14229 28.1328 7.08535C27.9939 7.02841 27.8451 6.99942 27.6949 7.00001H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M1.5 9.5H28.5V26C28.5 27.3807 27.3807 28.5 26 28.5H4C2.61929 28.5 1.5 27.3807 1.5 26V9.5Z"
						stroke="#CFD8DD"
						strokeWidth="3"
						fillOpacity={0}
					/>
					<path
						d="M0 4C0 1.79086 1.79086 0 4 0H26C28.2091 0 30 1.79086 30 4V8H0V4Z"
						fill="#2196F3"
					/>
					<path
						d="M24.729 21.1816L22.8564 20.7334C22.6844 21.0708 22.4579 21.3879 22.1722 21.6698C20.736 23.0871 18.4063 23.0871 16.9695 21.6698C15.5327 20.252 15.5327 17.9533 16.9695 16.5357C18.2074 15.3139 20.1077 15.1481 21.5291 16.0323L20.3189 17.2266L25 18.2183L23.9945 13.5996L22.8868 14.693C20.7059 13.0928 17.6112 13.2629 15.6316 15.2156C13.4561 17.3623 13.4561 20.8429 15.6316 22.9896C17.8071 25.1362 21.335 25.1362 23.5105 22.9898C24.0513 22.4557 24.4573 21.8391 24.729 21.1816Z"
						fill="#2196F3"
						className="_tableDCSpinner"
					/>
				</IconHelper>
			),
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
