import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';
import DnDIFrame from './DnDIFrame';
import DnDSideBar from './DnDSideBar';
import DnDBottomBar from './DnDBottomBar';
import DnDTopBar from './DnDTopBar';
import { ContextMenuDetails } from '../../components/ContextMenu';
import DnDPropertyBar from './DnDPropertyBar';
import DnDNavigationBar from './DnDNavigationBar';

interface DnDEditorProps {
	defPath: string | undefined;
	addnewPageName: string | undefined;
	dashboardPageName: string | undefined;
	settingsPageName: string | undefined;
	pagesData: any;
	currentPageId: string;
	personalizationPath: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onPublish?: () => void;
	onVersions?: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	pageExtractor: PageStoreExtractor;
	desktopIframe: React.RefObject<HTMLIFrameElement>;
	tabletIframe: React.RefObject<HTMLIFrameElement>;
	mobileIframe: React.RefObject<HTMLIFrameElement>;
	templateIframeRef: (element: HTMLIFrameElement | undefined) => void;
	selectedComponent: string | undefined;
	selectedComponentsList: string[] | [];
	onSelectedComponentChanged: (key: string) => void;
	onSelectedComponentListChanged: (key: string) => void;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onPageReload: () => void;
	onPageBack: () => void;
	onPageForward: () => void;
	theme: string;
	onUrlChange: (url: string) => void;
	onDeletePersonalization: () => void;
	logo: string | undefined;
	onContextMenu: (m: ContextMenuDetails) => void;
	onShowCodeEditor: (eventName: string) => void;
	firstTimeRef: React.MutableRefObject<PageDefinition[]>;
	undoStackRef: React.MutableRefObject<PageDefinition[]>;
	redoStackRef: React.MutableRefObject<PageDefinition[]>;
	latestVersion: React.MutableRefObject<number>;
	slaveStore: any;
	editPageName: string | undefined;
	selectedSubComponent: string;
	onSelectedSubComponentChanged: (key: string) => void;
	storePaths: Set<string>;
	setStyleSelectorPref: (pref: any) => void;
	styleSelectorPref: any;
	appPath: string | undefined;
	editorType: string | undefined;
}

export default function DnDEditor({
	defPath,
	personalizationPath,
	url,
	pageName,
	pageExtractor,
	templateIframeRef,
	desktopIframe,
	tabletIframe,
	mobileIframe,
	onChangePersonalization,
	selectedComponent,
	selectedComponentsList,
	onSelectedComponentChanged,
	onSelectedComponentListChanged,
	locationHistory,
	pageOperations,
	theme,
	onSave,
	onPublish,
	onUrlChange,
	onDeletePersonalization,
	onPageReload,
	onPageBack,
	onPageForward,
	logo,
	onContextMenu,
	onShowCodeEditor,
	firstTimeRef,
	undoStackRef,
	redoStackRef,
	latestVersion,
	slaveStore,
	editPageName,
	selectedSubComponent,
	onSelectedSubComponentChanged,
	storePaths,
	styleSelectorPref,
	setStyleSelectorPref,
	appPath,
	onVersions,
	pagesData,
	currentPageId,
	settingsPageName,
	dashboardPageName,
	addnewPageName,
	editorType,
}: DnDEditorProps) {
	const [preview, setPreview] = useState(false);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setPreview(v ?? false),
			pageExtractor,
			`${personalizationPath}.preview`,
		);
	}, [personalizationPath]);

	return (
		<div className="_dndGrid">
			<div className="_dndGridMain">
				<DnDTopBar
					defPath={defPath}
					locationHistory={locationHistory}
					url={url}
					onPublish={onPublish}
					onVersions={onVersions}
					personalizationPath={personalizationPath}
					onChangePersonalization={onChangePersonalization}
					theme={theme}
					onSave={onSave}
					onUrlChange={onUrlChange}
					onDeletePersonalization={onDeletePersonalization}
					pageExtractor={pageExtractor}
					onPageReload={onPageReload}
					onPageBack={onPageBack}
					onPageForward={onPageForward}
					undoStackRef={undoStackRef}
					redoStackRef={redoStackRef}
					firstTimeRef={firstTimeRef}
					latestVersion={latestVersion}
					previewMode={preview}
					storePaths={storePaths}
					slaveStore={slaveStore}
					editPageName={editPageName}
					selectedSubComponent={selectedSubComponent}
					selectedComponent={selectedComponent}
					onSelectedComponentChanged={onSelectedComponentChanged}
					onSelectedSubComponentChanged={onSelectedSubComponentChanged}
					pageOperations={pageOperations}
					pagesData={pagesData}
					currentPageId={currentPageId}
					logo={logo}
					settingsPageName={settingsPageName}
					dashboardPageName={dashboardPageName}
					addnewPageName={addnewPageName}
					editorType={editorType}
				/>
				<div className="_dndContentContainer">
					<DnDSideBar
						personalizationPath={personalizationPath}
						selectedComponent={selectedComponent}
						pageExtractor={pageExtractor}
						onChangePersonalization={onChangePersonalization}
						defPath={defPath}
						locationHistory={locationHistory}
						pageOperations={pageOperations}
						onShowCodeEditor={onShowCodeEditor}
						previewMode={preview}
						templateIframeRef={templateIframeRef}
						editorType={editorType}
					/>
					<div className="_dndIframeContentContainer">
						<div className={`_iframeContainer ${preview ? '_previewMode' : ''}`}>
							<DnDNavigationBar
								personalizationPath={personalizationPath}
								onChangePersonalization={onChangePersonalization}
								selectedComponent={selectedComponent}
								selectedComponentsList={selectedComponentsList}
								onSelectedComponentChanged={onSelectedComponentChanged}
								onSelectedComponentListChanged={onSelectedComponentListChanged}
								selectedSubComponent={selectedSubComponent}
								onSelectedSubComponentChanged={onSelectedSubComponentChanged}
								pageExtractor={pageExtractor}
								defPath={defPath}
								locationHistory={locationHistory}
								pageOperations={pageOperations}
								onContextMenu={onContextMenu}
								previewMode={preview}
								editorType={editorType}
							/>
							<DnDIFrame
								url={url}
								personalizationPath={personalizationPath}
								pageExtractor={pageExtractor}
								desktopIframe={desktopIframe}
								tabletIframe={tabletIframe}
								mobileIframe={mobileIframe}
								previewMode={preview}
								onChangePersonalization={onChangePersonalization}
							/>
							<DnDPropertyBar
								appPath={appPath}
								defPath={defPath}
								locationHistory={locationHistory}
								url={url}
								selectedComponent={selectedComponent}
								selectedComponentsList={selectedComponentsList}
								personalizationPath={personalizationPath}
								onChangePersonalization={onChangePersonalization}
								theme={theme}
								pageExtractor={pageExtractor}
								onShowCodeEditor={onShowCodeEditor}
								slaveStore={slaveStore}
								editPageName={editPageName}
								selectedSubComponent={selectedSubComponent}
								onSelectedSubComponentChanged={onSelectedSubComponentChanged}
								storePaths={storePaths}
								styleSelectorPref={styleSelectorPref}
								setStyleSelectorPref={setStyleSelectorPref}
								previewMode={preview}
								pageOperations={pageOperations}
								editorType={editorType}
							/>
						</div>
						<DnDBottomBar
							defPath={defPath}
							pageExtractor={pageExtractor}
							selectedComponent={selectedComponent}
							onSelectedComponentChanged={onSelectedComponentChanged}
							pageOperations={pageOperations}
							onContextMenu={onContextMenu}
							previewMode={preview}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
