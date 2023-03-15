import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	addListenerAndCallImmediately,
	getData,
	getDataFromPath,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './subPageProperties';
import SubPageStyle from './SubPageStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import { isNullValue } from '@fincity/kirun-js';
import { runEvent } from '../util/runEvent';
import * as getPageDefinition from './../../definitions/getPageDefinition.json';
import { flattenUUID } from '../util/uuid';

function SubPage(props: ComponentProps) {
	const {
		definition,
		pageDefinition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { pageName } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [subPage, setSubPage] = useState<any>();

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, v) => setSubPage(v),
				pageExtractor,
				`${STORE_PREFIX}.pageDefinition.${pageName}`,
			),
		[pageName],
	);

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
			if (isRunning) return;

			(async () =>
				await runEvent(
					getPageDefinition,
					pageNameKey,
					GLOBAL_CONTEXT_NAME,
					locationHistory,
					pageDefinition,
					new Map([['pageName', pageName]]),
				))();
		}, 10);
	}, [subPage]);

	const locHist = bindingPath
		? [...locationHistory, { location: bindingPath, index: -1, pageName }]
		: locationHistory;

	const childs = !isNullValue(subPage) ? (
		<Children
			key={`${key}_chld`}
			pageDefinition={subPage}
			children={{ [subPage.rootComponent]: true }}
			context={context}
			locationHistory={locHist}
		/>
	) : (
		<></>
	);

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className="comp compSubPage" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			{childs}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-note-sticky',
	name: 'SubPage',
	displayName: 'SubPage',
	description: 'SubPage component',
	component: SubPage,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SubPageStyle,
	stylePseudoStates: [],
	hasChildren: false,
	bindingPaths: {
		bindingPath: { name: 'Parent Binding' },
	},
};

export default component;
