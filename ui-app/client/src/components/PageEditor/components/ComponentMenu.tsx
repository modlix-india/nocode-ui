import React, { useEffect, useRef, useState } from 'react';
import { DRAG_COMP_NAME, TEMPLATE_DRAG } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
} from '../../../context/StoreContext';
import { LocationHistory, PageDefinition, Section, Component } from '../../../types/common';
import ComponentDefinitions from '../../index';
import { PageOperations } from '../functions/PageOperations';
import axios from 'axios';

export default function ComponentMenu({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	personalizationPath,
	onChangePersonalization,
	onCloseMenu,
	templateIframeRef,
	pageOperations,
	sectionsListConnectionName,
	sectionsCategoryList,
}: Readonly<{
	personalizationPath: string | undefined;
	selectedComponent: string | undefined;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
	onChangePersonalization: (prop: string, value: any) => void;
	onCloseMenu: () => void;
	templateIframeRef: (element: HTMLIFrameElement | undefined) => void;
	pageOperations: PageOperations;
	sectionsListConnectionName: string | undefined;
	sectionsCategoryList: any;
}>) {
	const [query, setQuery] = useState('');
	const [selectedComponentType, setSelectedComponentType] = useState('');
	const [selectedSectionCategory, setSelectedSectionCategory] = useState('');
	const [selectedTemplateSection, setSelectedTemplateSection] = useState<Section>();
	const [openCompMenu, setOpenCompMenu] = useState(false);
	const compMenuRef = useRef<HTMLDivElement>(null);
	const [theme, setTheme] = useState('light');
	const [originalCompType, setOriginalCompType] = useState('SECTIONS');
	const [sectionsList, setSectionsList] = useState<any>(null);
	let compType = sectionsListConnectionName ? originalCompType : 'COMPONENTS';

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setOriginalCompType(v ?? 'SECTIONS'),
			pageExtractor,
			`${personalizationPath}.compMenuType`,
		);
	}, [personalizationPath]);

	const iframeRef = useRef<HTMLIFrameElement>(null);
	useEffect(() => {
		templateIframeRef(iframeRef.current ?? undefined);
		return () => templateIframeRef(undefined);
	}, [iframeRef.current]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setTheme(v),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	const closeMenu = () => {
		setOpenCompMenu(false);
		compMenuRef.current?.classList.remove('foo');
		setTimeout(() => {
			onCloseMenu();
		}, 700);
	};

	useEffect(() => {
		const handle = setInterval(() => {
			if (!compMenuRef.current) return;
			setOpenCompMenu(true);
			clearInterval(handle);
		}, 100);
		return () => clearInterval(handle);
	}, [setOpenCompMenu, compMenuRef.current]);

	let compsList = undefined;

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				const componentName = !v?.componentName
					? Array.from(ComponentDefinitions.values()).filter(e => !e.isHidden)[0]?.name
					: v.componentName;
				const comp = Array.from(ComponentDefinitions.values()).find(
					e => e.name === componentName,
				);
				const selectedSection = !v?.selectedSection
					? comp?.sections && comp.sections[0]
					: comp?.sections &&
					  comp.sections.find(e => e.name === v?.selectedSection?.name);
				setSelectedComponentType(componentName);
				setSelectedTemplateSection(selectedSection);
			},
			pageExtractor,
			`${personalizationPath}.selectedComponent`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setSelectedSectionCategory(v ?? ''),
			pageExtractor,
			`${personalizationPath}.selectedSectionCategory`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!selectedSectionCategory) {
			setSectionsList(null);
			return;
		}

		(async () => {
			const sections = await axios(`api/core/function/execute/CoreServices.REST/GetRequest`, {
				method: 'POST',
				data: {
					connectionName: sectionsListConnectionName,
					url: `/api/core/function/execute/Items/ReadPageWithLatestVersion?type=Section&category=${selectedSectionCategory}`,
				},
			});
			setSectionsList(sections.data?.[0]?.result?.data?.[0]?.result?.list);
		})();
	}, [selectedSectionCategory]);

	if (!selectedComponent) {
		compsList = Array.from(ComponentDefinitions.values()).filter(
			e => !e.parentType && !e.isHidden,
		);
	} else {
		const def: PageDefinition = getDataFromPath(defPath, locationHistory, pageExtractor);
		const compDef = def.componentDefinition[selectedComponent];
		const component: Component | undefined = ComponentDefinitions.get(compDef?.type);
		if (component?.allowedChildrenType && !component?.allowedChildrenType.has('')) {
			compsList = Array.from(ComponentDefinitions.values()).filter(
				e => component.allowedChildrenType?.has(e.name) && !e.isHidden,
			);
		} else {
			compsList = Array.from(ComponentDefinitions.values()).filter(
				e => (!e.parentType || e.parentType === compDef?.type) && !e.isHidden,
			);
		}
	}
	let pattern = query
		.split('')
		.map(x => {
			return `(?=.*${x})`;
		})
		.join('');
	let regex = new RegExp(`${pattern}`, 'gi');
	const compList =
		compType === 'COMPONENTS' ? (
			<>
				<input
					className="_compMenuSearch"
					type="text"
					placeholder="Search"
					onChange={e => setQuery(e.target.value)}
					value={query}
				/>
				{compsList
					.sort((a, b) => a.displayName.localeCompare(b.displayName))
					.filter(
						f =>
							regex.exec(f.displayName.toLowerCase()) ||
							regex.exec(f.name.toLowerCase()),
					)
					.map(e => (
						<div
							key={e.name}
							className={`_compMenuItem ${
								selectedComponentType === e.name ? 'active' : ''
							}`}
							title={e.description}
							onClick={() =>
								onChangePersonalization('selectedComponent', {
									componentName: e.name,
									selectedSection: e.sections ? e.sections[0] : undefined,
								})
							}
							onDoubleClick={() => {
								if (!selectedComponent) return;
								pageOperations.droppedOn(
									selectedComponent,
									`${DRAG_COMP_NAME}${e.name}`,
								);
								closeMenu();
							}}
							draggable={true}
							onDragStart={ev =>
								ev.dataTransfer.items.add(
									`${DRAG_COMP_NAME}${e.name}`,
									'text/plain',
								)
							}
							onDragOver={e => {
								e.preventDefault();
								closeMenu();
							}}
						>
							{typeof e.subComponentDefinition?.[0].icon === 'string' ? (
								<i className={`fa ${e.subComponentDefinition?.[0].icon}`} />
							) : (
								e.subComponentDefinition?.[0].icon
							)}
							{e.displayName}
						</div>
					))}
			</>
		) : (
			sectionsCategoryList?.map((e: any) => (
				<div
					key={e.name}
					className={`_compMenuItem ${selectedSectionCategory === e._id ? 'active' : ''}`}
					title={e.name}
					onClick={() => onChangePersonalization('selectedSectionCategory', e._id)}
					onDragStart={ev =>
						ev.dataTransfer.items.add(`${DRAG_COMP_NAME}${e.name}`, 'text/plain')
					}
				>
					<img className="actual" src={e.image} />
					<img className="hover" src={e.hoverImage} />
					{e.name}
				</div>
			))
		);

	let tempSections: any =
		(selectedComponentType && compType === 'COMPONENTS'
			? compsList.find(e => e.name === selectedComponentType)
			: undefined
		)?.sections ?? [];

	let rightPart = <></>;

	if (compType === 'SECTIONS' && sectionsList?.content?.length) {
		console.log(sectionsList.content);
		rightPart = (
			<div
				className={`_popupMenuContainer _compMenu ${
					openCompMenu ? '_show' : ''
				} _compMenuRight _sections`}
			>
				{sectionsList.content.map((e: any) => (
					<div
						className="_sectionThumb"
						style={{ backgroundImage: `url('${e.thumbnail}')` }}
						draggable={true}
						onDragStart={ev =>
							ev.dataTransfer.items.add(
								`${TEMPLATE_DRAG}${JSON.stringify({
									mainKey: e.version.definition.rootComponent,
									objects: e.version.definition.componentDefinition,
								})}`,
								'text/plain',
							)
						}
						onDoubleClick={() => {
							if (!selectedComponent) return;
							pageOperations.droppedOn(
								selectedComponent,
								`${TEMPLATE_DRAG}${JSON.stringify({
									mainKey: e.version.definition.rootComponent,
									objects: e.version.definition.componentDefinition,
								})}`,
							);
							closeMenu();
						}}
					/>
				))}
			</div>
		);
	} else if (selectedComponentType && tempSections.length) {
		rightPart = (
			<div
				className={`_popupMenuContainer _compMenu ${
					openCompMenu ? '_show' : ''
				} _compMenuRight`}
			>
				<div className="_compTemplateSections">
					{tempSections.map((e: Section) => (
						<button
							key={e.name}
							onClick={() => {
								onChangePersonalization('selectedComponent', {
									componentName: selectedComponentType,
									selectedSection: e,
								});
							}}
							className={`_eachTemplateSection ${
								e.name === selectedTemplateSection?.name ? '_active' : ''
							}`}
						>
							{e.name}
						</button>
					))}
				</div>
				{selectedTemplateSection && (
					<iframe
						name="templateIframe"
						title="Template"
						ref={iframeRef}
						style={{ border: 'none' }}
						src={`/editortemplates/SYSTEM/page/${selectedTemplateSection?.pageName}`}
					/>
				)}
			</div>
		);
	} else {
		rightPart = <div className={`_popupMenuContainer _compMenu _compMenuRight`}></div>;
	}

	const sectionsTab = sectionsListConnectionName ? (
		<button
			className={`_tab ${compType === 'SECTIONS' ? '_selected' : ''}`}
			onClick={() => {
				setOriginalCompType('SECTIONS');
				onChangePersonalization('compMenuType', 'SECTIONS');
			}}
		>
			Sections
		</button>
	) : (
		<></>
	);

	return (
		<div
			className={`_popupMenuBackground ${theme}`}
			onMouseDown={e => e.target === e.currentTarget && closeMenu()}
			onDrop={() => {}}
			onDragOver={e => e.target === e.currentTarget && closeMenu()}
		>
			<div
				className={`_popupMenuContainer _compMenu ${openCompMenu ? '_show' : ''}`}
				ref={compMenuRef}
			>
				<div className="_left">
					<div className="_tabContainerContainer">
						<div className="_tabContainer">
							{sectionsTab}
							<button
								className={`_tab ${compType !== 'SECTIONS' ? '_selected' : ''}`}
								onClick={() => {
									setOriginalCompType('COMPONENTS');
									onChangePersonalization('compMenuType', 'COMPONENTS');
								}}
							>
								Elements
							</button>
						</div>
					</div>
					<div className="_compList">{compList}</div>
				</div>
			</div>
			{rightPart}
		</div>
	);
}
