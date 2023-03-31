import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
} from '../../../../context/StoreContext';
import { Component, LocationHistory, PageDefinition } from '../../../../types/common';
import Portal from '../../../Portal';
import ComponentDefinitions from '../../../';
import PageOperations from '../../functions/PageOperations';
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
}: DnDSideBarProps) {
	const [noSelection, setNoSelection] = useState<boolean>(false);
	const [noShell, setNoShell] = useState<boolean>(false);
	const [showCompMenu, setShowCompMenu] = useState<boolean>(false);
	const [selectedComponentType, setSelectedComponentType] = useState('');
	const [theme, setTheme] = useState('light');
	const svgLogo = logo ? <img className="_logo" src={logo} /> : undefined;

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setNoSelection(v ?? false),
			pageExtractor,
			`${personalizationPath}.slave.noSelection`,
		);
	}, [personalizationPath]);

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
					e => (!e.parentType || e.parentType === compDef.type) && !e.isHidden,
				);
			}
		}

		const compList = compsList
			.sort((a, b) => a.displayName.localeCompare(b.displayName))
			.map(e => (
				<div
					key={e.name}
					className={`_popupMenuItem ${selectedComponentType === e.name ? 'active' : ''}`}
					title={e.description}
					onClick={() => setSelectedComponentType(e.name)}
					onDoubleClick={() => {
						if (!selectedComponent) return;
						pageOperations.droppedOn(selectedComponent, `${DRAG_COMP_NAME}${e.name}`);
					}}
					draggable={true}
					onDragStart={ev =>
						ev.dataTransfer.items.add(`${DRAG_COMP_NAME}${e.name}`, 'text/plain')
					}
					onDragOver={e => {
						e.preventDefault();
						setShowCompMenu(false);
					}}
				>
					<i className={`fa ${e.icon}`} />
					{e.displayName}
				</div>
			));

		compMenu = (
			<Portal>
				<div
					className={`_popupMenuBackground ${theme}`}
					onMouseDown={e => e.currentTarget === e.target && setShowCompMenu(false)}
				>
					<div className="_popupMenuContainer _compMenu">
						<div className="_popupMenu">{compList}</div>
						<div className="_compTemplates"></div>
					</div>
				</div>
			</Portal>
		);
	}

	return (
		<>
			<div className="_sideBar">
				{svgLogo}
				<div className="_top">
					<div
						className="_iconMenu"
						tabIndex={0}
						onClick={() => {
							setShowCompMenu(true);
							setSelectedComponentType('');
						}}
					>
						<i className="fa fa-solid fa-circle-plus" />
					</div>
				</div>
				<div className="_bottom">
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
						<i className="fa fa-solid fa-trash"></i>
					</div>
					<div
						className="_iconMenu"
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
