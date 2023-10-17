import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
} from '../../../../context/StoreContext';
import { Component, LocationHistory, PageDefinition, Section } from '../../../../types/common';
import ComponentDefinitions from '../../../';
import { PageOperations } from '../../functions/PageOperations';
import { DRAG_CD_KEY, DRAG_COMP_NAME } from '../../../../constants';

interface DnDSideBarProps {
	personalizationPath: string | undefined;
	defPath: string | undefined;
	logo: string | undefined;
	pageExtractor: PageStoreExtractor;
	onChangePersonalization: (prop: string, value: any) => void;
	selectedComponent: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onShowCodeEditor: (eventName: string) => void;
	previewMode: boolean;
	templateIframeRef: (element: HTMLIFrameElement | undefined) => void;
}

export default function DnDSideBar({
	personalizationPath,
	defPath,
	logo,
	pageExtractor,
	locationHistory,
	selectedComponent,
	onChangePersonalization,
	pageOperations,
	onShowCodeEditor,
	previewMode,
	templateIframeRef,
}: DnDSideBarProps) {
	const [noSelection, setNoSelection] = useState<boolean>(false);
	const [componentTree, setComponentTree] = useState<boolean>(false);
	const [noShell, setNoShell] = useState<boolean>(false);
	const [showCompMenu, setShowCompMenu] = useState(false);
	const [selectedComponentType, setSelectedComponentType] = useState('');
	const [query, setQuery] = useState('');
	const [theme, setTheme] = useState('light');
	const [selectedTemplateSection, setSelectedTemplateSection] = useState<Section>();
	const svgLogo = logo ? <img className="_logo" src={logo} /> : undefined;
	const [openCompMenu, setOpenCompMenu] = useState(false);
	const compMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setNoSelection(v ?? false),
			pageExtractor,
			`${personalizationPath}.slave.noSelection`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!showCompMenu) return;
		const handle = setInterval(() => {
			if (!compMenuRef.current) return;
			setOpenCompMenu(true);
			clearInterval(handle);
		}, 100);
		return () => clearInterval(handle);
	}, [showCompMenu, setOpenCompMenu, compMenuRef.current]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setNoShell(v ?? false),
			pageExtractor,
			`${personalizationPath}.slave.noShell`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setTheme(v),
			pageExtractor,
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

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

	const iframeRef = useRef<HTMLIFrameElement>(null);
	useEffect(() => {
		templateIframeRef(iframeRef.current ?? undefined);
		() => templateIframeRef(undefined);
	}, [iframeRef.current]);

	if (previewMode) {
		return <div className="_sideBar _previewMode"></div>;
	}

	const closeMenu = () => {
		setOpenCompMenu(false);
		compMenuRef.current?.classList.remove('foo');
		setTimeout(() => {
			setShowCompMenu(false);
		}, 700);
	};

	let compMenu = undefined;
	if (showCompMenu) {
		let compsList = undefined;

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
		const compList = compsList
			.sort((a, b) => a.displayName.localeCompare(b.displayName))
			.filter(
				f => f.displayName.toLowerCase().match(regex) || f.name.toLowerCase().match(regex),
			)
			.map(e => (
				<div
					key={e.name}
					className={`_popupMenuItem ${selectedComponentType === e.name ? 'active' : ''}`}
					title={e.description}
					onClick={() =>
						onChangePersonalization('selectedComponent', {
							componentName: e.name,
							selectedSection: e.sections ? e.sections[0] : undefined,
						})
					}
					onDoubleClick={() => {
						if (!selectedComponent) return;
						pageOperations.droppedOn(selectedComponent, `${DRAG_COMP_NAME}${e.name}`);
						closeMenu();
					}}
					draggable={true}
					onDragStart={ev =>
						ev.dataTransfer.items.add(`${DRAG_COMP_NAME}${e.name}`, 'text/plain')
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
			));
		let tempSections: any =
			(selectedComponentType
				? compsList.find(e => e.name === selectedComponentType)
				: undefined
			)?.sections || [];
		compMenu = (
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
					<div className="_elementBarSearchContainer">
						<p className="_elementBarSearchContainerHeading">ADD ELEMENT</p>
						<input
							value={query}
							onChange={e => setQuery(e.target.value)}
							placeholder="Search for elements or sections."
							type="text"
						/>
					</div>
					<div className="_elementsBarContainer">
						<div className="_popupMenu">{compList}</div>
						{selectedComponentType && (
							<div className="_compTemplates">
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
												e.name === selectedTemplateSection?.name
													? '_active'
													: ''
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
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="_sideBar">
				{svgLogo}
				<div className="_top">
					<div
						className={`_iconMenu ${showCompMenu ? '_active' : ''}`}
						tabIndex={0}
						onClick={() => {
							setShowCompMenu(true);
						}}
					>
						<i className="fa fa-solid fa-circle-plus" />
					</div>
					<div
						className={`_iconMenu ${componentTree ? '_active' : ''}`}
						tabIndex={0}
						onClick={() => onChangePersonalization('componentTree', !componentTree)}
					>
						<i className="fa fa-solid fa-layer-group" />
					</div>
				</div>
				<div className="_bottom">
					<div className="_iconMenu" tabIndex={0} onClick={() => onShowCodeEditor('')}>
						<i className="fa fa-solid fa-code"></i>
					</div>
					<div
						className="_iconMenu"
						tabIndex={0}
						onClick={() => onChangePersonalization('preview', true)}
					>
						<i className="fa fa-regular fa-eye"></i>
					</div>
					<div
						className="_iconMenu"
						tabIndex={0}
						onClick={() => pageOperations.deleteComponent(selectedComponent)}
						onDrop={e => {
							e.preventDefault();
							e.dataTransfer.items[0].getAsString(dragData => {
								if (!dragData.startsWith(DRAG_CD_KEY)) return;
								pageOperations.deleteComponent(
									dragData.substring(DRAG_CD_KEY.length),
								);
							});
						}}
						onDragOver={e => {
							e.preventDefault();
						}}
					>
						<i className="fa fa-regular fa-trash-can"></i>
					</div>
					<div
						className="_iconMenu _arrow"
						tabIndex={0}
						onClick={() => onChangePersonalization('slave.noSelection', !noSelection)}
					>
						<span
							className="fa-stack"
							title={noSelection ? 'Enable Selection' : 'Disable Selection'}
						>
							<i className="fa fa-solid fa-arrow-pointer fa-stack-1x"></i>
							<i
								className="fa fa-solid fa-slash fa-stack-1x"
								style={{ opacity: noSelection ? '0' : '1' }}
							></i>
						</span>
					</div>
					<div
						className="_iconMenu"
						tabIndex={0}
						onClick={() => onChangePersonalization('slave.noShell', !noShell)}
						title={noSelection ? 'Disable Selection' : 'Enable Selection'}
					>
						<i
							className={`fa fa-solid ${
								noShell ? 'fa-window-maximize' : 'fa-window-restore'
							}`}
							title={noSelection ? 'Show Shell' : 'Hide Shell'}
						/>
					</div>
				</div>
			</div>
			{compMenu}
		</>
	);
}
