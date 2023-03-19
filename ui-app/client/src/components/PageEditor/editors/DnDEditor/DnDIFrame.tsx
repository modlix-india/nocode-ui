import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	PageStoreExtractor,
} from '../../../../context/StoreContext';

interface DnDIFrameProps {
	personalizationPath: string | undefined;
	url: string;
	pageExtractor: PageStoreExtractor;
	iframeRef: React.RefObject<HTMLIFrameElement>;
}

export default function DnDIFrame({
	url,
	personalizationPath,
	pageExtractor,
	iframeRef,
}: DnDIFrameProps) {
	const [device, setDevice] = useState<string>();

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setDevice(v),
			pageExtractor,
			`${personalizationPath}.deviceType`,
		);
	}, [personalizationPath]);

	return (
		<div className={`_iframe ${device ?? ''}`}>
			<iframe ref={iframeRef} src={url} width="100%" height="100%" />
		</div>
	);
}
