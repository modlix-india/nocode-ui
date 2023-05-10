import React, { ReactNode, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import { ContextMenuDetails } from '../../components/ContextMenu';
import PageOperations from '../../functions/PageOperations';
import ComponenstDefinition from '../../../';
import { DRAG_CD_KEY } from '../../../../constants';

interface DnDNavigationBarProps {
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
	previewMode: boolean;
}

export default function DnDNavigationBar({
	personalizationPath,
	onChangePersonalization,
	selectedComponent,
	onSelectedComponentChanged,
	pageExtractor,
	defPath,
	locationHistory,
	pageOperations,
	onContextMenu,
	previewMode,
}: DnDNavigationBarProps) {
	const [componentTree, setComponentTree] = React.useState(false);
	const [pageDef, setPageDef] = useState<PageDefinition>();
	const [openParents, setOpenParents] = useState<Set<string>>(new Set());
	const [expandAll, setExpandAll] = useState(false);
	const [filter, setFilter] = useState('');
	const [lastOpened, setLastOpened] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setComponentTree(v),
			pageExtractor,
			`${personalizationPath}.componentTree`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setExpandAll(v),
			pageExtractor,
			`${personalizationPath}.expandAll`,
		);
	}, [personalizationPath]);

	useEffect(
		() =>
			addListenerAndCallImmediatelyWithChildrenActivity(
				(_, v) => {
					setPageDef(v);
				},
				pageExtractor,
				`${defPath}`,
			),
		[defPath, setPageDef],
	);

	if (!componentTree || previewMode || !pageDef?.componentDefinition || !pageDef.rootComponent)
		return <div className="_propBar"></div>;

	return (
		<div className="_propBar _compNavBarVisible">
			<div className="_filterBar">
				<input
					type="text"
					placeholder="Filter"
					value={filter}
					onChange={e => setFilter(e.target.value)}
				/>
				<i
					className={`fa fa-solid ${expandAll ? 'fa-square-minus' : 'fa-square-plus'}`}
					onClick={() => {
						setExpandAll(!expandAll);
						setOpenParents(new Set());
					}}
				></i>
			</div>
			<div className="_compsTree">
				<CompTree
					pageDef={pageDef}
					selectedComponent={selectedComponent}
					onSelectedComponentChanged={onSelectedComponentChanged}
					expandAll={expandAll}
					openParents={openParents}
					compKey={pageDef?.rootComponent ?? ''}
					lastOpened={lastOpened}
					onOpenClose={key => {
						setLastOpened(key);
						const s = new Set(openParents);
						if (s.has(key)) s.delete(key);
						else s.add(key);
						setOpenParents(s);
					}}
					pageOperations={pageOperations}
					onContextMenu={onContextMenu}
				/>
			</div>
		</div>
	);
}

interface CompTreeProps {
	pageDef: PageDefinition | undefined;
	expandAll: boolean;
	openParents: Set<string>;
	compKey: string;
	parents?: string[];
	onOpenClose: (key: string) => void;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	lastOpened: string | undefined;
	pageOperations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
}

function CompTree({
	pageDef,
	compKey,
	parents = [],
	expandAll,
	openParents,
	onOpenClose,
	selectedComponent,
	onSelectedComponentChanged,
	lastOpened,
	pageOperations,
	onContextMenu,
}: CompTreeProps) {
	const comp = pageDef?.componentDefinition[compKey];
	if (!comp) return <></>;

	const children = pageDef?.componentDefinition[compKey]?.children
		? Object.keys(pageDef.componentDefinition[compKey].children!)
		: undefined;
	const isOpen =
		children?.length &&
		(parents.length === 0 ||
			(!expandAll && openParents.has(compKey)) ||
			(expandAll && !openParents.has(compKey)));
	const levels: ReactNode[] = [];
	for (let i = 0; i < parents.length; i++)
		levels.push(
			<span
				className={`_treeNodeLevel ${parents[i] === lastOpened ? '_lastOpened' : ''}`}
				key={`num${i}`}
			></span>,
		);

	let childrenLevels: ReactNode[] = [];

	if (isOpen) {
		childrenLevels = children?.map((cKey, i) => (
			<CompTree
				pageDef={pageDef}
				compKey={cKey}
				parents={[...parents, compKey]}
				key={cKey}
				expandAll={expandAll}
				openParents={openParents}
				onOpenClose={onOpenClose}
				selectedComponent={selectedComponent}
				onSelectedComponentChanged={onSelectedComponentChanged}
				lastOpened={lastOpened}
				pageOperations={pageOperations}
				onContextMenu={onContextMenu}
			/>
		));
	}

	return (
		<>
			<div
				className={`_treeNode ${selectedComponent === compKey ? '_selected' : ''}`}
				title={`${comp.name ?? ''} - ${compKey}`}
				onClick={() => onSelectedComponentChanged(compKey)}
				draggable="true"
				onDragStart={e =>
					e.dataTransfer.items.add(`${DRAG_CD_KEY}${comp.key}`, 'text/plain')
				}
				onDragOver={e => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onDrop={e =>
					e.dataTransfer.items[0].getAsString(dragData =>
						pageOperations.droppedOn(comp.key, dragData),
					)
				}
				onContextMenu={e => {
					e.stopPropagation();
					e.preventDefault();
					onContextMenu({
						componentKey: comp.key,
						menuPosition: { x: e.screenX, y: e.screenY },
					});
				}}
			>
				{levels}
				<div className="_treeNodeName" onClick={() => {}}>
					<i
						className={`fa _animateTransform ${
							children?.length
								? 'fa-solid fa-angle-right ' + (isOpen ? 'fa-rotate-90' : '')
								: ''
						}`}
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							onOpenClose(compKey);
						}}
					/>
					<i className={`fa ${ComponenstDefinition.get(comp.type)?.icon} ?? '`} />
					<span className="_treeText">{comp.name ?? compKey}</span>
				</div>
			</div>
			{childrenLevels}
		</>
	);
}
