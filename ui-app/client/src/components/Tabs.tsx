import { Schema } from '@fincity/kirun-js';
import React, { useEffect } from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData, PageStoreExtractor, getPathFromLocation } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { renderChildren } from './util/renderChildren';
import { ComponentProperty, DataLocation, RenderContext, Translations } from './types';
import { getTranslations } from './util/getTranslations';

export interface Tabs extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		key: string;
		name: string;
		children: any;
		properties: {
			tabs:ComponentProperty<Array<{childKey: string; tabName: string}>>;
			defaultActive: ComponentProperty<string>;
			bindingPath: DataLocation;
		};
        
	};
	pageDefinition: {
		translations: Translations
	};
    context: RenderContext;
	locationHistory: Array<DataLocation | string>;
}

export function TabsComponent(props: Tabs) {
	const {
		definition: {
			properties: { tabs, defaultActive, bindingPath },
			children,
		},
		pageDefinition:{translations},
        pageDefinition,
        definition,
        locationHistory,
        context
	} = props;
    const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const defaultActiveTab = getData(defaultActive,locationHistory, pageExtractor);
	const [activeTab, setActiveTab] = React.useState(defaultActiveTab || '');

	const tabsData = getData(tabs,locationHistory, pageExtractor);
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory);
	const handleClick = (key: string) => {
		setData(bindingPathPath, key);
	};
	useEffect(() => {
		return addListener(bindingPathPath, (_, value) => {
			setActiveTab(value??defaultActiveTab?? tabs[0].childKey);
		});
	}, []);
	const toggleActiveBorderStyle = function (childKey: any) {
		if (activeTab === childKey || defaultActive === childKey) {
			return 'tabButtonBorderActive';
		} else {
			return '';
		}
	};
	return (
		<div className="comp compTabs">
			<HelperComponent definition={definition} />
			<div className="tabBorder">
				<div className="tabButtonDiv">
					{tabsData.map((e: any) => (
						<button
							className={activeTab === e.childKey ? 'tabsButtonActive' : 'tabsButtons'}
							key={e.childKey}
							onClick={() => handleClick(e.childKey)}
						>
							{getTranslations(e.tabName,translations)}
							<div
								className={toggleActiveBorderStyle(e.childKey)}
							></div>
						</button>
					))}
				</div>
			</div>
			<div>
				<div>
					{renderChildren(pageDefinition, {[activeTab]:  true}, context, locationHistory)}
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
export default TabsComponent;