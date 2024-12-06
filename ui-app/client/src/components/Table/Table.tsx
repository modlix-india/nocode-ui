import React, { useEffect, useState } from 'react';
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

			let modes = undefined;
			if (gridChild && columnsChild) {
				modes = (
					<>
						<div className="_modesContainer">
							<div
								className={`_columns _pointer ${
									mode === 'COLUMNS' ? '_selected' : ''
								}`}
								onClick={() => {
									if (tableModeBindingPath)
										setStoreData(
											tableModeBindingPath,
											'COLUMNS',
											context.pageName,
										);
									else setMode('COLUMNS');
								}}
							>
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
							>
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
							</div>
						</div>
						{showSeperators && (
							// <i className="fa-solid fa-grip-lines fa-rotate-90 _seperator" />
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
							// <i className="fa-solid fa-grip-lines fa-rotate-90 _seperator" />
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
									strokeOpacity="0.7"
									strokeLinecap="round"
								/>
							</svg>
						)}
						<span style={{ paddingLeft: '10px' }}>{perPageLabel}</span>
						<select
							value={pageSize}
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
						<span style={{ paddingLeft: '10px' }}>Page</span>
						<select
							value={pageNumber + 1}
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
						<span style={{ paddingRight: '10px' }}>of {totalPages}</span>
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
						{showArrows && <i className="fas fa-chevron-left"></i>}
						<span className="_prev">{leftArrowLabel}</span>
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
						<span className="_next">{rightArrowLabel}</span>
						{showArrows && <i className="fas fa-chevron-right"></i>}
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

	const resolvedStyles =
		processComponentStylePseudoClasses(
			props.pageDefinition,
			{},
			stylePropertiesWithPseudoStates,
		) ?? {};

	return (
		<div
			className={`comp compTable ${tableDesign} ${colorScheme} ${previewGridPosition} ${tableLayout}`}
			style={resolvedStyles?.comp ?? {}}
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
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="4" fill="white" />
					<path
						d="M2.54769 14.2852C2.39752 14.2846 2.24873 14.3136 2.10977 14.3705C1.97081 14.4274 1.84442 14.5112 1.73784 14.617C1.63126 14.7228 1.54657 14.8486 1.48861 14.9871C1.43064 15.1256 1.40055 15.2742 1.40003 15.4244C1.39944 15.5753 1.4287 15.7248 1.48617 15.8643C1.54363 16.0038 1.62815 16.1305 1.73484 16.2372C1.84153 16.3439 1.96832 16.4284 2.10783 16.4859C2.24734 16.5433 2.39681 16.5726 2.54769 16.572H27.6949C27.8458 16.5726 27.9953 16.5433 28.1348 16.4859C28.2743 16.4284 28.4011 16.3439 28.5077 16.2372C28.6144 16.1305 28.699 16.0038 28.7564 15.8643C28.8139 15.7248 28.8431 15.5753 28.8425 15.4244C28.842 15.2742 28.8119 15.1256 28.754 14.9871C28.696 14.8486 28.6113 14.7228 28.5048 14.617C28.3982 14.5112 28.2718 14.4275 28.1328 14.3705C27.9939 14.3136 27.8451 14.2846 27.6949 14.2852H2.54769Z"
						fill="#CFD8DD"
						className="_tableline"
					/>
					<path
						className="_tableline"
						d="M2.54769 20.5742C2.39752 20.5736 2.24873 20.6026 2.10977 20.6595C1.97081 20.7165 1.84442 20.8002 1.73784 20.906C1.63126 21.0118 1.54657 21.1376 1.48861 21.2761C1.43064 21.4147 1.40055 21.5632 1.40003 21.7134C1.39944 21.8643 1.4287 22.0138 1.48617 22.1533C1.54363 22.2928 1.62815 22.4196 1.73484 22.5263C1.84153 22.633 1.96832 22.7174 2.10783 22.7749C2.24734 22.8324 2.39681 22.8617 2.54769 22.8611H27.6949C27.8458 22.8617 27.9953 22.8324 28.1348 22.7749C28.2743 22.7174 28.4011 22.6329 28.5077 22.5263C28.6144 22.4196 28.699 22.2928 28.7564 22.1533C28.8139 22.0138 28.8431 21.8643 28.8425 21.7134C28.842 21.5632 28.8119 21.4147 28.754 21.2761C28.696 21.1376 28.6113 21.0119 28.5048 20.9061C28.3982 20.8003 28.2718 20.7165 28.1328 20.6596C27.9939 20.6026 27.8451 20.5736 27.6949 20.5742H2.54769Z"
						fill="#CFD8DD"
					/>
					<path d="M18.5474 8.71289V26.9995H20.8342V8.71289H18.5474Z" fill="#CFD8DD" />
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
						className="_tableHeader"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
