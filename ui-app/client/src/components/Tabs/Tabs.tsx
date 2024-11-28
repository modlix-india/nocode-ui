import React, { CSSProperties, useEffect, useRef } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';

import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tabsProperties';
import { runEvent } from '../util/runEvent';
import TabsStyles from './TabsStyle';
import { styleDefaults } from './tabsStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { isNullValue } from '@fincity/kirun-js';

function setHighlighter(
	tabsOrientation: string,
	tabRefs: React.MutableRefObject<any[]>,
	hover: number,
	tabs: any[],
	activeTab: any,
	setHighlighterPosition: React.Dispatch<React.SetStateAction<React.CSSProperties>>,
) {
	const currentTab = tabRefs.current[hover === -1 ? tabs.indexOf(activeTab) : hover];
	const tabRect = currentTab?.getBoundingClientRect();
	if (!tabRect) return;
	const tabsContainer = tabRefs.current[0];
	if (!tabsContainer || !tabsContainer.parentElement) return;
	const tabsRect = tabsContainer.parentElement.getBoundingClientRect();
	const hp: CSSProperties = {};
	hp['left'] = tabRect.left - tabsRect.left;
	hp['top'] = tabRect.top - tabsRect.top;
	hp['width'] = tabsOrientation === '_horizontal' ? tabRect.width : '100%';
	hp['height'] = tabsOrientation === '_vertical' ? tabRect.height : '100%';

	setHighlighterPosition(hp);
}

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
		properties: {
			tabs = [],
			defaultActive,
			readOnly,
			icon,
			tabsOrientation,
			tabNameOrientation,
			tabsPosition,
			designType,
			colorScheme,
			onTabChange,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const [hover, setHover] = React.useState<number>(-1);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: false, readOnly: !!readOnly, disabled: !!readOnly },
		stylePropertiesWithPseudoStates,
	);
	const resolvedStylesWithHover = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true, readOnly: !!readOnly, disabled: !!readOnly },
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
	}, [bindingPathPath, defaultActive, tabs?.[0]]);

	const onChangeTabEvent = onTabChange
		? props.pageDefinition.eventFunctions?.[onTabChange]
		: undefined;

	const handleOnChange = onChangeTabEvent
		? async () =>
				await runEvent(
					onChangeTabEvent,
					onTabChange,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				)
		: undefined;

	const handleClick = async (key: string) => {
		if (!bindingPathPath) {
			setActiveTab(key);
			return;
		}
		setData(bindingPathPath, key, context.pageName);
		await handleOnChange?.();
	};

	const index = tabs.findIndex((e: string) => e == activeTab);
	const entry = Object.entries(definition.children ?? {})
		.filter(([k, v]) => !!v)
		.sort((a: any, b: any) => {
			const v =
				(pageDefinition.componentDefinition[a[0]]?.displayOrder ?? 0) -
				(pageDefinition.componentDefinition[b[0]]?.displayOrder ?? 0);
			return v === 0
				? (pageDefinition.componentDefinition[a[0]]?.key ?? '').localeCompare(
						pageDefinition.componentDefinition[b[0]]?.key ?? '',
					)
				: v;
		})[index == -1 ? 0 : index];
	const selectedChild = entry ? { [entry[0]]: entry[1] } : {};

	const tabRefs = useRef<any[]>([]);

	const [highlighterPosition, setHighlighterPosition] = React.useState<CSSProperties>({});

	useEffect(() => {
		setHighlighter(tabsOrientation, tabRefs, hover, tabs, activeTab, setHighlighterPosition);
	}, [
		hover,
		activeTab,
		tabs,
		tabRefs,
		tabsOrientation,
		tabNameOrientation,
		tabsPosition,
		setHighlighterPosition,
	]);

	useEffect(() => {
		tabRefs.current = [...tabRefs.current.slice(0, tabs.length)];
	}, [tabs]);

	return (
		<div
			className={`comp compTabs ${tabsOrientation} ${designType} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
			onResize={() =>
				setTimeout(
					() =>
						setHighlighter(
							tabsOrientation,
							tabRefs,
							hover,
							tabs,
							activeTab,
							setHighlighterPosition,
						),
					800,
				)
			}
		>
			<HelperComponent context={props.context} definition={definition} />
			<div
				className={`tabsContainer ${tabsPosition}`}
				style={resolvedStyles.tabsContainer ?? {}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="tabsContainer"
					zIndex={7}
				/>
				{tabs.map(
					(e: any, i: number) =>
						!isNullValue(e) && (
							<div
								key={e}
								ref={el => (tabRefs.current[i] = el)}
								className={`tabDiv ${tabNameOrientation} ${
									hover === i || (hover === -1 && activeTab === e)
										? '_active'
										: ''
								}`}
								style={
									hover === i || activeTab === e
										? resolvedStylesWithHover.tab ?? {}
										: resolvedStyles.tab ?? {}
								}
								onMouseEnter={() => setHover(i)}
								onMouseLeave={e => {
									e.preventDefault();
									e.stopPropagation();
									setHover(-1);
								}}
								onClick={() => handleClick(e)}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="tab"
									zIndex={8}
								/>

								<i
									className={`icon ${icon[i]}`}
									style={
										e === hover
											? resolvedStylesWithHover.icon ?? {}
											: resolvedStyles.icon ?? {}
									}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="icon"
										zIndex={9}
									/>
								</i>
								{getTranslations(e, pageDefinition.translations)}
							</div>
						),
				)}
				<div
					className={`tabHighlighter`}
					style={{ ...(resolvedStyles.tabHighlighter ?? {}), ...highlighterPosition }}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="tabHighlighter"
						zIndex={8}
					/>
				</div>
				<div className="tabsSeperator" style={resolvedStyles.tabsSeperator ?? {}}>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="tabsSeperator"
						zIndex={8}
					/>
				</div>
			</div>
			<div className="tabGridDiv" style={resolvedStyles.childContainer ?? {}}>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="childContainer"
				/>
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
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	stylePseudoStates: ['hover'],
	bindingPaths: {
		bindingPath: { name: 'Active Tab Binding' },
	},

	defaultTemplate: {
		key: '',
		name: 'Tabs',
		type: 'Tabs',
		properties: {
			tabs: {
				'3iFvRBg47fg0Mk7OR7Oshz': {
					key: '3iFvRBg47fg0Mk7OR7Oshz',
					order: 1,
					property: {
						value: 'Tab1',
					},
				},
				'5sEds41k2jvLbJgcOsDyVZ': {
					key: '5sEds41k2jvLbJgcOsDyVZ',
					order: 2,
					property: {
						value: 'Tab2',
					},
				},
				'3fmhmBLHzvC5yFJGK7IRmx': {
					key: '3fmhmBLHzvC5yFJGK7IRmx',
					order: 3,
					property: {
						value: 'Tab3',
					},
				},
			},
			icon: {
				'1gweTkTDaBOAUFGHDSV77J': {
					key: '1gweTkTDaBOAUFGHDSV77J',
					order: 1,
					property: {
						value: 'mi material-icons-outlined demoicons mio-demoicon1',
					},
				},
				'2Sr6eN2CeR1tOnODcFuoEB': {
					key: '2Sr6eN2CeR1tOnODcFuoEB',
					order: 2,
					property: {
						value: 'mi material-icons-outlined demoicons mio-demoicon2',
					},
				},
				'5oxu4PeICV9XbUM8uaUUGn': {
					key: '5oxu4PeICV9XbUM8uaUUGn',
					order: 3,
					property: {
						value: 'mi material-icons-outlined demoicons mio-demoicon3',
					},
				},
			},
			defaultActive: {
				value: 'Tab1',
			},
		},
	},
	sections: [{ name: 'Tabs', pageName: 'tab' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect x="4.28577" width="25.7143" height="25.7143" rx="4" fill="#EDEAEA" />
					<rect y="4.28516" width="25.7143" height="25.7143" rx="4" fill="#3792FE" />
					<path
						className="_tabs"
						d="M12.8572 24.6426C14.8463 24.6426 16.754 23.8524 18.1605 22.4459C19.567 21.0394 20.3572 19.1317 20.3572 17.1426C20.3572 15.1535 19.567 13.2458 18.1605 11.8393C16.754 10.4328 14.8463 9.64258 12.8572 9.64258C10.8681 9.64258 8.9604 10.4328 7.55388 11.8393C6.14735 13.2458 5.35718 15.1535 5.35718 17.1426C5.35718 19.1317 6.14735 21.0394 7.55388 22.4459C8.9604 23.8524 10.8681 24.6426 12.8572 24.6426ZM12.1541 19.7207V17.8457H10.2791C9.8894 17.8457 9.57593 17.5322 9.57593 17.1426C9.57593 16.7529 9.8894 16.4395 10.2791 16.4395H12.1541V14.5645C12.1541 14.1748 12.4675 13.8613 12.8572 13.8613C13.2468 13.8613 13.5603 14.1748 13.5603 14.5645V16.4395H15.4353C15.825 16.4395 16.1384 16.7529 16.1384 17.1426C16.1384 17.5322 15.825 17.8457 15.4353 17.8457H13.5603V19.7207C13.5603 20.1104 13.2468 20.4238 12.8572 20.4238C12.4675 20.4238 12.1541 20.1104 12.1541 19.7207Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'tabsContainer',
			displayName: 'Tabs Container',
			description: 'Tabs Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tab',
			displayName: 'Tab',
			description: 'Tab',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabHighlighter',
			displayName: 'Tab Highlighter',
			description: 'Tab Highlighter',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'childContainer',
			displayName: 'Child Container',
			description: 'Child Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tabsSeperator',
			displayName: 'Tabs Seperator',
			description: 'Tabs Seperator',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
