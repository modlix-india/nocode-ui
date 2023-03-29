import React, { useEffect } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
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
	const {
		properties: { tabs, defaultActive, readOnly, icon, tabsOrientation, activeStyle } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory)
		: undefined;
	const [hover, setHover] = React.useState(false);

	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover: !!hover, readOnly: !!readOnly, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);

	const [activeTab, setActiveTab] = React.useState(defaultActive ?? tabs[0]);

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			(_, value) => {
				setActiveTab(value ?? defaultActive ?? tabs[0]);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath, defaultActive, tabs]);

	console.log(tabs);

	const getActiveStyleBorder = function (childKey: any) {
		if (activeTab === childKey ?? defaultActive === childKey) return 'activeTabBorder';
	};
	const getActiveStyleHighlight = function (childKey: any) {
		if (activeTab === childKey ?? defaultActive === childKey) return 'activeTabHighlight';
	};

	const handleClick = function (key: string) {
		if (!bindingPathPath) {
			setActiveTab(key);
			return;
		}
		setData(bindingPathPath, key, context.pageName);
	};

	const index = tabs.findIndex((e: string) => e == activeTab);
	const entry = Object.entries(definition.children ?? {})
		.filter(([k, v]) => !!v)
		.sort(
			(a: any, b: any) =>
				(pageDefinition.componentDefinition[a[0]]?.displayOrder ?? 0) -
				(pageDefinition.componentDefinition[b[0]]?.displayOrder ?? 0),
		)[index == -1 ? 0 : index];
	const selectedChild = entry ? { [entry[0]]: entry[1] } : {};

	const orientationClass = tabsOrientation === 'VERTICAL' ? 'vertical' : '';

	return (
		<div className={`comp compTabs ${orientationClass}`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<div
				className={`tabsContainer ${orientationClass}`}
				style={resolvedStyles.tabsContainer ?? {}}
			>
				{tabs.map((e: any, i: number) => (
					<div
						key={e}
						className={`tabDiv ${orientationClass} ${
							activeStyle === 'HIGHLIGHT' ? getActiveStyleHighlight(e) : ''
						}`}
						style={resolvedStyles.tabDivContainer ?? {}}
						onMouseEnter={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(true)
								: undefined
						}
						onMouseLeave={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(false)
								: undefined
						}
						onClick={() => handleClick(e)}
					>
						<button
							style={resolvedStyles.button ?? {}}
							className={`tabButton ${icon.length === 0 ? 'noIcon' : ''}`}
						>
							<i className={icon[i]}></i>
							{getTranslations(e, pageDefinition.translations)}
						</button>
						{activeStyle === 'BORDER' && (
							<div className={getActiveStyleBorder(e)}></div>
						)}
					</div>
				))}
			</div>
			<div className="tabGridDiv" style={resolvedStyles.childContainer ?? {}}>
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
	icon: 'fa-solid fa-diagram-predecessor',
	name: 'Tabs',
	displayName: 'Tabs',
	description: 'Tabs Component',
	component: TabsComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TabsStyles,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	stylePseudoStates: ['hover'],
	bindingPaths: {
		bindingPath: { name: 'Active Tab Binding' },
	},
};

export default component;
