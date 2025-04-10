import React, { useEffect, useRef, useState } from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import CheckBoxStyle from './ThemeEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './themeEditorProperties';
import { styleProperties, styleDefaults } from './themeEditorStyleProperties';
import { IconHelper } from '../util/IconHelper';

export default function ThemeEditor(props: Readonly<ComponentProps>) {

	const {
		pageDefinition: { translations },
		pageDefinition,
		definition: { bindingPath },
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	const iFrameRef = useRef<HTMLIFrameElement>(null);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [_, setChanged] = useState(Date.now());

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, payload) => {
				console.log('In here...')
				const msg = {
					type: 'EDITOR_DEFINITION',
					payload,
				};
				iFrameRef.current?.contentWindow?.postMessage(msg);
				setChanged(Date.now());
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, iFrameRef.current, setChanged]);

	const theme = getDataFromPath(bindingPathPath, locationHistory, pageExtractor);
	console.log(bindingPathPath, theme);

	const iframeComp = theme ? <iframe ref={iFrameRef} src={`/${theme.appCode}/${theme.clientCode}/page/`} title="Theme Editor" /> : null;

	return <div className="comp compThemeEditor" style={resolvedStyles.comp ?? {}}>
		<HelperComponent context={context} definition={definition} />
		<div className="variableContainer">

		</div>
		<div className="iframeContainer">
			{iframeComp}
		</div>
	</div>;
}