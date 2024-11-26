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
			const lastPartIndex = styleParts[i + 1].indexOf(')');
			let lastPart = styleParts[i + 1].substring(0, lastPartIndex);
			if (window.cdnReplacePlus) lastPart = lastPart.replaceAll('+', '%20');
			fullStyle += lastPart + ')';
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
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M14.2958 6.09627V0H2.11268C0.947746 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.947746 30 2.11268 30H21.0963C22.2612 30 23.2089 29.0523 23.2089 27.8873V8.91317H17.1127C15.5594 8.91317 14.2958 7.64951 14.2958 6.09627Z"
						fill="#00ADB7"
						transform="translate(5, 0)"
					/>
					<path
						d="M15.707 6.08405C15.707 6.86067 16.3389 7.4925 17.1155 7.4925H22.1675L15.707 1.0625V6.08405Z"
						fill="#00ADB7"
						transform="translate(5, 0)"
					/>
					<path
						d="M14.1671 8.48664V3L2.09366 3C0.939214 3 0 3.85297 0 4.90141L0 28.0986C0 29.147 0.939214 30 2.09366 30H20.9063C22.0608 30 23 29.147 23 28.0986V11.0219H16.9586C15.4194 11.0219 14.1671 9.88456 14.1671 8.48664Z"
						fill="#00ADB7"
						fillOpacity="0.3"
						className="_PageIcon"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
