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
	if (!bindingPath) throw new Error('Definition requires binding path');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory);
	const [hover, setHover] = React.useState(false);

	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover: !!hover, readOnly: !!readOnly, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);

	const stringSpliter = (str: string) => {
		const value = str
			.split(',')
			.map((e: string) => e.trim())
			.filter(e => !!e);
		return value;
	};

	const tabNames = stringSpliter(tabs);
	const iconTags = stringSpliter(icon);

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

	const getActiveStyleBorder = function (childKey: any) {
		if (activeTab === childKey ?? defaultActive === childKey) return 'activeTabBorder';
	};
	const getActiveStyleHighlight = function (childKey: any) {
		if (activeTab === childKey ?? defaultActive === childKey) return 'activeTabHighlight';
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

	const orientationClass = tabsOrientation === 'VERTICAL' ? 'vertical' : '';

	return (
		<div className={`comp compTabs ${orientationClass}`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<div
				className={`tabsContainer ${orientationClass}`}
				style={resolvedStyles.tabsContainer ?? {}}
			>
				{tabNames.map((e: any, i: number) => (
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
							className={`tabButton ${iconTags.length === 0 ? 'noIcon' : ''}`}
						>
							<i className={iconTags[i]}></i>
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
};

export default component;
