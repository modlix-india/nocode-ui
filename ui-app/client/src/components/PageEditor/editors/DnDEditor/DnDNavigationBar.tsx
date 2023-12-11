import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import { ContextMenuDetails } from '../../components/ContextMenu';
import { PageOperations } from '../../functions/PageOperations';
import ComponenstDefinition from '../../../';
import { DRAG_CD_KEY } from '../../../../constants';
import { LinkedList } from '@fincity/kirun-js';

interface DnDNavigationBarProps {
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	onSelectedComponentListChanged: (key: string) => void;
	selectedSubComponent: string | undefined;
	selectednComponentsList: string[];
	onSelectedSubComponentChanged: (key: string) => void;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
	previewMode: boolean;
}

export default function DnDNavigationBar({
	personalizationPath, // Page.personalization.editor
	onChangePersonalization,
	selectedComponent,
	selectednComponentsList,
	onSelectedComponentChanged,
	onSelectedComponentListChanged,
	selectedSubComponent,
	onSelectedSubComponentChanged,
	pageExtractor,
	defPath,
	locationHistory,
	pageOperations,
	onContextMenu,
	previewMode,
}: DnDNavigationBarProps) {
	const [componentTree, setComponentTree] = React.useState(false); // component tree is open or not
	const [pageDef, setPageDef] = useState<PageDefinition>(); // page def object
	const [openParents, setOpenParents] = useState<Set<string>>(new Set()); // set object contains ids of all the parent components those are expand.
	const [expandAll, setExpandAll] = useState(false); // to expand all our componets
	const [filter, setFilter] = useState(''); // filter for components search in our page
	const [lastOpened, setLastOpened] = useState<string | undefined>(undefined); // which component expand last
	const [dragStart, setDragStart] = useState<boolean>(false); // dragging any component or not
	const [map, setMap] = useState(new Map<string, string>()); // contains all the components object ids

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

	const applyFilter = useCallback(
		(f: string) => {
			if (!f.trim()) return;

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
			setOpenParents(set);
		},
		[openParents, setOpenParents, pageDef, expandAll, map],
	);

	const [filterHandle, setFilterHandle] = useState<NodeJS.Timeout | undefined>();

	if (!componentTree || previewMode || !pageDef?.componentDefinition || !pageDef.rootComponent)
		return <div className="_propBar"></div>;

	return (
		<div className="_propBar _compNavBarVisible _left">
			<div className="_filterBar">
				<input
					type="text"
					placeholder="Search filter"
					value={filter}
					onChange={e => {
						setFilter(e.target.value);
						if (filterHandle) clearTimeout(filterHandle);
						setFilterHandle(setTimeout(() => applyFilter(e.target.value), 1000));
					}}
				/>
				<i
					className={`fa fa-solid ${expandAll ? 'fa-circle-minus' : 'fa-circle-plus'}`}
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
					selectednComponentsList={selectednComponentsList}
					onSelectedComponentChanged={onSelectedComponentChanged}
					onSelectedComponentListChanged={onSelectedComponentListChanged}
					selectedSubComponent={selectedSubComponent}
					onSelectedSubComponentChanged={onSelectedSubComponentChanged}
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
	selectednComponentsList: string[];
	onSelectedComponentChanged: (key: string) => void;
	onSelectedComponentListChanged: (key: string) => void;
	selectedSubComponent: string | undefined;
	onSelectedSubComponentChanged: (key: string) => void;
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
	selectednComponentsList,
	onSelectedComponentChanged,
	onSelectedComponentListChanged,
	selectedSubComponent,
	onSelectedSubComponentChanged,
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

	const subCompDef = ComponenstDefinition.get(comp.type)?.subComponentDefinition;

	const isOpen =
		(children?.length || (subCompDef?.length ?? 0) > 1) &&
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

	const [changingName, setChangingName] = useState('');

	if (isOpen && children?.length) {
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
					selectednComponentsList={selectednComponentsList}
					onSelectedComponentChanged={onSelectedComponentChanged}
					onSelectedComponentListChanged={onSelectedComponentListChanged}
					selectedSubComponent={selectedSubComponent}
					onSelectedSubComponentChanged={onSelectedSubComponentChanged}
					lastOpened={lastOpened}
					pageOperations={pageOperations}
					onContextMenu={onContextMenu}
					dragStart={dragStart}
					setDragStart={setDragStart}
					filter={filter}
				/>
			));
	}

	let subComps: ReactNode[] = [];
	if (isOpen && (subCompDef?.length ?? 0) > 1) {
		subComps = subCompDef!
			.filter(e => e.name !== '')
			.map((e, i) => (
				<SubCompTree
					key={`${compKey}_${e.name}`}
					subComp={e}
					lastOpened={lastOpened}
					parents={parents}
					componentKey={compKey}
					selectedComponent={selectedComponent}
					onSelectedComponentChanged={onSelectedComponentChanged}
					selectedSubComponent={selectedSubComponent}
					onSelectedSubComponentChanged={onSelectedSubComponentChanged}
				/>
			));
	}

	const nameChange = () => {
		if (changingName === comp.name || changingName.trim() === '') {
			setChangingName('');
			return;
		}
		pageOperations.changeComponentName(compKey, changingName.trim());
		setChangingName('');
	};

	const text = changingName ? (
		<>
			<input
				type="text"
				value={changingName}
				autoFocus={true}
				onChange={e => setChangingName(e.target.value)}
				onKeyDown={e => {
					if (e.key !== 'Enter') return;
					nameChange();
				}}
				onBlur={nameChange}
			/>
		</>
	) : (
		<span className="_treeText">
			{filter ? <Filter name={comp.name ?? compKey} filter={filter} /> : comp.name ?? compKey}
		</span>
	);

	return (
		<>
			<div
				className={`_treeNode ${
					selectedComponent === compKey ||
					(Array.isArray(selectednComponentsList) &&
						selectednComponentsList.includes(compKey))
						? '_selected'
						: ''
				} ${dragStart ? '_dragStart' : ''}`}
				title={`${comp.name ?? ''} - ${compKey}`} // it will be visible when we hover to the component tab in the tree
				onClick={e => {
					// selecting multiple components by clicking ctrl or meta keys(ios).
					if (e.metaKey || e.ctrlKey) {
						return onSelectedComponentListChanged(compKey);
					}
					return onSelectedComponentChanged(compKey);
				}}
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
						menuPosition: { x: e.clientX, y: e.clientY },
					});
				}}
				onDoubleClick={() => setChangingName(comp.name ?? comp.key)}
			>
				{levels}
				<div className="_treeNodeName" onClick={() => {}}>
					<i
						className={`fa _animateTransform ${
							children?.length || (subCompDef?.length ?? 0) > 1
								? 'fa-solid fa-caret-right ' + (isOpen ? 'fa-rotate-90' : '')
								: ''
						}`}
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							onOpenClose(compKey);
						}}
					/>
					{typeof subCompDef?.[0].icon === 'string' ? (
						<i className={`fa ${subCompDef?.[0].icon}`} />
					) : (
						subCompDef?.[0].icon
					)}
					{text}
				</div>
			</div>
			{subComps}
			{childrenLevels}
		</>
	);
}

