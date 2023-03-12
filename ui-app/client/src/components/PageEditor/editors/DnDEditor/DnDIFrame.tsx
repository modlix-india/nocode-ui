import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	PageStoreExtractor,
} from '../../../../context/StoreContext';

interface DnDIFrameProps {
	personalizationPath: string | undefined;
	pageName: string | undefined;
	url: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	selectedComponent: string;
}

export default function DnDIFrame({
	url,
	personalizationPath,
	pageExtractor,
	defPath,
	selectedComponent,
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

	const ref = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		if (!defPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				if (!ref.current) return;
				ref.current.contentWindow?.postMessage({
					type: 'EDITOR_TO_SLAVE_DEFINITION',
					payload,
				});
			},
			pageExtractor,
			defPath,
		);
	}, [defPath, ref.current]);

	useEffect(() => {
		if (!defPath) return;
		if (!ref.current) return;
		ref.current.contentWindow?.postMessage({
			type: 'EDITOR_TO_SLAVE_SELECTION',
			selectedComponent,
		});
	}, [selectedComponent, ref.current]);

	return (
		<div className={`_iframe ${device ?? ''}`}>
			<iframe ref={ref} src={url} width="100%" height="100%" />
		</div>
	);
}
