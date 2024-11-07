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
				<IconHelper viewBox="0 0 28 28">
					<rect width="28" height="28" rx="1" fill="#96A1B4" fillOpacity="0.2" />
					<path
						className="_SubPageMainFrame"
						d="M7 11.333C7 10.2284 7.89543 9.33301 9 9.33301H28V26.9997C28 27.552 27.5523 27.9997 27 27.9997H7V11.333Z"
						fill="url(#paint0_linear_3214_9603)"
					/>
					<ellipse
						className="_SubPageBlock1"
						cx="3.68805"
						cy="3.68878"
						rx="1.35163"
						ry="1.35163"
						fill="url(#paint1_linear_3214_9603)"
					/>
					<ellipse
						className="_SubPageBlock2"
						cx="9.09235"
						cy="3.68878"
						rx="1.35163"
						ry="1.35163"
						fill="url(#paint2_linear_3214_9603)"
					/>
					<ellipse
						className="_SubPageBlock3"
						cx="14.4966"
						cy="3.68878"
						rx="1.35163"
						ry="1.35163"
						fill="url(#paint3_linear_3214_9603)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9603"
							x1="17.5"
							y1="9.33301"
							x2="17.5"
							y2="27.9997"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#5D59F2" />
							<stop offset="1" stopColor="#04009A" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9603"
							x1="3.68805"
							y1="2.33716"
							x2="3.68805"
							y2="5.04041"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#5D59F2" />
							<stop offset="1" stopColor="#04009A" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9603"
							x1="9.09235"
							y1="2.33716"
							x2="9.09235"
							y2="5.04041"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#5D59F2" />
							<stop offset="1" stopColor="#04009A" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3214_9603"
							x1="14.4966"
							y1="2.33716"
							x2="14.4966"
							y2="5.04041"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#5D59F2" />
							<stop offset="1" stopColor="#04009A" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
