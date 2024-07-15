import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	PageStoreExtractor,
	addListener,
	getDataFromPath,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getHref } from '../util/getHref';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import GridStyle from './GridStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './gridProperties';
import { isNullValue } from '@fincity/kirun-js';
import { styleDefaults } from './gridStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Grid(props: ComponentProps) {
	const location = useLocation();
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);
	const [observer, setObserver] = React.useState<IntersectionObserver>();
	const ref = React.useRef(null);
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath, bindingPath2 },
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
			onMouseEnter,
			onMouseLeave,
			onLeavingViewport,
			onEnteringViewport,
			dragData,
			border,
			borderRadius,
			boxShadow,
			stopPropagation,
			preventDefault,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			children={definition.children}
			context={{ ...context, isReadonly }}
			locationHistory={locationHistory}
		/>
	);

	const dragstartHandler = (ev: React.DragEvent<HTMLElement>) => {
		ev.dataTransfer.setData('text/plain', dragData);
	};

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover, disabled: isReadonly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;
	const onMouseEnterEvent = onMouseEnter
		? props.pageDefinition.eventFunctions?.[onMouseEnter]
		: undefined;
	const onMouseLeaveEvent = onMouseLeave
		? props.pageDefinition.eventFunctions?.[onMouseLeave]
		: undefined;
	const onEnteringViewportEvent = onEnteringViewport
		? props.pageDefinition.eventFunctions?.[onEnteringViewport]
		: undefined;
	const onLeavingViewportEvent = onLeavingViewport
		? props.pageDefinition.eventFunctions?.[onLeavingViewport]
		: undefined;

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const bindingPathPath2 = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const spinnerPath = `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
		key,
	)}.isRunning`;

	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath, locationHistory, pageExtractor) ?? false,
	);

	useEffect(() => addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath), []);
	const handleClick =
		!clickEvent || isLoading
			? undefined
			: () =>
					(async () =>
						await runEvent(
							clickEvent,
							onClick,
							props.context.pageName,
							props.locationHistory,
							props.pageDefinition,
						))();

	const sepStyle = resolvedStyles?.comp?.hideScrollBar;
	const styleComp = sepStyle ? (
		<style
			key={`${key}_style`}
		>{`._${key}_grid_css::-webkit-scrollbar { display: none }`}</style>
	) : undefined;

	useEffect(() => {
		if (
			!ref.current ||
			(isNullValue(onEnteringViewportEvent) && isNullValue(onLeavingViewportEvent))
		)
			return;

		const thresholds = [];
		if (onEnteringViewport) thresholds.push(0.1);
		if (onLeavingViewport) thresholds.push(0.9);

		let firstTime = true;

		const observer = new IntersectionObserver(
			(entries, observer) => {
				if (firstTime) {
					firstTime = false;
					return;
				}

				if (
					onEnteringViewport &&
					Math.abs(Math.round(entries[0].intersectionRatio * 100) - 10) < 3
				) {
					(async () =>
						await runEvent(
							onEnteringViewportEvent,
							onEnteringViewport,
							props.context.pageName,
							props.locationHistory,
							props.pageDefinition,
						))();
				} else if (
					onLeavingViewport &&
					Math.abs(Math.round(entries[0].intersectionRatio * 100) - 90) < 3
				) {
					(async () =>
						await runEvent(
							onLeavingViewportEvent,
							onLeavingViewport,
							props.context.pageName,
							props.locationHistory,
							props.pageDefinition,
						))();
				}
			},
			{ root: null, rootMargin: '0px', threshold: thresholds },
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [ref.current, onEnteringViewport, onLeavingViewport]);

	if (linkPath) {
		return React.createElement(
			containerType.toLowerCase(),
			{
				className: 'comp compGrid',
				id: key,
				draggable:
					dragData?.length && dragData?.startsWith('TEMPLATE_DRAG_') ? true : false,
				onDragStart:
					dragData?.length && dragData?.startsWith('TEMPLATE_DRAG_')
						? dragstartHandler
						: undefined,
			},
			[
				<HelperComponent
					context={props.context}
					key={`${key}_hlp`}
					definition={definition}
				/>,
				styleComp,
				<Link
					key={`${key}_Link`}
					ref={ref}
					className={`_anchorGrid _${layout} ${background} ${border} ${borderRadius} ${boxShadow} ${
						sepStyle ? `_${key}_grid_css` : ''
					}`}
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover || onMouseEnterEvent
							? () => {
									setHover(true);

									if (!onMouseEnterEvent) return;
									(async () =>
										await runEvent(
											onMouseEnterEvent,
											onMouseEnter,
											props.context.pageName,
											props.locationHistory,
											props.pageDefinition,
										))();
								}
							: undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover || onMouseLeaveEvent
							? () => {
									setHover(false);
									if (!onMouseLeaveEvent) return;
									(async () =>
										await runEvent(
											onMouseLeaveEvent,
											onMouseLeave,
											props.context.pageName,
											props.locationHistory,
											props.pageDefinition,
										))();
								}
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

	const onScrollFunction =
		bindingPathPath || bindingPathPath2
			? (e: any) => {
					if (bindingPathPath) {
						const w = e.target.scrollWidth - e.target.clientWidth;
						setData(
							bindingPathPath,
							100 - Math.round(((w - e.target.scrollLeft) * 100) / w),
							context.pageName,
						);
					}
					if (bindingPathPath2) {
						const h = e.target.scrollHeight - e.target.clientHeight;
						setData(
							bindingPathPath2,
							100 - Math.round(((h - e.target.scrollTop) * 100) / h),
							context.pageName,
						);
					}
				}
			: undefined;

	return React.createElement(
		containerType.toLowerCase(),
		{
			onScroll: onScrollFunction,
			onMouseEnter:
				stylePropertiesWithPseudoStates?.hover || onMouseEnterEvent
					? () => {
							setHover(true);
							if (!onMouseEnterEvent) return;
							(async () =>
								await runEvent(
									onMouseEnterEvent,
									onMouseEnter,
									props.context.pageName,
									props.locationHistory,
									props.pageDefinition,
								))();
						}
					: undefined,

			onMouseLeave:
				stylePropertiesWithPseudoStates?.hover || onMouseLeaveEvent
					? () => {
							setHover(false);
							if (!onMouseLeaveEvent) return;
							(async () =>
								await runEvent(
									onMouseLeaveEvent,
									onMouseLeave,
									props.context.pageName,
									props.locationHistory,
									props.pageDefinition,
								))();
						}
					: undefined,
			onDragStart:
				dragData?.length && dragData?.startsWith('TEMPLATE_DRAG_')
					? dragstartHandler
					: undefined,
			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,
			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,
			ref: ref,
			draggable: dragData?.length && dragData?.startsWith('TEMPLATE_DRAG_') ? true : false,
			className: `comp compGrid _noAnchorGrid _${layout} ${background} ${border} ${borderRadius} ${boxShadow} ${
				sepStyle ? `_${key}_grid_css` : ''
			}`,
			style: resolvedStyles.comp ?? {},

			onClick: ev => {
				if (stopPropagation) ev.stopPropagation();
				if (preventDefault) ev.preventDefault();
				handleClick?.();
			},
			id: key,
		},
		[
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />,
			styleComp,
			childs,
		],
	);
}

const component: Component = {
	name: 'Grid',
	displayName: 'Grid',
	description: 'Grid component',
	component: Grid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover', 'focus', 'readonly'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Grid X Scroll Percentage Binding' },
		bindingPath2: { name: 'Grid Y Scroll Percentage Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'Grid',
		type: 'Grid',
	},
	sections: [
		{
			name: 'Grid',
			pageName: 'grid',
		},
	],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 22 22">
					<path
						d="M8 1H2C1.44772 1 1 1.44772 1 2V12C1 12.5523 1.44772 13 2 13H8C8.55229 13 9 12.5523 9 12V2C9 1.44772 8.55229 1 8 1Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
						fillOpacity="0.5"
					/>
					<path
						d="M20 9H14C13.4477 9 13 9.44772 13 10V20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V10C21 9.44772 20.5523 9 20 9Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M8 17H2C1.44772 17 1 17.4477 1 18V20C1 20.5523 1.44772 21 2 21H8C8.55229 21 9 20.5523 9 20V18C9 17.4477 8.55229 17 8 17Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
						fillOpacity="0.5"
					/>
					<path
						d="M20 1H14C13.4477 1 13 1.44772 13 2V4C13 4.55228 13.4477 5 14 5H20C20.5523 5 21 4.55228 21 4V2C21 1.44772 20.5523 1 20 1Z"
						fill="currentColor"
						strokeWidth="0"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
