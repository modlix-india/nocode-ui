import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediately,
	PageStoreExtractor,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition, RenderContext } from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';
import DnDIFrame from './DnDIFrame';
import DnDSideBar from './DnDSideBar';
import DnDBottomBar from './DnDBottomBar';
import DnDTopBar from './DnDTopBar';
import { ContextMenuDetails } from '../../components/ContextMenu';
import DnDPropertyBar from './DnDPropertyBar';
import DnDNavigationBar from './DnDNavigationBar';
import DnDSidekickBar from './DnDSidekickBar';

interface DnDEditorProps {
	defPath: string | undefined;
	addnewPageName: string | undefined;
	dashboardPageName: string | undefined;
	dashboardPageMenuName: string | undefined;
	pagesPageMenuName: string | undefined;
	pagesPageUrl: string | undefined;
	settingsPageName: string | undefined;
	settingsPageMenuName: string | undefined;
	pagesData: any;
	currentPageId: string;
	personalizationPath: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onPublish?: () => void;
	onVersions?: () => void;
	onSavedVersions?: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	/**
	 * Origin the canvases load from: the draft-edit host, '' for the live surface
	 * when no grant was issued, undefined while one is still being minted.
	 */
	previewOrigin: string | undefined;
	pageExtractor: PageStoreExtractor;
	desktopIframe: React.RefObject<HTMLIFrameElement | null>;
	tabletIframe: React.RefObject<HTMLIFrameElement | null>;
	mobileIframe: React.RefObject<HTMLIFrameElement | null>;
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
	slaveStore: {desktop: any, tablet: any, mobile: any};
	editPageName: string | undefined;
	selectedSubComponent: string;
	onSelectedSubComponentChanged: (key: string) => void;
	storePaths: Set<string>;
	setStyleSelectorPref: (pref: any) => void;
	styleSelectorPref: any;
	appPath: string | undefined;
	editorType: string | undefined;
	sectionsListConnectionName: string | undefined;
	sectionsCategoryList: any;
	helpURL: string | undefined;
	defaultZoomPercentage: number | undefined;
	onDebugButtonClick: () => void;
	debugMessageCount: number;
	// The AI panel needs a real ComponentProps to render the Prompt component
	// inside the editor chrome, and these two are the parts DnDEditor did not
	// already carry.
	editorPageDefinition: PageDefinition;
	editorContext: RenderContext;
	appCode: string | undefined;
	sidekickEnabled: boolean;
	sidekickAgentEndpoint: string;
	sidekickDraftMode: boolean;
	onObjectSaved: (data: any) => void;
}

export default function DnDEditor({
	defPath,
	personalizationPath,
	url,
	previewOrigin,
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
	onSavedVersions,
	pagesData,
	currentPageId,
	settingsPageName,
	settingsPageMenuName,
	dashboardPageName,
	dashboardPageMenuName,
	pagesPageMenuName,
	pagesPageUrl,
	addnewPageName,
	editorType,
	sectionsListConnectionName,
	sectionsCategoryList,
	helpURL,
	defaultZoomPercentage,
	onDebugButtonClick,
	debugMessageCount,
	editorPageDefinition,
	editorContext,
	appCode,
	sidekickEnabled,
	sidekickAgentEndpoint,
	sidekickDraftMode,
	onObjectSaved,
}: DnDEditorProps) {
	const [preview, setPreview] = useState(false);
	// Lifted out of the panel because the side rail's toggle needs the same bit.
	const [sidekickOpen, setSidekickOpen] = useState(false);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setPreview(v ?? false),
			`${personalizationPath}.preview`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setSidekickOpen(v === true),
			`${personalizationPath}.sidekickOpen`,
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
					onSavedVersions={onSavedVersions}
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
					settingsPageMenuName={settingsPageMenuName}
					dashboardPageName={dashboardPageName}
					dashboardPageMenuName={dashboardPageMenuName}
					pagesPageMenuName={pagesPageMenuName}
					pagesPageUrl={pagesPageUrl}
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
						sectionsListConnectionName={sectionsListConnectionName}
						sectionsCategoryList={sectionsCategoryList}
						helpURL={helpURL}
						onDebugButtonClick={onDebugButtonClick}
						debugMessageCount={debugMessageCount}
						sidekickEnabled={sidekickEnabled}
						sidekickOpen={sidekickOpen}
						onSidekickButtonClick={() =>
							onChangePersonalization('sidekickOpen', !sidekickOpen)
						}
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
								previewOrigin={previewOrigin}
								personalizationPath={personalizationPath}
								pageExtractor={pageExtractor}
								desktopIframe={desktopIframe}
								tabletIframe={tabletIframe}
								mobileIframe={mobileIframe}
								previewMode={preview}
								onChangePersonalization={onChangePersonalization}
								defaultZoomPercentage={defaultZoomPercentage}
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
					<DnDSidekickBar
						defPath={defPath}
						personalizationPath={personalizationPath}
						onChangePersonalization={onChangePersonalization}
						pageExtractor={pageExtractor}
						locationHistory={locationHistory}
						context={editorContext}
						pageDefinition={editorPageDefinition}
						selectedComponent={selectedComponent}
						selectedSubComponent={selectedSubComponent}
						pageOperations={pageOperations}
						appCode={appCode}
						agentEndpoint={sidekickAgentEndpoint}
						draftMode={sidekickDraftMode}
						previewMode={preview}
						enabled={sidekickEnabled}
						open={sidekickOpen}
						onObjectSaved={onObjectSaved}
					/>
				</div>
			</div>
		</div>
	);
}
