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
	previewMode: boolean;
	onChangePersonalization: (prop: string, value: any) => void;
}

export default function DnDIFrame({
	url,
	personalizationPath,
	pageExtractor,
	iframeRef,
	previewMode,
	onChangePersonalization,
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
			const hgt = iframeRef.current?.contentWindow?.document.body?.scrollHeight + 'px';
			if (
				(iframeRef.current?.contentWindow?.document.body?.scrollHeight ?? 0) -
					Number.parseInt(height) <
				50
			)
				return;
			setHeight(hgt);
		}, 100);

		return () => clearInterval(handle);
	}, [iframeRef.current, height]);

	let previewCloser = <></>;
	if (previewMode)
		previewCloser = (
			<div
				className="_previewModeCloser"
				tabIndex={0}
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();

					onChangePersonalization('preview', false);
				}}
			>
				<i className="fa fa-solid fa-eye-slash"></i>
			</div>
		);

	return (
		<div className="_iframeHolder">
			<div className={`_iframe ${device ?? ''}`}>
				<iframe ref={iframeRef} src={url} height={height} />
			</div>
			{previewCloser}
		</div>
	);
}
