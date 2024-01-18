import React, { useEffect, useRef, useState } from 'react';
import { DRAG_COMP_NAME } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getDataFromPath,
} from '../../../context/StoreContext';
import { LocationHistory, PageDefinition, Section, Component } from '../../../types/common';
import ComponentDefinitions from '../../index';
import { PageOperations } from '../functions/PageOperations';

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
}: {
	personalizationPath: string | undefined;
	selectedComponent: string | undefined;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageExtractor: PageStoreExtractor;
	onChangePersonalization: (prop: string, value: any) => void;
	onCloseMenu: () => void;
	templateIframeRef: (element: HTMLIFrameElement | undefined) => void;
	pageOperations: PageOperations;
}) {
	const [query, setQuery] = useState('');
	const [selectedComponentType, setSelectedComponentType] = useState('');
	const [selectedTemplateSection, setSelectedTemplateSection] = useState<Section>();
	const [openCompMenu, setOpenCompMenu] = useState(false);
	const compMenuRef = useRef<HTMLDivElement>(null);
	const [theme, setTheme] = useState('light');
	const [compType, setCompType] = useState('SECTIONS');

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setCompType(v ?? 'SECTIONS'),
			pageExtractor,
			`${personalizationPath}.compMenuType`,
		);
	}, [personalizationPath]);

	const iframeRef = useRef<HTMLIFrameElement>(null);
	useEffect(() => {
		templateIframeRef(iframeRef.current ?? undefined);
		() => templateIframeRef(undefined);
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
		.toLowerCase()
		.split('')
		.map(x => {
			return `(?=.*${x})`;
		})
		.join('');
	let regex = new RegExp(`${pattern}`, 'g');
	const compList =
		compType === 'COMPONENTS'
			? compsList
					.sort((a, b) => a.displayName.localeCompare(b.displayName))
					.filter(
						f =>
							f.displayName.toLowerCase().match(regex) ||
							f.name.toLowerCase().match(regex),
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
					))
			: [];

	let tempSections: any =
		(selectedComponentType && compType === 'COMPONENTS'
			? compsList.find(e => e.name === selectedComponentType)
			: undefined
		)?.sections ?? [];

	let rightPart = <></>;

	if (compType === 'SECTIONS') {
	} else if (selectedComponentType && tempSections.length) {
		rightPart = (
			<div className="_right">
				<div className="_compTemplateSections">
					{tempSections.map((e: Section) => (
						<div
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
						</div>
					))}
				</div>
				{selectedTemplateSection && (
					<iframe
						ref={iframeRef}
						style={{ border: 'none' }}
						src={`/editortemplates/SYSTEM/page/${selectedTemplateSection?.pageName}`}
					/>
				)}
			</div>
		);
	}

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
							<div
								className={`_tab ${compType === 'SECTIONS' ? '_selected' : ''}`}
								onClick={() => {
									setCompType('SECTIONS');
									onChangePersonalization('compMenuType', 'SECTIONS');
								}}
							>
								Sections
							</div>
							<div
								className={`_tab ${compType !== 'SECTIONS' ? '_selected' : ''}`}
								onClick={() => {
									setCompType('COMPONENTS');
									onChangePersonalization('compMenuType', 'COMPONENTS');
								}}
							>
								Elements
							</div>
						</div>
					</div>
					<div className={`_compList ${!selectedTemplateSection ? '_twoColumn' : ''} `}>
						{compList}
					</div>
				</div>
				{rightPart}
			</div>
		</div>
	);
}
