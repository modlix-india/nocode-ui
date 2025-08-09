import { deepEqual, duplicate, isNullValue } from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
	setData,
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
	);

	let pageName = originalPageName;

	if (pageName && appCode && clientCode) {
		pageName = `${appCode}_${clientCode}_${pageName}`;
	}

	const [subPage, setSubPage] = useState<any>();

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, v) => setSubPage(processClassesForPageDefinition(v)),
				pageExtractor,
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
				props.pageDefinition,
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M16.0991 7.70755L14.6481 2.52648L2.81514 5.06389C1.68369 5.30652 0.988766 6.30937 1.26604 7.29942L7.40092 29.2047C7.6782 30.1947 8.82429 30.8028 9.95574 30.5602L28.3937 26.6064C29.5252 26.3638 30.2201 25.3609 29.9428 24.3709L25.4266 8.2452L19.5056 9.51488C17.997 9.83838 16.4688 9.02761 16.0991 7.70755Z"
						fill="#5D59F2"
						fillOpacity="0.3"
						className="_SubPageIcon"
					/>
					<path
						d="M19.707 8.04046C19.707 8.72002 20.3389 9.27289 21.1155 9.27289H26.1675L19.707 3.64648V8.04046Z"
						fill="#00ADB7"
					/>
					<rect x="9" y="1" width="21" height="29" rx="2" fill="#5D59F2" />
					<ellipse cx="12.8003" cy="3.80028" rx="0.800282" ry="0.800282" fill="white" />
					<ellipse cx="16" cy="3.80028" rx="0.800282" ry="0.800282" fill="white" />
					<rect x="12" y="7" width="15" height="1.5" rx="0.75" fill="white" />
				</IconHelper>
			),
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
