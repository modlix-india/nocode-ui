import React, { ReactNode, useCallback, useEffect, useState } from 'react';
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
import { LinkedList } from '@fincity/kirun-js';

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
	const [filter, setFilterOriginal] = useState('');
	const [lastOpened, setLastOpened] = useState<string | undefined>(undefined);
	const [dragStart, setDragStart] = useState<boolean>(false);
	const [map, setMap] = useState(new Map<string, string>());

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
					setMap(
						new Map<string, string>(
							Object.values(v?.componentDefinition ?? {})
								.map((e: any) => ({
									parentKey: e.key as string,
									children: Object.keys(e.children ?? {}),
								}))
								.filter(e => !!e.children.length)
								.flatMap(e => e.children.map(f => [f, e.parentKey])),
						),
					);
				},
				pageExtractor,
				`${defPath}`,
			),
		[defPath, setPageDef],
	);

	const [oldSelected, setOldSelected] = useState<string>('');

	useEffect(() => {
		if (oldSelected === selectedComponent || !selectedComponent) return;
		let current = map.get(selectedComponent);
		let set = new Set(openParents);
		while (current) {
			if (expandAll) set.delete(current);
			else set.add(current);
			current = map.get(current);
		}
		setOpenParents(set);
		setOldSelected(selectedComponent);
	}, [pageDef, expandAll, selectedComponent, openParents, map, setOpenParents, setOldSelected]);

	const setFilter = useCallback(
		(f: string) => {
			if (!f.trim()) {
				setFilterOriginal(f);
				return;
			}

			const set = new Set(openParents);

			Object.values(pageDef?.componentDefinition ?? {})
				.filter(e => (e.name ?? '').toUpperCase().includes(f.toUpperCase()))
				.map(e => e.key)
				.forEach(e => {
					let p: string | undefined = e;
					while ((p = map.get(p))) {
						if (expandAll) set.delete(p);
						else set.add(p);
					}
				});

			setFilterOriginal(f);
			setOpenParents(set);
		},
		[openParents, setFilterOriginal, setOpenParents, pageDef, expandAll, map],
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
					dragStart={dragStart}
					setDragStart={setDragStart}
					filter={filter}
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
	dragStart: boolean;
	setDragStart: (v: boolean) => void;
	filter: string;
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
	dragStart,
	setDragStart,
	filter,
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
		childrenLevels = children
			?.sort((a, b) => {
				const v =
					(pageDef?.componentDefinition[a]?.displayOrder ?? 0) -
					(pageDef?.componentDefinition[b]?.displayOrder ?? 0);
				return v === 0
					? (pageDef?.componentDefinition[a]?.key ?? '').localeCompare(
							pageDef?.componentDefinition[b]?.key ?? '',
					  )
					: v;
			})
			.map((cKey, i) => (
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
					dragStart={dragStart}
					setDragStart={setDragStart}
					filter={filter}
				/>
			));
	}

	return (
		<>
			<div
				className={`_treeNode ${selectedComponent === compKey ? '_selected' : ''} ${
					dragStart ? '_dragStart' : ''
				}`}
				title={`${comp.name ?? ''} - ${compKey}`}
				onClick={() => onSelectedComponentChanged(compKey)}
				draggable="true"
				onDragStart={e => {
					setDragStart(true);
					e.dataTransfer.items.add(`${DRAG_CD_KEY}${comp.key}`, 'text/plain');
				}}
				onDragOver={e => {
					e.preventDefault();
					e.stopPropagation();
					if (!dragStart || !children?.length || isOpen) return;
					onOpenClose(compKey);
				}}
				onDragEnd={e => setDragStart(false)}
				onDrop={e =>
					e.dataTransfer.items[0].getAsString(dragData =>
						pageOperations.droppedOn(comp.key, dragData, true),
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
					<span className="_treeText">
						{filter ? (
							<Filter name={comp.name ?? compKey} filter={filter} />
						) : (
							comp.name ?? compKey
						)}
					</span>
				</div>
			</div>
			{childrenLevels}
		</>
	);
}

function Filter({ name, filter }: { name: string; filter: string }) {
	const parts = name.toUpperCase().split(filter.toUpperCase());
	if (parts.length === 1) return <>{name}</>;

	const result: ReactNode[] = [];
	let start = 0;
	for (let i = 0; i < parts.length; i++) {
		if (i !== 0 && parts[i].length === 0) continue;
		result.push(<span key={`part${i}`}>{name.substring(start, start + parts[i].length)}</span>);

		start += parts[i].length;
		if (i < parts.length - 1) {
			result.push(
				<span key={`filter${i}`} className="_filter">
					{name.substring(start, start + filter.length)}
				</span>,
			);

			start += filter.length;
		}
	}
	return <>{result}</>;
}