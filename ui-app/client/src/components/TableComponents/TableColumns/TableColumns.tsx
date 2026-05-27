import {
	deepEqual,
	duplicate,
	ExpressionEvaluator,
	isNullValue,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import React, { useEffect, useMemo, useState } from 'react';
import CommonCheckbox from '../../../commonComponents/CommonCheckbox';
import {
	addListenerWithChildrenActivity,
	addListenerAndCallImmediatelyWithChildrenActivity,
	fillerExtractor,
	getData,
	getDataFromLocation,
	getDataFromPath,
	localStoreExtractor,
	PageStoreExtractor,
	setData,
	storeExtractor,
	UrlDetailsExtractor,
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
import {
	getChildrenKeyAtDepth,
	getHasChildrenPropertyAtDepth,
	TreeKeyConfig,
} from '../Table/Table';
import { ParentExtractor } from '../../../context/ParentExtractor';
import { propertiesDefinition as tableDynamicColumnPropertiesDefinition } from '../TableDynamicColumn/tableDynamicColumnProperties';
import { propertiesDefinition as tableDynamicGroupedColumnPropertiesDefinition } from '../TableDynamicGroupedColumn/tableDynamicGroupedColumnProperties';
import { propertiesDefinition as tableRowPropertiesDefinition } from '../TableRow/tableRowProperties';
import { createNewState } from '../../util/useDefinition/commons';
import { getPathsFromComponentDefinition } from '../../util/getPaths';

// Progressive row rendering — renders rows in batches to avoid freezing the browser.
const INITIAL_BATCH = 5;
const PROGRESSIVE_BATCH = 3;

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

	const locationHistoryKey = (locationHistory ?? [])
		.map(
			e =>
				(typeof e.location === 'string'
					? e.location
					: (e.location?.expression ?? e.location?.value ?? '')) +
				'_' +
				e.index,
		)
		.join('|');

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: { showEmptyRows, showHeaders, fixedHeader, expandIcon, collapseIcon } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const [updateColumnsAt, setUpdateColumnsAt] = useState(Date.now());
	const updateColumnsAtTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const debouncedSetUpdateColumnsAt = React.useCallback(() => {
		if (updateColumnsAtTimerRef.current) clearTimeout(updateColumnsAtTimerRef.current);
		updateColumnsAtTimerRef.current = setTimeout(() => setUpdateColumnsAt(Date.now()), 50);
	}, []);

	useEffect(() => {
		if (!context.table.personalizationBindingPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			context.pageName,
			debouncedSetUpdateColumnsAt,
			context.table.personalizationBindingPath,
		);
	}, [
		context.table.personalizationBindingPath,
		context.table.enablePersonalization,
		debouncedSetUpdateColumnsAt,
		context.pageName,
	]);

	const { headerDef, columnDef, listenPaths, children, tableRowProps } = useMemo(() => {
		let { dynamicColumns, groupedColumns, columnsPageDefinition, listenPaths, tableRowProps } =
			resolvePropertiesOfDynamicColumns(
				pageDefinition,
				originalChildren ?? {},
				pageExtractor,
				urlExtractor,
				locationHistory,
			);

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
				groupedColumns,
				columnsPageDefinition,
				originalChildren ?? {},
				context,
				personalizationObject,
				locationHistory,
				pageExtractor,
			),
			listenPaths,
			tableRowProps,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		pageDefinition,
		updateColumnsAt,
		context.table.personalizationBindingPath,
		context.table.enablePersonalization,
		context.table.key,
		originalChildren,
		pageExtractor,
		locationHistoryKey,
		urlExtractor,
	]);

	const emptyRowPageDef = useMemo(() => {
		if (!showEmptyRows) return columnDef;
		const np = duplicate(columnDef);

		Object.keys(children ?? {})
			.map(k => np?.componentDefinition[k])
			.filter(e => e?.type === 'TableColumn')
			.forEach(cd => (cd.children = {}));

		return np;
	}, [columnDef, showEmptyRows, children]);

	useEffect(() => {
		if (!listenPaths.length) return;
		// Children-activity variant so listening to `Page.expandedStages` also
		// fires on `Page.expandedStages.s_<id>` writes (per-stage toggles).
		return addListenerWithChildrenActivity(
			context.pageName,
			debouncedSetUpdateColumnsAt,
			...listenPaths,
		);
	}, [debouncedSetUpdateColumnsAt, pageExtractor, listenPaths, context.pageName]);

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
		treeMode,
		childrenKey,
		hasChildrenProperty,
		expandedKeys,
		toggleExpand,
		showConnectors = true,
		indentSize = 20,
	} = props.context.table ?? {};

	useEffect(() => setValue(props.context.table?.data), [props.context.table?.data]);

	const [hover, setHover] = useState(false);

	const { columnChildren, tableRowChildKey } = useMemo(() => {
		const result: { [key: string]: boolean } = {};
		let rowKey: string | undefined = undefined;
		for (const [k, v] of Object.entries(children ?? {})) {
			if (!v) continue;
			if (columnDef.componentDefinition[k]?.type === 'TableRow') {
				rowKey = k;
			} else {
				result[k] = true;
			}
		}

		return { columnChildren: result, tableRowChildKey: rowKey };
	}, [children, columnDef]);

	const columnNames = useMemo(
		() =>
			getColumnNames({
				children: columnChildren,
				columnDef,
				locationHistory,
				pageExtractor,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[columnDef, locationHistoryKey, pageExtractor, columnChildren],
	);

	const [progressiveCount, setProgressiveCount] = useState(INITIAL_BATCH);
	const progressiveRowRef = React.useRef<number>(0);

	useEffect(() => {
		if (!Array.isArray(value)) return;
		const totalRows = progressiveRowRef.current;
		if (totalRows <= INITIAL_BATCH) {
			setProgressiveCount(totalRows);
			return;
		}
		if (progressiveCount >= totalRows) return;
		const timer = setTimeout(() => {
			setProgressiveCount(prev => Math.min(prev + PROGRESSIVE_BATCH, totalRows));
		}, 0);
		return () => clearTimeout(timer);
		// expandedKeys is included so that expanding/collapsing a tree node
		// (which grows/shrinks the flattened row count assigned to
		// progressiveRowRef.current later in render) re-fires this ramp. The
		// ref alone can't trigger it: its dep value is read above, before the
		// render assigns the new total, so it always lags one render behind.
	}, [progressiveCount, progressiveRowRef.current, value, expandedKeys]);

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

	const rowColSpan = columnNames.length + (showCheckBox ? 1 : 0);
	const firstColumnKey = treeMode && columnNames.length > 0 ? columnNames[0].key : undefined;

	const treeStyles = treeMode
		? {
				normal: {
					treeExpandButton: styleNormalProperties.treeExpandButton,
					treeCollapseButton: styleNormalProperties.treeCollapseButton,
					treeLines: styleNormalProperties.treeLines,
					treeCell: styleNormalProperties.treeCell,
				},
				hover: {
					treeExpandButton: styleHoverProperties.treeExpandButton,
					treeCollapseButton: styleHoverProperties.treeCollapseButton,
					treeLines: styleHoverProperties.treeLines,
					treeCell: styleHoverProperties.treeCell,
				},
			}
		: undefined;

	let rows: any[] = [];
	let treeRowCount = 0;
	if (treeMode && expandedKeys && toggleExpand) {
		const flattenedRows = flattenTree({
			nodes: value,
			childrenKey,
			uniqueKey: uniqueKey ?? 'id',
			hasChildrenProperty,
			expandedKeys,
			depth: 0,
			parentPath: [],
			basePath: '',
		});

		treeRowCount = flattenedRows.length;

		rows = generateTreeRows({
			flattenedRows,
			showCheckBox,
			isSelected,
			select,
			multiSelect,
			selectionType,
			uniqueKey,
			data,
			columnDef,
			children: columnChildren,
			context: { ...context, table: { ...context.table, rowColSpan } },
			locationHistory,
			definition,
			pageExtractor,
			showConnectors,
			indentSize,
			expandIcon,
			collapseIcon,
			toggleExpand,
			dataBindingPath,
			firstColumnKey,
			treeStyles,
		});
	} else {
		rows = generateRows({
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
			children: columnChildren,
			context: { ...context, table: { ...context.table, rowColSpan } },
			locationHistory,
			definition,
			pageExtractor,
			tableRowChildKey,
			tableRowProps,
			urlExtractor,
		});
	}

	progressiveRowRef.current = rows?.length ?? 0;

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
						renderableChildren={columnChildren}
						context={{ ...context, table: { ...context.table, columnNames } }}
						locationHistory={locationHistory}
					/>
				</tr>
			</thead>
		);
	}

	if (treeMode && treeRowCount > 0) {
		emptyCount = pageSize - treeRowCount;
		if (emptyCount < 0 || !showEmptyRows) emptyCount = 0;
	}

	const emptyRows = [];
	if (emptyCount) {
		for (let i = 0; i < emptyCount; i++) {
			emptyRows.push(
				<tr key={`emptyRow_${i}`} className="_row" style={styleNormalProperties.row}>
					<Children
						pageDefinition={emptyRowPageDef}
						renderableChildren={columnChildren}
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

	const visibleRows = rows?.length > INITIAL_BATCH ? rows?.slice(0, progressiveCount) : rows;

	return (
		<table
			id={styleKey}
			className={`comp compTableColumns ${styleKey} ${fixedHeader ? '_fixedHeader' : ''}`}
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
				{visibleRows}
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
	children: { [key: string]: boolean },
	pageExtractor: PageStoreExtractor,
	urlExtractor: any,
	locationHistory: LocationHistory[],
) {
	const childrenKeys = Object.keys(children).filter(k => children[k]);

	let dynamicColumns = childrenKeys
		.map(k => pageDefinition.componentDefinition[k])
		.filter(cd => cd?.type === 'TableDynamicColumn');

	let groupedColumns = childrenKeys
		.map(k => pageDefinition.componentDefinition[k])
		.filter(cd => cd?.type === 'TableDynamicGroupedColumn');

	let tableRowComp = childrenKeys
		.map(k => pageDefinition.componentDefinition[k])
		.find(cd => cd?.type === 'TableRow');

	const listenPaths = new Array<string>();
	let tableRowProps: any = undefined;

	let columnsPageDefinition = pageDefinition;
	if (dynamicColumns.length > 0 || groupedColumns.length > 0 || tableRowComp) {
		columnsPageDefinition = duplicate(pageDefinition);
		dynamicColumns = childrenKeys
			.map(k => columnsPageDefinition.componentDefinition[k])
			.filter(cd => cd?.type === 'TableDynamicColumn');
		groupedColumns = childrenKeys
			.map(k => columnsPageDefinition.componentDefinition[k])
			.filter(cd => cd?.type === 'TableDynamicGroupedColumn');
		tableRowComp = childrenKeys
			.map(k => columnsPageDefinition.componentDefinition[k])
			.find(cd => cd?.type === 'TableRow');

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

		if (urlExtractor) {
			evaluatorMaps.set(urlExtractor.getPrefix(), urlExtractor);
			tokenExtractors.push(urlExtractor);
		}

		let parentExtractor: ParentExtractor | undefined;

		if (locationHistory.length) {
			parentExtractor = new ParentExtractor(locationHistory);
			evaluatorMaps.set(parentExtractor.getPrefix(), parentExtractor);
			tokenExtractors.push(parentExtractor);
		}

		if (dynamicColumns.length) {
			const propDefMap = tableDynamicColumnPropertiesDefinition.reduce((a: any, c) => {
				a[c.name] = c;
				return a;
			}, {});

			for (let dynamicColumn of dynamicColumns) {
				const paths = getPathsFromComponentDefinition(
					dynamicColumn,
					evaluatorMaps,
					propDefMap,
				);
				if (!paths.length || !dynamicColumn.properties) continue;

				listenPaths.push(...paths);
				const properties = createNewState(
					dynamicColumn,
					tableDynamicColumnPropertiesDefinition,
					{},
					locationHistory,
					tokenExtractors,
				);
				if (properties.properties) {
					Object.entries(properties.properties).forEach(
						([key, value]) => (dynamicColumn.properties![key] = { value }),
					);
				}
			}
		}

		if (groupedColumns.length) {
			const propDefMap = tableDynamicGroupedColumnPropertiesDefinition.reduce(
				(a: any, c) => {
					a[c.name] = c;
					return a;
				},
				{},
			);

			for (let groupedColumn of groupedColumns) {
				const paths = getPathsFromComponentDefinition(
					groupedColumn,
					evaluatorMaps,
					propDefMap,
				);
				if (paths.length) listenPaths.push(...paths);

				// Also listen to the per-stage expanded-state path so a header
				// click that toggles Page.expandedStages forces a re-render and
				// the substage columns appear/disappear.
				const expandedPath =
					(groupedColumn as any).properties?.expandedGroupsPath?.value ??
					'Page.expandedStages';
				if (typeof expandedPath === 'string' && expandedPath.length > 0) {
					listenPaths.push(expandedPath);
				}

				const properties = createNewState(
					groupedColumn,
					tableDynamicGroupedColumnPropertiesDefinition,
					{},
					locationHistory,
					tokenExtractors,
				);
				if (properties.properties && groupedColumn.properties) {
					Object.entries(properties.properties).forEach(
						([key, value]) => (groupedColumn.properties![key] = { value }),
					);
				} else if (properties.properties) {
					groupedColumn.properties = Object.fromEntries(
						Object.entries(properties.properties).map(([k, v]) => [k, { value: v }]),
					) as any;
				}
			}
		}

		if (tableRowComp) {
			const propDefMap = tableRowPropertiesDefinition.reduce((a: any, c) => {
				a[c.name] = c;
				return a;
			}, {});

			const paths = getPathsFromComponentDefinition(tableRowComp, evaluatorMaps, propDefMap);
			listenPaths.push(...paths);

			const state = createNewState(
				tableRowComp,
				tableRowPropertiesDefinition,
				{},
				locationHistory,
				tokenExtractors,
			);
			tableRowProps = state.properties;

			if (tableRowComp.properties && tableRowProps) {
				Object.entries(tableRowProps).forEach(([key, value]) => {
					if (key === 'visibility') return;
					tableRowComp!.properties![key] = { value };
				});
			}
		}
	}
	return { dynamicColumns, groupedColumns, columnsPageDefinition, listenPaths, tableRowProps };
}

function generateRows(properties: {
	value: any[];
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
	tableRowChildKey?: string;
	tableRowProps?: any;
	urlExtractor: any;
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
		tableRowChildKey,
		tableRowProps,
		urlExtractor,
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

		const rowClassName = `_row _dataRow ${onClick ? '_pointer' : ''} ${isSelected(index) ? '_selected' : ''}`;

		rows.push(
			<tr
				key={key}
				className={rowClassName}
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

		let tableRowElement = null;
		if (tableRowChildKey) {
			const tableRowDefinition = columnDef.componentDefinition[tableRowChildKey];
			const rowLocationHistory = [
				...locationHistory,
				updateLocationForChild(
					definition.key,
					context.table?.bindingPath,
					index,
					locationHistory,
					context.pageName,
					pageExtractor,
				),
			];

			const isVisible =
				getData(
					tableRowDefinition?.properties?.visibility,
					rowLocationHistory,
					pageExtractor,
					urlExtractor,
				) ?? true;

			if (isVisible) {
				tableRowElement = (
					<tr key={`${key}_tableRow`} className="_detailRow" role="row">
						<Children
							pageDefinition={columnDef}
							renderableChildren={{ [tableRowChildKey]: true }}
							context={{
								...context,
								table: { ...context.table, isSelected: isSelected(index) },
							}}
							locationHistory={rowLocationHistory}
						/>
					</tr>
				);
			}
		}

		if (tableRowElement) {
			if (tableRowProps?.rowPosition === 'ABOVE') {
				rows.splice(rows.length - 1, 0, tableRowElement);
			} else {
				rows.push(tableRowElement);
			}
		}
	}

	return rows;
}

function generateTableColumnDefinitions(
	dynamicColumns: ComponentDefinition[],
	groupedColumns: ComponentDefinition[],
	pageDefinition: PageDefinition,
	originalChildren: { [key: string]: boolean },
	context: RenderContext,
	personalizationObject: any,
	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
) {
	const children = duplicate(originalChildren);

	let cp = pageDefinition;
	if (dynamicColumns.length > 0 || groupedColumns.length > 0) {
		if (dynamicColumns.length > 0) generateDynamicColumns(dynamicColumns, context, cp, children);
		if (groupedColumns.length > 0)
			generateGroupedDynamicColumns(
				groupedColumns,
				cp,
				children,
				locationHistory,
				pageExtractor,
			);

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

			if (
				component?.type !== 'TableDynamicColumn' &&
				component?.type !== 'TableDynamicGroupedColumn'
			)
				continue;

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

		let allKeys: Set<string>;
		if (context.table.treeMode) {
			allKeys = collectAllKeysFromTree(context.table.data ?? [], context.table.childrenKey);
		} else {
			allKeys = (context.table.data ?? []).reduce((a: Set<string>, c: any) => {
				if (!c) return a;
				for (const eachKey of Object.keys(c)) a.add(eachKey);
				return a;
			}, new Set<string>());
		}
		let columns = Array.from<string>(allKeys);

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

/**
 * Walks the group tree binding for every TableDynamicGroupedColumn child and
 * synthesises one TableColumn per (leaf × sub-cell field) into the page
 * definition. Each synthesised column gets a Text renderer reading
 * {@code Parent.<cellPathTemplate(leafId)>.<subField>}. Labels embed the
 * parent-group / leaf / sub-cell hierarchy inline (single header row) — true
 * multi-row colspan grouping is a follow-up that needs deeper Table renderer
 * changes.
 */
function generateGroupedDynamicColumns(
	groupedColumns: ComponentDefinition[],
	cp: any,
	children: { [key: string]: boolean },
	locationHistory: LocationHistory[],
	pageExtractor: PageStoreExtractor,
) {
	if (!children) return;

	for (const gc of groupedColumns) {
		const key = gc.key;
		const propValue = (name: string, dflt: any) =>
			(gc as any).properties?.[name]?.value ?? dflt;
		const idField = String(propValue('idField', 'id'));
		const labelField = String(propValue('labelField', 'name'));
		const childrenField = String(propValue('childrenField', 'children'));
		const cellPathTemplate = String(propValue('cellPathTemplate', 'stageCells.{id}'));
		const subCellFields: string[] = String(propValue('subCellFields', 'count,cpl'))
			.split(',')
			.map((s: string) => s.trim())
			.filter(Boolean);
		const subCellLabels: string[] = String(propValue('subCellLabels', 'Count,CPL'))
			.split(',')
			.map((s: string) => s.trim());

		// Page-state path holding the per-stage expanded flags. Default
		// `Page.expandedStages` — keyed by stageId → truthy when expanded.
		const expandedGroupsPath = String(
			propValue('expandedGroupsPath', 'Page.expandedStages'),
		);
		const expandedMap =
			getDataFromPath(expandedGroupsPath, locationHistory, pageExtractor) ?? {};

		const bp = (gc as any).bindingPath as { type?: string; value?: string } | undefined;
		if (!bp || !bp.value) continue;
		const tree = getDataFromPath(bp.value, locationHistory, pageExtractor);
		if (!Array.isArray(tree) || tree.length === 0) continue;

		const styleProperties = (gc as any).styleProperties
			? duplicate((gc as any).styleProperties)
			: undefined;

		let order = 0;

		// Synthesize a 1-step toggle event function on the page def for the
		// given stage id. SetStore writes `not Page.expandedStages.<id>` to the
		// same path, so the value flips between truthy and falsy on each click.
		// Returns the synthesized event-function key so the column can wire its
		// headerOnClick to it.
		const synthToggleEventKey = (stageId: any): string => {
			// Prefix with `s_` so numeric stage ids (e.g. 66) don't get treated as
			// array indices by the SetStore path resolver — which would replace
			// the expandedStages object with a sparse array.
			const safe = `s_${String(stageId).replace(/[^a-zA-Z0-9]/g, '')}`;
			const efKey = `__expandToggle_${key}_${safe}`;
			if (!cp.eventFunctions) cp.eventFunctions = {};
			if (!cp.eventFunctions[efKey]) {
				const togglePath = `${expandedGroupsPath}.${safe}`;
				cp.eventFunctions[efKey] = {
					key: efKey,
					name: efKey,
					steps: {
						toggle: {
							statementName: 'toggle',
							name: 'SetStore',
							namespace: 'UIEngine',
							parameterMap: {
								path: {
									k1: {
										key: 'k1',
										type: 'VALUE',
										value: togglePath,
										order: 1,
									},
								},
								value: {
									k2: {
										key: 'k2',
										type: 'EXPRESSION',
										expression: `not ${togglePath}`,
										order: 1,
									},
								},
							},
							dependentStatements: {},
						},
					},
				};
			}
			return efKey;
		};

		// Emit one TableColumn pair per (node, subField). For every parent group we
		// emit a rollup column first, then one column per substage. Tickets often
		// sit at the parent stage itself (not a leaf), so without the parent column
		// the data is invisible to users.
		const emitColumnsFor = (
			node: any,
			parentLabel: string | undefined,
			toggleEfKey: string | undefined,
			isExpanded: boolean,
		) => {
			const nid = (node as any)[idField];
			const nname = (node as any)[labelField] ?? '';
			const cellPath = cellPathTemplate.replace('{id}', String(nid));
			const safeId = String(nid).replace(/[^a-zA-Z0-9]/g, '');

			for (let i = 0; i < subCellFields.length; i++) {
				const sf = subCellFields[i];
				const sl = subCellLabels[i] ?? sf;

				const rendererKey = `${key}_${safeId}_${sf}_renderer`;
				cp.componentDefinition[rendererKey] = {
					key: rendererKey,
					type: 'Text',
					name: `${nname}_${sf}`,
					properties: {
						text: {
							location: {
								type: 'EXPRESSION',
								expression: `Parent.${cellPath}.${sf}`,
							},
						},
					},
				};

				const colKey = `${key}_${safeId}_${sf}`;
				// Prefix the first sub-cell column of a clickable parent with a
				// chevron so users see the column group is expandable.
				const chevron = toggleEfKey && i === 0 ? (isExpanded ? '▾ ' : '▸ ') : '';
				const labelStr = parentLabel
					? `${parentLabel} › ${nname} · ${sl}`
					: `${chevron}${nname} · ${sl}`;
				const colProps: any = { label: { value: labelStr } };
				if (toggleEfKey) colProps.headerOnClick = { value: toggleEfKey };
				cp.componentDefinition[colKey] = {
					key: colKey,
					type: 'TableColumn',
					name: `${parentLabel ? parentLabel + '_' : ''}${nname}_${sf}`,
					displayOrder: order++,
					properties: colProps,
					styleProperties,
					children: { [rendererKey]: true },
				};
				children[colKey] = true;
			}
		};

		// Legacy global override — when set, ignore per-stage state and force
		// every parent to render its substages. Kept for callers that want the
		// flat-expanded look without wiring toggle UI.
		const forceExpandAll = !!propValue('expandSubstages', false);

		for (const group of tree) {
			if (!group) continue;
			const gid = (group as any)[idField];
			const gname = (group as any)[labelField] ?? '';
			const rawLeaves = (group as any)[childrenField];
			const hasLeaves = Array.isArray(rawLeaves) && rawLeaves.length > 0;

			// Only wire a toggle when the parent actually has substages — clicking
			// a leaf-only "parent" is a no-op.
			const toggleEfKey = hasLeaves ? synthToggleEventKey(gid) : undefined;

			const isExpanded =
				forceExpandAll ||
				!!expandedMap?.[`s_${String(gid).replace(/[^a-zA-Z0-9]/g, '')}`];

			// Parent group: rollup column. Wire headerOnClick to the toggle and
			// pass isExpanded so the chevron reflects current state.
			emitColumnsFor(group, undefined, toggleEfKey, isExpanded);

			// Substage columns only when this parent is expanded. Default state is
			// "collapsed" — only parent rollups are visible until the user clicks.
			if (hasLeaves && isExpanded) {
				for (const leaf of rawLeaves) {
					if (leaf) emitColumnsFor(leaf, gname, undefined, false);
				}
			}
		}
	}
}

// Tree mode types and helpers

interface FlattenedRow {
	node: any;
	depth: number;
	hasChildren: boolean;
	isExpanded: boolean;
	isFirstChild: boolean;
	isLastChild: boolean;
	parentPath: boolean[];
	dataPath: string;
	nodeKey: string;
}

interface FlattenTreeParams {
	nodes: any[];
	childrenKey: TreeKeyConfig;
	uniqueKey: string;
	hasChildrenProperty: TreeKeyConfig;
	expandedKeys: Set<string>;
	depth: number;
	parentPath: boolean[];
	basePath: string;
}

function flattenTree(params: FlattenTreeParams): FlattenedRow[] {
	const {
		nodes,
		childrenKey,
		uniqueKey,
		hasChildrenProperty,
		expandedKeys,
		depth,
		parentPath,
		basePath,
	} = params;
	const ck = getChildrenKeyAtDepth(childrenKey, depth);
	const hcp = getHasChildrenPropertyAtDepth(hasChildrenProperty, depth);
	const result: FlattenedRow[] = [];
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (!node) continue;
		const nodeKey = String(node[uniqueKey] ?? `${basePath}[${i}]`);
		const isFirst = i === 0;
		const isLast = i === nodes.length - 1;
		const nodeChildren = node[ck];
		const hasChildrenByArray = Array.isArray(nodeChildren) && nodeChildren.length > 0;
		const hasChildrenByProp = hcp ? !!node[hcp] : false;
		const hasChildren = hasChildrenByArray || hasChildrenByProp;
		const isExpanded = expandedKeys.has(nodeKey);
		const currentPath = `${basePath}[${i}]`;

		result.push({
			node,
			depth,
			hasChildren,
			isExpanded,
			isFirstChild: isFirst,
			isLastChild: isLast,
			parentPath: [...parentPath],
			dataPath: currentPath,
			nodeKey,
		});

		if (hasChildrenByArray && isExpanded) {
			result.push(
				...flattenTree({
					nodes: nodeChildren,
					childrenKey,
					uniqueKey,
					hasChildrenProperty,
					expandedKeys,
					depth: depth + 1,
					parentPath: [...parentPath, !isLast],
					basePath: `${currentPath}.${ck}`,
				}),
			);
		}
	}
	return result;
}

function collectAllKeysFromTree(data: any[], childrenKey: TreeKeyConfig): Set<string> {
	const keys = new Set<string>();
	let childKeyList: string[];
	if (Array.isArray(childrenKey)) childKeyList = childrenKey.filter(Boolean);
	else if (childrenKey) childKeyList = [childrenKey];
	else childKeyList = ['children'];
	const childKeySet = new Set<string>(childKeyList);
	const walk = (nodes: any[], depth: number) => {
		const ck = getChildrenKeyAtDepth(childrenKey, depth);
		for (const node of nodes) {
			if (!node) continue;
			for (const k of Object.keys(node)) {
				if (!childKeySet.has(k)) keys.add(k);
			}
			if (Array.isArray(node[ck])) walk(node[ck], depth + 1);
		}
	};
	walk(data, 0);
	return keys;
}

function generateTreeRows(properties: {
	flattenedRows: FlattenedRow[];
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
	showConnectors: boolean;
	indentSize: number;
	expandIcon: string | undefined;
	collapseIcon: string | undefined;
	toggleExpand: (nodeKey: string, dataPath: string) => void;
	dataBindingPath: string;
	firstColumnKey: string | undefined;
	treeStyles: any;
}) {
	const {
		flattenedRows,
		showCheckBox,
		isSelected,
		select,
		multiSelect,
		selectionType,
		columnDef,
		children,
		context,
		locationHistory,
		definition,
		showConnectors,
		indentSize,
		expandIcon,
		collapseIcon,
		toggleExpand,
		dataBindingPath,
		firstColumnKey,
		treeStyles,
	} = properties;

	const rows: React.ReactNode[] = [];

	for (let i = 0; i < flattenedRows.length; i++) {
		const row = flattenedRows[i];
		const checkBox = showCheckBox ? (
			<td className="comp compTableColumn">
				<CommonCheckbox
					key="checkbox"
					isChecked={isSelected(i)}
					onChange={() => select(i)}
				/>
			</td>
		) : (
			<></>
		);

		const onClick = !multiSelect && selectionType !== 'NONE' ? () => select(i) : undefined;

		const rowLocationHistory: LocationHistory[] = [
			...locationHistory,
			{
				location: {
					type: 'EXPRESSION' as const,
					expression: `${dataBindingPath}${row.dataPath}`,
				},
				index: row.nodeKey,
				pageName: context.pageName,
				componentKey: definition.key,
			},
		];

		const rowContext = {
			...context,
			table: {
				...context.table,
				treeRowData: row,
				firstColumnKey,
				showConnectors,
				indentSize,
				expandIcon,
				collapseIcon,
				toggleExpand,
				treeStyles,
				columnsDefinition: definition,
			},
		};

		const rowClassName = `_row _dataRow _treeDepth${row.depth} ${onClick ? '_pointer' : ''} ${isSelected(i) ? '_selected' : ''}`;

		rows.push(
			<tr
				key={row.nodeKey}
				className={rowClassName}
				onClick={onClick}
				tabIndex={onClick ? 0 : undefined}
				role="row"
			>
				{checkBox}
				<Children
					pageDefinition={columnDef}
					renderableChildren={children}
					context={rowContext}
					locationHistory={rowLocationHistory}
				/>
			</tr>,
		);
	}

	return rows;
}
