import React, { useState } from 'react';
import {
	getDataFromPath,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../../context/StoreContext';
import { ComponentDefinition, ComponentProps } from '../../../types/common';
import { processComponentStylePseudoClasses } from '../../../util/styleProcessor';
import Children from '../../Children';
import { HelperComponent } from '../../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import useDefinition from '../../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnProperties';

export default function TableColumnComponent(props: Readonly<ComponentProps>) {
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates, properties: { hideIfNotPersonalized } = {} } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
			urlExtractor,
		);

	const [hover, setHover] = useState(false);
	const [treeHover, setTreeHover] = useState(false);
	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const personalizedObject = context.table.personalizationBindingPath
		? getDataFromPath(
				`${context.table.personalizationBindingPath}`,
				locationHistory,
				pageExtractor,
			)
		: undefined;

	if (
		(hideIfNotPersonalized && !personalizedObject?.hiddenFields?.[definition.key]) ||
		(!hideIfNotPersonalized && personalizedObject?.hiddenFields?.[definition.key])
	) {
		return null;
	}

	let dataPart;
	const isLoading =
		context.table.isLoading &&
		context.table.showSpinner &&
		context.table.spinnerType.startsWith('_emptyRow');

	if (isLoading) {
		dataPart = <div className={`_animateData ${context.table.spinnerType}`}>&nbsp;</div>;
	} else {
		dataPart = (
			<Children
				pageDefinition={pageDefinition}
				renderableChildren={firstchild}
				context={context}
				locationHistory={locationHistory}
			/>
		);
	}
	let treePrefix: React.ReactNode = undefined;
	const treeRowData = context.table?.treeRowData;
	const treeStyleSet = context.table?.treeStyles;
	const activeTreeStyles = treeStyleSet
		? treeHover && treeStyleSet.hover
			? treeStyleSet.hover
			: treeStyleSet.normal
		: undefined;

	if (treeRowData && definition.key === context.table?.firstColumnKey) {
		treePrefix = renderTreeCellContent({
			row: treeRowData,
			showConnectors: context.table.showConnectors,
			indentSize: context.table.indentSize,
			expandIcon: context.table.expandIcon,
			collapseIcon: context.table.collapseIcon,
			toggleExpand: context.table.toggleExpand,
			normalStyles: treeStyleSet?.normal ?? {},
			hoverStyles: treeStyleSet?.hover ?? {},
			definition: context.table.columnsDefinition ?? definition,
		});
	}

	return (
		<td
			className={`comp compTableColumn${treePrefix ? ' _treeColumn' : ''}`}
			style={styleProperties.comp}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
		>
			<HelperComponent context={props.context} definition={definition} />
			{treePrefix ? (
				<div
					className="_treeColumnCell"
					style={activeTreeStyles?.treeCell}
					onMouseEnter={() => setTreeHover(true)}
					onMouseLeave={() => setTreeHover(false)}
				>
					<SubHelperComponent definition={context.table?.columnsDefinition ?? definition} subComponentName="treeCell" />
					{treePrefix}
					<span className="_treeCellContent">{dataPart}</span>
				</div>
			) : (
				dataPart
			)}
		</td>
	);
}

