import { Schema } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { NAMESPACE_UI_ENGINE, STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getDataFromLocation,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import { updateLocationForChild } from '../util/updateLoactionForChild';
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
		definition: { children, bindingPath, bindingPath2, bindingPath3, bindingPath4 },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			data,
			offlineData,
			showSpinner,
			showPagination,
			uniqueKey,
			selectionType,
			displayMode,
			defaultSize,
			previewMode,
			previewGridPosition,
			tableDesign,
			paginationPosition,
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

	const selectionBindingPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	const pageNumberBindingPath =
		bindingPath2 && getPathFromLocation(bindingPath2, locationHistory, pageExtractor);

	const pageSizeBindingPath =
		bindingPath3 && getPathFromLocation(bindingPath3, locationHistory, pageExtractor);

	const tableModeBindingPath =
		bindingPath4 && getPathFromLocation(bindingPath4, locationHistory, pageExtractor);

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
				? addListener(
						(_, v) => setMode(v ?? displayMode),
						pageExtractor,
						tableModeBindingPath,
				  )
				: undefined,
		[tableModeBindingPath],
	);

	let body;
	const childrenEntries = Object.entries(children ?? {}).filter(e => e[1]);

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

	const [selection, setSelection] = useState<any>();

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
				previewChild = childrenEntries.filter(
					([k]) => pageDefinition.componentDefinition[k].type === 'TablePreviewGrid',
				);
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
	}

	return (
		<div className={`comp compTable ${tableDesign} ${previewGridPosition}`}>
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
		bindingPath: { name: 'Selection Binding' },
		bindingPath2: { name: 'Page Number Binding' },
		bindingPath3: { name: 'Page Size Binding' },
		bindingPath4: { name: 'Table Display Mode Binding' },
	},
};

export default component;
