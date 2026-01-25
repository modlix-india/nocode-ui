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
		stylePropertiesForTheme: styleProperties,
};

export default component;
