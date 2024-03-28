import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import ComponenstDefinition from '../../../';
import { DRAG_CD_KEY } from '../../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentMultiProperty,
	ComponentProperty,
	LocationHistory,
	PageDefinition,
} from '../../../../types/common';
import { ContextMenuDetails } from '../../components/ContextMenu';
import { PageOperations } from '../../functions/PageOperations';
import DnDEditorSearchInput from './DnDEditorSearchInput';
import { Validation } from '../../../../types/validation';

interface DnDNavigationBarProps {
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	onSelectedComponentListChanged: (key: string) => void;
	setSelectedComponentOriginal: React.Dispatch<React.SetStateAction<string>>;
	setSelectedComponentsListOriginal: React.Dispatch<React.SetStateAction<string[]>>;
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
	searchOptions: string[];
	filter: string;
	setFilter: React.Dispatch<React.SetStateAction<string>>;
	selectedOption: string;
	setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
}

export default function DnDNavigationBar({
	personalizationPath, // Page.personalization.editor
	onChangePersonalization,
	selectedComponent,
	selectedComponentsList,
	onSelectedComponentChanged,
	onSelectedComponentListChanged,
	setSelectedComponentOriginal,
	setSelectedComponentsListOriginal,
	selectedSubComponent,
	onSelectedSubComponentChanged,
	pageExtractor,
	defPath,
	locationHistory,
	pageOperations,
	onContextMenu,
	previewMode,
	editorType,
	searchOptions,
	filter,
	setFilter,
	selectedOption,
	setSelectedOption,
}: DnDNavigationBarProps) {
	const [componentTree, setComponentTree] = React.useState(false); // component tree is open or not
	const [pageDef, setPageDef] = useState<PageDefinition>(); // page def object
	const [openParents, setOpenParents] = useState<Set<string>>(new Set()); // set object contains ids of all the parent components those are expand.
	const [expandAll, setExpandAll] = useState(false); // to expand all our componets
	const [lastOpened, setLastOpened] = useState<string | undefined>(undefined); // which component expand last
	const [dragStart, setDragStart] = useState<boolean>(false); // dragging any component or not
	const [map, setMap] = useState(new Map<string, string>()); // setMap will contain a map with key as children and value as parentKey
	const [filterHandle, setFilterHandle] = useState<NodeJS.Timeout | undefined>();
	const [showOptions, setShowOptions] = useState<boolean>();
	const [filteredComponentList, setFilteredComponentList] = useState<string[]>();
	const [isRegex, setIsRegex] = useState<boolean>(false);
	const [regexString, setRegexString] = useState<string>('');

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
					setMap(() => {
						let newData = new Map<string, string>(
							Object.values(v?.componentDefinition ?? {})
								.map((e: any) => ({
									parentKey: e.key as string,
									children: Object.keys(e.children ?? {}),
								}))
								.filter(e => !!e.children.length)
								.flatMap(e => e.children.map(f => [f, e.parentKey])),
						);
						return newData;
					});
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

	// here we are just opening the parents of the filtered components
	const applyFilter = useCallback(
		(f: string) => {
			if (!f.trim()) return;

			const set = new Set(openParents);
			let filteredComponents: string[] = [];
			Object.values(pageDef?.componentDefinition ?? {})
				.filter(e => {
					const regex = new RegExp(f);
					const cond1 = !isRegex
						? (e.name ?? '').toUpperCase().includes(f.toUpperCase())
						: regex.test(e.name);
					const cond2 = !isRegex
						? (e.type ?? '').toUpperCase().includes(f.toUpperCase())
						: regex.test(e.type);
					const cond3 = !isRegex ? (e.key ?? '').includes(f) : regex.test(e.key);
					const cond4 = (() => {
						let tags = e.properties?._tags ?? ([] as string[]);
						if (Array.isArray(tags))
							return !isRegex
								? tags.reduce((acc, tag) => {
										return !acc ? tag.includes(f) : acc;
								  }, false)
								: tags.reduce((acc, tag) => {
										return !acc ? regex.test(tag) : acc;
								  }, false);
					})();

					let cond5: boolean = false;
					const allProperties = e.properties;
					for (const propsKey in allProperties) {
						const properties = allProperties[propsKey];
						const entries = Object.entries(properties);

						if (!cond5) {
							cond5 = entries.reduce((acc, property) => {
								return !acc
									? !isRegex
										? property[1].includes(f)
										: regex.test(property[1])
									: acc;
							}, false);
						}
					}

					let cond6: boolean = false;
					const allStyleProperties = e.styleProperties;
					for (const propsKey in allStyleProperties) {
						const currentConditionStyleProperties = allStyleProperties[propsKey];
						const allResolutionProperties = {
							...currentConditionStyleProperties['resolutions'],
						};
						for (const currentResolutionStyleProperties of Object.entries(
							allResolutionProperties,
						)) {
							const entries = Object.entries(currentResolutionStyleProperties[1]);
							if (!cond6) {
								cond6 = entries.reduce((acc, property) => {
									const propValue = property[1].value;
									return !acc && propValue
										? !isRegex
											? propValue.includes(f)
											: regex.test(propValue)
										: acc;
								}, false);
							}
						}
					}

					if (selectedOption.includes('Name')) {
						return cond1;
					} else if (selectedOption.includes('Type')) {
						return cond2;
					} else if (selectedOption.includes('Key')) {
						return cond3;
					} else if (selectedOption.includes('Tag')) {
						return cond4;
					} else if (selectedOption.includes('Property')) {
						return cond5;
					} else if (selectedOption.includes('StyleProp')) {
						return cond6;
					} else if (selectedOption.includes('All')) {
						return (
							(selectedOption.includes('All') && cond1) ||
							cond2 ||
							cond3 ||
							cond4 ||
							cond5 ||
							cond6
						);
					}
				})
				.map(e => e.key)
				.forEach(e => {
					filteredComponents.push(e);
					let p: string | undefined = e;
					while ((p = map.get(p))) {
						if (expandAll) {
							set.delete(p);
						} else {
							set.add(p);
						}
					}
				});
			setFilteredComponentList(filteredComponents);
			setOpenParents(set);
		},
		[openParents, setOpenParents, pageDef, expandAll, map, selectedOption],
	);

	// useEffect(() => {
	// 	setSelectedComponentOriginal('');
	// 	setSelectedComponentsListOriginal([]);
	// }, [filteredComponentList]);

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
			}, 500);
		}
	}, [selectedComponent]);

	if (!componentTree || previewMode || !pageDef?.componentDefinition || !pageDef.rootComponent)
		return <div className="_propBar"></div>;

	return (
		<div className="_propBar _compNavBarVisible _left">
			<DnDEditorSearchInput
				filter={filter}
				setFilter={setFilter}
				filterHandle={filterHandle}
				setFilterHandle={setFilterHandle}
				applyFilter={applyFilter}
				expandAll={expandAll}
				setExpandAll={setExpandAll}
				setOpenParents={setOpenParents}
				showOptions={showOptions}
				setShowOptions={setShowOptions}
				selectedOption={selectedOption}
				setSelectedOption={setSelectedOption}
				searchOptions={searchOptions}
				filteredComponentList={filteredComponentList}
				onSelectedComponentListChanged={onSelectedComponentListChanged}
				selectedComponent={selectedComponent}
				selectedComponentsList={selectedComponentsList}
				setSelectedComponentOriginal={setSelectedComponentOriginal}
				setSelectedComponentsListOriginal={setSelectedComponentsListOriginal}
				isRegex={isRegex}
				setIsRegex={setIsRegex}
			/>
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
					selectedOption={selectedOption}
					isRegex={isRegex}
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
	selectedOption: string;
	isRegex: boolean;
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
	selectedOption,
	isRegex,
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
					selectedOption={selectedOption}
					isRegex={isRegex}
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
				<Filter
					name={comp.name ?? compKey}
					filterString={filter}
					filterBy={selectedOption}
					comp={comp}
					isRegex={isRegex}
				/>
			) : (
				comp.name ?? compKey
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
					{/* {typeof subCompDef?.[0].icon === 'string' ? (
						<i className={`fa ${subCompDef?.[0].icon}`} />
					) : (
						subCompDef?.[0].icon
					)} */}
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

function Filter({
	name,
	filterString,
	filterBy,
	comp,
	isRegex,
}: {
	name: string;
	filterString: string;
	filterBy: string;
	comp: ComponentDefinition;
	isRegex: boolean;
}) {
	const key = comp.key;
	const type = comp.type;
	const tags = comp?.properties?._tags ?? ([] as string[]);
	const regex = new RegExp(filterString);
	const allProperties = { ...comp?.properties };
	const allStyleProperties = { ...comp?.styleProperties };

	const newResult: ReactNode[] = [];
	const cond1 = !isRegex
		? name.toUpperCase().includes(filterString.toUpperCase())
		: regex.test(name);
	const cond2 = !isRegex ? key.includes(filterString) : regex.test(key);
	const cond3 = !isRegex
		? type.toUpperCase().includes(filterString.toUpperCase())
		: regex.test(type);
	const cond4 =
		Array.isArray(tags) &&
		(!isRegex
			? tags.reduce((acc, tag) => {
					return !acc ? tag.includes(filterString) : acc;
			  }, false)
			: tags.reduce((acc, tag) => {
					return !acc ? regex.test(tag) : acc;
			  }, false));

	let cond5: boolean = false;
	for (const propsKey in allProperties) {
		const properties = allProperties[propsKey];
		const entries = Object.entries(properties);

		if (!cond5) {
			cond5 = entries.reduce((acc, property) => {
				return !acc
					? !isRegex
						? property[1].includes(filterString)
						: regex.test(property[1])
					: acc;
			}, false);
		}
	}

	let cond6: boolean = false;
	for (const propsKey in allStyleProperties) {
		const currentConditionStyleProperties = allStyleProperties[propsKey];
		const allResolutionProperties = { ...currentConditionStyleProperties['resolutions'] };
		for (const currentResolutionStyleProperties of Object.entries(allResolutionProperties)) {
			const entries = Object.entries(currentResolutionStyleProperties[1]);
			if (!cond6) {
				cond6 = entries.reduce((acc, property) => {
					const propValue = property[1].value;
					return !acc && propValue
						? !isRegex
							? propValue.includes(filterString)
							: regex.test(propValue)
						: acc;
				}, false);
			}
		}
	}

	if (
		(filterBy === 'Name' && cond1) ||
		(filterBy === 'Key' && cond2) ||
		(filterBy === 'Type' && cond3) ||
		(filterBy === 'Tags' && cond4) ||
		(filterBy === 'Property' && cond5) ||
		(filterBy === 'StyleProp' && cond6) ||
		(filterBy === 'All' && (cond1 || cond2 || cond3 || cond4 || cond5 || cond6))
	) {
		newResult.push(<i className="fa-solid fa-check _filter"></i>);
	}

	if (filterBy === 'Name' && !isRegex) {
		const parts = name.toUpperCase().split(filterString.toUpperCase());
		if (parts.length === 1) return <>{name}</>;

		const result: ReactNode[] = [];
		let start = 0;
		for (let i = 0; i < parts.length; i++) {
			if (i !== 0 && parts[i].length === 0) continue;
			result.push(
				<span key={`part${i}`}>{name.substring(start, start + parts[i].length)}</span>,
			);

			start += parts[i].length;
			if (i < parts.length - 1) {
				result.push(
					<span key={`filter${i}`} className="_filterText">
						{name.substring(start, start + filterString.length)}
					</span>,
				);

				start += filterString.length;
			}
		}
		newResult.push(result);
	} else {
		newResult.push(<span>{name}</span>);
	}

	return newResult;
}
