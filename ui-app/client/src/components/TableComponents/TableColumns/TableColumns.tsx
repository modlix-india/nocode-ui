import React, { useEffect, useMemo, useState } from 'react';
import { getDataFromPath, PageStoreExtractor, setData } from '../../../context/StoreContext';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import {
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../../types/common';
import { updateLocationForChild } from '../../util/updateLoactionForChild';
import { Component } from '../../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableColumnsProperties';
import TableColumnsStyle from './TableColumnsStyle';
import useDefinition from '../../util/useDefinition';
import Children from '../../Children';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import { deepEqual, ExpressionEvaluator } from '@fincity/kirun-js';
import { getExtractionMap } from '../../util/getRenderData';
import CommonCheckbox from '../../../commonComponents/CommonCheckbox';
import { duplicate } from '@fincity/kirun-js';
import { runEvent } from '../../util/runEvent';
import { styleDefaults } from './tableColumnsStyleProperties';
import { difference } from '../../../util/setOperations';
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
function TableColumnsComponent(props: Readonly<ComponentProps>) {
	const [value, setValue] = useState([]);
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { showEmptyRows, showHeaders } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);

	const dynamicColumns = Object.values(pageDefinition.componentDefinition).filter(
		cd => cd?.type === 'TableDynamicColumn',
	);

	if (dynamicColumns.length > 0) {
		let includeColumnsArray = [];
		let excludeColumnsArray = [];
		let columnsOrderArray = [];

		for (let i = 0; i < dynamicColumns.length; i++) {
			const key = dynamicColumns[i].key;
			const visibility = dynamicColumns[i]?.properties?.visibility?.value;
			const includeColumns = dynamicColumns[i]?.properties?.includeColumns;
			if (visibility == false) {
				continue;
			}
			if (includeColumns)
				includeColumnsArray = Object.values(includeColumns).map(col => col.property.value);

			const excludeColumns = dynamicColumns[i]?.properties?.excludeColumns;
			if (excludeColumns)
				excludeColumnsArray = Object.values(excludeColumns).map(col => col.property.value);

			const dontShowOtherColumns = dynamicColumns[i]?.properties?.dontShowOtherColumns;

			const columnsOrder = dynamicColumns[i]?.properties?.columnsOrder;
			if (columnsOrder)
				columnsOrderArray = Object.values(columnsOrder).map(col => col.property.value);

			let columns = Array.from<string>(
				(context.table.data ?? []).reduce((a: Set<string>, c: any) => {
					if (!c) return a;
					for (const eachKey of Object.keys(c)) a.add(eachKey);
					return a;
				}, new Set<string>()),
			);

			const includedColumns = new Set<string>(includeColumnsArray);
			const excludedColumns = new Set<string>(excludeColumnsArray);

			if (dontShowOtherColumns && includeColumnsArray.length) {
				columns = columns.filter(c => includedColumns.has(c));
			} else if (excludeColumnsArray.length) {
				columns = columns.filter(c => !excludedColumns.has(c));
			}

			if (includeColumnsArray.length) {
				columns = [
					...columns,
					...Array.from(difference(includedColumns, new Set(columns))),
				];
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

			const index = columnsOrderArray.reduce(
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

			for (let i = 0; i < columns.length; i++) {
				const eachField = columns[i];

				const childRendererKey = `${key}${eachField}_renderer`;
				const eachRenderer: ComponentDefinition = {
					key: childRendererKey,
					type: 'Text',
					name: eachField + 'Text',
					properties: {
						text: {
							location: { type: 'EXPRESSION', expression: `Parent.${eachField}` },
						},
					},
				};

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
					children: { [eachRenderer.key]: true },
				};

				pageDefinition.componentDefinition[eachRenderer.key] = eachRenderer;
				pageDefinition.componentDefinition[eachChild.key] = eachChild;
				children![eachChild.key] = true;
			}
		}
		const displayOrderMap = new Map();

		for (const key of Object.keys(pageDefinition.componentDefinition)) {
			const component = pageDefinition.componentDefinition[key];
			if (
				component &&
				(component.name === 'TableDynamicColumn' || component.name === 'TableColumn')
			) {
				const displayOrder = component.displayOrder ?? 0;
				displayOrderMap.set(key, displayOrder);
			}

			const sortedEntries = Array.from(displayOrderMap.entries()).sort((a, b) => a[1] - b[1]);

			const newarr = sortedEntries.flatMap(([key]) => {
				const columnType = pageDefinition.componentDefinition[key]?.type;

				if (columnType === 'TableColumn') {
					return [key];
				} else if (columnType === 'TableDynamicColumn') {
					const childrenKeys = Object.keys(
						pageDefinition.componentDefinition || {},
					).filter(
						childKey =>
							childKey.startsWith(key) &&
							children?.hasOwnProperty(childKey) &&
							childKey !== key,
					);
					return childrenKeys;
				}
				return [];
			});

			newarr.forEach((key, index) => {
				pageDefinition.componentDefinition[key].displayOrder = index + 1;
			});
		}
	}

	const newPageDef = useMemo(() => {
		//for headers generation
		const np = duplicate(pageDefinition);
		Object.keys(children ?? {})
			.map(k => np?.componentDefinition[k])
			.filter(e => e?.type === 'TableColumn')
			.forEach(cd => (cd.type = 'TableColumnHeader'));
		return np;
	}, [pageDefinition]);

	const colPageDef = useMemo(() => {
		if (!showEmptyRows) return pageDefinition;
		const np = duplicate(pageDefinition);

		Object.keys(children ?? {})
			.map(k => np?.componentDefinition[k])
			.filter(e => e?.type === 'TableColumn')
			.forEach(cd => (cd.children = {}));

		return np;
	}, [pageDefinition, showEmptyRows]);

	const {
		from = 0,
		to = 0,
		data,
		dataBindingPath,
		selectionBindingPath,
		selectionType,
		multiSelect,
		pageSize,
		uniqueKey,
		onSelect,
	} = props.context.table ?? {};

	useEffect(() => setValue(props.context.table?.data), [props.context.table?.data]);

	const [hover, setHover] = useState(false);
	const [hoverRow, setHoverRow] = useState(-1);

	if (!Array.isArray(value)) return <></>;

	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleNormalProperties =
		processComponentStylePseudoClasses(
			props.pageDefinition,
			{ hover: false },
			stylePropertiesWithPseudoStates,
		) ?? {};
	const styleHoverProperties =
		processComponentStylePseudoClasses(
			props.pageDefinition,
			{ hover: true },
			stylePropertiesWithPseudoStates,
		) ?? {};

	const total = to - from;

	let emptyCount = pageSize - total;
	if (emptyCount < 0 || !showEmptyRows) emptyCount = 0;

	const selection = getDataFromPath(selectionBindingPath, locationHistory, pageExtractor);

	const isSelected = (index: number): boolean => {
		if (selectionType === 'NONE' || !selectionBindingPath) return false;

		const selected =
			(multiSelect ? (selection ?? []) : [selection]).filter((e: any) =>
				selectionType === 'OBJECT'
					? deepEqual(e, data[index])
					: e === `(${dataBindingPath})[${index}]`,
			).length !== 0;

		return selected;
	};

	const select = (index: number) => {
		if (selectionType === 'NONE' || !selectionBindingPath) return;

		const putObj =
			selectionType === 'OBJECT' ? duplicate(data[index]) : `${dataBindingPath}[${index}]`;

		if (multiSelect) {
			let x = selection ? [...selection] : [];
			if (isSelected(index)) {
				x = x.filter(e => !deepEqual(e, putObj));
			} else {
				x.push(putObj);
			}
			setData(selectionBindingPath, x, context.pageName);
		} else {
			setData(selectionBindingPath, putObj, context.pageName);
		}

		const selectEvent = onSelect ? props.pageDefinition.eventFunctions?.[onSelect] : undefined;

		if (!selectEvent) return;

		(async () =>
			await runEvent(
				selectEvent,
				uniqueKey,
				context.pageName,
				locationHistory,
				props.pageDefinition,
			))();
	};

	const showCheckBox = multiSelect && selectionType !== 'NONE' && selectionBindingPath;

	const rows = value.map((e: any, index) => {
		if (index < from || index >= to) return undefined;
		const checkBox = showCheckBox ? (
			<div className="comp compTableColumn">
				<CommonCheckbox
					key="checkbox"
					isChecked={isSelected(index)}
					onChange={() => select(index)}
				/>
			</div>
		) : (
			<></>
		);

		const onClick = !multiSelect && selectionType !== 'NONE' ? () => select(index) : undefined;

		let key = undefined;

		if (uniqueKey) {
			let ev: ExpressionEvaluator = new ExpressionEvaluator(`Data.${uniqueKey}`);
			key = ev.evaluate(getExtractionMap(data?.[index]));
		}

		return (
			<div
				key={key}
				className={`_row _dataRow ${onClick ? '_pointer' : ''} ${
					isSelected(index) ? '_selected' : ''
				}`}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHoverRow(index) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHoverRow(-1) : undefined
				}
				onClick={onClick}
				style={(hoverRow === index ? styleHoverProperties : styleNormalProperties).row}
			>
				{checkBox}
				<Children
					pageDefinition={pageDefinition}
					renderableChildren={children}
					context={context}
					locationHistory={[
						...locationHistory,
						updateLocationForChild(
							definition.key,
							context.table?.bindingPath,
							index,
							locationHistory,
							context.pageName,
							pageExtractor,
						),
					]}
				/>
			</div>
		);
	});

	Object.entries(children ?? {})
		.map(e => e[0])
		.map(k => `${k} - ${pageDefinition.componentDefinition[k].displayOrder}`)
		.forEach(console.log);

	let headers = undefined;
	if (showHeaders) {
		let checkBoxTop = undefined;
		if (showCheckBox) {
			checkBoxTop = <div className="comp compTableHeaderColumn">&nbsp;</div>;
		}
		headers = (
			<div
				className="_row"
				style={(hover ? styleHoverProperties : styleNormalProperties).header}
			>
				{checkBoxTop}
				<Children
					pageDefinition={newPageDef}
					renderableChildren={children}
					context={context}
					locationHistory={locationHistory}
				/>
			</div>
		);
	}

	const emptyRows = [];
	if (emptyCount) {
		for (let i = 0; i < emptyCount; i++) {
			emptyRows.push(
				<div key={`emptyRow_${i}`} className="_row" style={styleNormalProperties.row}>
					<Children
						pageDefinition={colPageDef}
						renderableChildren={children}
						context={context}
						locationHistory={locationHistory}
					/>
				</div>,
			);
		}
	}

	return (
		<div
			className="comp compTableColumns"
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			style={(hover ? styleHoverProperties : styleNormalProperties).comp}
		>
			<HelperComponent context={props.context} definition={definition} />
			{headers}
			{rows}
			{emptyRows}
		</div>
	);
}

const component: Component = {
	name: 'TableColumns',
	displayName: 'Table Columns',
	description: 'Table Columns component',
	component: TableColumnsComponent,
	styleProperties: stylePropertiesDefinition,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableColumnsStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map([
		['TableColumn', -1],
		['TableDynamicColumn', -1],
	]),
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
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path
						className="_tablelineY"
						d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z"
						fill="#CFD8DD"
					/>
					<path
						className="_tablelineY"
						d="M9.40833 8.71289V26.9995H11.6952V8.71289H9.40833Z"
						fill="#CFD8DD"
					/>
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
						className="_tableHeader"
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
