import { getDataFromPath, PageStoreExtractor, setData } from '../../../context/StoreContext';
import { ComponentProps } from '../../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../../util/styleProcessor';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { runEvent } from '../../util/runEvent';
import useDefinition from '../../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnHeaderProperties';

export default function TableColumnHeaderComponent(props: Readonly<ComponentProps>) {
	const {
		locationHistory = [],
		context,
		definition,
		definition: { key },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
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
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
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
			</i>
		);
	}

	const { sortBindingPath, onSort, multiSort } = context.table;

	let rightIconComp;
	const hasSort = sortKey && sortBindingPath && onSort;
	let currentSortOrder: string | undefined;
	if (hasSort) {
		currentSortOrder = getDataFromPath(
			`${sortBindingPath}.${sortKey}`,
			locationHistory,
			pageExtractor,
		);
		const sortIcon =
			currentSortOrder === 'ASC'
				? sortAscendingIcon
				: currentSortOrder === 'DESC'
					? sortDescendingIcon
					: sortNoneIcon;

		if (sortIcon) {
			rightIconComp = (
				<i className={`_sortIcon ${currentSortOrder} ${sortIcon}`}>
					<SubHelperComponent definition={definition} subComponentName="rightIcon" />
				</i>
			);
		} else {
			rightIconComp = (
				<svg
					className={`_sortIcon ${currentSortOrder}`}
					width="11"
					height="10"
					viewBox="0 0 11 10"
					fill="none"
				>
					<path
						d="M10.8437 7.70029C11.0521 7.49052 11.0521 7.15131 10.8437 6.94376C10.6353 6.73622 10.2982 6.73399 10.092 6.94376L8.87251 8.17117L8.87029 0.536711C8.87029 0.239902 8.63304 0.00111582 8.33814 0.00111582C8.04324 0.00111582 7.80599 0.239902 7.80599 0.536711V8.17117L6.58647 6.94376C6.37805 6.73399 6.04102 6.73399 5.83481 6.94376C5.6286 7.15354 5.62639 7.49275 5.83481 7.70029L7.96341 9.84267C8.17184 10.0524 8.50887 10.0524 8.71508 9.84267L10.8437 7.70029ZM3.0388 0.157331C2.83038 -0.0524436 2.49335 -0.0524436 2.28714 0.157331L0.156319 2.29971C-0.0521064 2.50948 -0.0521064 2.84869 0.156319 3.05624C0.364745 3.26378 0.701774 3.26601 0.907982 3.05624L2.12749 1.82883L2.12971 9.46329C2.12971 9.7601 2.36696 9.99888 2.66186 9.99888C2.95676 9.99888 3.19401 9.7601 3.19401 9.46329V1.82883L4.41353 3.05624C4.62195 3.26601 4.95898 3.26601 5.16519 3.05624C5.3714 2.84646 5.37361 2.50725 5.16519 2.29971L3.0388 0.157331Z"
						fill="currentColor"
					/>
				</svg>
			);
		}
	} else if (rightIcon) {
		rightIconComp = (
			<i className={`_rightIcon ${rightIcon}`}>
				<SubHelperComponent definition={definition} subComponentName="rightIcon" />
			</i>
		);
	}

	let style = processStyleObjectToCSS(
		styleProperties.comp,
		`.comp.compTableHeaderColumn.c${key}`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.comp,
		`.comp.compTableHeaderColumn.c${key}:hover`,
	);
	style += processStyleObjectToCSS(
		styleProperties.headerContainer,
		`.comp.compTableHeaderColumn.c${key} ._headerContainer`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.headerContainer,
		`.comp.compTableHeaderColumn.c${key}:hover ._headerContainer`,
	);
	style += processStyleObjectToCSS(
		styleProperties.leftIcon,
		`.comp.compTableHeaderColumn.c${key} ._leftIcon`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.leftIcon,
		`.comp.compTableHeaderColumn.c${key}:hover ._leftIcon`,
	);
	style += processStyleObjectToCSS(
		styleProperties.rightIcon,
		`.comp.compTableHeaderColumn.c${key} ._rightIcon`,
	);
	style += processStyleObjectToCSS(
		hoverStyleProperties.rightIcon,
		`.comp.compTableHeaderColumn.c${key}:hover ._rightIcon`,
	);

	return (
		<div
			className={`comp compTableHeaderColumn c${key} ${hasSort ? '_pointer' : ''}`}
			style={{ ...styleProperties.comp }}
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
				})
			}
			role="columnheader"
			tabIndex={hasSort ? 0 : undefined}
		>
			<HelperComponent context={props.context} definition={definition} />
			<style>{style}</style>
			<div className={`_headerContainer _${(currentSortOrder ?? 'no').toLowerCase()}`}>
				<SubHelperComponent definition={definition} subComponentName="headerContainer" />
				{leftIconComp}
				{label}
				{rightIconComp}
			</div>
		</div>
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
}: {
	currentSortOrder: string | undefined;
	initialSortOrder: string;
	props: Readonly<ComponentProps>;
	multiSort: boolean;
	sortBindingPath: string;
	sortKey: string;
	pageExtractor: PageStoreExtractor;
	onSort: string | undefined;
	hasSort: boolean;
}) {
	if (!hasSort) return;
	let newSortOrder = currentSortOrder;
	if (newSortOrder === undefined) newSortOrder = initialSortOrder;
	else if (newSortOrder === 'ASC') newSortOrder = 'DESC';
	else newSortOrder = undefined;

	if (multiSort)
		setData(`${sortBindingPath}.${sortKey}`, newSortOrder, pageExtractor.getPageName());
	else setData(sortBindingPath, { [sortKey]: newSortOrder }, pageExtractor.getPageName());

	const onSortEvent = onSort ? props.pageDefinition.eventFunctions?.[onSort] : undefined;
	if (onSortEvent)
		(async () =>
			await runEvent(
				onSortEvent,
				onSort,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			))();
}
