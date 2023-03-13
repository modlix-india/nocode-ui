import React, { useEffect, useState } from 'react';
import { PageStoreExtractor } from '../../../../context/StoreContext';
import DnDIFrame from './DnDIFrame';
import DnDSideBar from './DnDSideBar';

interface DnDEditorProps {
	defPath: string | undefined;
	personalizationPath: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	pageExtractor: PageStoreExtractor;
	iframeRef: React.RefObject<HTMLIFrameElement>;
}

export default function DnDEditor({
	defPath,
	personalizationPath,
	url,
	pageName,
	pageExtractor,
	iframeRef,
}: DnDEditorProps) {
	return (
		<div className="_dndGrid">
			<DnDSideBar />
			<DnDIFrame
				url={url}
				personalizationPath={personalizationPath}
				pageName={pageName}
				pageExtractor={pageExtractor}
				iframeRef={iframeRef}
			/>
		</div>
	);
}
