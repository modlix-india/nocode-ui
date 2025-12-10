import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../context/StoreContext';

export default function PageViewer({
	iframeRef,
	url,
	pageExtractor,
	personalizationPath,
}: {
	iframeRef: React.RefObject<HTMLIFrameElement>;
	url: string;
	pageExtractor: PageStoreExtractor;
	personalizationPath?: string;
}) {
	const [pageMode, setPageMode] = useState<string>('DESKTOP');

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => setPageMode(v?.pageMode ?? 'DESKTOP'),
			personalizationPath,
		);
	}, [personalizationPath]);

	return (
		<div className={`_pageViewer _${pageMode}`}>
			<iframe ref={iframeRef} src={url} />
		</div>
	);
}
