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
import { IconHelper } from '../../../util/IconHelper';
import ComponentMenu from '../../components/ComponentMenu';

interface DnDSideBarProps {
	personalizationPath: string | undefined;
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	onChangePersonalization: (prop: string, value: any) => void;
	selectedComponent: string | undefined;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onShowCodeEditor: (eventName: string) => void;
	previewMode: boolean;
	templateIframeRef: (element: HTMLIFrameElement | undefined) => void;
	editorType: string | undefined;
	sectionsListConnectionName: string | undefined;
	sectionsCategoryList: any;
}

export default function DnDSideBar({
	personalizationPath,
	defPath,
	pageExtractor,
	locationHistory,
	selectedComponent,
	onChangePersonalization,
	pageOperations,
	onShowCodeEditor,
	previewMode,
	templateIframeRef,
	editorType,
	sectionsListConnectionName,
	sectionsCategoryList,
}: DnDSideBarProps) {
	const [noSelection, setNoSelection] = useState<boolean>(false);
	const [componentTree, setComponentTree] = useState<boolean>(false);
	const [noShell, setNoShell] = useState<boolean>(false);
	const [showCompMenu, setShowCompMenu] = useState(false);

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
			(_, v) => setComponentTree(v),
			pageExtractor,
			`${personalizationPath}.componentTree`,
		);
	}, [personalizationPath]);

	if (previewMode) {
		return <div className="_sideBar _previewMode"></div>;
	}

	let compMenu = undefined;
	if (showCompMenu) {
		compMenu = (
			<ComponentMenu
				selectedComponent={selectedComponent}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				onCloseMenu={() => setShowCompMenu(false)}
				templateIframeRef={templateIframeRef}
				pageOperations={pageOperations}
				sectionsListConnectionName={sectionsListConnectionName}
				sectionsCategoryList={sectionsCategoryList}
			/>
		);
	}

	let shellIcon = <></>;
	if (editorType !== 'SECTION') {
		shellIcon = (
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
		);
	}

	return (
		<>
			<div className="_sideBar">
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
						<IconHelper viewBox="0 0 24 24">
							<path
								d="M24 7.19836C23.9998 6.98419 23.9422 6.77398 23.8333 6.58955C23.7245 6.40512 23.5682 6.2532 23.3808 6.14954L12.5542 0.14941C12.3763 0.0513986 12.1765 0 11.9733 0C11.7702 0 11.5704 0.0513986 11.3925 0.14941L0.618706 6.10154C0.431542 6.20517 0.275489 6.35696 0.166707 6.54118C0.0579242 6.72541 0.000368943 6.93536 1.76788e-06 7.1493C-0.000365408 7.36324 0.0564686 7.57339 0.164618 7.75798C0.272767 7.94258 0.428299 8.0949 0.615106 8.19918L11.4417 14.2473C11.62 14.3475 11.8209 14.4002 12.0254 14.4004C12.2298 14.4006 12.4309 14.3483 12.6094 14.2485L23.3832 8.24838C23.5703 8.14431 23.7262 7.99206 23.8347 7.80742C23.9431 7.62279 24.0002 7.41249 24 7.19836ZM12.0273 11.8245L3.67157 7.15756L11.9721 2.57106L20.3291 7.20196L12.0273 11.8245Z"
								fill="currentColor"
							/>
							<path
								d="M22.2188 10.9492L12.0006 16.6253L1.78241 10.9492L0.617188 13.0469L11.4174 19.047C11.5956 19.146 11.7962 19.1979 12 19.1979C12.2039 19.1979 12.4044 19.146 12.5826 19.047L23.3829 13.0469L22.2188 10.9492Z"
								fill="currentColor"
							/>
							<path
								d="M22.2188 15.75L12.0006 21.4261L1.78241 15.75L0.617188 17.8476L11.4174 23.8478C11.5956 23.9467 11.7962 23.9987 12 23.9987C12.2039 23.9987 12.4044 23.9467 12.5826 23.8478L23.3829 17.8476L22.2188 15.75Z"
								fill="currentColor"
							/>
						</IconHelper>
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
						<IconHelper viewBox="0 0 20 16">
							<path
								d="M9.99826 1.68831C7.73457 1.68831 5.87362 2.72944 4.44666 4.06954C3.10997 5.32873 2.18644 6.82359 1.71426 7.87879C2.18644 8.93398 3.10997 10.4288 4.44319 11.688C5.87362 13.0281 7.73457 14.0693 9.99826 14.0693C12.262 14.0693 14.1229 13.0281 15.5499 11.688C16.8866 10.4288 17.8101 8.93398 18.2823 7.87879C17.8101 6.82359 16.8866 5.32873 15.5533 4.06954C14.1229 2.72944 12.262 1.68831 9.99826 1.68831ZM3.31134 2.83496C4.94662 1.29437 7.19295 0 9.99826 0C12.8036 0 15.0499 1.29437 16.6852 2.83496C18.31 4.36499 19.3968 6.19048 19.9141 7.44616C20.0286 7.72403 20.0286 8.03355 19.9141 8.31142C19.3968 9.5671 18.31 11.3961 16.6852 12.9226C15.0499 14.4632 12.8036 15.7576 9.99826 15.7576C7.19295 15.7576 4.94662 14.4632 3.31134 12.9226C1.68649 11.3961 0.599774 9.5671 0.08593 8.31142C-0.0286433 8.03355 -0.0286433 7.72403 0.08593 7.44616C0.599774 6.19048 1.68649 4.36147 3.31134 2.83496Z"
								fill="currentColor"
							/>
							<path
								d="M14.6875 8.15436C14.6875 10.6829 12.5898 12.7308 10 12.7308C7.41016 12.7308 5.3125 10.6829 5.3125 8.15436V8.03995C5.61133 8.11432 5.92773 8.15436 6.25 8.15436C8.31836 8.15436 10 6.51256 10 4.4932C10 4.17856 9.95898 3.86965 9.88281 3.57791H10C12.5898 3.57791 14.6875 5.62587 14.6875 8.15436Z"
								fill="currentColor"
							/>
						</IconHelper>
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
					{shellIcon}
				</div>
			</div>
			{compMenu}
		</>
	);
}
