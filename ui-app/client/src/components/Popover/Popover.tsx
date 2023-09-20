import React, { useState } from 'react';
import { addListenerAndCallImmediately, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './popoverProperties';
import { Component } from '../../types/common';
import PopoverStyle from './PopoverStyle';
import useDefinition from '../util/useDefinition';
import Children from '../Children';
import Portal from '../Portal';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import getPositions from '../util/getPositions';
import { SubHelperComponent } from '../SubHelperComponent';
import { styleDefaults } from './popoverStyleProperties';
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
	}, [show]);

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
	}, [show]);

	return (
		<div
			className="comp compPopover"
			style={resolvedStyles.comp ?? {}}
			onClick={e => e.stopPropagation()}
		>
			<HelperComponent definition={definition} />
			{popChildren.length ? (
				<div
					style={{
						display: 'inline-flex',
						position: 'relative',
						...(resolvedStyles.popoverParentContainer ?? {}),
					}}
					ref={boxRef}
					onClick={showPopover}
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
									<Children
										key={`${key}_${popover.key}_chld`}
										pageDefinition={pageDefinition}
										children={{ [popover.key]: true }}
										context={{ ...context, isReadonly }}
										locationHistory={locationHistory}
									/>
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-regular fa-message',
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
