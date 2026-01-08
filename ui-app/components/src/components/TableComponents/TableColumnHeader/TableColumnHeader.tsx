import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../../context/StoreContext';
import { ComponentProps, LocationHistory } from '../../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { runEvent } from '../../util/runEvent';
import useDefinition from '../../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnHeaderProperties';

interface SortObject {
	[key: string]: 'ASC' | 'DESC';
}

function getSortObject(
	dataFromPath: any,
	sortObjectType: 'spring' | 'keyValue' | 'stringWithColon' | 'stringWithSpace',
	ascValue: any,
): SortObject {
	if (!dataFromPath) return {};

	const sortObject: SortObject = {};

	if (sortObjectType === 'spring') {
		if (typeof dataFromPath === 'object')
			(Array.isArray(dataFromPath) ? dataFromPath : [dataFromPath]).forEach(
				e => (sortObject[e.property] = e.direction == ascValue ? 'ASC' : 'DESC'),
			);
	} else if (sortObjectType === 'keyValue') {
		if (typeof dataFromPath === 'object')
			Object.keys(dataFromPath).forEach(
				e => (sortObject[e] = dataFromPath[e] == ascValue ? 'ASC' : 'DESC'),
			);
	} else {
		if (typeof dataFromPath === 'string')
			dataFromPath.split(',').forEach(e => {
				const [key, value] = e.split(sortObjectType === 'stringWithColon' ? ':' : ' ');
				sortObject[key] = value == ascValue ? 'ASC' : 'DESC';
			});
	}

	return sortObject;
}

function getSortOrderFromSortObject(
	sortObject: SortObject,
	sortObjectType: 'spring' | 'keyValue' | 'stringWithColon' | 'stringWithSpace',
	ascValue: any,
	descValue: any,
	isMultiSort: boolean,
): any {
	const keyValues = Object.entries(sortObject);
	if (!keyValues.length) return undefined;

	if (sortObjectType === 'spring') {
		const list = keyValues.map(([key, value]) => ({
			property: key,
			direction: value == 'ASC' ? ascValue : descValue,
		}));
		return isMultiSort ? list : list[0];
	}

	if (sortObjectType === 'keyValue') {
		return keyValues.reduce((a, [key, direction]) => {
			a[key] = direction == 'ASC' ? ascValue : descValue;
			return a;
		}, {} as any);
	}

	return keyValues
		.map(
			([key, direction]) =>
				`${key}${sortObjectType == 'stringWithColon' ? ':' : ' '}${direction == 'ASC' ? ascValue : descValue}`,
		)
		.join(',');
}

