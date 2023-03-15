import React, { useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../../../context/StoreContext';
import DnDIFrame from './DnDIFrame';
import DnDSideBar from './DnDSideBar';
import { SelectionBar } from './SelectionBar';

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
}: DnDEditorProps) {
	return (
		<div className="_dndGrid">
			<DnDSideBar
				personalizationPath={personalizationPath}
				pageName={pageName}
				pageExtractor={pageExtractor}
				onChangePersonalization={onChangePersonalization}
			/>
			<div className="_dndGridMain">
				<DnDIFrame
					url={url}
					personalizationPath={personalizationPath}
					pageName={pageName}
					pageExtractor={pageExtractor}
					iframeRef={iframeRef}
				/>
				<SelectionBar
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
