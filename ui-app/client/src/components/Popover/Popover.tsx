import React, { useState } from 'react';
import { addListenerAndCallImmediately, PageStoreExtractor } from '../../context/StoreContext';
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
import { styleDefaults } from './popoverStyleProperties';
import { IconHelper } from '../util/IconHelper';
export interface PortalCoordinates {
	left?: number;
	top?: number;
	right?: number;
	bottom?: number;
}

function Popover(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		pageDefinition,
		definition,
		definition: { children, key },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
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
	const boxRef = React.createRef<HTMLDivElement>();
	const popoverRef = React.createRef<HTMLDivElement>();
	const popChildren = Object.keys(children ?? {})
		.map(e => pageDefinition.componentDefinition[e])
		.sort((a: any, b: any) => {
			const v = (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0);
			return v === 0 ? (a?.key ?? '').localeCompare(b?.key ?? '') : v;
		});

	const popController = popChildren[0];
	const popover = popChildren[1];

	React.useEffect(() => {
		if (!boxRef.current || !popoverRef.current || !show) return;
		const boxRect = boxRef.current?.getBoundingClientRect();
		const popoverRect = popoverRef.current?.getBoundingClientRect();

		let positions = getPositions(position, boxRect, popoverRect)!;
		setCoords(positions.coords);
		setTipPosition(positions.tipPosition);
		setMargin(positions.marginContainer);
		setTipStyle(positions.tipStyle!);
	}, [show, boxRef.current, popoverRef.current, position]);

	const showPopover = (e: React.MouseEvent<HTMLElement>) => {
		setShow(!show);
	};

	const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
		setShow(false);
	};

	React.useEffect(() => {
		if (isDesignMode && showInDesign === true) return;
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
					onMouseEnter={showOnHover ? showPopover : undefined}
					onMouseLeave={
						!(isDesignMode && showInDesign === true) && closeOnLeave
							? handleMouseLeave
							: undefined
					}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="popoverParentContainer"
					/>
					<Children
						key={`${key}_${popController}_chld`}
						pageDefinition={pageDefinition}
						children={{ [popController.key]: true }}
						context={{ ...context, isReadonly }}
						locationHistory={locationHistory}
					/>
					{(isDesignMode && showInDesign === true) || show ? (
						<Portal>
							<div
								ref={popoverRef}
								onClick={e => e.stopPropagation()}
								style={{
									position: 'absolute',
									...coords,
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
											children={{ [popover.key]: true }}
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 20">
					<rect
						className="_popOver"
						width="30"
						height="20"
						rx="2"
						fill="url(#paint0_linear_3214_9662)"
					/>
					<rect
						className="_popOver"
						x="3"
						y="3"
						width="24"
						height="14"
						rx="2"
						fill="white"
						fillOpacity="0.5"
					/>
					<path
						className="_popOver"
						d="M10.6062 24.95C10.3368 25.4167 9.66321 25.4167 9.39378 24.95L6.27609 19.55C6.00666 19.0833 6.34345 18.5 6.88231 18.5H13.1177C13.6566 18.5 13.9933 19.0833 13.7239 19.55L10.6062 24.95Z"
						fill="#0582C7"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9662"
							x1="15"
							y1="0"
							x2="15"
							y2="20"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#93D9FF" />
							<stop offset="1" stopColor="#007FC5" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
		{
			name: 'popoverParentContainer',
			displayName: 'Popover Parent Container',
			description: 'Popover Parent Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'popoverContainer',
			displayName: 'Popover Container',
			description: 'Popover Container',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
