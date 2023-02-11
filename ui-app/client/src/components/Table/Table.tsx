import React, { useEffect, useState } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableProperties';
import TableStyle from './TableStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { flattenUUID } from '../util/uuid';

function spinCalculate(
	spinnerPath1: string | undefined,
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
	props: ComponentProps,
	spinnerPath2: string | undefined,
	pageExtractor: PageStoreExtractor,
): React.EffectCallback {
	return () => {
		let sp1: () => void;
		if (spinnerPath1) {
			sp1 = addListenerAndCallImmediately(
				() =>
					setIsLoading(
						(spinnerPath1
							? getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ??
							  false
							: false) ||
							(spinnerPath2
								? getDataFromPath(
										spinnerPath2,
										props.locationHistory,
										pageExtractor,
								  ) ?? false
								: false),
					),
				pageExtractor,
				spinnerPath1,
			);
		}

		let sp2: () => void;
		if (spinnerPath2) {
			sp2 = addListenerAndCallImmediately(
				() =>
					setIsLoading(
						(spinnerPath1
							? getDataFromPath(spinnerPath1, props.locationHistory, pageExtractor) ??
							  false
							: false) ||
							(spinnerPath2
								? getDataFromPath(
										spinnerPath2,
										props.locationHistory,
										pageExtractor,
								  ) ?? false
								: false),
					),
				pageExtractor,
				spinnerPath2,
			);
		}

		return () => {
			if (sp1) sp1();
			if (sp2) sp2();
		};
	};
}

