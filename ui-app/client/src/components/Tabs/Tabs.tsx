import React, { useEffect } from 'react';
import {
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
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tabsProperties';
import TabsStyles from './TabsStyle';
import { SubHelperComponent } from '../SubHelperComponent';

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
	const [hover, setHover] = React.useState(null);
	console.log(hover, 'hoverValue');

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
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

	const orientationClass = tabsOrientation === 'VERTICAL' ? 'vertical' : '';

	const handleMouseEnter = (each: any) => {
		console.log(each, 'eachfirst');
		setHover(each);
	};
	console.log(hover, 'hoverAfterSetHover');

	return (
		<div className={`comp compTabs ${orientationClass}`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<div
				className={`tabsContainer ${orientationClass}`}
				style={resolvedStyles.tabsContainer ?? {}}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="tabsContainer"
				/>
				{tabs.map((e: any, i: number) => (
					<div
						key={e}
						className={`tabDiv ${orientationClass} ${
							activeStyle === 'HIGHLIGHT' ? getActiveStyleHighlight(e) : ''
						}`}
						style={e === hover ? resolvedStyles.tabDivContainer ?? {} : {}}
						onMouseEnter={
							stylePropertiesWithPseudoStates?.hover
								? () => handleMouseEnter(e)
								: undefined
						}
						onMouseLeave={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(null)
								: undefined
						}
						onClick={() => handleClick(e)}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="tabDivContainer"
						/>

						<button
							style={e === hover ? resolvedStyles.button ?? {} : {}}
							className={`tabButton ${icon.length === 0 ? 'noIcon' : ''}`}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="button"
							/>
							<i
								className={`icon ${icon[i]}`}
								style={e === hover ? resolvedStyles.icon ?? {} : {}}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="icon"
								/>
							</i>
							{getTranslations(e, pageDefinition.translations)}
						</button>
						{activeStyle === 'BORDER' && (
							<div
								className={`border ${getActiveStyleBorder(e)}`}
								style={e === hover ? resolvedStyles.border ?? {} : {}}
							>
								<SubHelperComponent
									definition={props.definition}
									subComponentName="border"
								/>
							</div>
						)}
					</div>
				))}
			</div>
			<div className="tabGridDiv" style={resolvedStyles.childContainer ?? {}}>
				<SubHelperComponent definition={props.definition} subComponentName="tabGridDiv" />
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
				'24Aou1fgffDV4hpQMxj4jy': {
					key: '24Aou1fgffDV4hpQMxj4jy',
					order: 4,
					property: {
						value: 'Tab4',
					},
				},
			},
			icon: {
				'1gweTkTDaBOAUFGHDSV77J': {
					key: '1gweTkTDaBOAUFGHDSV77J',
					order: 1,
					property: {
						value: 'fa-arrows-to-circle fa-solid',
					},
				},
				'2Sr6eN2CeR1tOnODcFuoEB': {
					key: '2Sr6eN2CeR1tOnODcFuoEB',
					order: 2,
					property: {
						value: 'fa-text-height fa-solid',
					},
				},
				'5oxu4PeICV9XbUM8uaUUGn': {
					key: '5oxu4PeICV9XbUM8uaUUGn',
					order: 3,
					property: {
						value: 'fa-message fa-solid',
					},
				},
				'7yb3thIp2JDvXMlUy6uTMS': {
					key: '7yb3thIp2JDvXMlUy6uTMS',
					order: 4,
					property: {
						value: 'fa-file-lines fa-solid',
					},
				},
			},
			defaultActive: {
				value: 'Tab1',
			},
		},
	},
};

export default component;
