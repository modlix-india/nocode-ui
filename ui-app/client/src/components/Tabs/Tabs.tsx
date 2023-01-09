import React, { useEffect } from 'react';
import {
	addListener,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponent';
import { renderChildren } from '../util/renderChildren';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tabsProperties';
import TabsStyles from './TabsStyle';

function TabsComponent(props: ComponentProps) {
	const {
		definition,
		definition: { children },
		locationHistory = [],
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { tabs, defaultActive, bindingPath } = {} } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const [activeTab, setActiveTab] = React.useState(defaultActive || '');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory);

	useEffect(() => {
		return addListener(
			(_, value) => {
				setActiveTab(value ?? defaultActive ?? tabs[0].childKey);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, []);

	const toggleActiveBorderStyle = function (childKey: any) {
		if (activeTab === childKey || defaultActive === childKey) {
			return 'tabButtonBorderActive';
		} else {
			return '';
		}
	};

	const toggleActiveStyle = function (childKey: any) {
		if (activeTab === childKey || defaultActive === childKey) {
			return 'tabsButtonActive';
		} else {
			return 'tabsButtons';
		}
	};

	const handleClick = function (key: string) {
		setData(bindingPath, key);
	};

	return (
		<div className="comp compTabs">
			<HelperComponent definition={definition} />
			<div className="tabButtonDiv">
				{tabs.map((e: any) => (
					<button
						className={toggleActiveStyle(e.childKey)}
						key={e.childKey}
						onClick={() => handleClick(e.childKey)}
					>
						{e.tabName}
						<div className={toggleActiveBorderStyle(e.childKey)}></div>
					</button>
				))}
				<div>
					<div>
						{renderChildren(
							pageDefinition,
							{
								[activeTab]: true,
							},
							context,
							locationHistory,
						)}
					</div>
				</div>
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
};

export default component;
