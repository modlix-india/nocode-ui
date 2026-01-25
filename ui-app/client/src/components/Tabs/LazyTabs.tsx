import React, { CSSProperties, useEffect, useRef } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tabsProperties';
import { runEvent } from '../util/runEvent';
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
	hp['left'] = tabRect.left - tabsRect.left + tabsContainer.parentElement.scrollLeft;
	hp['top'] = tabRect.top - tabsRect.top + tabsContainer.parentElement.scrollTop;
	hp['width'] = tabsOrientation === '_horizontal' ? tabRect.width : '100%';
	hp['height'] = tabsOrientation === '_vertical' ? tabRect.height : '100%';

	setHighlighterPosition(hp);
}

export default function TabsComponent(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory = [],
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
			image,
			showLabel,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
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
			pageExtractor.getPageName(),
			(_, value) => {
				setActiveTab(value ?? defaultActive ?? tabs[0]);
			},
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
		const timeout = setTimeout(() => {
			setHighlighter(
				tabsOrientation,
				tabRefs,
				hover,
				tabs,
				activeTab,
				setHighlighterPosition,
			);
		}, 100);
		return () => clearTimeout(timeout);
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
										? (resolvedStylesWithHover.tab ?? {})
										: (resolvedStyles.tab ?? {})
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
								{image[i] ? (
									<img
										src={image[i]}
										className="icon"
										alt="icon"
										style={resolvedStyles.icon}
									></img>
								) : (
									<i
										className={`icon ${icon[i]}`}
										style={
											e === hover
												? (resolvedStylesWithHover.icon ?? {})
												: (resolvedStyles.icon ?? {})
										}
									>
										<SubHelperComponent
											definition={props.definition}
											subComponentName="icon"
											zIndex={9}
										/>
									</i>
								)}
								{showLabel && getTranslations(e, pageDefinition.translations)}
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
					renderableChildren={selectedChild}
					context={context}
					locationHistory={locationHistory}
				/>
			</div>
		</div>
	);
}
