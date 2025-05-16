import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import {
	LOCAL_STORE_PREFIX,
	STORE_PATH_FUNCTION_EXECUTION,
	STORE_PREFIX,
} from '../../../constants';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData as setStoreData,
} from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';

import Children from '../../Children';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { runEvent } from '../../util/runEvent';
import useDefinition from '../../util/useDefinition';
import { flattenUUID } from '../../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './tableProperties';
import { usedComponents } from '../../../App/usedComponents';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import axios from 'axios';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import getSrcUrl from '../../util/getSrcUrl';

export default function TableComponent(props: Readonly<ComponentProps>) {
	const {
		definition: {
			key,
			children,
			bindingPath,
			bindingPath2,
			bindingPath3,
			bindingPath4,
			bindingPath5,
			bindingPath6,
			bindingPath7,
		},
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			tableLayout,
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
			colorScheme,
			paginationPosition,
			totalPages,
			perPageNumbers,
			showPerPage,
			onSelect,
			onPagination,
			paginationDesign,
			showPageSelectionDropdown,
			leftArrowLabel,
			rightArrowLabel,
			showSeperators,
			showArrows,
			perPageLabel,
			columnsModeIcon,
			gridModeIcon,
			columnsModeImage,
			gridModeImage,
			columnsModeActiveImage,
			gridModeActiveImage,
			previousArrowIcon,
			nextArrowIcon,
			previousArrowImage,
			nextArrowImage,
			enablePersonalization,
			onSort,
			multiSort,
			hideContextMenu,
			disableColumnDragging,
			descValue,
			ascValue,
			sortObjectType,
			spinnerType,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	useEffect(() => {
		usedComponents.using('TableColumn');
		usedComponents.using('TableColumnHeader');
		usedComponents.using('TableColumns');
		usedComponents.using('TableDynamicColumn');
		usedComponents.using('TableDynamicColumns');
		usedComponents.using('TableEmptyGrid');
		usedComponents.using('TableGrid');
		usedComponents.using('TablePreviewGrid');
	}, []);

	const [hovers, setHovers] = React.useState<Set<string>>(() => new Set());
	const computedStyles = useMemo(
		() =>
			processComponentStylePseudoClasses(
				props.pageDefinition,
				{ hover: false },
				stylePropertiesWithPseudoStates,
			),
		[stylePropertiesWithPseudoStates, hovers],
	);

	const hoverComputedStyles = useMemo(
		() =>
			processComponentStylePseudoClasses(
				props.pageDefinition,
				{ hover: true },
				stylePropertiesWithPseudoStates,
			),
		[stylePropertiesWithPseudoStates],
	);

	const getStyleObject = useMemo(
		() => (key: string, hovers: Set<string>) => {
			if (hovers.has(key)) return hoverComputedStyles[key] ?? {};
			return computedStyles[key] ?? {};
		},
		[computedStyles, hoverComputedStyles],
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

	const sortBindingPath =
		bindingPath6 && getPathFromLocation(bindingPath6, locationHistory, pageExtractor);

	const personalizationBindingPath = enablePersonalization
		? ((bindingPath7 && getPathFromLocation(bindingPath7, locationHistory, pageExtractor)) ??
			`${STORE_PREFIX}.personalization.${context.pageName}.${flattenUUID(key)}`)
		: undefined;

	useEffect(
		() =>
			personalizationEvent({
				personalizationBindingPath,
				pageExtractor,
				locationHistory,
				key,
			}),
		[personalizationBindingPath, locationHistory, pageExtractor, key],
	);

	const [data, setData] = useState<any>();

	useEffect(
		() =>
			dataBindingPath
				? addListenerAndCallImmediatelyWithChildrenActivity(
						(_, v) => setData(v),
						pageExtractor,
						dataBindingPath,
					)
				: undefined,
		[dataBindingPath],
	);

	const paginationEvent = onPagination
		? props.pageDefinition.eventFunctions?.[onPagination]
		: undefined;

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let paths: string[] = [];
		if (onPagination)
			paths.push(
				`${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
					onPagination,
				)}.isRunning`,
			);
		if (onSort && onSort != onPagination)
			paths.push(
				`${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
					onSort,
				)}.isRunning`,
			);

		if (!paths.length) return;

		return addListenerAndCallImmediately((_, v) => setIsLoading(v), pageExtractor, ...paths);
	}, [onPagination, onSort, pageExtractor]);

	const spinner =
		isLoading && showSpinner && !spinnerType.startsWith('_emptyRow') ? (
			<div className={`_spinner ${spinnerType}`}>
				<div className="_block1" />
				<div className="_block2" />
				<div className="_block3" />
			</div>
		) : undefined;

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

	useEffect(() => {
		setPageSize(defaultSize);
	}, [defaultSize]);

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

	const [pageNumber, setPageNumber] = useState<number>(0);

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

	if (!isLoading && data?.length === 0) {
		const entry = childrenEntries
			.filter(([k]) => pageDefinition.componentDefinition[k])
			.filter(([k]) => pageDefinition.componentDefinition[k].type === 'TableEmptyGrid');
		if (entry?.length) {
			body = (
				<Children
					pageDefinition={pageDefinition}
					renderableChildren={{ [entry[0][0]]: true }}
					context={context}
					locationHistory={locationHistory}
				/>
			);
		}
	}
	useEffect(
		() =>
			selectionBindingPath
				? addListenerAndCallImmediatelyWithChildrenActivity(
						(_, v) => {
							setSelection(v);
						},
						pageExtractor,
						selectionBindingPath,
					)
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
		for (let i = 0; i < childrenEntries.length && (!gridChild || !columnsChild); i++) {
			const k = childrenEntries[i][0];
			if (
				pageDefinition.componentDefinition[k]?.type === 'TableColumns' ||
				pageDefinition.componentDefinition[k]?.type === 'TableDynamicColumns'
			) {
				columnsChild = k;
			} else if (pageDefinition.componentDefinition[k]?.type === 'TableGrid') {
				gridChild = k;
			}
		}

		let selectedChildrenArray;
		let firstChildKey = undefined;
		if (gridChild && (!columnsChild || mode === 'GRID')) {
			selectedChildrenArray = [gridChild];
		} else {
			selectedChildrenArray = [];
			let order = Number.MAX_VALUE;
			for (let i = 0; i < childrenEntries.length; i++) {
				const k = pageDefinition.componentDefinition[childrenEntries[i][0]];
				if (k?.type === 'TableColumns' || k?.type === 'TableDynamicColumns') {
					if (
						(k.displayOrder ?? 0) < order ||
						((k.displayOrder ?? 0) === order &&
							(!firstChildKey || k.key.localeCompare(firstChildKey) < 0))
					)
						firstChildKey = childrenEntries[i][0];
					selectedChildrenArray.push(childrenEntries[i][0]);
				}
			}
		}
		const selectedChildren = selectedChildrenArray.reduce((a, c) => {
			a[c!] = true;
			return a;
		}, {} as any);

		let from = offlineData ? pageNumber * pageSize : 0;
		let to = data?.length ?? 0;
		if (offlineData) {
			to = (pageNumber + 1) * pageSize;
			if (to >= data?.length) to = (data?.length ?? 0) - 1;
		}

		let pagination = undefined;

		if (showPagination && Array.isArray(data)) {
			let pages = totalPages;
			let currentPage = pageNumber;
			let size = pageSize;

			if (offlineData) {
				size = defaultSize;
				currentPage = pageNumber;
				pages = size > 0 ? Math.ceil(data?.length / size) : 0;
			}

			let numbers: Array<number> = [];
			numbers.push(1);
			if (pages <= 5) {
				for (let i = 2; i <= pages; i++) numbers.push(i);
			} else {
				if (currentPage - 1 > 1) numbers.push(currentPage - 1);
				if (currentPage > 1) numbers.push(currentPage);
				if (currentPage + 1 > 1 && currentPage + 1 < pages) numbers.push(currentPage + 1);
				if (currentPage + 2 < pages) numbers.push(currentPage + 2);
				if (currentPage < pages) numbers.push(pages);
			}

			const columnsMode = columnsModeImage ? (
				<img
					alt="Column Mode"
					src={getSrcUrl(mode === 'COLUMNS' ? columnsModeActiveImage : columnsModeImage)}
					style={getStyleObject(
						'columnsModeImage',
						hovers.has('columnsModeIcon') ? new Set(['columnsModeImage']) : new Set(),
					)}
				></img>
			) : columnsModeIcon ? (
				<i
					className={columnsModeIcon}
					style={getStyleObject(
						mode === 'COLUMNS' ? 'selectedColumnsModeIcon' : 'columnsModeIcon',
						hovers,
					)}
				></i>
			) : (
				<svg
					width="19"
					height="18"
					viewBox="0 0 19 18"
					fill="none"
					style={getStyleObject(
						mode === 'COLUMNS' ? 'selectedColumnsModeIcon' : 'columnsModeIcon',
						hovers,
					)}
				>
					<path
						d="M0 2C0 0.89543 0.895431 0 2 0H5V18H2C0.89543 18 0 17.1046 0 16V2Z"
						fill="currentColor"
					/>
					<path d="M7 0H12V18H7V0Z" fill="currentColor" />
					<path
						d="M14 0H17C18.1046 0 19 0.895431 19 2V16C19 17.1046 18.1046 18 17 18H14V0Z"
						fill="currentColor"
					/>
				</svg>
			);

			const gridMode = gridModeImage ? (
				<img
					alt="Grid Mode"
					src={getSrcUrl(mode === 'COLUMNS' ? gridModeActiveImage : gridModeImage)}
					style={getStyleObject(
						'gridModeImage',
						hovers.has('gridModeIcon') ? new Set(['gridModeImage']) : new Set(),
					)}
				></img>
			) : gridModeIcon ? (
				<i
					className={gridModeIcon}
					style={getStyleObject(
						mode === 'GRID' ? 'selectedGridModeIcon' : 'gridModeIcon',
						hovers,
					)}
				></i>
			) : (
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					style={getStyleObject(
						mode === 'GRID' ? 'selectedGridModeIcon' : 'gridModeIcon',
						hovers,
					)}
				>
					<rect width="8" height="8" rx="1" fill="currentColor" />
					<rect y="10" width="8" height="8" rx="1" fill="currentColor" />
					<rect x="10" width="8" height="8" rx="1" fill="currentColor" />
					<rect x="10" y="10" width="8" height="8" rx="1" fill="currentColor" />
				</svg>
			);

			let modes = undefined;
			if (gridChild && columnsChild) {
				modes = (
					<>
						<div
							className="_modesContainer"
							style={getStyleObject('modesContainer', hovers)}
							onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'modesContainer')}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'modesContainer',
								'selectedColumnsModeIcon',
								'columnsModeIcon',
								'selectedGridModeIcon',
								'gridModeIcon',
							)}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="modesContainer"
							/>
							<div
								className={`_columns _pointer ${
									mode === 'COLUMNS' ? '_selected' : ''
								}`}
								style={getStyleObject(
									mode === 'COLUMNS'
										? 'selectedColumnsModeIcon'
										: 'columnsModeIcon',
									hovers,
								)}
								onClick={() => {
									if (tableModeBindingPath) {
										setStoreData(
											tableModeBindingPath,
											'COLUMNS',
											context.pageName,
										);
									} else {
										setMode('COLUMNS');
									}
								}}
								onMouseEnter={addToToggleSetCurry(
									hovers,
									setHovers,
									mode === 'COLUMNS'
										? 'selectedColumnsModeIcon'
										: 'columnsModeIcon',
								)}
								onMouseLeave={removeFromToggleSetCurry(
									hovers,
									setHovers,
									mode === 'COLUMNS'
										? 'selectedColumnsModeIcon'
										: 'columnsModeIcon',
								)}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName={
										mode === 'COLUMNS'
											? 'selectedColumnsModeIcon'
											: 'columnsModeIcon'
									}
								/>
								{columnsMode}
							</div>
							<div
								className={`_grid _pointer ${mode === 'GRID' ? '_selected' : ''}`}
								style={getStyleObject(
									mode === 'COLUMNS' ? 'selectedGridModeIcon' : 'gridModeIcon',
									hovers,
								)}
								onClick={() => {
									if (tableModeBindingPath)
										setStoreData(
											tableModeBindingPath,
											'GRID',
											context.pageName,
										);
									else setMode('GRID');
								}}
								onMouseEnter={addToToggleSetCurry(
									hovers,
									setHovers,
									mode === 'GRID' ? 'selectedGridModeIcon' : 'gridModeIcon',
								)}
								onMouseLeave={removeFromToggleSetCurry(
									hovers,
									setHovers,
									mode === 'GRID' ? 'selectedGridModeIcon' : 'gridModeIcon',
								)}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName={
										mode === 'GRID' ? 'selectedGridModeIcon' : 'gridModeIcon'
									}
								/>
								{gridMode}
							</div>
						</div>
						{showSeperators && (
							<svg width="2" height="28" viewBox="0 0 2 28" fill="none">
								<path
									d="M1 1L0.999999 27"
									stroke="#DDDDDD"
									strokeOpacity="0.7"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</>
				);
			}

			let perPage = undefined;
			if (showPerPage) {
				perPage = (
					<>
						{showSeperators && (
							<svg width="2" height="28" viewBox="0 0 2 28" fill="none">
								<path
									d="M1 1L0.999999 27"
									stroke="#DDDDDD"
									strokeOpacity="0.7"
									strokeLinecap="round"
								/>
							</svg>
						)}
						<span
							className="_perPageLabel"
							style={getStyleObject('perPageLabel', hovers)}
							onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'perPageLabel')}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'perPageLabel',
							)}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="perPageLabel"
							/>
							{perPageLabel}
						</span>
						<select
							value={pageSize}
							className="_tableSize"
							style={getStyleObject('itemsPerPageDropdown', hovers)}
							onMouseEnter={addToToggleSetCurry(
								hovers,
								setHovers,
								'itemsPerPageDropdown',
							)}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'itemsPerPageDropdown',
							)}
							onChange={e => {
								if (pageSizeBindingPath) {
									setStoreData(
										pageSizeBindingPath,
										parseInt(e.target.value),
										context.pageName,
									);
								} else {
									setPageSize(parseInt(e.target.value));
								}

								if (pageNumberBindingPath) {
									setStoreData(pageNumberBindingPath, 0, context.pageName);
								} else {
									setPageNumber(0);
								}

								if (selectionBindingPath) {
									setStoreData(
										selectionBindingPath,
										undefined,
										context.pageName,
										true,
									);
								}

								if (paginationEvent) {
									(async () =>
										await runEvent(
											paginationEvent,
											onPagination,
											context.pageName,
											locationHistory,
											pageDefinition,
										))();
								}
							}}
						>
							{perPageNumbers
								.filter((e: number) => !isNaN(e))
								.map((e: number) => (
									<option key={e} value={e}>
										{e}
									</option>
								))}
						</select>
					</>
				);
			}

			let pageSelectionDropdown = undefined;
			if (showPageSelectionDropdown) {
				pageSelectionDropdown = (
					<>
						<span
							className="_pageSelectionLabel"
							style={getStyleObject('pageSelectionLabel', hovers)}
							onMouseEnter={addToToggleSetCurry(
								hovers,
								setHovers,
								'pageSelectionLabel',
							)}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'pageSelectionLabel',
							)}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="pageSelectionLabel"
							/>
							Page
						</span>
						<select
							value={pageNumber + 1}
							style={getStyleObject('pageSelectionDropdown', hovers)}
							onMouseEnter={addToToggleSetCurry(
								hovers,
								setHovers,
								'pageSelectionDropdown',
							)}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'pageSelectionDropdown',
							)}
							onChange={e => {
								const selectedPage = parseInt(e.target.value) - 1;
								if (pageNumberBindingPath) {
									setStoreData(
										pageNumberBindingPath,
										selectedPage,
										context.pageName,
									);
								} else {
									setPageNumber(selectedPage);
								}

								if (selectionBindingPath) {
									setStoreData(
										selectionBindingPath,
										undefined,
										context.pageName,
										true,
									);
								}

								if (paginationEvent) {
									(async () =>
										await runEvent(
											paginationEvent,
											onPagination,
											context.pageName,
											locationHistory,
											pageDefinition,
										))();
								}
							}}
						>
							{Array.from({ length: totalPages }, (_, index) => index).map(page => (
								<option key={page} value={page + 1}>
									{page + 1}
								</option>
							))}
						</select>
						<span
							className="_pageSelectionDropdownLabelOf"
							style={getStyleObject('pageSelectionLabel', hovers)}
							onMouseEnter={addToToggleSetCurry(
								hovers,
								setHovers,
								'pageSelectionLabel',
							)}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'pageSelectionLabel',
							)}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="pageSelectionLabel"
							/>
							of {totalPages}
						</span>
					</>
				);
			}

			const previousArrow = showArrows ? (
				previousArrowImage ? (
					<img
						alt="PreviousArrow Image"
						src={getSrcUrl(previousArrowImage)}
						style={getStyleObject('previousArrow', hovers)}
						onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'previousArrow')}
						onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'previousArrow')}
					></img>
				) : previousArrowIcon ? (
					<i
						className={previousArrowIcon}
						style={getStyleObject('previousArrow', hovers)}
						onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'previousArrow')}
						onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'previousArrow')}
					></i>
				) : (
					<i
						className="fas fa-chevron-left"
						style={getStyleObject('previousArrow', hovers)}
						onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'previousArrow')}
						onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'previousArrow')}
					></i>
				)
			) : (
				<></>
			);

			let leftArrow = undefined;
			if (!showPageSelectionDropdown) {
				leftArrow = (
					<div
						className="_clickable _pointer _leftArrow"
						onClick={() => {
							if (isLoading || currentPage === 0) return;
							const newPage = currentPage - 1;
							if (pageNumberBindingPath)
								setStoreData(pageNumberBindingPath, newPage, context.pageName);
							else setPageNumber(newPage);
							if (selectionBindingPath) {
								setStoreData(
									selectionBindingPath,
									undefined,
									context.pageName,
									true,
								);
							}
							if (paginationEvent) {
								(async () =>
									await runEvent(
										paginationEvent,
										onPagination,
										context.pageName,
										locationHistory,
										pageDefinition,
									))();
							}
						}}
					>
						{previousArrow}
						<span
							className="_prev"
							style={getStyleObject('previousText', hovers)}
							onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'previousText')}
							onMouseLeave={removeFromToggleSetCurry(
								hovers,
								setHovers,
								'previousText',
							)}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="previousText"
							/>
							{leftArrowLabel}
						</span>
					</div>
				);
			}

			const nextArrow = showArrows ? (
				nextArrowImage ? (
					<img
						alt="NextArrow Image"
						src={getSrcUrl(nextArrowImage)}
						style={getStyleObject('nextArrow', hovers)}
						onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'nextArrow')}
						onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'nextArrow')}
					></img>
				) : nextArrowIcon ? (
					<i
						className={nextArrowIcon}
						style={getStyleObject('nextArrow', hovers)}
						onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'nextArrow')}
						onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'nextArrow')}
					></i>
				) : (
					<i
						className="fas fa-chevron-right"
						style={getStyleObject('nextArrow', hovers)}
						onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'nextArrow')}
						onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'nextArrow')}
					></i>
				)
			) : (
				<></>
			);

			let rightArrow = undefined;
			if (!showPageSelectionDropdown) {
				rightArrow = (
					<div
						className="_clickable _pointer _rightArrow"
						onClick={() => {
							if (isLoading || currentPage === pages - 1) return;
							const newPage = currentPage + 1;
							if (pageNumberBindingPath)
								setStoreData(pageNumberBindingPath, newPage, context.pageName);
							else setPageNumber(newPage);
							if (selectionBindingPath) {
								setStoreData(
									selectionBindingPath,
									undefined,
									context.pageName,
									true,
								);
							}
							if (paginationEvent) {
								(async () =>
									await runEvent(
										paginationEvent,
										onPagination,
										context.pageName,
										locationHistory,
										pageDefinition,
									))();
							}
						}}
					>
						<span
							className="_next"
							style={getStyleObject('nextText', hovers)}
							onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'nextText')}
							onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'nextText')}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="nextText"
							/>
							{rightArrowLabel}
						</span>
						{nextArrow}
					</div>
				);
			}

			pagination = (
				<div
					className={`_tablePagination ${paginationPosition} ${paginationDesign} ${colorScheme}`}
				>
					{modes}
					{leftArrow}
					{!pageSelectionDropdown &&
						numbers.flatMap((e, i) => {
							const arr = [];

							if (i > 0 && numbers[i - 1] + 1 !== numbers[i]) {
								arr.push(
									<div
										key={`${numbers[i]}_elipsis`}
										className="_noclick"
										style={getStyleObject('ellipsesGrid', hovers)}
									>
										...
									</div>,
								);
							}
							const styleObjectName =
								e === currentPage + 1 ? 'selectedPageNumber' : 'pageNumbers';
							arr.push(
								<div
									key={`${numbers[i]}_pagenumber`}
									className={
										e === currentPage + 1
											? '_noclick _pageNumber _selected'
											: '_clickable _pointer _pageNumber'
									}
									style={getStyleObject(
										styleObjectName,
										hovers.has(`${numbers[i]}_pagenumber`)
											? new Set([styleObjectName])
											: new Set(),
									)}
									onMouseEnter={addToToggleSetCurry(
										hovers,
										setHovers,
										`${numbers[i]}_pagenumber`,
									)}
									onMouseLeave={removeFromToggleSetCurry(
										hovers,
										setHovers,
										`${numbers[i]}_pagenumber`,
									)}
									onClick={() => {
										if (isLoading) return;
										if (pageNumberBindingPath)
											setStoreData(
												pageNumberBindingPath,
												numbers[i] - 1,
												context.pageName,
											);
										else setPageNumber(numbers[i] - 1);
										if (selectionBindingPath) {
											setStoreData(
												selectionBindingPath,
												undefined,
												context.pageName,
												true,
											);
										}
										if (paginationEvent) {
											(async () =>
												await runEvent(
													paginationEvent,
													onPagination,
													context.pageName,
													locationHistory,
													pageDefinition,
												))();
										}
									}}
								>
									<SubHelperComponent
										definition={definition}
										subComponentName={styleObjectName}
									/>
									{e}
								</div>,
							);

							return arr;
						})}
					{rightArrow}
					{pageSelectionDropdown}
					{perPage}
				</div>
			);
		}

		let mainBody = selectedChildrenArray?.length ? (
			<div
				className="_tableWithPagination"
				style={getStyleObject('tableWithPagination', hovers)}
			>
				<SubHelperComponent
					definition={definition}
					subComponentName="tableWithPagination"
				/>
				<div className="_tableContainer" style={getStyleObject('tableContainer', hovers)}>
					<SubHelperComponent definition={definition} subComponentName="tableContainer" />
					<Children
						pageDefinition={pageDefinition}
						renderableChildren={selectedChildren}
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
								onSelect,
								firstChildKey,
								onSort,
								enablePersonalization,
								personalizationBindingPath,
								sortBindingPath,
								multiSort,
								hideContextMenu,
								disableColumnDragging,
								descValue,
								ascValue,
								sortObjectType,
								isLoading,
								spinnerType,
								showSpinner,
							},
						}}
						locationHistory={locationHistory}
					/>
				</div>
				{pagination}
			</div>
		) : (
			<></>
		);

		if (previewChild) {
			body = (
				<>
					<Children
						pageDefinition={pageDefinition}
						renderableChildren={{ [previewChild]: true }}
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
								isLoading,
								spinnerType,
								showSpinner,
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
		<div
			className={`comp compTable ${tableDesign} ${colorScheme} ${previewGridPosition} ${tableLayout}`}
			style={getStyleObject('comp', hovers)}
		>
			<HelperComponent context={props.context} definition={definition} />
			{body}
			{spinner}
		</div>
	);
}

