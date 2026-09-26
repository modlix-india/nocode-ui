import React, { useState } from 'react';
import {
	addListenerAndCallImmediately,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './popoverProperties';
import { Component } from '../../types/common';
import PopoverStyle from './PopoverStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import Portal from '../Portal';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import getPositions from '../util/getPositions';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleProperties, styleDefaults } from './popoverStyleProperties';
import { IconHelper } from '../util/IconHelper';
export interface PortalCoordinates {
	left?: number;
	top?: number;
	right?: number;
	bottom?: number;
}

// Kept identical to Dropdown's own constant on purpose: both are "the pointer left the
// control, give it a moment to come back", and two different delays would read as two
// different behaviours for the same gesture.
const MOUSE_LEAVE_CLOSE_DELAY = 1000;

function Popover(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		pageDefinition,
		definition,
		definition: { children, key },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			isReadonly,
			position,
			showTip,
			closeOnLeave,
			showInDesign,
			closeOnOutsideClick,
			showOnHover,
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
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const [show, setShow] = React.useState(false);
	const [coords, setCoords] = React.useState<PortalCoordinates | undefined>();
	const [tipPosition, setTipPosition] = useState('');
	const [tipStyle, setTipStyle] = useState({});
	const [margin, setMargin] = useState({});
	const boxRef = React.useRef<HTMLDivElement>(null);
	const popoverRef = React.useRef<HTMLDivElement>(null);
	const popChildren = Object.keys(children ?? {})
		.map(e => pageDefinition.componentDefinition[e])
		.sort((a: any, b: any) => {
			const v = (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0);
			return v === 0 ? (a?.key ?? '').localeCompare(b?.key ?? '') : v;
		});

	const popController = popChildren[0];
	const popover = popChildren[1];

	const isOpen = (globalThis.designMode == 'PAGE' && showInDesign === true) || show;

	// Layout effect and not an effect : the popover is portalled to the end of the body, so an
	// unpositioned absolute box would be painted at the bottom of the document for a frame,
	// growing the scroll height and flashing a scrollbar before the coordinates land.
	React.useLayoutEffect(() => {
		if (!isOpen) {
			setCoords(undefined);
			return;
		}
		if (!boxRef.current || !popoverRef.current) return;
		const boxRect = boxRef.current.getBoundingClientRect();
		const popoverRect = popoverRef.current.getBoundingClientRect();

		let positions = getPositions(position, boxRect, popoverRect)!;
		setCoords(positions.coords);
		setTipPosition(positions.tipPosition);
		setMargin(positions.marginContainer);
		setTipStyle(positions.tipStyle!);
	}, [isOpen, position, showTip]);

	const showPopover = (e: React.MouseEvent<HTMLElement>) => {
		setShow(!show);
	};

	// `closeOnLeave` used to close on the spot, and only the TRIGGER carries the leave
	// handler while the panel is portalled to the end of the body. So the pointer had to
	// travel from the trigger to a panel it could not touch without crossing a gap that
	// dismissed the thing it was heading for. The same aim-hostility Dropdown had, and
	// the same fix (Dropdown.tsx, MOUSE_LEAVE_CLOSE_DELAY): leaving only ARMS a close a
	// second out, and entering either the trigger or the panel disarms it, so a brief
	// wander off the edge costs nothing.
	const leaveClosesIt =
		!(globalThis.designMode == 'PAGE' && showInDesign === true) && !!closeOnLeave;

	const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const mouseIsInsideRef = React.useRef(false);

	const cancelPendingClose = React.useCallback(() => {
		mouseIsInsideRef.current = true;
		if (closeTimerRef.current === undefined) return;
		clearTimeout(closeTimerRef.current);
		closeTimerRef.current = undefined;
	}, []);

	const schedulePendingClose = React.useCallback(() => {
		mouseIsInsideRef.current = false;
		if (closeTimerRef.current !== undefined) clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => {
			closeTimerRef.current = undefined;
			// The pointer may have come back after the timer was armed but before it
			// fired; the ref is the live answer, state would be a frame stale.
			if (!mouseIsInsideRef.current) setShow(false);
		}, MOUSE_LEAVE_CLOSE_DELAY);
	}, []);

	// An unmount mid-countdown would otherwise leave the timer holding a setState.
	React.useEffect(
		() => () => {
			if (closeTimerRef.current !== undefined) clearTimeout(closeTimerRef.current);
		},
		[],
	);

	React.useEffect(() => {
		if (globalThis.designMode == 'PAGE' && showInDesign === true) return;
		const closePopover = () => setShow(false);
		if (show && closeOnOutsideClick) {
			document.body.addEventListener('click', closePopover);
		}
		return () => document.body.removeEventListener('click', closePopover);
	}, [show, closeOnOutsideClick, isDesignMode, showInDesign]);

	return (
		<div
			className="comp compPopover"
			style={resolvedStyles.comp ?? {}}
			onClick={e => e.stopPropagation()}
		>
			<HelperComponent context={props.context} definition={definition} />
			{popChildren.length ? (
				<div
					style={{
						display: 'inline-flex',
						position: 'relative',
						...(resolvedStyles.popoverParentContainer ?? {}),
					}}
					ref={boxRef}
					onClick={showPopover}
					onMouseEnter={e => {
						if (leaveClosesIt) cancelPendingClose();
						if (showOnHover) showPopover(e);
					}}
					onMouseLeave={leaveClosesIt ? schedulePendingClose : undefined}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="popoverParentContainer"
					/>
					<Children
						key={`${key}_${popController}_chld`}
						pageDefinition={pageDefinition}
						renderableChildren={{ [popController.key]: true }}
						context={{ ...context, isReadonly }}
						locationHistory={locationHistory}
					/>
					{isOpen ? (
						<Portal>
							<div
								ref={popoverRef}
								onClick={e => e.stopPropagation()}
								// Without these the panel is unreachable when closeOnLeave
								// is set: the countdown armed on leaving the trigger would
								// run out while the pointer sits on the panel, because the
								// panel is portalled and shares no DOM boundary with it.
								onMouseEnter={leaveClosesIt ? cancelPendingClose : undefined}
								onMouseLeave={leaveClosesIt ? schedulePendingClose : undefined}
								style={{
									position: 'fixed',
									...(coords ?? {
										top: 0,
										left: 0,
										visibility: 'hidden',
									}),
								}}
								className="comp compPopover popover"
							>
								{showTip ? (
									<div
										className={`popoverTip ${tipPosition}`}
										style={tipStyle}
									></div>
								) : null}
								<div
									className={`popoverContainer`}
									style={{
										...(showTip ? margin : null),
										...(resolvedStyles?.popoverContainer ?? {}),
									}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="popoverContainer"
									/>
									{popover ? (
										<Children
											key={`${key}_${popover.key}_chld`}
											pageDefinition={pageDefinition}
											renderableChildren={{ [popover.key]: true }}
											context={{ ...context, isReadonly }}
											locationHistory={locationHistory}
										/>
									) : undefined}
								</div>
							</div>
						</Portal>
					) : null}
				</div>
			) : null}
		</div>
	);
}

const component: Component = {
	order: 24,
	name: 'Popover',
	displayName: 'Popover',
	description: 'Popover component',
	component: Popover,
	styleComponent: PopoverStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	defaultTemplate: {
		key: '',
		type: 'Popover',
		name: 'Popover',
		properties: {},
	},
	needShowInDesginMode: true,
	stylePropertiesForTheme: styleProperties,
};

export default component;
