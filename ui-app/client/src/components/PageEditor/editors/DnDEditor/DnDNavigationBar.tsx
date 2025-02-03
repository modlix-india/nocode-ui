import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import ComponenstDefinition from '../../../';
import { DRAG_CD_KEY } from '../../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import { ContextMenuDetails } from '../../components/ContextMenu';
import { PageOperations } from '../../functions/PageOperations';

interface DnDNavigationBarProps {
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	onSelectedComponentListChanged: (key: string) => void;
	selectedSubComponent: string | undefined;
	selectedComponentsList: string[];
	onSelectedSubComponentChanged: (key: string) => void;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onContextMenu: (m: ContextMenuDetails) => void;
	previewMode: boolean;
	editorType: string | undefined;
}

export default function DnDNavigationBar({
	personalizationPath, // Page.personalization.editor
	onChangePersonalization,
	selectedComponent,
	selectedComponentsList,
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
	editorType,
}: DnDNavigationBarProps) {
	const [componentTree, setComponentTree] = React.useState(false); // component tree is open or not
	const [pageDef, setPageDef] = useState<PageDefinition>(); // page def object
	const [openParents, setOpenParents] = useState<Set<string>>(new Set()); // set object contains ids of all the parent components those are expand.
	const [expandAll, setExpandAll] = useState(false); // to expand all our componets
	const [filter, setFilter] = useState(''); // filter for components search in our page
	const [lastOpened, setLastOpened] = useState<string | undefined>(undefined); // which component expand last
	const [dragStart, setDragStart] = useState<boolean>(false); // dragging any component or not
	const [map, setMap] = useState(new Map<string, string>()); // contains all the components object ids
	const [oldSelected, setOldSelected] = useState<string>('');
	const [filterHandle, setFilterHandle] = useState<NodeJS.Timeout | undefined>();
	const [showMultiSelect, setShowMultiSelect] = useState(false); // Add new state for multi-select button visibility
	const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
	const [advancedFilters, setAdvancedFilters] = useState({
		name: '',
		type: '',
		tag: '',
		value: '',
		style: '',
		prop: '',
	});
	const [allFilteredSelected, setAllFilteredSelected] = useState(false);

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
					const componentMap = new Map<string, string>(
						Object.values(v?.componentDefinition ?? {})
							.filter(e => e && typeof e === 'object')
							.map((e: any) => ({
								parentKey: e.key as string,
								children: Object.keys(e.children ?? {}),
							}))
							.filter(e => e.children && e.children.length > 0)
							.flatMap(e => e.children.map(f => [f, e.parentKey])),
					);
					setMap(componentMap);
				},
				pageExtractor,
				`${defPath}`,
			),
		[defPath, setPageDef],
	);

	useEffect(() => {
		if (oldSelected === selectedComponent || !selectedComponent) return;

		let current = map.get(selectedComponent);
		let set = new Set(openParents);

		while (current) {
			set.add(current);
			current = map.get(current);
		}

		setOpenParents(set);
		setOldSelected(selectedComponent);
	}, [pageDef, selectedComponent, openParents, map, setOpenParents, setOldSelected]);

	const applyFilter = useCallback(
		(f: string) => {
			if (!f.trim()) {
				setShowMultiSelect(false);
				onSelectedComponentChanged('');
				onSelectedComponentListChanged('');
				setOpenParents(new Set());
				return;
			}

			const set = new Set(openParents);
			const matchingComponents: string[] = [];

			Object.values(pageDef?.componentDefinition ?? {})
				.filter(e => {
					const nameMatch = (e.name ?? '').toUpperCase().includes(f.toUpperCase());

					let tags: string[] = [];
					if (e._tags) {
						if (Array.isArray(e._tags)) {
							tags = e._tags.filter(tag => tag != null).map(tag => String(tag));
						} else if (e._tags != null) {
							tags = [String(e._tags)];
						}
					}
					const tagMatch = tags.some(tag => tag.toUpperCase().includes(f.toUpperCase()));

					const typeMatch = (e.type ?? '').toUpperCase().includes(f.toUpperCase());

					const styleMatch = Object.values(e.styleProperties ?? {}).some(style =>
						Object.values(style.resolutions?.ALL ?? {}).some(prop =>
							prop.value?.toString().toUpperCase().includes(f.toUpperCase()),
						),
					);

					const propMatch = Object.values(e.properties ?? {}).some(prop =>
						prop.value?.toString().toUpperCase().includes(f.toUpperCase()),
					);

					const isMatch = nameMatch || tagMatch || typeMatch || styleMatch || propMatch;

					if (isMatch) {
						matchingComponents.push(e.key);
					}
					return isMatch;
				})
				.forEach(e => {
					let p: string | undefined = e.key;
					while ((p = map.get(p))) {
						if (expandAll) set.delete(p);
						else set.add(p);
					}
				});

			setOpenParents(set);

			setShowMultiSelect(matchingComponents.length > 1);

			if (matchingComponents.length > 0) {
				onSelectedComponentChanged(matchingComponents[0]);
				matchingComponents.forEach(key => {
					onSelectedComponentListChanged(key);
				});
			}
		},
		[
			openParents,
			setOpenParents,
			pageDef,
			expandAll,
			map,
			onSelectedComponentChanged,
			onSelectedComponentListChanged,
		],
	);

	const handleMultiSelect = useCallback(() => {
		const matchingComponents = Object.values(pageDef?.componentDefinition ?? {})
			.filter(e => {
				if (isAdvancedSearch) {
					const nameMatch = advancedFilters.name
						? (e.name ?? '').toUpperCase().includes(advancedFilters.name.toUpperCase())
						: true;

					const typeMatch = advancedFilters.type
						? (e.type ?? '').toUpperCase().includes(advancedFilters.type.toUpperCase())
						: true;

					let tags: string[] = [];
					if (e.properties?._tags?.value) {
						const tagValue = e.properties._tags.value;
						if (Array.isArray(tagValue)) {
							tags = tagValue
								.filter(tag => tag != null)
								.map(tag => String(tag).toUpperCase());
						} else if (typeof tagValue === 'string') {
							tags = [tagValue.toUpperCase()];
						} else if (typeof tagValue === 'object') {
							tags = Object.values(tagValue)
								.filter(v => v != null)
								.map(v => String(v).toUpperCase());
						}
					}

					const tagMatch = advancedFilters.tag
						? tags.some(tag => tag.includes(advancedFilters.tag.toUpperCase()))
						: true;

					const valueMatch = advancedFilters.value
						? Object.values(e.properties ?? {}).some(prop =>
								prop.value
									?.toString()
									.toUpperCase()
									.includes(advancedFilters.value.toUpperCase()),
							)
						: true;

					const styleMatch = advancedFilters.style
						? Object.values(e.styleProperties ?? {}).some(style =>
								Object.values(style.resolutions?.ALL ?? {}).some(prop =>
									prop.value
										?.toString()
										.toUpperCase()
										.includes(advancedFilters.style.toUpperCase()),
								),
							)
						: true;

					const propMatch = advancedFilters.prop
						? Object.values(e.properties ?? {}).some(prop =>
								prop.value
									?.toString()
									.toUpperCase()
									.includes(advancedFilters.prop.toUpperCase()),
							)
						: true;

					return (
						nameMatch && typeMatch && tagMatch && valueMatch && styleMatch && propMatch
					);
				} else {
					const nameMatch = (e.name ?? '').toUpperCase().includes(filter.toUpperCase());

					let tags: string[] = [];
					if (e._tags) {
						if (Array.isArray(e._tags)) {
							tags = e._tags.filter(tag => tag != null).map(tag => String(tag));
						} else if (e._tags != null) {
							tags = [String(e._tags)];
						}
					}
					const tagMatch = tags.some(tag =>
						tag.toUpperCase().includes(filter.toUpperCase()),
					);

					const typeMatch = (e.type ?? '').toUpperCase().includes(filter.toUpperCase());
					const styleMatch = Object.values(e.styleProperties ?? {}).some(style =>
						Object.values(style.resolutions?.ALL ?? {}).some(prop =>
							prop.value?.toString().toUpperCase().includes(filter.toUpperCase()),
						),
					);
					const propMatch = Object.values(e.properties ?? {}).some(prop =>
						prop.value?.toString().toUpperCase().includes(filter.toUpperCase()),
					);
					return nameMatch || tagMatch || typeMatch || styleMatch || propMatch;
				}
			})
			.map(e => e.key);

		if (matchingComponents.length > 0) {
			if (allFilteredSelected) {
				onSelectedComponentChanged('');
				onSelectedComponentListChanged('');
				setAllFilteredSelected(false);
			} else {
				onSelectedComponentChanged(matchingComponents[0]);
				matchingComponents.forEach(key => {
					onSelectedComponentListChanged(key);
				});
				setAllFilteredSelected(true);
			}
		}
	}, [
		filter,
		advancedFilters,
		isAdvancedSearch,
		pageDef,
		onSelectedComponentChanged,
		onSelectedComponentListChanged,
		allFilteredSelected,
	]);

	useEffect(() => {
		if (!selectedComponent || selectedComponentsList?.length != 1) return;
		const element = document.getElementById(`treeNode_${selectedComponent}`);
		if (element) {
			const rect = element.getBoundingClientRect();
			if (rect.top < 0 || rect.bottom > window.innerHeight)
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		} else {
			setTimeout(() => {
				const element = document.getElementById(`treeNode_${selectedComponent}`);
				if (!element) return;
				const rect = element.getBoundingClientRect();
				if (rect.top < 0 || rect.bottom > window.innerHeight)
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 100);
		}
	}, [selectedComponent]);

	const applyAdvancedFilter = useCallback(() => {
		const hasAnyFilter = Object.values(advancedFilters).some(f => f.trim() !== '');

		if (!hasAnyFilter) {
			setShowMultiSelect(false);
			onSelectedComponentChanged('');
			onSelectedComponentListChanged('');
			setOpenParents(new Set());
			return;
		}

		const set = new Set(openParents);
		const matchingComponents: string[] = [];

		Object.values(pageDef?.componentDefinition ?? {})
			.filter(e => {
				const nameMatch = advancedFilters.name
					? (e.name ?? '').toUpperCase().includes(advancedFilters.name.toUpperCase())
					: true;

				const typeMatch = advancedFilters.type
					? (e.type ?? '').toUpperCase().includes(advancedFilters.type.toUpperCase())
					: true;

				let tags: string[] = [];
				if (e.properties?._tags?.value) {
					const tagValue = e.properties._tags.value;
					if (Array.isArray(tagValue)) {
						tags = tagValue
							.filter(tag => tag != null)
							.map(tag => String(tag).toUpperCase());
					} else if (typeof tagValue === 'string') {
						tags = [tagValue.toUpperCase()];
					} else if (typeof tagValue === 'object') {
						tags = Object.values(tagValue)
							.filter(v => v != null)
							.map(v => String(v).toUpperCase());
					}
				}

				const tagMatch = advancedFilters.tag
					? tags.some(tag => tag.includes(advancedFilters.tag.toUpperCase()))
					: true;

				const valueMatch = advancedFilters.value
					? Object.values(e.properties ?? {}).some(prop =>
							prop.value
								?.toString()
								.toUpperCase()
								.includes(advancedFilters.value.toUpperCase()),
						)
					: true;

				const styleMatch = advancedFilters.style
					? Object.values(e.styleProperties ?? {}).some(style =>
							Object.values(style.resolutions?.ALL ?? {}).some(prop =>
								prop.value
									?.toString()
									.toUpperCase()
									.includes(advancedFilters.style.toUpperCase()),
							),
						)
					: true;

				const propMatch = advancedFilters.prop
					? Object.values(e.properties ?? {}).some(prop =>
							prop.value
								?.toString()
								.toUpperCase()
								.includes(advancedFilters.prop.toUpperCase()),
						)
					: true;

				const isMatch =
					nameMatch && typeMatch && tagMatch && valueMatch && styleMatch && propMatch;

				if (isMatch) {
					matchingComponents.push(e.key);
				}
				return isMatch;
			})
			.forEach(e => {
				let p: string | undefined = e.key;
				while ((p = map.get(p))) {
					if (expandAll) set.delete(p);
					else set.add(p);
				}
			});

		setOpenParents(set);
		setShowMultiSelect(matchingComponents.length > 1);

		if (matchingComponents.length > 0) {
			onSelectedComponentChanged(matchingComponents[0]);
			matchingComponents.forEach(key => {
				onSelectedComponentListChanged(key);
			});
		} else {
			onSelectedComponentChanged('');
			onSelectedComponentListChanged('');
		}
	}, [
		advancedFilters,
		openParents,
		pageDef,
		expandAll,
		map,
		onSelectedComponentChanged,
		onSelectedComponentListChanged,
	]);

	if (!componentTree || previewMode || !pageDef?.componentDefinition || !pageDef.rootComponent)
		return <div className="_propBar"></div>;

	return (
		<div className="_propBar _compNavBarVisible _left">
			<div className="_filterBar">
				{!isAdvancedSearch ? (
					<>
						<i
							className="fa fa-solid fa-chevron-circle-right"
							onClick={() => setIsAdvancedSearch(true)}
							title="Advanced Search"
						/>
						<input
							type="text"
							placeholder="Search filter"
							value={filter}
							onChange={e => {
								setFilter(e.target.value);
								if (filterHandle) clearTimeout(filterHandle);
								setFilterHandle(
									setTimeout(() => applyFilter(e.target.value), 1000),
								);
							}}
						/>
						{showMultiSelect && (
							<i
								className={`fa fa-solid ${allFilteredSelected ? 'fa-xmark-circle' : 'fa-check-circle'}`}
								onClick={handleMultiSelect}
								title={
									allFilteredSelected
										? 'Deselect All Matching Components'
										: 'Select All Matching Components'
								}
							/>
						)}
					</>
				) : (
					<>
						<i
							className="fa fa-solid fa-chevron-circle-up"
							onClick={() => {
								setIsAdvancedSearch(false);
								setAdvancedFilters({
									name: '',
									type: '',
									tag: '',
									value: '',
									style: '',
									prop: '',
								});
							}}
						/>

						<span className="_advancedFilterBody">
							{Object.entries(advancedFilters).map(([key, value]) => (
								<div key={key} className="_filterRow">
									<input
										type="text"
										placeholder={`Search with ${key}`}
										value={value}
										onChange={e => {
											setAdvancedFilters(prev => ({
												...prev,
												[key]: e.target.value,
											}));
											if (filterHandle) clearTimeout(filterHandle);
											setFilterHandle(
												setTimeout(() => applyAdvancedFilter(), 1000),
											);
										}}
									/>
								</div>
							))}
						</span>
						{showMultiSelect && (
							<i
								className={`fa fa-solid ${allFilteredSelected ? 'fa-xmark-circle' : 'fa-check-circle'}`}
								onClick={handleMultiSelect}
								title={
									allFilteredSelected
										? 'Deselect All Matching Components'
										: 'Select All Matching Components'
								}
							/>
						)}
					</>
				)}
				<i
					className={`fa fa-solid fa-circle-${expandAll ? 'minus' : 'plus'}`}
					onClick={() => {
						setExpandAll(!expandAll);
						setOpenParents(new Set());
					}}
				/>
			</div>
			<div className="_compsTree">
				<CompTree
					pageDef={pageDef}
					selectedComponent={selectedComponent}
					selectedComponentsList={selectedComponentsList}
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
					editorType={editorType}
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
	selectedComponentsList: string[];
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
	editorType: string | undefined;
}

function CompTree({
	pageDef,
	compKey,
	parents = [],
	expandAll,
	openParents,
	onOpenClose,
	selectedComponent,
	selectedComponentsList,
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
	editorType,
}: CompTreeProps) {
	const comp = pageDef?.componentDefinition[compKey];
	const hoverLonger = useRef<NodeJS.Timeout | null>();
	if (!comp) return <></>;

	const children =
		(comp?.type !== 'SectionGrid' && comp?.children) ||
		(comp?.type === 'SectionGrid' &&
			comp?.children &&
			(editorType === 'SECTION' || comp?.properties?.enableChildrenSelection?.value))
			? Object.keys(comp.children!)
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
					selectedComponentsList={selectedComponentsList}
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
					editorType={editorType}
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
			{filter ? (
				<Filter name={comp.name ?? compKey} filter={filter} />
			) : (
				(comp.name ?? compKey)
			)}
		</span>
	);

	return (
		<>
			<div
				id={`treeNode_${compKey}`}
				className={`_treeNode ${
					selectedComponent === compKey ||
					(Array.isArray(selectedComponentsList) &&
						selectedComponentsList.includes(compKey))
						? '_selected'
						: ''
				} ${dragStart ? '_dragStart' : ''}`}
				title={`${comp.name ?? ''} - ${compKey}`} // it will be visible when we hover to the component tab in the tree
				onClick={e => {
					// selecting multiple components by c	licking ctrl or meta keys(ios).
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
					if (!dragStart || !children?.length || isOpen || hoverLonger.current) return;
					hoverLonger.current = setTimeout(() => {
						onOpenClose(compKey);
						hoverLonger.current = null;
					}, 3000);
				}}
				onDragLeave={e => {
					if (!hoverLonger.current) return;
					clearTimeout(hoverLonger.current);
					hoverLonger.current = null;
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
								: '_nothing'
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
