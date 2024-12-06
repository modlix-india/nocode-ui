import React, { useEffect, useState } from 'react';
import { DRAG_CD_KEY } from '../../../../constants';
import {
	addListenerAndCallImmediately,
	PageStoreExtractor,
} from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
import { IconHelper } from '../../../util/IconHelper';
import ComponentMenu from '../../components/ComponentMenu';
import { PageOperations } from '../../functions/PageOperations';

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
	helpURL: string | undefined;
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
	helpURL,
}: Readonly<DnDSideBarProps>) {
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
			<button
				className="_iconMenu"
				onClick={() => onChangePersonalization('slave.noShell', !noShell)}
				title={!noShell ? 'Hide Shell' : 'Show Shell'}
			>
				<IconHelper viewBox="0 0 16 16">
					{noShell ? (
						<>
							<path
								d="M0 6C0 4.89688 0.896875 4 2 4H10C11.1031 4 12 4.89688 12 6V14C12 15.1031 11.1031 16 10 16H2C0.896875 16 0 15.1031 0 14V6ZM2 7C2 7.55312 2.44688 8 3 8H9C9.55313 8 10 7.55312 10 7C10 6.44688 9.55313 6 9 6H3C2.44688 6 2 6.44688 2 7Z"
								fill="currentColor"
								fillOpacity={0.5}
							/>
							<path
								d="M13.5 2H6.5C6.225 2 6 2.225 6 2.5V3H4V2.5C4 1.11875 5.11875 0 6.5 0H13.5C14.8813 0 16 1.11875 16 2.5V9.5C16 10.8813 14.8813 12 13.5 12H13V10H13.5C13.775 10 14 9.775 14 9.5V2.5C14 2.225 13.775 2 13.5 2Z"
								fill="currentColor"
							/>
						</>
					) : (
						<path
							d="M0,6.667A2.669,2.669,0,0,1,2.667,4H13.333A2.669,2.669,0,0,1,16,6.667V17.333A2.669,2.669,0,0,1,13.333,20H2.667A2.669,2.669,0,0,1,0,17.333ZM2.667,8A1.332,1.332,0,0,0,4,9.333h8a1.333,1.333,0,1,0,0-2.667H4A1.332,1.332,0,0,0,2.667,8Z"
							transform="translate(0 -4)"
							fill="currentColor"
						/>
					)}
				</IconHelper>
			</button>
		);
	}

	let helpIcon = undefined;
	if (helpURL) {
		helpIcon = (
			<>
				<div className="_seperator"></div>
				<a className="_iconMenu" href={helpURL} target="_blank">
					<IconHelper viewBox="0 0 16 16">
						<path
							d="M14.5 8C14.5 6.27609 13.8152 4.62279 12.5962 3.40381C11.3772 2.18482 9.72391 1.5 8 1.5C6.27609 1.5 4.62279 2.18482 3.40381 3.40381C2.18482 4.62279 1.5 6.27609 1.5 8C1.5 9.72391 2.18482 11.3772 3.40381 12.5962C4.62279 13.8152 6.27609 14.5 8 14.5C9.72391 14.5 11.3772 13.8152 12.5962 12.5962C13.8152 11.3772 14.5 9.72391 14.5 8ZM0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8ZM5.30625 5.16563C5.55312 4.46875 6.21563 4 6.95625 4H8.77812C9.86875 4 10.75 4.88438 10.75 5.97188C10.75 6.67813 10.3719 7.33125 9.75937 7.68437L8.75 8.2625C8.74375 8.66875 8.40938 9 8 9C7.58437 9 7.25 8.66562 7.25 8.25V7.82812C7.25 7.55937 7.39375 7.3125 7.62813 7.17812L9.0125 6.38438C9.15938 6.3 9.25 6.14375 9.25 5.975C9.25 5.7125 9.0375 5.50313 8.77812 5.50313H6.95625C6.85 5.50313 6.75625 5.56875 6.72188 5.66875L6.70937 5.70625C6.57188 6.09688 6.14062 6.3 5.75313 6.1625C5.36563 6.025 5.15938 5.59375 5.29688 5.20625L5.30937 5.16875L5.30625 5.16563ZM7 11C7 10.7348 7.10536 10.4804 7.29289 10.2929C7.48043 10.1054 7.73478 10 8 10C8.26522 10 8.51957 10.1054 8.70711 10.2929C8.89464 10.4804 9 10.7348 9 11C9 11.2652 8.89464 11.5196 8.70711 11.7071C8.51957 11.8946 8.26522 12 8 12C7.73478 12 7.48043 11.8946 7.29289 11.7071C7.10536 11.5196 7 11.2652 7 11Z"
							fill="currentColor"
						/>
					</IconHelper>
				</a>
			</>
		);
	}

	return (
		<>
			<div className="_sideBar">
				<div className="_top">
					<button
						className={`_iconMenu _compMenuButton ${showCompMenu ? '_active' : ''}`}
						onClick={() => setShowCompMenu(true)}
					>
						<IconHelper viewBox="0 0 48 48">
							<path
								d="M6 22.9998H42"
								strokeWidth="6"
								strokeLinecap="round"
								stroke="currentColor"
							/>
							<path
								d="M23.999 6L23.999 42"
								strokeWidth="6"
								strokeLinecap="round"
								stroke="currentColor"
							/>
						</IconHelper>
					</button>
					<button
						className={`_iconMenu ${componentTree ? '_active' : ''}`}
						onClick={() => onChangePersonalization('componentTree', !componentTree)}
					>
						<IconHelper viewBox="0 0 16 16">
							<path
								d="M9.15312 8.74307L13.9031 6.54932L15.5656 7.31807C15.8312 7.43994 16 7.70557 16 7.99932C16 8.29307 15.8312 8.55869 15.5656 8.68057L8.73438 11.8368C8.26875 12.0524 7.73125 12.0524 7.26562 11.8368L0.434375 8.68057C0.16875 8.55557 0 8.28994 0 7.99932C0 7.70869 0.16875 7.43994 0.434375 7.31807L2.09687 6.54932L6.84688 8.74307C7.57812 9.08057 8.42188 9.08057 9.15312 8.74307Z"
								fillOpacity="0.5"
								fill="currentColor"
							/>
							<path
								d="M7.26562 0.161719C7.73125 -0.0539062 8.26875 -0.0539062 8.73438 0.161719L15.5656 3.31797C15.8312 3.43984 16 3.70547 16 3.99922C16 4.29297 15.8312 4.55859 15.5656 4.68047L8.73438 7.83672C8.26875 8.05234 7.73125 8.05234 7.26562 7.83672L0.434375 4.68047C0.16875 4.55547 0 4.28984 0 3.99922C0 3.70859 0.16875 3.43984 0.434375 3.31797L7.26562 0.161719ZM13.9031 10.5492L15.5656 11.318C15.8312 11.4398 16 11.7055 16 11.9992C16 12.293 15.8312 12.5586 15.5656 12.6805L8.73438 15.8367C8.26875 16.0523 7.73125 16.0523 7.26562 15.8367L0.434375 12.6805C0.16875 12.5555 0 12.2898 0 11.9992C0 11.7086 0.16875 11.4398 0.434375 11.318L2.09687 10.5492L6.84688 12.743C7.57812 13.0805 8.42188 13.0805 9.15312 12.743L13.9031 10.5492Z"
								fill="currentColor"
							/>
						</IconHelper>
					</button>
				</div>
				<div className="_bottom">
					<button className="_iconMenu" onClick={() => onShowCodeEditor('')}>
						<IconHelper viewBox="0 0 18 16">
							<path
								d="M10.4961 2L8.24609 14.75"
								stroke="currentColor"
								strokeOpacity="0.5"
								strokeWidth="2.5"
								strokeLinecap="round"
							/>
							<path
								d="M13.3147 4.73933C12.9631 5.09881 12.9631 5.6826 13.3147 6.04208L15.8265 8.61306L13.3119 11.184C12.9603 11.5435 12.9603 12.1273 13.3119 12.4868C13.6635 12.8463 14.2345 12.8463 14.5861 12.4868L17.7363 9.26586C18.0879 8.90639 18.0879 8.3226 17.7363 7.96312L14.5861 4.74221C14.2345 4.38273 13.6635 4.38273 13.3119 4.74221L13.3147 4.73933ZM4.6881 4.73933C4.33651 4.37986 3.76553 4.37986 3.41394 4.73933L0.263692 7.96024C-0.0878975 8.31972 -0.0878975 8.90351 0.263692 9.26299L3.41394 12.4839C3.76553 12.8434 4.33651 12.8434 4.6881 12.4839C5.03969 12.1244 5.03969 11.5406 4.6881 11.1812L2.17353 8.61306L4.6881 6.04208C5.03969 5.6826 5.03969 5.09881 4.6881 4.73933Z"
								fill="currentColor"
							/>
						</IconHelper>
					</button>
					<button
						className="_iconMenu"
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
								fillOpacity={0.5}
							/>
						</IconHelper>
					</button>
					<button
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
						<IconHelper viewBox="0 0 15 16">
							<path
								d="M5.48036 1.6125L4.86964 2.5H9.53036L8.91964 1.6125C8.87143 1.54375 8.79107 1.5 8.70429 1.5H5.6925C5.60572 1.5 5.52536 1.54062 5.47714 1.6125H5.48036ZM10.2054 0.78125L11.385 2.5H11.8286H13.3714H13.6286C14.0561 2.5 14.4 2.83437 14.4 3.25C14.4 3.66563 14.0561 4 13.6286 4H13.3714V13.5C13.3714 14.8813 12.2207 16 10.8 16H3.6C2.17929 16 1.02857 14.8813 1.02857 13.5V4H0.771429C0.343929 4 0 3.66563 0 3.25C0 2.83437 0.343929 2.5 0.771429 2.5H1.02857H2.57143H3.015L4.19464 0.778125C4.52893 0.29375 5.09143 0 5.6925 0H8.70429C9.30536 0 9.86786 0.29375 10.2021 0.778125L10.2054 0.78125ZM2.57143 4V13.5C2.57143 14.0531 3.03107 14.5 3.6 14.5H10.8C11.3689 14.5 11.8286 14.0531 11.8286 13.5V4H2.57143Z"
								fill="currentColor"
								fillOpacity={0.5}
							/>
							<path
								d="M5.22877 12.1001V6.6001C5.22877 6.3251 4.99734 6.1001 4.71448 6.1001C4.43162 6.1001 4.2002 6.3251 4.2002 6.6001V12.1001C4.2002 12.3751 4.43162 12.6001 4.71448 12.6001C4.99734 12.6001 5.22877 12.3751 5.22877 12.1001Z"
								fill="currentColor"
							/>
							<path
								d="M7.8002 12.1001V6.6001C7.8002 6.3251 7.56877 6.1001 7.28591 6.1001C7.00305 6.1001 6.77162 6.3251 6.77162 6.6001V12.1001C6.77162 12.3751 7.00305 12.6001 7.28591 12.6001C7.56877 12.6001 7.8002 12.3751 7.8002 12.1001Z"
								fill="currentColor"
							/>
							<path
								d="M10.3716 12.1001V6.6001C10.3716 6.3251 10.1402 6.1001 9.85734 6.1001C9.57448 6.1001 9.34305 6.3251 9.34305 6.6001V12.1001C9.34305 12.3751 9.57448 12.6001 9.85734 12.6001C10.1402 12.6001 10.3716 12.3751 10.3716 12.1001Z"
								fill="currentColor"
							/>
						</IconHelper>
					</button>
					<button
						className="_iconMenu _arrow"
						tabIndex={0}
						onClick={() => onChangePersonalization('slave.noSelection', !noSelection)}
					>
						<IconHelper viewBox="0 0 27.776 19.788">
							<path
								d="M0,1.025V17.4a1,1,0,0,0,1.02.972,1.048,1.048,0,0,0,.77-.331L5.621,13.87l2.695,5.137a1.518,1.518,0,0,0,1.99.632,1.382,1.382,0,0,0,.663-1.895l-2.63-5.022h5.477a1,1,0,0,0,1.025-.976.958.958,0,0,0-.343-.729L1.79.261A1.1,1.1,0,0,0,1.076,0,1.052,1.052,0,0,0,0,1.025Z"
								transform="translate(9.559)"
								fill="currentColor"
							/>
							<rect
								width="30.918"
								height="2.473"
								rx="1.237"
								transform="translate(0 15.924) rotate(-31)"
								fill="currentColor"
								fillOpacity={noSelection ? '0' : '0.5'}
							/>
						</IconHelper>
					</button>
					{shellIcon}
					{helpIcon}
				</div>
			</div>
			{compMenu}
		</>
	);
}
