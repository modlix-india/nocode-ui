import { isNullValue } from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import getPageDefinition from '../../Engine/pageDefinition';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processClassesForPageDefinition,
	processComponentStylePseudoClasses,
} from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './subPageProperties';
import SubPageStyle from './SubPageStyle';
import { styleDefaults } from './subPageStyleProperties';

function SubPage(props: Readonly<ComponentProps>) {
	const {
		definition,
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
				setData(`Store.pageDefinition.${pageName}`, await getPageDefinition(pageName)))();
		}, 10);
	}, [subPage]);

	const locHist = bindingPath
		? [...locationHistory, { location: bindingPath, index: -1, pageName, componentKey: key }]
		: locationHistory;

	const childs = !isNullValue(subPage) ? (
		<Children
			key={`${key}_chld`}
			pageDefinition={subPage}
			renderableChildren={{ [subPage.rootComponent]: true }}
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
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M16.0991 7.70755L14.6481 2.52648L2.81514 5.06389C1.68369 5.30652 0.988766 6.30937 1.26604 7.29942L7.40092 29.2047C7.6782 30.1947 8.82429 30.8028 9.95574 30.5602L28.3937 26.6064C29.5252 26.3638 30.2201 25.3609 29.9428 24.3709L25.4266 8.2452L19.5056 9.51488C17.997 9.83838 16.4688 9.02761 16.0991 7.70755Z"
						fill="#5D59F2"
						fillOpacity="0.3"
						className="_SubPageIcon"
					/>
					<path
						d="M19.707 8.04046C19.707 8.72002 20.3389 9.27289 21.1155 9.27289H26.1675L19.707 3.64648V8.04046Z"
						fill="#00ADB7"
					/>
					<rect x="9" y="1" width="21" height="29" rx="2" fill="#5D59F2" />
					<ellipse cx="12.8003" cy="3.80028" rx="0.800282" ry="0.800282" fill="white" />
					<ellipse cx="16" cy="3.80028" rx="0.800282" ry="0.800282" fill="white" />
					<rect x="12" y="7" width="15" height="1.5" rx="0.75" fill="white" />
				</IconHelper>
			),
		},
	],
};

export default component;
