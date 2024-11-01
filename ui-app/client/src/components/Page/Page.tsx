import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import Children from '../Children';
import { deepEqual, duplicate, isNullValue } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	addListenerWithChildrenActivity,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import PageStyle from './PageStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './pageProperties';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import pageHistory from './pageHistory';
import { styleDefaults } from './pageStyleProperties';
import { IconHelper } from '../util/IconHelper';

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
	const { stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [_, setLastChanged] = useState<number>(Date.now());

	useEffect(
		() =>
			addListenerWithChildrenActivity(
				() => setLastChanged(Date.now()),
				pageExtractor,
				`Store.validationTriggers.${pageName}`,
			),
		[],
	);

	useEffect(() => {
		return addListenerAndCallImmediately(
			(_, value) => {
				const v = duplicate(value);
				if (isNullValue(v.pageName)) {
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
					(async () =>
						await runEvent(
							eventFunctions[onLoadEvent!],
							'pageOnLoad',
							pageName,
							locationHistory,
							pageDefinition,
						))();
				}
			},
			pageExtractor,
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

		if (!window.cdnPrefix) return fullStyle;

		const styleParts = fullStyle.split(STATIC_FILE_API_PREFIX);
		fullStyle = '';

		for (let i = 0; i < styleParts.length; i += 2) {
			fullStyle += styleParts[i];
			if (i + 1 == styleParts.length) break;
			if (fullStyle.endsWith('/')) fullStyle = fullStyle.substring(0, fullStyle.length - 1);
			fullStyle += `https://${window.cdnPrefix}/`;
			if (!window.cdnStripAPIPrefix) fullStyle += STATIC_FILE_API_PREFIX;
			const lastPartIndex = styleParts[i + 1].indexOf("')");
			let lastPart = styleParts[i + 1].substring(0, lastPartIndex);
			if (window.cdnReplacePlus) lastPart = lastPart.replaceAll('+', '%20');
			fullStyle += lastPart;
			fullStyle += styleParts[i + 1].substring(lastPartIndex + 2);
		}
		return fullStyle;
	}, [pageDefinition?.properties?.classes]);

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
				children={{
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M12.4836 5.4706V1H3.5493C2.69501 1 2 1.69501 2 2.5493V21.4507C2 22.305 2.69501 23 3.5493 23H17.4706C18.3249 23 19.0199 22.305 19.0199 21.4507V7.53632H14.5493C13.4103 7.53632 12.4836 6.60964 12.4836 5.4706Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M13.5176 5.47056C13.5176 6.04008 13.9809 6.50342 14.5504 6.50342H18.2553L13.5176 1.78809V5.47056Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
