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
import TabsStyles from './TabsStyle';
import { styleDefaults } from './tabsStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { isNullValue } from '@fincity/kirun-js';

function setHighlighter(
	tabsOrientation: string,
	tabRefs: React.MutableRefObject<any[]>,
	hover: number,
	tabs: any,
	activeTab: any,
	setHighlighterPosition: React.Dispatch<React.SetStateAction<React.CSSProperties>>,
) {
	const currentTab = tabRefs.current[hover === -1 ? tabs.indexOf(activeTab) : hover];
	const tabRect = currentTab?.getBoundingClientRect();
	const tabsRect = tabRefs.current[0].parentElement.getBoundingClientRect();
	const hp: CSSProperties = {};
	if (!tabRect) return;
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
			tabs,
			defaultActive,
			readOnly,
			icon,
			tabsOrientation,
			tabNameOrientation,
			tabsPosition,
			designType,
			colorScheme,
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
									i === hover
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M16.5006 7H1.50002C1.22387 7 1 7.22387 1 7.50002V22.5006C1 22.7768 1.22387 23.0006 1.50002 23.0006H16.5006C16.7768 23.0006 17.0006 22.7768 17.0006 22.5006V7.50002C17.0006 7.22387 16.7768 7 16.5006 7Z"
						fill="currentColor"
					/>
					<path
						d="M22.5006 0.999512H7.50002C7.36741 0.999512 7.24022 1.05219 7.14645 1.14596C7.05268 1.23974 7 1.36692 7 1.49953V5.99971H16.5004C16.8982 5.99971 17.2798 6.15776 17.5611 6.43907C17.8424 6.72039 18.0004 7.10193 18.0004 7.49977V17.0002H22.5006C22.6332 17.0002 22.7604 16.9475 22.8542 16.8537C22.948 16.7599 23.0006 16.6328 23.0006 16.5001V1.49953C23.0006 1.36692 22.948 1.23974 22.8542 1.14596C22.7604 1.05219 22.6332 0.999512 22.5006 0.999512Z"
						fill="currentColor"
						fillOpacity="0.2"
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