export default function TableColumnHeaderComponent(props: Readonly<ComponentProps>) {
	const {
		locationHistory = [],
		context,
		definition,
		definition: { key },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			label,
			leftIcon,
			rightIcon,
			sortKey,
			initialSortOrder,
			sortNoneIcon,
			sortDescendingIcon,
			sortAscendingIcon,
			hideIfNotPersonalized,
			disableColumnDragging,
			leftIconTitle,
			rightIconTitle,
			tooltipPosition,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false },
		stylePropertiesWithPseudoStates,
	);

	const hoverStyleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	let leftIconComp;
	if (leftIcon) {
		leftIconComp = (
			<i className={`_leftIcon ${leftIcon}`}>
				<SubHelperComponent definition={definition} subComponentName="leftIcon" />
				{leftIconTitle ? (
					<span className="_titleContainer" style={styleProperties.tooltipContainer}>
						{leftIconTitle}
						<span className="_titleTriangle" style={styleProperties.tooltipTriangle} />
					</span>
				) : null}
			</i>
		);
	}

	const { sortBindingPath, onSort, multiSort, descValue, ascValue, sortObjectType } =
		context.table;

	let rightIconComp;
	const hasSort = sortKey && sortBindingPath && onSort;
	let currentSortOrder: 'ASC' | 'DESC' | undefined;
	if (hasSort) {
		currentSortOrder = getSortObject(
			getDataFromPath(`${sortBindingPath}`, locationHistory, pageExtractor),
			sortObjectType,
			ascValue,
		)[sortKey];
		const sortIcon =
			currentSortOrder === 'ASC'
				? sortAscendingIcon
				: currentSortOrder === 'DESC'
					? sortDescendingIcon
					: sortNoneIcon;

		const subHelperComp =
			currentSortOrder === 'ASC'
				? 'sortAscendingIcon'
				: currentSortOrder === 'DESC'
					? 'sortDescendingIcon'
					: 'sortNoneIcon';

		if (sortIcon) {
			rightIconComp = (
				<i className={`_sortIcon ${currentSortOrder} ${sortIcon}`}>
					<SubHelperComponent definition={definition} subComponentName={subHelperComp} />
				</i>
			);
		} else {
			rightIconComp = (
				<svg
					width="11"
					height="10"
					viewBox="0 0 11 10"
					fill="none"
					className={`_sortIconDefault ${currentSortOrder}`}
				>
					<path
						d="M3.0388 0.157331C2.83038 -0.0524437 2.49335 -0.0524437 2.28714 0.157331L0.156319 2.29971C-0.0521064 2.50948 -0.0521064 2.84869 0.156319 3.05624C0.364745 3.26378 0.701774 3.26601 0.907982 3.05624L2.12749 1.82883L2.12971 9.46329C2.12971 9.7601 2.36696 9.99888 2.66186 9.99888C2.95676 9.99888 3.19401 9.7601 3.19401 9.46329V1.82883L4.41353 3.05624C4.62195 3.26601 4.95898 3.26601 5.16519 3.05624C5.3714 2.84646 5.37361 2.50725 5.16519 2.29971L3.0388 0.157331Z"
						className="_upIcon"
						fill="currentColor"
					/>
					<path
						d="M10.844 6.9446C11.0525 7.15214 11.0525 7.49135 10.844 7.70113L8.71544 9.84351C8.50923 10.0533 8.17221 10.0533 7.96378 9.84351L5.83518 7.70113C5.62675 7.49359 5.62897 7.15438 5.83518 6.9446C6.04138 6.73483 6.37841 6.73483 6.58684 6.9446L7.80635 8.172V0.537548C7.80635 0.240739 8.0436 0.00195312 8.3385 0.00195312C8.6334 0.00195312 8.87065 0.240739 8.87065 0.537548L8.87287 8.172L10.0924 6.9446C10.2986 6.73483 10.6356 6.73706 10.844 6.9446Z"
						className="_downIcon"
						fill="currentColor"
					/>
				</svg>
			);
		}
	}

	if (rightIcon) {
		rightIconComp = (
			<>
				<i className={`_rightIcon ${rightIcon}`}>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
					{rightIconTitle ? (
						<span className="_titleContainer" style={styleProperties.tooltipContainer}>
							{rightIconTitle}
							<span
								className="_titleTriangle"
								style={styleProperties.tooltipTriangle}
							/>
						</span>
					) : null}
				</i>
				{rightIconComp}
			</>
		);
	}

	let styleKey = `tch${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	let style = processStyleObjectToCSS(
		styleProperties.header,
		`.comp.compTableHeaderColumn#${styleKey}`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.header,
		`.comp.compTableHeaderColumn#${styleKey}:hover`,
	);
	style += processStyleObjectToCSS(
		styleProperties.headerContainer,
		`.comp.compTableHeaderColumn#${styleKey} ._headerContainer`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.headerContainer,
		`.comp.compTableHeaderColumn#${styleKey}:hover ._headerContainer`,
	);
	style += processStyleObjectToCSS(
		styleProperties.leftIcon,
		`.comp.compTableHeaderColumn#${styleKey} ._leftIcon`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.leftIcon,
		`.comp.compTableHeaderColumn#${styleKey}:hover ._leftIcon`,
	);
	style += processStyleObjectToCSS(
		styleProperties.rightIcon,
		`.comp.compTableHeaderColumn#${styleKey} ._rightIcon`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.rightIcon,
		`.comp.compTableHeaderColumn#${styleKey}:hover ._rightIcon`,
	);
	style += processStyleObjectToCSS(
		styleProperties.sortNoneIcon,
		`.comp.compTableHeaderColumn#${styleKey} ._sortIcon`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.sortNoneIcon,
		`.comp.compTableHeaderColumn#${styleKey}:hover ._sortIcon`,
	);
	style += processStyleObjectToCSS(
		styleProperties.sortAscendingIcon,
		`.comp.compTableHeaderColumn#${styleKey} ._sortIcon.ASC`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.sortAscendingIcon,
		`.comp.compTableHeaderColumn#${styleKey}:hover ._sortIcon.ASC`,
	);
	style += processStyleObjectToCSS(
		styleProperties.sortDescendingIcon,
		`.comp.compTableHeaderColumn#${styleKey} ._sortIcon.DESC`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.sortDescendingIcon,
		`.comp.compTableHeaderColumn#${styleKey}:hover ._sortIcon.DESC`,
	);

	const [showMenuLocation, setShowMenuLocation] = useState<{ x: number; y: number } | undefined>(
		undefined,
	);
	let menu = undefined;

	const [personalizedObject, setPersonalizedObject] = useState<any>(undefined);
	useEffect(
		() =>
			context.table.personalizationBindingPath
				? addListenerAndCallImmediatelyWithChildrenActivity(
						pageExtractor.getPageName(),
						(_, v) => setPersonalizedObject(v),
						context.table.personalizationBindingPath,
					)
				: undefined,
		[
			context.table.personalizationBindingPath,
			context.table.enablePersonalization,
			setPersonalizedObject,
		],
	);

	if (
		(hideIfNotPersonalized && !personalizedObject?.hiddenFields?.[definition.key]) ||
		(!hideIfNotPersonalized && personalizedObject?.hiddenFields?.[definition.key])
	) {
		return null;
	}

	if (showMenuLocation) {
		let sortItems = undefined;
		if (hasSort) {
			sortItems = (
				<>
					<div
						className="_popupMenuItem"
						role="menuitem"
						tabIndex={0}
						onKeyUp={e =>
							(e.key === 'Enter' || e.key === ' ') && e.currentTarget.click()
						}
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							onChangeSort({
								currentSortOrder,
								initialSortOrder,
								props,
								multiSort,
								sortBindingPath,
								sortKey,
								pageExtractor,
								onSort,
								hasSort,
								sortTo: 'ASC',
								sortObjectType,
								ascValue,
								descValue,
								locationHistory,
							});
							setShowMenuLocation(undefined);
						}}
					>
						Sort Ascending
					</div>
					<div
						className="_popupMenuItem"
						role="menuitem"
						tabIndex={0}
						onKeyUp={e =>
							(e.key === 'Enter' || e.key === ' ') && e.currentTarget.click()
						}
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							onChangeSort({
								currentSortOrder,
								initialSortOrder,
								props,
								multiSort,
								sortBindingPath,
								sortKey,
								pageExtractor,
								onSort,
								hasSort,
								sortTo: 'DESC',
								sortObjectType,
								ascValue,
								descValue,
								locationHistory,
							});
							setShowMenuLocation(undefined);
						}}
					>
						Sort Descending
					</div>
					<div
						className="_popupMenuItem"
						role="menuitem"
						tabIndex={0}
						onKeyUp={e =>
							(e.key === 'Enter' || e.key === ' ') && e.currentTarget.click()
						}
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							onChangeSort({
								currentSortOrder,
								initialSortOrder,
								props,
								multiSort,
								sortBindingPath,
								sortKey,
								pageExtractor,
								onSort,
								hasSort,
								sortTo: 'undefined',
								sortObjectType,
								ascValue,
								descValue,
								locationHistory,
							});
							setShowMenuLocation(undefined);
						}}
					>
						Clear Sorting
					</div>
					<div className="_popupMenuItemSeperator" />
				</>
			);
		}

		let resetColoumnOrder = undefined;
		if (!context.table.disableColumnDragging) {
			resetColoumnOrder = (
				<>
					<div
						className="_popupMenuItem"
						role="menuitem"
						tabIndex={0}
						onKeyDown={e => e.key === 'Enter' && e.currentTarget.click()}
						onClick={() =>
							setData(
								`${context.table.personalizationBindingPath}.columnOrder`,
								undefined,
								pageExtractor.getPageName(),
								true,
							)
						}
					>
						Reset Column Order
					</div>
					<div className="_popupMenuItemSeperator" />
				</>
			);
		}

		menu = (
			<div
				className="_popupBackground"
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();
					setShowMenuLocation(undefined);
				}}
				onContextMenu={e => {
					e.preventDefault();
					e.stopPropagation();
				}}
				role="menu"
				tabIndex={0}
				onKeyUp={e => e.key === 'Escape' && setShowMenuLocation(undefined)}
			>
				<div
					className="_popupMenu"
					style={{
						top: showMenuLocation.y,
						left: showMenuLocation.x,
					}}
				>
					{sortItems}
					<div
						className="_popupMenuItem"
						role="menuitem"
						tabIndex={0}
						onKeyDown={e => e.key === 'Enter' && e.currentTarget.click()}
						onClick={() =>
							setData(
								`${context.table.personalizationBindingPath}.hiddenFields.${key}`,
								true,
								pageExtractor.getPageName(),
							)
						}
					>
						Hide Column
					</div>
					<div
						className="_popupMenuItem"
						role="menuitem"
						tabIndex={0}
						onKeyDown={e => e.key === 'Enter' && e.currentTarget.click()}
						onClick={() =>
							setData(
								`${context.table.personalizationBindingPath}.hiddenFields`,
								undefined,
								pageExtractor.getPageName(),
								true,
							)
						}
					>
						Reset Column Visibility
					</div>
					<div className="_popupMenuItemSeperator" />
					{resetColoumnOrder}
					{context.table.columnNames.map(({ key, label }: any) => {
						if (!label) return null;
						return (
							<div
								key={key}
								className="_popupMenuItem"
								role="menuitem"
								tabIndex={0}
								onKeyDown={e => e.key === 'Enter' && e.currentTarget.click()}
								onClick={() =>
									setData(
										`${context.table.personalizationBindingPath}.hiddenFields.${key}`,
										!personalizedObject?.hiddenFields?.[key],
										pageExtractor.getPageName(),
									)
								}
							>
								{label}
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	const dragProperties: any = {};

	if (
		!disableColumnDragging &&
		context.table.enablePersonalization &&
		!context.table.disableColumnDragging
	) {
		dragProperties.draggable = true;
		dragProperties.onDragStart = (ev: React.DragEvent<HTMLElement>) =>
			ev.dataTransfer.setData('text/plain', `COLUMN_NAME_${key}`);
		dragProperties.onDrop = (ev: React.DragEvent<HTMLElement>) => {
			let droppedKey = ev.dataTransfer.getData('text/plain');
			if (!droppedKey.startsWith('COLUMN_NAME_')) return;
			droppedKey = droppedKey.substring(12);
			if (droppedKey === key) return;

			const columnOrder = context.table.columnNames
				.sort((a: any, b: any) => a.order - b.order)
				.map(({ key }: any) => key);

			const di = columnOrder.indexOf(droppedKey);
			const doi = columnOrder.indexOf(key);
			columnOrder.splice(di, 1);
			columnOrder.splice(doi, 0, droppedKey);

			const newOrder = columnOrder.reduce((acc: any, key: string, i: number) => {
				acc[key] = i;
				return acc;
			}, {});

			setData(
				`${context.table.personalizationBindingPath}.columnOrder`,
				newOrder,
				pageExtractor.getPageName(),
			);
		};
		dragProperties.onDragOver = (ev: React.DragEvent<HTMLElement>) => ev.preventDefault();
	}

	return (
		<th
			id={styleKey}
			className={`comp compTableHeaderColumn ${hasSort ? '_pointer' : ''} ${tooltipPosition}`}
			style={{ ...(styleProperties.header ?? {}) }}
			onClick={() =>
				onChangeSort({
					currentSortOrder,
					initialSortOrder,
					props,
					multiSort,
					sortBindingPath,
					sortKey,
					pageExtractor,
					onSort,
					hasSort,
					sortObjectType,
					ascValue,
					descValue,
					locationHistory,
				})
			}
			tabIndex={hasSort ? 0 : undefined}
			onContextMenu={
				context.table.enablePersonalization && !context.table.hideContextMenu
					? e => {
							e.preventDefault();
							e.stopPropagation();
							setShowMenuLocation({ x: e.clientX, y: e.clientY });
						}
					: undefined
			}
			{...dragProperties}
		>
			<HelperComponent context={props.context} definition={definition} />
			<style>{style}</style>
			<div className={`_headerContainer _${(currentSortOrder ?? 'no').toLowerCase()}`}>
				<SubHelperComponent definition={definition} subComponentName="headerContainer" />
				{leftIconComp}
				{label}
				{rightIconComp}
			</div>
			{menu}
		</th>
	);
}

function onChangeSort({
	currentSortOrder,
	initialSortOrder,
	props,
	multiSort,
	sortBindingPath,
	sortKey,
	pageExtractor,
	onSort,
	hasSort,
	sortTo,
	sortObjectType,
	ascValue,
	descValue,
	locationHistory,
}: {
	currentSortOrder: 'ASC' | 'DESC' | undefined;
	initialSortOrder: 'ASC' | 'DESC';
	props: Readonly<ComponentProps>;
	multiSort: boolean;
	sortBindingPath: string;
	sortKey: string;
	pageExtractor: PageStoreExtractor;
	onSort: string | undefined;
	hasSort: boolean;
	sortTo?: 'ASC' | 'DESC' | 'undefined' | undefined;
	sortObjectType: 'spring' | 'keyValue' | 'stringWithColon' | 'stringWithSpace';
	ascValue: string;
	descValue: string;
	locationHistory: Array<LocationHistory>;
}) {
	if (!hasSort) return;

	let newSortOrder: 'ASC' | 'DESC' | undefined = currentSortOrder;
	const sortObject = multiSort
		? getSortObject(
				getDataFromPath(`${sortBindingPath}`, locationHistory, pageExtractor),
				sortObjectType,
				ascValue,
			)
		: {};

	if (!sortTo) {
		if (newSortOrder === undefined) newSortOrder = initialSortOrder;
		else if (newSortOrder === 'ASC') newSortOrder = 'DESC';
		else newSortOrder = undefined;
	} else newSortOrder = sortTo === 'undefined' ? undefined : sortTo;

	if (!newSortOrder) delete sortObject[sortKey];
	else sortObject[sortKey] = newSortOrder;

	setData(
		sortBindingPath,
		getSortOrderFromSortObject(sortObject, sortObjectType, ascValue, descValue, multiSort),
		pageExtractor.getPageName(),
	);

	const onSortEvent = onSort ? props.pageDefinition.eventFunctions?.[onSort] : undefined;
	if (!onSortEvent) return;
	(async () =>
		await runEvent(
			onSortEvent,
			onSort,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		))();
}
