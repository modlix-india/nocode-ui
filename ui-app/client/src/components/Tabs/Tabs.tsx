import React, { useEffect } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import Children from '../Children';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { renderChildren } from '../util/renderChildren';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tabsProperties';
import TabsStyles from './TabsStyle';

function TabsComponent(props: ComponentProps) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory = [],
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { tabs, defaultActive } = {} } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	if (!bindingPath) throw new Error('Definition requires binding path');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory);

	const tabNames = (tabs ?? '').split(',').map((e: string) => e?.trim() ?? '');

	const [activeTab, setActiveTab] = React.useState(defaultActive ?? tabNames[0]);

	useEffect(() => {
		return addListenerAndCallImmediately(
			(_, value) => {
				setActiveTab(value ?? defaultActive ?? tabNames[0]);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

	const toggleActiveStyle = function (childKey: any) {
		if (activeTab === childKey ?? defaultActive === childKey) {
			return 'tabsButtonActive';
		} else {
			return 'tabsButtons';
		}
	};

	const handleClick = function (key: string) {
		setData(bindingPathPath, key, context.pageName);
	};

	const index = tabNames.findIndex((e: string) => e == activeTab);
	const entry = Object.entries(definition.children ?? {})
		.filter(([k, v]) => !!v)
		.sort(
			(a: any, b: any) =>
				(pageDefinition.componentDefinition[a[0]]?.displayOrder ?? 0) -
				(pageDefinition.componentDefinition[b[0]]?.displayOrder ?? 0),
		)[index == -1 ? 0 : index];
	const selectedChild = entry ? { [entry[0]]: entry[1] } : {};

	return (
		<div className="comp compTabs">
			<HelperComponent definition={definition} />
			<div className="tabButtonDiv">
				{tabNames.map((e: any) => (
					<button
						className={`${toggleActiveStyle(e)}`}
						key={e}
						onClick={() => handleClick(e)}
					>
						{getTranslations(e, pageDefinition.translations)}
					</button>
				))}
			</div>
			<div className="tabBodyDiv">
				<Children
					key={`${activeTab}_chld`}
					pageDefinition={pageDefinition}
					children={selectedChild}
					context={context}
					locationHistory={locationHistory}
				/>
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Tabs',
	displayName: 'Tabs',
	description: 'Tabs Component',
	component: TabsComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TabsStyles,
	styleProperties: stylePropertiesDefinition,
	hasChildren: true,
};

export default component;
