import React, { useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
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
}: DnDEditorProps) {
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
				/>
				<div className="_iframeContainer">
					<DnDIFrame
						url={url}
						personalizationPath={personalizationPath}
						pageExtractor={pageExtractor}
						iframeRef={iframeRef}
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
					/>
				</div>
				<DnDBottomBar
					defPath={defPath}
					pageExtractor={pageExtractor}
					selectedComponent={selectedComponent}
					onSelectedComponentChanged={onSelectedComponentChanged}
					pageOperations={pageOperations}
					onContextMenu={onContextMenu}
				/>
			</div>
		</div>
	);
}