function TableComponent(props: ComponentProps) {
	const {
		definition: {
			children,
			bindingPath,
			bindingPath2,
			bindingPath3,
			bindingPath4,
			bindingPath5,
		},
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			offlineData,
			showSpinner,
			showPagination,
			uniqueKey,
			selectionType,
			multiSelect,
			displayMode,
			defaultSize,
			previewMode,
			previewGridPosition,
			tableDesign,
			paginationPosition,
			totalPages,
			onSelect,
			onPagination,
		} = {},
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const dataBindingPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	const selectionBindingPath =
		bindingPath2 && getPathFromLocation(bindingPath2, locationHistory, pageExtractor);

	const pageNumberBindingPath =
		bindingPath3 && getPathFromLocation(bindingPath3, locationHistory, pageExtractor);

	const pageSizeBindingPath =
		bindingPath4 && getPathFromLocation(bindingPath4, locationHistory, pageExtractor);

	const tableModeBindingPath =
		bindingPath5 && getPathFromLocation(bindingPath5, locationHistory, pageExtractor);

	const [data, setData] = useState<any>();

	useEffect(
		() =>
			dataBindingPath
				? addListenerAndCallImmediately(
						(_, v) => setData(v),
						pageExtractor,
						dataBindingPath,
				  )
				: undefined,
		[dataBindingPath],
	);

	const selectEvent = onSelect ? props.pageDefinition.eventFunctions[onSelect] : undefined;
	const spinnerPath1 = onSelect
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onSelect,
		  )}.isRunning`
		: undefined;

	const paginationEvent = onPagination
		? props.pageDefinition.eventFunctions[onPagination]
		: undefined;
	const spinnerPath2 = onPagination
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onPagination,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(false);

	useEffect(spinCalculate(spinnerPath1, setIsLoading, props, spinnerPath2, pageExtractor), [
		spinnerPath1,
		spinnerPath2,
	]);

	const spinner = isLoading && showSpinner ? <div className="_spinner"></div> : undefined;

	const [mode, setMode] = useState(
		(tableModeBindingPath
			? getDataFromPath(tableModeBindingPath, props.locationHistory)
			: displayMode) ?? displayMode,
	);

	useEffect(
		() =>
			tableModeBindingPath
				? addListenerAndCallImmediately(
						(_, v) => setMode(v ?? displayMode),
						pageExtractor,
						tableModeBindingPath,
				  )
				: undefined,
		[tableModeBindingPath],
	);

	const [pageSize, setPageSize] = useState(defaultSize);

	useEffect(
		() =>
			pageSizeBindingPath
				? addListenerAndCallImmediately(
						(_, v) => setPageSize(v),
						pageExtractor,
						pageSizeBindingPath,
				  )
				: undefined,
		[pageSizeBindingPath],
	);

	const [pageNumber, setPageNumber] = useState(0);

	useEffect(
		() =>
			pageNumberBindingPath
				? addListenerAndCallImmediately(
						(_, v) => setPageNumber(v),
						pageExtractor,
						pageNumberBindingPath,
				  )
				: undefined,
		[pageNumberBindingPath],
	);

	let body;
	const childrenEntries = Object.entries(children ?? {}).filter(e => e[1]);
	const [selection, setSelection] = useState<any>();

	if (!isLoading && !data?.length) {
		const entry = childrenEntries.filter(
			([k]) => pageDefinition.componentDefinition[k].type === 'TableEmptyGrid',
		);
		if (entry?.length) {
			body = (
				<Children
					pageDefinition={pageDefinition}
					children={{ [entry[0][0]]: true }}
					context={context}
					locationHistory={locationHistory}
				/>
			);
		}
	}
	useEffect(
		() =>
			selectionBindingPath
				? addListenerAndCallImmediately((_, v) => setSelection(v))
				: undefined,
		[selectionBindingPath],
	);

	if (!body) {
		let previewChild;
		if (selection) {
			if (previewMode === 'BOTH' || previewMode === mode) {
				previewChild = childrenEntries
					.filter(
						([k]) => pageDefinition.componentDefinition[k].type === 'TablePreviewGrid',
					)
					.map(([k]) => k)
					.find(() => true);
			}
		}

		let gridChild, columnsChild;
		for (let i = 0; i < childrenEntries.length && !gridChild && !columnsChild; i++) {
			const k = childrenEntries[i][0];
			if (pageDefinition.componentDefinition[k].type === 'TableColumns') {
				columnsChild = k;
			} else if (pageDefinition.componentDefinition[k].type === 'TableGrid') {
				gridChild = k;
			}
		}
		let selectedChild = columnsChild;
		if (gridChild && (!columnsChild || mode === 'GRID')) {
			selectedChild = gridChild;
		}

		let from = offlineData ? pageNumber * pageSize : 0;
		let to = offlineData ? (pageNumber + 1) * pageSize : pageSize;

		let mainBody = selectedChild ? (
			<Children
				pageDefinition={pageDefinition}
				children={{ [selectedChild]: true }}
				context={{
					...context,
					table: {
						data,
						bindingPath,
						dataBindingPath,
						from,
						to,
						selectionBindingPath,
						selectionType,
						multiSelect,
						pageSize,
						uniqueKey,
					},
				}}
				locationHistory={locationHistory}
			/>
		) : (
			<></>
		);

		if (previewChild) {
			body = (
				<>
					<Children
						pageDefinition={pageDefinition}
						children={{ [previewChild]: true }}
						context={{
							...context,
							table: {
								data,
								bindingPath,
								dataBindingPath,
								from,
								to,
								selectionBindingPath,
								selectionType,
								multiSelect,
								pageSize,
								uniqueKey,
							},
						}}
						locationHistory={locationHistory}
					/>
					{mainBody}
				</>
			);
		} else {
			body = mainBody;
		}
	}

	return (
		<div className={`comp compTable ${tableDesign} ${previewGridPosition}`}>
			<HelperComponent definition={definition} />
			{body}
			{spinner}
		</div>
	);
}

const component: Component = {
	name: 'Table',
	displayName: 'Table',
	description: 'Table component',
	component: TableComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableStyle,
	hasChildren: true,
	allowedChildrenType: new Map([
		['TableEmptyGrid', 1],
		['TableColumns', 1],
		['TableGrid', 1],
		['TablePreviewGrid', 1],
	]),
	bindingPaths: {
		bindingPath: { name: 'Array Binding' },
		bindingPath2: { name: 'Selection Binding' },
		bindingPath3: { name: 'Page Number Binding' },
		bindingPath4: { name: 'Page Size Binding' },
		bindingPath5: { name: 'Table Display Mode Binding' },
	},
};

export default component;
