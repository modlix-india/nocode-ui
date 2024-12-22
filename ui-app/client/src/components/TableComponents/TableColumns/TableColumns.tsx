import { deepEqual, duplicate, ExpressionEvaluator, TokenValueExtractor } from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import CommonCheckbox from '../../../commonComponents/CommonCheckbox';
import {
	addListener,
	fillerExtractor,
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
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
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

	const [pathsUpdatedAt, setPathsUpdatedAt] = useState(Date.now());

	const { headerDef, columnDef, listenPaths } = useMemo(() => {
		let { dynamicColumns, columnsPageDefinition, listenPaths } =
			resolvePropertiesOfDynamicColumns(pageDefinition, pageExtractor, locationHistory);

		return {
			...generateTableColumnDefinitions(
				dynamicColumns,
				columnsPageDefinition,
				children,
				context,
			),
			listenPaths,
		};
	}, [pageDefinition, pathsUpdatedAt]);

	useEffect(() => {
		if (!listenPaths.length) return;
		addListener(() => setPathsUpdatedAt(Date.now()), pageExtractor, ...listenPaths);
	}, [setPathsUpdatedAt, pageExtractor, listenPaths]);

	const emptyRowPageDef = useMemo(() => {
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
		stylePropertiesWithPseudoStates,
		setHoverRow,
		hoverRow,
		styleHoverProperties,
		styleNormalProperties,
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
			<div
				className="_row"
				style={(hover ? styleHoverProperties : styleNormalProperties).header}
			>
				{checkBoxTop}
				<Children
					pageDefinition={headerDef}
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
						pageDefinition={emptyRowPageDef}
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
			role="table"
		>
			<HelperComponent context={props.context} definition={definition} />
			{headers}
			{rows}
			{emptyRows}
		</div>
	);
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
	stylePropertiesWithPseudoStates: any;
	setHoverRow: any;
	hoverRow: number;
	styleHoverProperties: any;
	styleNormalProperties: any;
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
		stylePropertiesWithPseudoStates,
		setHoverRow,
		hoverRow,
		styleHoverProperties,
		styleNormalProperties,
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

		rows.push(
			<div
				key={key}
				className={`_row _dataRow ${onClick ? '_pointer' : ''} ${isSelected(index) ? '_selected' : ''}`}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHoverRow(index) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHoverRow(-1) : undefined
				}
				onClick={onClick}
				style={(hoverRow === index ? styleHoverProperties : styleNormalProperties).row}
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
			</div>,
		);
	}

	return rows;
}

function generateTableColumnDefinitions(
	dynamicColumns: ComponentDefinition[],
	pageDefinition: PageDefinition,
	children: { [key: string]: boolean } | undefined,
	context: RenderContext,
) {
	let cp = pageDefinition;
	if (dynamicColumns.length > 0) {
		generateDynamicColumns(dynamicColumns, context, cp, children);
		const displayOrderMap = new Map();

		for (const key of Object.keys(cp.componentDefinition)) {
			const component = cp.componentDefinition[key];
			if (
				component &&
				(component.name === 'TableDynamicColumn' || component.name === 'TableColumn')
			) {
				const displayOrder = component.displayOrder ?? 0;
				displayOrderMap.set(key, displayOrder);
			}

			const sortedEntries = Array.from(displayOrderMap.entries()).sort((a, b) => a[1] - b[1]);

			const newarr = sortedEntries.flatMap(([key]) => {
				const columnType = cp.componentDefinition[key]?.type;

				if (columnType === 'TableColumn') {
					return [key];
				} else if (columnType === 'TableDynamicColumn') {
					const childrenKeys = Object.keys(cp.componentDefinition || {}).filter(
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
				cp.componentDefinition[key].displayOrder = index + 1;
			});
		}
	}

	const hp = duplicate(cp);
	Object.keys(children ?? {})
		.map(k => hp?.componentDefinition[k])
		.filter(e => e?.type === 'TableColumn')
		.forEach(cd => (cd.type = 'TableColumnHeader'));

	return { headerDef: hp, columnDef: cp };
}

function generateDynamicColumns(
	dynamicColumns: ComponentDefinition[],
	context: RenderContext,
	cp: any,
	children: { [key: string]: boolean } | undefined,
) {
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
			children![eachChild.key] = true;
		}
	}
}
