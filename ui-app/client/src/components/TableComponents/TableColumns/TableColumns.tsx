import {
	deepEqual,
	duplicate,
	ExpressionEvaluator,
	isNullValue,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import CommonCheckbox from '../../../commonComponents/CommonCheckbox';
import {
	addListener,
	addListenerAndCallImmediatelyWithChildrenActivity,
	fillerExtractor,
	getDataFromLocation,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../../types/common';
import { difference } from '../../../util/setOperations';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../../util/styleProcessor';
import Children from '../../Children';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { getExtractionMap } from '../../util/getRenderData';
import { runEvent } from '../../util/runEvent';
import { updateLocationForChild } from '../../util/updateLoactionForChild';
import useDefinition from '../../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableColumnsProperties';
import { ParentExtractor } from '../../../context/ParentExtractor';
import { propertiesDefinition as tableDynamicColumnPropertiesDefinition } from '../TableDynamicColumn/tableDynamicColumnProperties';
import { createNewState } from '../../util/useDefinition/commons';
import { getPathsFromComponentDefinition } from '../../util/getPaths';

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

export default function TableColumnsComponent(props: Readonly<ComponentProps>) {
	const [value, setValue] = useState([]);
	const {
		definition: { key, children: originalChildren },
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

	const [updateColumnsAt, setUpdateColumnsAt] = useState(Date.now());

	useEffect(() => {
		if (!context.table.personalizationBindingPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			() => setUpdateColumnsAt(Date.now()),
			pageExtractor,
			context.table.personalizationBindingPath,
		);
	}, [
		context.table.personalizationBindingPath,
		context.table.enablePersonalization,
		setUpdateColumnsAt,
	]);

	const { headerDef, columnDef, listenPaths, children } = useMemo(() => {
		let { dynamicColumns, columnsPageDefinition, listenPaths } =
			resolvePropertiesOfDynamicColumns(pageDefinition, pageExtractor, locationHistory);

		const personalizationObject = context.table.enablePersonalization
			? getDataFromPath(
					context.table.personalizationBindingPath,
					locationHistory,
					pageExtractor,
				)
			: {};
		return {
			...generateTableColumnDefinitions(
				dynamicColumns,
				columnsPageDefinition,
				originalChildren ?? {},
				context,
				personalizationObject,
			),
			listenPaths,
		};
	}, [
		pageDefinition,
		updateColumnsAt,
		context.table.personalizationBindingPath,
		context.table.enablePersonalization,
		context.table.key,
	]);

	const emptyRowPageDef = useMemo(() => {
		if (!showEmptyRows) return columnDef;
		const np = duplicate(columnDef);

		Object.keys(children ?? {})
			.map(k => np?.componentDefinition[k])
			.filter(e => e?.type === 'TableColumn')
			.forEach(cd => (cd.children = {}));

		return np;
	}, [columnDef, showEmptyRows]);

	useEffect(() => {
		if (!listenPaths.length) return;
		addListener(() => setUpdateColumnsAt(Date.now()), pageExtractor, ...listenPaths);
	}, [setUpdateColumnsAt, pageExtractor, listenPaths]);

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

	const columnNames = useMemo(
		() =>
			getColumnNames({
				children,
				columnDef,
				locationHistory,
				pageExtractor,
			}),
		[columnDef, locationHistory, pageExtractor],
	);

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

		return (
			(multiSelect ? (selection ?? []) : [selection]).filter((e: any) =>
				selectionType === 'OBJECT'
					? deepEqual(e, data[index])
					: e === `${dataBindingPath}[${index}]`,
			).length !== 0
		);
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

	const rows = generateRows({
		value,
		from,
		to,
		showCheckBox,
		isSelected,
		select,
		multiSelect,
		selectionType,
		uniqueKey,
		data,
		columnDef,
		children,
		context,
		locationHistory,
		definition,
		pageExtractor,
	});

	let headers = undefined;
	if (showHeaders) {
		let checkBoxTop = undefined;
		if (showCheckBox) {
			checkBoxTop = <div className="comp compTableHeaderColumn">&nbsp;</div>;
		}

		headers = (
			<thead className="_headerContainer" style={styleNormalProperties.headerContainer}>
				<tr
					className="_row _header"
					style={(hover ? styleHoverProperties : styleNormalProperties).header}
				>
					{checkBoxTop}
					<Children
						pageDefinition={headerDef}
						renderableChildren={children}
						context={{ ...context, table: { ...context.table, columnNames } }}
						locationHistory={locationHistory}
					/>
				</tr>
			</thead>
		);
	}

	const emptyRows = [];
	if (emptyCount) {
		for (let i = 0; i < emptyCount; i++) {
			emptyRows.push(
				<tr key={`emptyRow_${i}`} className="_row" style={styleNormalProperties.row}>
					<Children
						pageDefinition={emptyRowPageDef}
						renderableChildren={children}
						context={context}
						locationHistory={locationHistory}
					/>
				</tr>,
			);
		}
	}

	const styleKey = `row${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	let rowStyles =
		processStyleObjectToCSS(
			styleNormalProperties.row,
			`.comp.compTableColumns#${styleKey} ._row._dataRow`,
		) +
		processStyleObjectToCSS(
			styleHoverProperties.row,
			`.comp.compTableColumns#${styleKey} ._row._dataRow:hover`,
		) +
		processStyleObjectToCSS(
			styleNormalProperties.selectedRow ?? styleHoverProperties.row,
			`.comp.compTableColumns#${styleKey} ._row._dataRow._selected`,
		);

	let tableStyle = (hover ? styleHoverProperties : styleNormalProperties).comp;

	return (
		<table
			id={styleKey}
			className={`comp compTableColumns ${styleKey}`}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			border={0}
			style={tableStyle}
		>
			{headers}
			<tbody
				className="_rowContainer"
				style={styleNormalProperties.rowContainer}
				role="rowgroup"
			>
				<style>{rowStyles}</style>
				{rows}
				{emptyRows}
			</tbody>
			<HelperComponent context={props.context} definition={definition} />
		</table>
	);
}

function getColumnNames({
	children,
	columnDef,
	locationHistory,
	pageExtractor,
}: {
	children: { [_: string]: boolean } | undefined;
	columnDef: any;
	locationHistory: LocationHistory[];
	pageExtractor: PageStoreExtractor;
}): Array<{
	key: string;
	label: string;
	order: number;
}> {
	if (!children) return [];

	const columnNames: Array<{
		key: string;
		label: string;
		order: number;
	}> = [];

	for (let [k, v] of Object.entries(children)) {
		if (!v) continue;
		const column = columnDef.componentDefinition[k];
		if (!column) continue;
		let value = column.properties?.label?.value;
		if (column.properties?.label?.location) {
			const location = column.properties.label.location;
			if (
				'type' in location &&
				(location.type === 'EXPRESSION' || location.type === 'VALUE')
			) {
				const newValue = getDataFromLocation(location, locationHistory, pageExtractor);
				if (!isNullValue(newValue)) value = newValue;
			}
		}
		columnNames.push({ key: k, label: value, order: column.displayOrder });
	}

	columnNames.sort((a, b) => a.order - b.order);
	return columnNames;
}

function resolvePropertiesOfDynamicColumns(
	pageDefinition: PageDefinition,
	pageExtractor: PageStoreExtractor,
	locationHistory: LocationHistory[],
) {
	let dynamicColumns = Object.values(pageDefinition.componentDefinition).filter(
		cd => cd?.type === 'TableDynamicColumn',
	);
	const listenPaths = new Array<string>();

	let columnsPageDefinition = pageDefinition;
	if (dynamicColumns.length > 0) {
		columnsPageDefinition = duplicate(pageDefinition);
		dynamicColumns = Object.values(columnsPageDefinition.componentDefinition).filter(
			cd => cd?.type === 'TableDynamicColumn',
		);

		const evaluatorMaps = new Map<string, TokenValueExtractor>([
			[storeExtractor.getPrefix(), storeExtractor],
			[fillerExtractor.getPrefix(), fillerExtractor],
			[localStoreExtractor.getPrefix(), localStoreExtractor],
		]);
		let tokenExtractors: TokenValueExtractor[] = [];

		if (pageExtractor) {
			evaluatorMaps.set(pageExtractor.getPrefix(), pageExtractor);
			tokenExtractors.push(pageExtractor);
		}

		let parentExtractor: ParentExtractor | undefined;

		if (locationHistory.length) {
			parentExtractor = new ParentExtractor(locationHistory);
			evaluatorMaps.set(parentExtractor.getPrefix(), parentExtractor);
			tokenExtractors.push(parentExtractor);
		}

		const propDefMap = tableDynamicColumnPropertiesDefinition.reduce((a: any, c) => {
			a[c.name] = c;
			return a;
		}, {});

		for (let dynamicColumn of dynamicColumns) {
			const paths = getPathsFromComponentDefinition(dynamicColumn, evaluatorMaps, propDefMap);
			if (!paths.length || !dynamicColumn.properties) continue;

			listenPaths.push(...paths);
			const properties = createNewState(
				dynamicColumn,
				tableDynamicColumnPropertiesDefinition,
				{},
				locationHistory,
				tokenExtractors,
			);
			Object.entries(properties).forEach(
				([key, value]) => (dynamicColumn.properties![key] = { value }),
			);
		}
	}
	return { dynamicColumns, columnsPageDefinition, listenPaths };
}

function generateRows(properties: {
	value: never[];
	from: any;
	to: any;
	showCheckBox: any;
	isSelected: (index: number) => boolean;
	select: (index: number) => void;
	multiSelect: any;
	selectionType: any;
	uniqueKey: any;
	data: any;
	columnDef: any;
	children: { [key: string]: boolean } | undefined;
	context: RenderContext;
	locationHistory: LocationHistory[];
	definition: ComponentDefinition;
	pageExtractor: PageStoreExtractor;
}) {
	const {
		value,
		from,
		to,
		showCheckBox,
		isSelected,
		select,
		multiSelect,
		selectionType,
		uniqueKey,
		data,
		columnDef,
		children,
		context,
		locationHistory,
		definition,
		pageExtractor,
	} = properties;

	const rows = [];

	for (let index = 0; index < value.length; index++) {
		if (index < from || index >= to) continue;
		const checkBox = showCheckBox ? (
			<td className="comp compTableColumn">
				<CommonCheckbox
					key="checkbox"
					isChecked={isSelected(index)}
					onChange={() => select(index)}
				/>
			</td>
		) : (
			<></>
		);

		const onClick = !multiSelect && selectionType !== 'NONE' ? () => select(index) : undefined;

		let key = undefined;

		if (uniqueKey) {
			let ev: ExpressionEvaluator = new ExpressionEvaluator(`Data.${uniqueKey}`);
			key = ev.evaluate(getExtractionMap(data?.[index]));
		}

		rows.push(
			<tr
				key={key}
				className={`_row _dataRow ${onClick ? '_pointer' : ''} ${isSelected(index) ? '_selected' : ''}`}
				onClick={onClick}
				tabIndex={onClick ? 0 : undefined}
				role="row"
			>
				{checkBox}
				<Children
					pageDefinition={columnDef}
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
			</tr>,
		);
	}

	return rows;
}

function generateTableColumnDefinitions(
	dynamicColumns: ComponentDefinition[],
	pageDefinition: PageDefinition,
	originalChildren: { [key: string]: boolean },
	context: RenderContext,
	personalizationObject: any,
) {
	const children = duplicate(originalChildren);

	let cp = pageDefinition;
	if (dynamicColumns.length > 0) {
		generateDynamicColumns(dynamicColumns, context, cp, children);

		let order = 1;
		for (const key of Object.entries(originalChildren)
			.filter(e => e[1])
			.map(e => e[0])
			.sort(
				(a, b) =>
					(cp.componentDefinition[a].displayOrder ?? 0) -
					(cp.componentDefinition[b].displayOrder ?? 0),
			)) {
			const component = cp.componentDefinition[key];

			if (component.type === 'TableColumn') {
				component.displayOrder = order++;
				continue;
			}

			if (component?.type !== 'TableDynamicColumn') continue;

			Object.keys(cp.componentDefinition)
				.filter(
					childKey =>
						childKey.startsWith(key) &&
						children?.hasOwnProperty(childKey) &&
						childKey !== key,
				)
				.sort(
					(a, b) =>
						(cp.componentDefinition[a].displayOrder ?? 0) -
						(cp.componentDefinition[b].displayOrder ?? 0),
				)
				.forEach(childKey => (cp.componentDefinition[childKey].displayOrder = order++));
		}
	}

	if (children && personalizationObject?.columnOrder) {
		if (!dynamicColumns.length) cp = duplicate(pageDefinition);
		Object.entries(children)
			.filter(([, v]) => v)
			.map(([k]) => cp.componentDefinition[k])
			.sort(
				(a, b) =>
					(personalizationObject.columnOrder[a.key] ?? a.displayOrder ?? 0) -
					(personalizationObject.columnOrder[b.key] ?? b.displayOrder ?? 0),
			)
			.forEach((cd, i) => (cd.displayOrder = i));
	}

	const hp = duplicate(cp);
	Object.keys(children ?? {})
		.map(k => hp?.componentDefinition[k])
		.filter(e => e?.type === 'TableColumn')
		.forEach(cd => (cd.type = 'TableColumnHeader'));

	return { headerDef: hp, columnDef: cp, children };
}

function generateDynamicColumns(
	dynamicColumns: ComponentDefinition[],
	context: RenderContext,
	cp: any,
	children: { [key: string]: boolean },
) {
	if (!children) return;

	let includeColumnsArray = [];
	let excludeColumnsArray = [];
	let columnsOrderArray = [];

	for (let dynamicColumn of dynamicColumns) {
		const key = dynamicColumn.key;
		const includeColumns = dynamicColumn?.properties?.includeColumns;
		if (includeColumns)
			includeColumnsArray = Object.values(includeColumns).map(col => col.property.value);

		const excludeColumns = dynamicColumn?.properties?.excludeColumns;
		if (excludeColumns)
			excludeColumnsArray = Object.values(excludeColumns).map(col => col.property.value);

		const dontShowOtherColumns = dynamicColumn?.properties?.dontShowOtherColumns;

		const columnsOrder = dynamicColumn?.properties?.columnsOrder;
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

		const sortColumns = dynamicColumn?.properties?.sortColumns;
		let sortColumnsArray = [];
		if (sortColumns)
			sortColumnsArray = Object.values(sortColumns).map(col => col.property.value);

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

			const styleProperties = dynamicColumn?.styleProperties
				? duplicate(dynamicColumn.styleProperties)
				: undefined;

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
				styleProperties,
				children: { [eachRenderer.key]: true },
			};

			if (
				dynamicColumn?.properties?.enableSorting?.value &&
				(!sortColumnsArray.length || sortColumnsArray.includes(eachField)) &&
				context.table.onSort
			) {
				eachChild.properties!.sortKey = {
					value: eachField,
				};
			}

			cp.componentDefinition[eachRenderer.key] = eachRenderer;
			cp.componentDefinition[eachChild.key] = eachChild;
			children[eachChild.key] = true;
		}
	}
}
