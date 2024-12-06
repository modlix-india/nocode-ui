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
						d="M17.3144 7.68985V2H1.86912C0.838487 2 0 2.88456 0 3.97183V28.0282C0 29.1154 0.838487 30 1.86912 30H23.3309C24.3615 30 25.2 29.1154 25.2 28.0282V10.319H19.8065C18.4324 10.319 17.3144 9.13954 17.3144 7.68985Z"
						fill="#3A3A3A"
						fill-opacity="0.1"
					/>
					<path
						d="M18.5623 7.69459C18.5623 8.41944 19.1212 9.00915 19.8083 9.00915H24.278L18.5623 3.00781V7.69459Z"
						fill="#3A3A3A"
						fill-opacity="0.1"
					/>
					<path
						d="M20.1143 5.82462V0.134766H4.66905C3.63841 0.134766 2.79993 1.01933 2.79993 2.1066V26.1629C2.79993 27.2502 3.63841 28.1348 4.66905 28.1348H26.1308C27.1614 28.1348 27.9999 27.2502 27.9999 26.1629V8.45372H22.6065C21.2323 8.45372 20.1143 7.27431 20.1143 5.82462Z"
						fill="#3A3A3A"
					/>
					<path
						className="_pagePen"
						d="M6.45915 21.1634L10.1542 17.4683C10.7787 16.8439 11.4697 16.8439 12.0942 17.4683C12.7186 18.0928 12.7186 18.7838 12.0942 19.4083L8.39908 23.1033L6.45915 21.1634ZM7.90296 23.3832L6.30469 23.5608C6.12995 23.5802 5.98231 23.4325 6.00172 23.2578L6.17931 21.6595L7.90296 23.3832Z"
						fill="white"
					/>
					<ellipse cx="6.75026" cy="4.75026" rx="0.750265" ry="0.750265" fill="white" />
					<ellipse cx="9.75002" cy="4.75026" rx="0.750265" ry="0.750265" fill="white" />
					<path
						d="M21.3622 5.82936C21.3622 6.5542 21.9212 7.14391 22.6083 7.14391H27.0779L21.3622 1.14258V5.82936Z"
						fill="#3A3A3A"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
