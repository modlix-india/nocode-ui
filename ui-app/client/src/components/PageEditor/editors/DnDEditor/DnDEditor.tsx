import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import PageOperations from '../../functions/PageOperations';
import DnDIFrame from './DnDIFrame';
import DnDSideBar from './DnDSideBar';
import DnDBottomBar from './DnDBottomBar';
import DnDTopBar from './DnDTopBar';
import { ContextMenuDetails } from '../../components/ContextMenu';
import DnDPropertyBar from './DnDPropertyBar';

interface DnDEditorProps {
	defPath: string | undefined;
	personalizationPath: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	pageExtractor: PageStoreExtractor;
	iframeRef: React.RefObject<HTMLIFrameElement>;
	selectedComponent: string | undefined;
	onSelectedComponentChanged: (key: string) => void;
	locationHistory: Array<LocationHistory>;
	pageOperations: PageOperations;
	onPageReload: () => void;
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
}

export default function DnDEditor({
	defPath,
	personalizationPath,
	url,
	pageName,
	pageExtractor,
	iframeRef,
	onChangePersonalization,
	selectedComponent,
	onSelectedComponentChanged,
	locationHistory,
	pageOperations,
	theme,
	onSave,
	onUrlChange,
	onDeletePersonalization,
	onPageReload,
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
			<DnDSideBar
				personalizationPath={personalizationPath}
				logo={logo}
				selectedComponent={selectedComponent}
				pageExtractor={pageExtractor}
				onChangePersonalization={onChangePersonalization}
				defPath={defPath}
				locationHistory={locationHistory}
				pageOperations={pageOperations}
				onShowCodeEditor={onShowCodeEditor}
				previewMode={preview}
			/>
			<div className="_dndGridMain">
				<DnDTopBar
					defPath={defPath}
					locationHistory={locationHistory}
					url={url}
					personalizationPath={personalizationPath}
					onChangePersonalization={onChangePersonalization}
					theme={theme}
					onSave={onSave}
					onUrlChange={onUrlChange}
					onDeletePersonalization={onDeletePersonalization}
					pageExtractor={pageExtractor}
					onPageReload={onPageReload}
					undoStackRef={undoStackRef}
					redoStackRef={redoStackRef}
					firstTimeRef={firstTimeRef}
					latestVersion={latestVersion}
					previewMode={preview}
					storePaths={storePaths}
					slaveStore={slaveStore}
					editPageName={editPageName}
				/>
				<div className={`_iframeContainer ${preview ? '_previewMode' : ''}`}>
					<DnDIFrame
						url={url}
						personalizationPath={personalizationPath}
						pageExtractor={pageExtractor}
						iframeRef={iframeRef}
						previewMode={preview}
						onChangePersonalization={onChangePersonalization}
					/>
					<DnDPropertyBar
						defPath={defPath}
						locationHistory={locationHistory}
						url={url}
						selectedComponent={selectedComponent}
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
	);
}
