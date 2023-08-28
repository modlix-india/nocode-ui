import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { PageStoreExtractor, addListener, getDataFromPath } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponent';
import { getHref } from '../util/getHref';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import GridStyle from './GridStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './gridProperties';

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
			onMouseEnter,
			onMouseLeave,
			dragData,
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
			context={{ ...context, isReadonly, observer }}
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
				<HelperComponent key={`${key}_hlp`} definition={definition} />,
				styleComp,
				<Link
					key={`${key}_Link`}
					ref={ref}
					className={`_anchorGrid _${layout} ${background} ${
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

	return React.createElement(
		containerType.toLowerCase(),
		{
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
};

export default component;
