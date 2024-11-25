import React, { act, useEffect, useMemo, useState } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData as setStoreData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './tableProperties';
import TableStyle from './TableStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { flattenUUID } from '../util/uuid';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { styleDefaults } from './tableStyleProperties';
import { IconHelper } from '../util/IconHelper';
import TableDynamicColumns from '../TableDynamicColumns/TableDynamicColumns';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import {
	addToToggleSetCurry,
	getStyleObjectCurry,
	removeFromToggleSetCurry,
} from '../Calendar/components/calendarFunctions';

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
							? (getDataFromPath(
									spinnerPath1,
									props.locationHistory,
									pageExtractor,
								) ?? false)
							: false) ||
							(spinnerPath2
								? (getDataFromPath(
										spinnerPath2,
										props.locationHistory,
										pageExtractor,
									) ?? false)
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
							? (getDataFromPath(
									spinnerPath1,
									props.locationHistory,
									pageExtractor,
								) ?? false)
							: false) ||
							(spinnerPath2
								? (getDataFromPath(
										spinnerPath2,
										props.locationHistory,
										pageExtractor,
									) ?? false)
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
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

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

	console.log('hovers', hovers);
	console.log('computed', computedStyles, 'hover', hoverComputedStyles);
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
				? addListenerAndCallImmediatelyWithChildrenActivity(
						(_, v) => setData(v),
						pageExtractor,
						dataBindingPath,
					)
				: undefined,
		[dataBindingPath],
	);

	const spinnerPath1 = onSelect
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onSelect,
			)}.isRunning`
		: undefined;

	const paginationEvent = onPagination
		? props.pageDefinition.eventFunctions?.[onPagination]
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

	if (!isLoading && !data?.length) {
		const entry = childrenEntries
			.filter(([k]) => pageDefinition.componentDefinition[k])
			.filter(([k]) => pageDefinition.componentDefinition[k].type === 'TableEmptyGrid');
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

		let selectedChildrenArray = [columnsChild];
		let firstchildKey = undefined;
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
							(!firstchildKey || k.key.localeCompare(firstchildKey) < 0))
					)
						firstchildKey = childrenEntries[i][0];
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

		if (showPagination) {
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
					src={mode === 'COLUMNS' ? columnsModeActiveImage : columnsModeImage}
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
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M0 2C0 0.89543 0.895431 0 2 0H5V18H2C0.89543 18 0 17.1046 0 16V2Z" />
					<path d="M7 0H12V18H7V0Z" />
					<path d="M14 0H17C18.1046 0 19 0.895431 19 2V16C19 17.1046 18.1046 18 17 18H14V0Z" />
				</svg>
			);

			const gridMode = gridModeImage ? (
				<img
					src={mode === 'COLUMNS' ? gridModeActiveImage : gridModeImage}
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
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect width="8" height="8" rx="1" />
					<rect y="10" width="8" height="8" rx="1" />
					<rect x="10" width="8" height="8" rx="1" />
					<rect x="10" y="10" width="8" height="8" rx="1" />
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
							)}
						>
							<div
								className={`_columns _pointer ${
									mode === 'COLUMNS' ? '_selected' : ''
								}`}
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
								{columnsMode}
							</div>
							<div
								className={`_grid _pointer ${mode === 'GRID' ? '_selected' : ''}`}
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
								{gridMode}
							</div>
						</div>
						{showSeperators && (
							<svg
								width="2"
								height="28"
								viewBox="0 0 2 28"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M1 1L0.999999 27"
									stroke="#DDDDDD"
									stroke-opacity="0.7"
									stroke-linecap="round"
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
							<svg
								width="2"
								height="28"
								viewBox="0 0 2 28"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M1 1L0.999999 27"
									stroke="#DDDDDD"
									stroke-opacity="0.7"
									stroke-linecap="round"
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
							{perPageLabel}
						</span>
						<select
							value={pageSize}
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
							of {totalPages}
						</span>
					</>
				);
			}

			let leftArrow = undefined;
			if (!showPageSelectionDropdown) {
				leftArrow = (
					<div
						className="_clickable _pointer _leftArrow"
						onClick={() => {
							if (spinner || currentPage === 0) return;
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
						{showArrows && (
							<i
								className="fas fa-chevron-left"
								style={getStyleObject('previousArrow', hovers)}
								onMouseEnter={addToToggleSetCurry(
									hovers,
									setHovers,
									'previousArrow',
								)}
								onMouseLeave={removeFromToggleSetCurry(
									hovers,
									setHovers,
									'previousArrow',
								)}
							></i>
						)}
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
							{leftArrowLabel}
						</span>
					</div>
				);
			}

			let rightArrow = undefined;
			if (!showPageSelectionDropdown) {
				rightArrow = (
					<div
						className="_clickable _pointer _rightArrow"
						onClick={() => {
							if (spinner || currentPage === pages - 1) return;
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
							// style={resolvedStyles?.nextAndPreviousText}
							style={getStyleObject('nextText', hovers)}
							onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'nextText')}
							onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'nextText')}
						>
							{rightArrowLabel}
						</span>
						{showArrows && (
							<i
								className="fas fa-chevron-right"
								// style={resolvedStyles?.nextAndPreviousArrows}
								style={getStyleObject('nextArrow', hovers)}
								onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'nextArrow')}
								onMouseLeave={removeFromToggleSetCurry(
									hovers,
									setHovers,
									'nextArrow',
								)}
							></i>
						)}
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
									<div key={`${numbers[i]}_elipsis`} className="_noclick">
										...
									</div>,
								);
							}

							arr.push(
								<div
									key={`${numbers[i]}_pagenumber`}
									className={
										e === currentPage + 1
											? '_noclick _pageNumber _selected'
											: '_clickable _pointer _pageNumber'
									}
									style={getStyleObject(
										e === currentPage + 1
											? 'selectedPageNumber'
											: 'pageNumbers',
										hovers.has(`${numbers[i]}_pagenumber`)
											? new Set(['pageNumbers'])
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
										if (spinner) return;
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
			<div className="_tableWithPagination">
				<Children
					pageDefinition={pageDefinition}
					children={selectedChildren}
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
							firstchildKey,
						},
					}}
					locationHistory={locationHistory}
				/>
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
		<div
			className={`comp compTable ${tableDesign} ${colorScheme} ${previewGridPosition} ${tableLayout}`}
			style={getStyleObject('comp', hovers)}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'comp')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'comp')}
		>
			<HelperComponent context={props.context} definition={definition} />
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
	styleProperties: stylePropertiesDefinition,
	styleComponent: TableStyle,
	stylePseudoStates: ['hover'],
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map([
		['TableEmptyGrid', 1],
		['TableColumns', -1],
		['TableDynamicColumns', -1],
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M1 4.2998H14.2V22.1998C14.2 22.6416 13.8418 22.9998 13.4 22.9998H1V4.2998Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M1 1.8C1 1.35817 1.35817 1 1.8 1H22.2C22.6418 1 23 1.35817 23 1.8V6.5H1V1.8Z"
						fill="currentColor"
					/>
					<rect x="1" y="9.7998" width="5.5" height="4.4" rx="0.2" fill="currentColor" />
					<path
						d="M1 17.5H6.5V23H1.8C1.35817 23 1 22.6418 1 22.2V17.5Z"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="9.7998"
						width="4.4"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<rect
						x="9.80078"
						y="17.5"
						width="4.4"
						height="5.5"
						rx="0.2"
						fill="currentColor"
					/>
					<rect
						x="17.5"
						y="9.7998"
						width="5.5"
						height="4.4"
						rx="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.5 17.5H23V22.2C23 22.6418 22.6418 23 22.2 23H17.5V17.5Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'modesContainer',
			displayName: 'Modes Container',
			description: 'Modes Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'columnsModeIcon',
			displayName: 'Columns Mode Icon',
			description: 'Columns Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedColumnsModeIcon',
			displayName: 'Selected Columns Mode Icon',
			description: 'Selected Columns Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'columnsModeImage',
			displayName: 'Columns Mode Image',
			description: 'Columns Mode Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'gridModeIcon',
			displayName: 'Grid Mode Icon',
			description: 'Grid Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedGridModeIcon',
			displayName: 'Selected Grid Mode Icon',
			description: 'Selected Grid Mode Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'gridModeImage',
			displayName: 'Grid Mode Image',
			description: 'Grid Mode Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextArrow',
			displayName: 'Next Arrow',
			description: 'Next Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previousArrow',
			displayName: 'Previous Arrow',
			description: 'Previous Arrow',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'nextText',
			displayName: 'Next Text',
			description: 'Next Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previousText',
			displayName: 'Previous Text',
			description: 'Previous Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageNumbers',
			displayName: 'Page Numbers',
			description: 'Page Numbers',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedPageNumber',
			displayName: 'Selected Page Number',
			description: 'Selected Page Number',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'itemsPerPageDropdown',
			displayName: 'Items per page Dropdown',
			description: 'Items per page Dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'perPageLabel',
			displayName: 'Per Page Label',
			description: 'Per Page Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageSelectionDropdown',
			displayName: 'Page Selection Dropdown',
			description: 'Page Selection Dropdown',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'pageSelectionLabel',
			displayName: 'Page Selection Label',
			description: 'Page Selection Label',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
