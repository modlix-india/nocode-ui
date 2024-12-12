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
						renderableChildren={{ [popController.key]: true }}
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M1.5 9C0.671573 9 0 8.32843 0 7.5V1.5C0 0.671573 0.671573 0 1.5 0H28.5C29.3284 0 30 0.671573 30 1.5V7.5C30 8.32843 29.3284 9 28.5 9H1.5ZM8.5 3.5H21.5C21.7761 3.5 22 3.72386 22 4V5C22 5.27614 21.7761 5.5 21.5 5.5H8.5C8.22386 5.5 8 5.27614 8 5V4C8 3.72386 8.22386 3.5 8.5 3.5Z"
						fill="#C5A400"
						className="_popOver"
						transform="translate(0, 19)"
						opacity={0}
					/>
					<rect width="30" height="24" rx="2" fill="#C5A400" className="_popOver1" />
					<path
						d="M23.5 11H6.5C6.22386 11 6 11.2239 6 11.5V12.5C6 12.7761 6.22386 13 6.5 13H23.5C23.7761 13 24 12.7761 24 12.5V11.5C24 11.2239 23.7761 11 23.5 11Z"
						fill="white"
						className="_popOver1"
					/>
					<path
						d="M23.5 5H12.5C12.2239 5 12 5.22386 12 5.5V6.5C12 6.77614 12.2239 7 12.5 7H23.5C23.7761 7 24 6.77614 24 6.5V5.5C24 5.22386 23.7761 5 23.5 5Z"
						fill="white"
						className="_popOver1"
					/>
					<path
						d="M23.5 17H12.5C12.2239 17 12 17.2239 12 17.5V18.5C12 18.7761 12.2239 19 12.5 19H23.5C23.7761 19 24 18.7761 24 18.5V17.5C24 17.2239 23.7761 17 23.5 17Z"
						fill="white"
						className="_popOver1"
					/>
					<path
						d="M10.6062 28.95C10.3368 29.4167 9.66321 29.4167 9.39378 28.95L6.27609 23.55C6.00666 23.0833 6.34345 22.5 6.88231 22.5H13.1177C13.6566 22.5 13.9933 23.0833 13.7239 23.55L10.6062 28.95Z"
						fill="#C5A400"
						className="_popOver1"
					/>
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
