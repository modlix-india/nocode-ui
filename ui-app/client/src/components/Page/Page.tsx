import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	DataLocation,
	LocationHistory,
	RenderContext,
} from '../../types/common';
import Children from '../Children';
import { deepEqual, isNullValue } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListener,
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

function Page({
	definition,
	pageComponentDefinition,
	context,
	locationHistory,
}: {
	definition: any;
	pageComponentDefinition?: ComponentDefinition;
	context: RenderContext;
	locationHistory: Array<LocationHistory>;
}) {
	const { pageName } = context;
	const [, setValidationChangedAt] = useState(Date.now());
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates } = useDefinition(
		pageComponentDefinition ?? { key: 'PageWithNoDef', name: 'page', type: 'Page' },
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
		} = definition;
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

		if (makeCall && !isNullValue(onLoadEvent) && !isNullValue(eventFunctions[onLoadEvent])) {
			(async () =>
				await runEvent(
					eventFunctions[onLoadEvent],
					'pageOnLoad',
					pageName,
					locationHistory,
					definition,
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

	if (isNullValue(definition)) return <>...</>;

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className="comp compPage" style={resolvedStyles?.comp ?? {}}>
			<HelperComponent definition={definition} />
			<Children
				pageDefinition={definition}
				children={{
					[definition.rootComponent]: true,
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
	component: Page,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PageStyle,
	hasChildren: true,
	numberOfChildren: 1,
};

export default component;
