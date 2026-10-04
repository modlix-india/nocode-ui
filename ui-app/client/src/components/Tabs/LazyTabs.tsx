import React, { CSSProperties, useEffect, useLayoutEffect, useRef } from 'react';
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
	const currentTab: HTMLElement | undefined =
		tabRefs.current[hover === -1 ? tabs.indexOf(activeTab) : hover];
	// Layout offsets, not getBoundingClientRect: inside a popup that is still scaling in, the
	// visual rect is transformed and the highlighter came out the wrong size and place.
	// The tabs container is position:relative, so it is the offset parent.
	if (!currentTab?.offsetHeight) {
		// No tab to sit under: hide it rather than leave it where it was last measured.
		if (!currentTab) setHighlighterPosition({});
		return;
	}
	const hp: CSSProperties = {};
	hp['left'] = currentTab.offsetLeft;
	hp['top'] = currentTab.offsetTop;
	hp['width'] = currentTab.offsetWidth;
	hp['height'] = tabsOrientation === '_vertical' ? currentTab.offsetHeight : '100%';

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
			analyticsLabel,
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
	// A bound value that names no tab shows the first tab's content, so the first tab is the
	// one that looks active too.
	const shownTab = index == -1 ? tabs[0] : activeTab;
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

	useLayoutEffect(() => {
		const place = () =>
			setHighlighter(
				tabsOrientation,
				tabRefs,
				hover,
				tabs,
				shownTab,
				setHighlighterPosition,
			);
		place();
		// Tabs change size after mount (icons and fonts load, the popup finishes opening, the
		// container is resized), so follow the tab list instead of measuring once.
		const container: HTMLElement | undefined = tabRefs.current.find(e => !!e)?.parentElement;
		if (!container || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(place);
		observer.observe(container);
		tabRefs.current.forEach(e => e && observer.observe(e));
		return () => observer.disconnect();
	}, [
		hover,
		shownTab,
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
			data-analytics-label={analyticsLabel || undefined}
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
								ref={el => {
									tabRefs.current[i] = el;
								}}
								className={`tabDiv ${tabNameOrientation} ${
									hover === i || (hover === -1 && shownTab === e)
										? '_active'
										: ''
								}`}
								style={
									hover === i || shownTab === e
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
					style={{
						...(resolvedStyles.tabHighlighter ?? {}),
						...highlighterPosition,
						// Unmeasured, the highlighter would paint at its full default size.
						...(highlighterPosition.top === undefined ? { visibility: 'hidden' } : {}),
					}}
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