function personalizationEvent({
	personalizationBindingPath,
	key,
	locationHistory,
	pageExtractor,
}: {
	personalizationBindingPath: string | undefined;
	key: string;
	locationHistory: any[];
	pageExtractor: PageStoreExtractor;
}) {
	if (!personalizationBindingPath) return;

	const appCode = getDataFromPath(
		`${STORE_PREFIX}.application.appCode`,
		locationHistory,
		pageExtractor,
	);
	const url = `api/ui/personalization/${appCode}/table_${pageExtractor.getPageName()}_${key}`;
	let currentObject: any;
	(async () => {
		const po = await axios.get(url, {
			headers: {
				Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
			},
		});
		if (po.data) setStoreData(personalizationBindingPath, po.data, pageExtractor.getPageName());
		currentObject = duplicate(po.data);
	})();

	let timeoutHandle: NodeJS.Timeout | undefined;
	return addListenerAndCallImmediatelyWithChildrenActivity(
		(_, v) => {
			if (!timeoutHandle) clearTimeout(timeoutHandle);
			if (deepEqual(currentObject, v) || currentObject === undefined) return;
			currentObject = duplicate(v);

			timeoutHandle = setTimeout(() => {
				(async () => {
					await axios.post(url, v, {
						headers: {
							Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
						},
					});
					timeoutHandle = undefined;
				})();
			}, 2000);
		},
		pageExtractor,
		personalizationBindingPath,
	);
}

export function addToToggleSetCurry(
	set: Set<string>,
	setStateFunction: Dispatch<SetStateAction<Set<string>>>,
	key: string,
) {
	return () => {
		if (set.has(key)) return;
		setStateFunction(new Set([...Array.from(set), key]));
	};
}

export function removeFromToggleSetCurry(
	set: Set<string>,
	setStateFunction: Dispatch<SetStateAction<Set<string>>>,
	...key: string[]
) {
	return () => {
		if (!key.find(e => set.has(e))) return;
		const newSet = new Set([...Array.from(set)]);
		key.forEach(e => newSet.delete(e));
		setStateFunction(newSet);
	};
}
