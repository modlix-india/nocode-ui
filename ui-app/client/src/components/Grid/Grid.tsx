import React, { useCallback, useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import {
	addListener,
	getData,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './gridProperties';
import GridStyle from './GridStyle';
import useDefinition from '../util/useDefinition';
import { Link, useLocation } from 'react-router-dom';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';
import { getHref } from '../util/getHref';

function Grid(props: ComponentProps) {
	const location = useLocation();
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);
	const [observer, setObserver] = React.useState<IntersectionObserver>();
	const ref = React.useRef(null);
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			readOnly: isReadonly = false,
			linkPath,
			target,
			containerType,
			layout,
			onClick,
			background,
			observeChildren,
			observerThresholds,
			rootMargin,
			onMouseEnter,
			onMouseLeave,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const bindingPathPath = getPathFromLocation(bindingPath!, locationHistory, pageExtractor);
	const observerrCallback = useCallback(
		(entries: Array<IntersectionObserverEntry>) => {
			if (observeChildren && !bindingPath) return;
			const [entry] = entries;
			const key = entry.target.getAttribute('data-key');
			setData(
				getPathFromLocation(bindingPath!, locationHistory, pageExtractor),
				key,
				context.pageName,
			);
		},
		[bindingPathPath],
	);
	React.useEffect(() => {
		if (!observeChildren) return;
		const threshold = observerThresholds
			.split(',')
			.map((e: string) => parseFloat(e))
			.filter((e: number) => !isNaN(e) && e <= 1 && e >= 0);
		const options = {
			root: ref.current,
			rootMargin: rootMargin,
			threshold,
		};
		setObserver(new IntersectionObserver(observerrCallback, options));
	}, [ref.current, observerrCallback]);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			children={definition.children}
			context={{ ...context, isReadonly, observer }}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover, disabled: isReadonly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const onMouseEnterEvent = onMouseEnter
		? props.pageDefinition.eventFunctions[onMouseEnter]
		: undefined;
	const onMouseLeaveEvent = onMouseLeave
		? props.pageDefinition.eventFunctions[onMouseLeave]
		: undefined;
	const spinnerPath = `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
		key,
	)}.isRunning`;

	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath, locationHistory, pageExtractor) ?? false,
	);

	useEffect(() => addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath), []);
	useEffect(() => {
		if (hover) {
			console.log(hover, onMouseEnterEvent);
			async () =>
				await runEvent(
					onMouseEnterEvent,
					onClick,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
			return;
		}
		console.log(hover, onMouseLeaveEvent);
		async () =>
			await runEvent(
				onMouseLeaveEvent,
				onClick,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
	}, [hover]);
	const handleClick =
		!clickEvent || isLoading
			? undefined
			: async () =>
					await runEvent(
						clickEvent,
						onClick,
						props.context.pageName,
						props.locationHistory,
						props.pageDefinition,
					);
	const sepStyle = resolvedStyles?.comp?.hideScrollBar;
	const styleComp = sepStyle ? (
		<style
			key={`${key}_style`}
		>{`._${key}_grid_css::-webkit-scrollbar { display: none }`}</style>
	) : undefined;
	if (linkPath) {
		return React.createElement(
			containerType.toLowerCase(),
			{ className: 'comp compGrid', id: key },
			[
				<HelperComponent key={`${key}_hlp`} definition={definition} />,
				styleComp,
				<Link
					key={`${key}_Link`}
					ref={ref}
					className={`_anchorGrid _${layout} ${background} ${
						sepStyle ? `_${key}_grid_css` : ''
					}`}
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover ||
						onMouseEnterEvent ||
						onMouseLeaveEvent
							? () => setHover(true)
							: undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover ||
						onMouseEnterEvent ||
						onMouseLeaveEvent
							? () => setHover(false)
							: undefined
					}
					onFocus={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined
					}
					onBlur={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined
					}
					to={getHref(linkPath, location)}
					target={target}
					style={resolvedStyles.comp ?? {}}
				>
					{childs}
				</Link>,
			],
		);
	}

	return React.createElement(
		containerType.toLowerCase(),
		{
			onMouseEnter:
				stylePropertiesWithPseudoStates?.hover || onMouseEnterEvent || onMouseLeaveEvent
					? () => setHover(true)
					: undefined,

			onMouseLeave:
				stylePropertiesWithPseudoStates?.hover || onMouseEnterEvent || onMouseLeaveEvent
					? () => setHover(false)
					: undefined,

			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,
			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,
			ref: ref,
			className: `comp compGrid _noAnchorGrid _${layout} ${background} ${
				sepStyle ? `_${key}_grid_css` : ''
			}`,
			style: resolvedStyles.comp ?? {},

			onClick: handleClick,
			id: key,
		},
		[<HelperComponent key={`${key}_hlp`} definition={definition} />, styleComp, childs],
	);
}

const component: Component = {
	icon: 'fa-solid fa-table-cells',
	name: 'Grid',
	displayName: 'Grid',
	description: 'Grid component',
	component: Grid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Scrolled Component Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Grid',
		type: 'Grid',
	},
};

export default component;
