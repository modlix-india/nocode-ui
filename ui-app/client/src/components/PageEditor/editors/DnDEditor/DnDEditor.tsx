import React, { useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
import PageOperations from '../../functions/PageOperations';
import DnDIFrame from './DnDIFrame';
import DnDSideBar from './DnDSideBar';
import DnDSelectionBar from './DnDSelectionBar';
import DnDTopBar from './DnDTopBar';

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
	operations: PageOperations;
	onPageReload: () => void;
	theme: string;
	onUrlChange: (url: string) => void;
	onDeletePersonalization: () => void;
	logo: string | undefined;
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
	operations,
	theme,
	onSave,
	onUrlChange,
	onDeletePersonalization,
	onPageReload,
	logo,
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
				operations={operations}
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
				<DnDIFrame
					url={url}
					personalizationPath={personalizationPath}
					pageName={pageName}
					pageExtractor={pageExtractor}
					iframeRef={iframeRef}
				/>
				<DnDSelectionBar
					defPath={defPath}
					pageName={pageName}
					pageExtractor={pageExtractor}
					selectedComponent={selectedComponent}
					onSelectedComponentChanged={onSelectedComponentChanged}
				/>
			</div>
		</div>
	);
}
