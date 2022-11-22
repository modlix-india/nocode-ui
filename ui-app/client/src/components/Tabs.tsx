import { Schema } from '@fincity/kirun-js';
import React, { useEffect } from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { renderChildren } from './util/renderChildren';

export interface Tabs extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			tabs: {
				value: object;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: object;
					expression?: object;
				};
			};
			defaultActive: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			bindingPath: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
		};
	};
	pageDefinition: {
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
}

export function TabsComponent(props: Tabs) {
	const {
		definition: {
			properties: { tabs, defaultActive, bindingPath },
			children,
		},
		pageDefinition,
	} = props;
	const defaultActiveTab = getData(defaultActive);
	const [activeTab, setActiveTab] = React.useState(defaultActiveTab || '');

	const tabsData = getData(tabs);
	const bindingPathData = getData(bindingPath);
	const handleClick = function (key: string) {
		setData(bindingPathData, key);
	};
	useEffect(() => {
		addListener(bindingPathData, (_, value) => {
			setActiveTab(value);
		});
	}, []);
	const toggleActiveStyle = function (childKey: any) {
		if (activeTab === childKey || defaultActive === childKey) {
			return 'tabButtonsActive';
		} else {
			return '';
		}
	};
	return (
		<div className="comp compTabs">
			<HelperComponent />
			<div className="tabBorder">
				<div className="tabButtonDiv">
					{tabsData.map((e: any) => (
						<button
							className="tabsButtons"
							key={e.childKey}
							onClick={() => handleClick(e.childKey)}
						>
							{e.tabName}
							<div
								className={toggleActiveStyle(e.childKey)}
							></div>
						</button>
					))}
				</div>
			</div>
			<div>
				<div>
					{renderChildren(pageDefinition, {
						[activeTab ||
						defaultActiveTab ||
						Object.keys(children)[0]]: true,
					})}
				</div>
			</div>
		</div>
	);
}

TabsComponent.propertiesSchema = Schema.ofObject('Tabs')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['tabs', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['defaultActive', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['bindingPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);
export const tabs = TabsComponent;
