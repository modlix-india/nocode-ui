import React, { useEffect, useState } from 'react';
import {
	getDataFromPath,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './iframeProperties';
import IframeStyle from './IframeStyle';
import { styleProperties, styleDefaults } from './iframeStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { shortUUID } from '../../util/shortUUID';
import axios from 'axios';

async function secureSource(src: string) {
	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode)
		headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

	return await axios
		.get(src, { responseType: 'blob', headers })
		.then(res => URL.createObjectURL(res.data));
}

function Iframe(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const { locationHistory, definition } = props;
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			width,
			height,
			srcdoc,
			src,
			sandbox,
			referrerpolicy,
			name,
			loading,
			allowfullscreen,
			allow,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	let shouldRenderIframe = false;

	if (!srcdoc?.trim()) {
		try {
			if (src) {
				new URL(src, window.location.origin);
				shouldRenderIframe = true;
			}
		} catch (err) {}
	} else shouldRenderIframe = true;

	const [actualSrc, setActualSrc] = useState<string | undefined>();
	useEffect(() => {
		if (!src?.includes('api/files/secured')) {
			setActualSrc(src);
			return;
		}
		(async () => setActualSrc(await secureSource(src)))();
	}, [src]);

	return (
		<div className="comp compIframe" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{shouldRenderIframe ? (
				<iframe
					className="iframe"
					style={resolvedStyles.iframe ?? {}}
					width={width}
					src={srcdoc ? undefined : actualSrc}
					srcDoc={srcdoc}
					height={height}
					name={name}
					loading={loading}
					allow={allow}
					sandbox={sandbox}
					referrerPolicy={referrerpolicy}
					allowFullScreen={allowfullscreen}
				></iframe>
			) : null}
		</div>
	);
}

const component: Component = {
	order: 18,
	name: 'Iframe',
	displayName: 'Iframe',
	description: 'Iframe component',
	component: Iframe,
	styleComponent: IframeStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Iframe',
		type: 'Iframe',
		properties: {},
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
