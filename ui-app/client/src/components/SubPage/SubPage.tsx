import { deepEqual, duplicate, isNullValue } from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import getPageDefinition from '../../Engine/pageDefinition';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processClassesForPageDefinition,
	processComponentStylePseudoClasses,
} from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './subPageProperties';
import SubPageStyle from './SubPageStyle';
import { styleProperties, styleDefaults } from './subPageStyleProperties';
import axios, { AxiosHeaders } from 'axios';
import pageHistory from '../Page/pageHistory';
import { runEvent } from '../util/runEvent';

const STATIC_FILE_API_PREFIX = 'api/files/static/file/';

function SubPage(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { pageName: originalPageName, appCode, clientCode, overrideThemeStyles } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	let pageName = originalPageName;

	if (pageName && appCode && clientCode) {
		pageName = `${appCode}_${clientCode}_${pageName}`;
	}

	const [subPage, setSubPage] = useState<any>();

	useEffect(
		() =>
			addListenerAndCallImmediately(
				pageExtractor.getPageName(),
				(_, v) => setSubPage(processClassesForPageDefinition(v)),
				`${STORE_PREFIX}.pageDefinition.${pageName}`,
			),
		[pageName],
	);

	const styleText = useMemo(() => {
		if (!subPage?.properties?.classes) return '';

		let fullStyle = Object.values(subPage?.properties?.classes)
			.filter((e: any) => e.selector?.indexOf('@') !== -1)
			.map((e: any) => {
				const txt = `${e.selector} { ${e.style} }`;
				if (!e.mediaQuery) return txt;
				return `${e.mediaQuery} { ${txt} }`;
			})
			.join('\n');

		if (!globalThis.cdnPrefix) return fullStyle;

		const styleParts = fullStyle.split(STATIC_FILE_API_PREFIX);
		fullStyle = '';

		for (let i = 0; i < styleParts.length; i += 2) {
			fullStyle += styleParts[i];
			if (i + 1 == styleParts.length) break;
			if (fullStyle.endsWith('/')) fullStyle = fullStyle.substring(0, fullStyle.length - 1);
			fullStyle += `https://${globalThis.cdnPrefix}/`;
			if (!globalThis.cdnStripAPIPrefix) fullStyle += STATIC_FILE_API_PREFIX;
			const lastPartIndex = styleParts[i + 1].indexOf(')');
			let lastPart = styleParts[i + 1].substring(0, lastPartIndex);
			if (globalThis.cdnReplacePlus) lastPart = lastPart.replaceAll('+', '%20');
			fullStyle += lastPart + ')';
			fullStyle += styleParts[i + 1].substring(lastPartIndex + 2);
		}
		return fullStyle;
	}, [subPage]);

	useEffect(() => {
		if (!isNullValue(subPage)) return;

		setTimeout(() => {
			const pageNameKey = `pageDefinition_${pageName}`;
			const isRunning = getDataFromPath(
				`Store.functionExecutions.${GLOBAL_CONTEXT_NAME}.${flattenUUID(
					pageNameKey,
				)}.isRunning`,
				locationHistory,
			);
			if (isRunning || !pageName) return;

			(async () => {
				const pageDefinition = await getPageDefinition(
					originalPageName,
					appCode,
					clientCode,
				);
				if (pageDefinition.name != pageName) pageDefinition.name = pageName;
				setData(`Store.pageDefinition.${pageName}`, pageDefinition);
			})();
		}, 10);
	}, [pageName, originalPageName, clientCode, appCode, subPage]);

	useEffect(() => {
		if (!overrideThemeStyles || (!appCode && !clientCode)) return;

		(async () => {
			const headers: AxiosHeaders = {} as AxiosHeaders;
			if (appCode) headers['appCode'] = appCode;
			if (clientCode) headers['clientCode'] = clientCode;
			const theme = (await axios.get('api/ui/theme', { headers }))?.data;

			if (!theme) return;

			setData(`Store.theme`, theme);
		})();
	}, [appCode, clientCode, overrideThemeStyles]);

	useEffect(() => {
		if (!subPage) return;

		const { name, eventFunctions = {}, properties: { onLoadEvent = undefined } = {} } = subPage;

		if (!onLoadEvent || !eventFunctions[onLoadEvent]) return;

		(async () =>
			await runEvent(
				eventFunctions[onLoadEvent!],
				'subPageOnLoad',
				pageExtractor.getPageName(),
				locationHistory,
				subPage,
				undefined,
				true,
			))();
	}, [subPage !== undefined, pageName, locationHistory.length]);

	const locHist = bindingPath
		? [...locationHistory, { location: bindingPath, index: -1, pageName, componentKey: key }]
		: locationHistory;

	const childs = !isNullValue(subPage) ? (
		<Children
			key={`${key}_chld`}
			pageDefinition={subPage}
			renderableChildren={{ [subPage.rootComponent]: true }}
			context={context}
			locationHistory={locHist}
		/>
	) : (
		<></>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compSubPage" style={resolvedStyles.comp ?? {}}>
			<style>{styleText}</style>
			<HelperComponent context={props.context} definition={definition} />
			{childs}
		</div>
	);
}

const component: Component = {
	name: 'SubPage',
	displayName: 'SubPage',
	description: 'SubPage component',
	component: SubPage,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: SubPageStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	bindingPaths: {
		bindingPath: { name: 'Parent Binding' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
