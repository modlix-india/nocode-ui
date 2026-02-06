import { deepEqual, duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	addListenerWithChildrenActivity,
	getData,
	getDataFromPath,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import PageStyle from './PageStyle';
import pageHistory from './pageHistory';
import { propertiesDefinition, stylePropertiesDefinition } from './pageProperties';
import { styleProperties, styleDefaults } from './pageStyleProperties';
import axios from 'axios';

const STATIC_FILE_API_PREFIX = 'api/files/static/file/';

function PageComponent(props: Readonly<ComponentProps>) {
	const {
		context,
		pageDefinition,
		definition = { key: 'PageWithNoDef', name: 'page', type: 'Page' },
		locationHistory,
	} = props;
	const { pageName } = context;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const [, setLastChanged] = useState<number>(Date.now());

	const auth = getDataFromPath(`Store.auth`, []);
	let shouldRedirect = false;
	if (!auth?.isAuthenticated && pageDefinition) {
		const app = getDataFromPath(`Store.application`, []);
		shouldRedirect =
			app?.appCode === pageDefinition?.appCode &&
			app?.properties?.loginPage === pageDefinition.name &&
			app?.properties?.loginPage !== pageName &&
			app?.properties?.sso?.redirectURL;
	}

	useEffect(() => {
		if (!shouldRedirect) return;

		(async () => {
			const app = getDataFromPath(`Store.application`, []);
			const redirectURL = app?.properties?.sso?.redirectURL;
			const { appCode = '', clientCode = '' } =
				(await axios.get('api/ui/urlDetails')).data ?? {};

			const finalURL = redirectURL
				.replace('{appCode}', appCode)
				.replace('{clientCode}', clientCode)
				.replace('{redirectUrl}', encodeURIComponent(window.location.href));

			window.location.replace(finalURL);
		})();
	}, [shouldRedirect]);

	useEffect(
		() =>
			addListenerWithChildrenActivity(
				pageExtractor.getPageName(),
				() => setLastChanged(Date.now()),
				`Store.validationTriggers.${pageName}`,
			),
		[],
	);

	useEffect(() => {
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {
				const v = duplicate(value);
				if (isNullValue(v?.pageName)) {
					v.pageName = getDataFromPath(
						`${STORE_PREFIX}.application.properties.defaultPage`,
						[],
					);
				}

				if (v.pageName !== pageName) return;

				let firstTime = true;
				let sameAsExisting = false;
				if (pageHistory[pageName]) {
					firstTime = false;
					if (deepEqual(v, pageHistory[pageName])) {
						sameAsExisting = true;
					}
				}

				let makeCall = true;

				const {
					name,
					eventFunctions = {},
					properties: { onLoadEvent = undefined, loadStrategy = 'default' } = {},
				} = pageDefinition;

				pageHistory[name] = v;

				if (!firstTime) {
					makeCall = false;
					if (loadStrategy !== 'default' || !sameAsExisting) {
						setData(`${STORE_PREFIX}.pageData.${pageName}`, {});
						makeCall = true;
					}
				}

				if (
					makeCall &&
					!isNullValue(onLoadEvent) &&
					!isNullValue(eventFunctions[onLoadEvent!])
				) {
					if (
						!getDataFromPath(
							`Store.functionExecutions.${pageName}.pageOnLoad.isRunning`,
							[],
						)
					) {
						(async () =>
							await runEvent(
								eventFunctions[onLoadEvent!],
								'pageOnLoad',
								pageName,
								locationHistory,
								pageDefinition,
							))();
					}
				}
			},
			`${STORE_PREFIX}.urlDetails`,
		);
	}, [
		pageDefinition === undefined,
		pageExtractor.getPageName(),
		pageName,
		locationHistory.length,
	]);

	const styleText = React.useMemo(() => {
		if (!pageDefinition?.properties?.classes) return '';

		let fullStyle = Object.values(pageDefinition?.properties?.classes)
			.filter(e => e.selector?.indexOf('@') !== -1)
			.map(e => {
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
	}, [pageDefinition?.properties?.classes]);

	if (shouldRedirect) return <></>;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	if (context.level >= 2 || (context.level > 0 && pageName === context.shellPageName)) {
		return (
			<div className="comp compPage _blockPageRendering" style={resolvedStyles?.comp ?? {}}>
				<HelperComponent context={props.context} definition={definition} />
				<style>{styleText}</style>
				Design Mode
			</div>
		);
	}

	return (
		<div className="comp compPage" style={resolvedStyles?.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<style>{styleText}</style>
			<Children
				pageDefinition={pageDefinition}
				renderableChildren={{
					[pageDefinition.rootComponent]: true,
				}}
				context={context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}

const component: Component = {
	name: 'Page',
	displayName: 'Page',
	description: 'Page component',
	isHidden: false,
	component: PageComponent,
	styleProperties: stylePropertiesDefinition,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PageStyle,
	styleDefaults: styleDefaults,
		stylePropertiesForTheme: styleProperties,
};

export default component;
