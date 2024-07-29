import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processClassesForPageDefinition,
	processComponentStylePseudoClasses,
} from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import * as getPageDefinition from './../../definitions/getPageDefinition.json';
import { propertiesDefinition, stylePropertiesDefinition } from './subPageProperties';
import SubPageStyle from './SubPageStyle';
import { styleDefaults } from './subPageStyleProperties';

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
				(_, v) => setSubPage(processClassesForPageDefinition(v)),
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
		? [...locationHistory, { location: bindingPath, index: -1, pageName, componentKey: key }]
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

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compSubPage" style={resolvedStyles.comp ?? {}}>
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
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="1"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M6.5 10.333C6.5 9.22844 7.39543 8.33301 8.5 8.33301H23V21.9997C23 22.552 22.5523 22.9997 22 22.9997H6.5V10.333Z"
						fill="currentColor"
					/>
					<ellipse
						cx="3.89793"
						cy="3.89598"
						rx="1.06199"
						ry="1.06199"
						fill="currentColor"
					/>
					<ellipse
						cx="8.14402"
						cy="3.89598"
						rx="1.06199"
						ry="1.06199"
						fill="currentColor"
					/>
					<ellipse
						cx="12.3901"
						cy="3.89598"
						rx="1.06199"
						ry="1.06199"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
