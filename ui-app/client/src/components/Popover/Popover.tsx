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
	const { properties: { isReadonly, position } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);
	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	const [show, setShow] = React.useState(false);
	const [coords, setCoords] = React.useState<PortalCoordinates | undefined>();
	const [tipPosition, setTipPosition] = useState('');
	const [tipStyle, setTipStyle] = useState({});
	const [margin, setMargin] = useState({});
	const boxRef = React.createRef<HTMLDivElement>();
	const popoverRef = React.createRef<HTMLDivElement>();
	const popChildren = Object.keys(children ?? {})
		.map(e => pageDefinition.componentDefinition[e])
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
	if (!popChildren.length) throw new Error('Definition requires children');
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

	return (
		<div className="comp compPopover" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<div
				style={{ display: 'inline-flex' }}
				ref={boxRef}
				onClick={showPopover}
				onMouseLeave={() => setShow(false)}
			>
				<Children
					key={`${key}_${popController}_chld`}
					pageDefinition={pageDefinition}
					children={{ [popController.key]: true }}
					context={{ ...context, isReadonly }}
					locationHistory={locationHistory}
				/>
				{show ? (
					<div
					// style={{
					// 	width: '100vw',
					// 	height: '100vh',
					// 	position: 'absolute',
					// 	left: 0,
					// 	top: 0,
					// }}
					>
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
								<div className={`popoverTip ${tipPosition}`} style={tipStyle}></div>
								<div className={`popoverContainer`} style={margin}>
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
					</div>
				) : null}
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Popover',
	displayName: 'Popover',
	description: 'Popover component',
	component: Popover,
	styleComponent: PopoverStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
};

export default component;