function SubCompTree({
	subComp,
	parents,
	lastOpened,
	componentKey,
	selectedComponent,
	onSelectedComponentChanged,
	selectedSubComponent,
	onSelectedSubComponentChanged,
}: {
	subComp: any;
	parents: string[];
	lastOpened: string | undefined;
	componentKey: string;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	selectedSubComponent: string | undefined;
	onSelectedSubComponentChanged: (key: string) => void;
}) {
	const levels: ReactNode[] = [];
	for (let i = 0; i < parents.length; i++)
		levels.push(
			<span
				className={`_treeNodeLevel ${parents[i] === lastOpened ? '_lastOpened' : ''}`}
				key={`num${i}`}
			></span>,
		);

	levels.push(
		<span
			className={`_treeNodeLevel ${componentKey === lastOpened ? '_lastOpened' : ''}`}
			key={`num${parents.length}`}
		/>,
	);

	return (
		<div
			className={`_treeNode _subComponent ${
				selectedComponent === componentKey &&
				selectedSubComponent === `${componentKey}:${subComp.name}`
					? '_selected'
					: ''
			}`}
			// it gets called when sub component gets selected
			onClick={() => onSelectedSubComponentChanged(`${componentKey}:${subComp.name}`)}
		>
			{levels}
			<div
				className="_treeNodeName"
				onClick={() => {}} // why we need this on click function ?
			>
				<i className="fa _animateTransform" />
				{typeof subComp.icon === 'string' ? (
					<i className={`fa ${subComp.icon}`} />
				) : (
					subComp.icon
				)}
				{subComp.displayName ?? subComp.name}
			</div>
		</div>
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
