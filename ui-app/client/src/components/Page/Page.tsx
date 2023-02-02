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
import { isNullValue } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import { GLOBAL_CONTEXT_NAME } from '../../constants';
import {
	addListener,
	addListenerWithChildrenActivity,
	PageStoreExtractor,
} from '../../context/StoreContext';
import PageStyle from './PageStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './pageProperties';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

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
		pageComponentDefinition ?? { key: 'PageWithNoDef', type: 'Page' },
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	useEffect(() => {
		const { eventFunctions, properties: { onLoadEvent = undefined } = {} } = definition;

		if (pageName === GLOBAL_CONTEXT_NAME) return;

		if (isNullValue(onLoadEvent) || isNullValue(eventFunctions[onLoadEvent])) return;
		(async () =>
			await runEvent(
				eventFunctions[onLoadEvent],
				'pageOnLoad',
				pageName,
				locationHistory,
				definition,
			))();
	}, [pageName]);

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
	name: 'Page',
	displayName: 'Page',
	description: 'Page component',
	component: Page,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PageStyle,
	hasChildren: true,
	noOfChildren: 1,
};

export default component;