function renderTreeCellContent(params: {
	row: any;
	showConnectors: boolean;
	indentSize: number;
	expandIcon: string | undefined;
	collapseIcon: string | undefined;
	toggleExpand: (nodeKey: string, dataPath: string) => void;
	normalStyles: any;
	hoverStyles: any;
	definition: ComponentDefinition;
}): React.ReactNode {
	const { row, showConnectors, indentSize, expandIcon, collapseIcon, toggleExpand, normalStyles, hoverStyles, definition } = params;
	const indents: React.ReactNode[] = [];
	const lineStyle = normalStyles.treeLines ?? {};
	const sizeStyle = { width: indentSize, minWidth: indentSize };

	for (let d = 0; d < row.parentPath.length; d++) {
		const hasLine = showConnectors && row.parentPath[d];
		indents.push(
			<span key={`indent_${d}`} className="_treeIndent" style={sizeStyle}>
				{hasLine && <div className="_treeLine _vertical" style={lineStyle} />}
			</span>,
		);
	}

	if (row.depth > 0 && showConnectors) {
		indents.push(
			<span key="connector" className="_treeConnector" style={sizeStyle}>
				<SubHelperComponent definition={definition} subComponentName="treeLines" />
				<div className="_treeLine _horizontal" style={lineStyle} />
				{row.isLastChild ? (
					<div className="_treeLine _verticalHalf" style={lineStyle} />
				) : (
					<div className="_treeLine _vertical" style={lineStyle} />
				)}
			</span>,
		);
	} else if (row.depth > 0) {
		indents.push(<span key="connector" className="_treeConnector" style={sizeStyle} />);
	}

	if (row.hasChildren) {
		const wrapClasses = ['_treeToggleWrap'];
		if (row.isExpanded) wrapClasses.push('_expanded');
		if (row.depth === 0) wrapClasses.push('_rootLevel');

		const wrapLines: React.ReactNode[] = [];

		if (row.depth === 0) {
			// Root level sibling lines
			if (row.isFirstChild && !row.isLastChild) {
				wrapLines.push(<div key="rootLine" className="_treeLine _verticalBottom" style={lineStyle} />);
			} else if (!row.isFirstChild && !row.isLastChild) {
				wrapLines.push(<div key="rootLine" className="_treeLine _vertical" style={lineStyle} />);
			} else if (row.isLastChild && !row.isFirstChild) {
				wrapLines.push(<div key="rootLine" className="_treeLine _verticalHalf" style={lineStyle} />);
			}
		}

		if (row.isExpanded && row.depth > 0) {
			// Downward children line for non-root expanded nodes
			wrapLines.push(<div key="childLine" className="_treeLine _verticalBottom" style={lineStyle} />);
		}

		indents.push(
			<span key="toggleWrap" className={wrapClasses.join(' ')}>
				{wrapLines}
				<TreeToggleButton
					row={row}
					expandIcon={expandIcon}
					collapseIcon={collapseIcon}
					toggleExpand={toggleExpand}
					normalStyles={normalStyles}
					hoverStyles={hoverStyles}
					definition={definition}
				/>
			</span>,
		);
	} else {
		indents.push(<span key="leaf" className="_treeLeafSpacer" />);
	}

	return <>{indents}</>;
}

function TreeToggleButton({
	row,
	expandIcon,
	collapseIcon,
	toggleExpand,
	normalStyles,
	hoverStyles,
	definition,
}: {
	row: any;
	expandIcon: string | undefined;
	collapseIcon: string | undefined;
	toggleExpand: (nodeKey: string, dataPath: string) => void;
	normalStyles: any;
	hoverStyles: any;
	definition: ComponentDefinition;
}) {
	const [btnHover, setBtnHover] = useState(false);
	const subName = row.isExpanded ? 'treeCollapseButton' : 'treeExpandButton';
	const activeStyles = btnHover ? hoverStyles : normalStyles;
	const buttonStyle = row.isExpanded
		? activeStyles.treeCollapseButton
		: activeStyles.treeExpandButton;

	let icon: React.ReactNode;
	if (row.isExpanded) {
		icon = collapseIcon ? (
			<i className={collapseIcon} />
		) : (
			<svg width="10" height="10" viewBox="0 0 10 10">
				<path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
			</svg>
		);
	} else {
		icon = expandIcon ? (
			<i className={expandIcon} />
		) : (
			<svg width="10" height="10" viewBox="0 0 10 10">
				<path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
			</svg>
		);
	}

	return (
		<button
			className={`_treeToggle ${row.isExpanded ? '_expanded' : '_collapsed'}`}
			onClick={e => {
				e.stopPropagation();
				toggleExpand(row.nodeKey, row.dataPath);
			}}
			type="button"
			style={buttonStyle}
			onMouseEnter={() => setBtnHover(true)}
			onMouseLeave={() => setBtnHover(false)}
		>
			<SubHelperComponent definition={definition} subComponentName={subName} />
			{icon}
		</button>
	);
}
