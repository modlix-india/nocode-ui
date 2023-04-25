import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import Children from '../Children';
import { deepEqual, isNullValue } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	addListenerWithChildrenActivity,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import PageStyle from './PageStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './pageProperties';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

const pageHistory: any = {};

function Page(props: ComponentProps) {
	const {
		context,
		pageDefinition,
		definition = { key: 'PageWithNoDef', name: 'page', type: 'Page' },
		locationHistory,
	} = props;
	const { pageName } = context;
	const [, setValidationChangedAt] = useState(Date.now());
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const [pathParts, setPathParts] = useState();

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					if (pageName === GLOBAL_CONTEXT_NAME) return;
					setPathParts(value.pathParts.join('/'));
				},
				pageExtractor,
				`${STORE_PREFIX}.urlDetails`,
			),
		[],
	);

	useEffect(() => {
		if (pathParts === undefined) return;
		const {
			eventFunctions = {},
			name,
			properties: { onLoadEvent = undefined, loadStrategy = 'default' } = {},
		} = pageDefinition;
		const v = { ...(getDataFromPath(`${STORE_PREFIX}.urlDetails`, []) ?? {}), origName: name };
		let firstTime = true;
		let sameAsExisting = false;
		if (v.pageName === pageName) {
			if (pageHistory[pageName]) {
				firstTime = false;
				if (deepEqual(v, pageHistory[pageName])) {
					sameAsExisting = true;
				}
			}
		}

		pageHistory[pageName] = v;
		let makeCall = true;
		if (!firstTime) {
			makeCall = false;
			if (loadStrategy !== 'default' || !sameAsExisting) {
				setData(`${STORE_PREFIX}.pageData.${pageName}`, {});
				makeCall = true;
			}
		}

		if (makeCall && !isNullValue(onLoadEvent) && !isNullValue(eventFunctions[onLoadEvent!])) {
			(async () =>
				await runEvent(
					eventFunctions[onLoadEvent!],
					'pageOnLoad',
					pageName,
					locationHistory,
					pageDefinition,
				))();
		}
	}, [pathParts]);

	useEffect(
		() =>
			addListenerWithChildrenActivity(
				() => setValidationChangedAt(Date.now()),
				undefined,
				`Store.validationTriggers.${pageName}`,
			),
		[],
	);

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className="comp compPage" style={resolvedStyles?.comp ?? {}}>
			<HelperComponent definition={definition} />
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
	icon: 'fa-solid fa-file',
	name: 'Page',
	displayName: 'Page',
	description: 'Page component',
	isHidden: true,
	component: Page,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PageStyle,
};

export default component;
