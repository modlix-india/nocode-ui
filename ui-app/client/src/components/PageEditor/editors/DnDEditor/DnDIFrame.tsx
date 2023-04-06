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
	const [height, setHeight] = useState('100%');

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setDevice(v),
			pageExtractor,
			`${personalizationPath}.deviceType`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!iframeRef.current) return;
		const handle = setInterval(() => {
			const hgt = iframeRef.current?.contentWindow?.document.body.scrollHeight + 'px';
			if (hgt === height) return;
			console.log('Hello');
			setHeight(hgt);
		}, 100);

		return () => clearInterval(handle);
	}, [iframeRef.current, height]);

	return (
		<div className="_iframeHolder">
			<div className={`_iframe ${device ?? ''}`}>
				<iframe ref={iframeRef} src={url} height={height} />
			</div>
		</div>
	);
}
