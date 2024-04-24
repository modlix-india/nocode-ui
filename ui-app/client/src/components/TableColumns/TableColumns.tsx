import React, { useEffect, useMemo, useState } from 'react';
import { getDataFromPath, PageStoreExtractor, setData } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import {
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableColumnsProperties';
import TableColumnsStyle from './TableColumnsStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { deepEqual, ExpressionEvaluator } from '@fincity/kirun-js';
import { getExtractionMap } from '../util/getRenderData';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import { duplicate } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import { styleDefaults } from './tableColumnsStyleProperties';
import { difference } from '../../util/setOperations';
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
function TableColumnsComponent(props: ComponentProps) {
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

			let columnNamesIndex = columns.reduce((a: { [key: string]: string }, c: string) => {
				a[c] = fieldToName(c);
				return a;
			}, {} as { [key: string]: string });

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
			(multiSelect ? selection ?? [] : [selection]).filter((e: any) =>
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
					children={children}
					context={context}
					locationHistory={[
						...locationHistory,
						updateLocationForChild(
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
					children={children}
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
						children={children}
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
