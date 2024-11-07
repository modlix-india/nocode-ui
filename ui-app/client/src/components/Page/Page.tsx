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
import { useLocation } from 'react-router-dom';

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

		return Object.values(pageDefinition?.properties?.classes)
			.filter(e => e.selector?.indexOf('@') !== -1)
			.map(e => {
				const txt = `${e.selector} { ${e.style} }`;
				if (!e.mediaQuery) return txt;
				return `${e.mediaQuery} { ${txt} }`;
			})
			.join('\n');
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
						className="_PageIcon"
						d="M13.5511 6.09627V0H2.00263C0.898379 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.898379 30 2.00263 30H19.9974C21.1016 30 22 29.0523 22 27.8873V8.91317H16.2213C14.749 8.91317 13.5511 7.64951 13.5511 6.09627Z"
						fill="url(#paint0_linear_3214_9567)"
					/>

					<path
						className="_PageIcon"
						d="M14.8882 6.1012C14.8882 6.87782 15.4871 7.50965 16.2233 7.50965H21.0122L14.8882 1.07965V6.1012Z"
						fill="url(#paint1_linear_3214_9567)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9567"
							x1="11"
							y1="0"
							x2="11"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#00ADB7" />
							<stop offset="1" stopColor="#016A70" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9567"
							x1="17.9502"
							y1="1.07965"
							x2="17.9502"
							y2="7.50965"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#00ADB7" />
							<stop offset="1" stopColor="#016A70" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
