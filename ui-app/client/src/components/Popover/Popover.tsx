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

export interface Cords {
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
	const [coords, setCoords] = React.useState<Cords>({ left: 0, top: 0 });
	const [tipPosition, setTipPosition] = useState('');
	const [tipStyle, setTipStyle] = useState({});
	const [margin, setMargin] = useState({});
	const boxRef = React.createRef<HTMLDivElement>();
	const popoverRef = React.createRef<HTMLDivElement>();
	const [pageBox, setPageBox] = React.useState<DOMRect>();
	const popChildren = Object.keys(children ?? {})
		.map(e => pageDefinition.componentDefinition[e])
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
	if (!popChildren.length) throw new Error('Definition requires children');
	const popController = popChildren[0];
	const popover = popChildren[1];

	// React.useEffect(
	// 	() =>
	// 		addListenerAndCallImmediately(
	// 			(_, value) => {
	// 				setPageBox(value);
	// 			},
	// 			pageExtractor,
	// 			'Page.boundingRect',
	// 		),
	// 	[],
	// );

	React.useEffect(() => {
		if (!boxRef.current || !popoverRef.current || !show) return;
		const boxRect = boxRef.current?.getBoundingClientRect();
		const popoverRect = popoverRef.current?.getBoundingClientRect();
		console.log(boxRect, 'box1');
		console.log(popoverRect, 'box2');

		// console.log(getPositions(position, boxRect, popoverRect)!);
		let positions = getPositions(position, boxRect, popoverRect)!;
		setCoords(positions.coords);
		setTipPosition(positions.tipPosition);
		setMargin(positions.marginContainer);
		setTipStyle(positions.tipStyle!);
		console.log('tip style ', tipStyle);
		console.log('tip position', tipPosition);
		// if (position === 'bottom-start') {
		// 	let bodyHeight = document.body.clientHeight;
		// 	let top = boxRect.y + boxRect.height;
		// 	top = top + popoverRect.height > bodyHeight ? boxRect.y - popoverRect.height : top;
		// 	let left = boxRect.x;
		// 	setCoords({ left, top });
		// }

		// if (position === 'bottom') {
		// 	let top = boxRect.y + boxRect.height;
		// 	let left = boxRect.x + 0.5 * boxRect.width - 0.5 * popoverRect.width;
		// 	setCoords({ top, left });
		// }

		// if (position === 'bottom-end') {
		// 	let bodyWidth = document.body.clientWidth;
		// 	let top = boxRect.y + boxRect.height;
		// 	let right = bodyWidth - boxRect.x - boxRect.width;
		// 	setCoords({ top, right });
		// }

		// if (position === 'top-start') {
		// 	let bodyHeight = document.body.clientHeight;
		// 	let bottom = bodyHeight - boxRect.y;
		// 	let left = boxRect.x;
		// 	setCoords({
		// 		left: left,
		// 		bottom: bottom,
		// 	});
		// }

		// if (position === 'top') {
		// 	let bodyHeight = document.body.clientHeight;
		// 	let bottom = bodyHeight - boxRect.y;
		// 	let left = boxRect.x + 0.5 * boxRect.width - 0.5 * popoverRect.width;
		// 	setCoords({
		// 		left: left,
		// 		bottom: bottom,
		// 	});
		// }

		// if (position === 'top-end') {
		// 	let bodyHeight = document.body.clientHeight;
		// 	let bottom = bodyHeight - boxRect.y;
		// 	let bodyWidth = document.body.clientWidth;
		// 	let right = bodyWidth - boxRect.x - boxRect.width;
		// 	setCoords({
		// 		right: right,
		// 		bottom: bottom,
		// 	});
		// }

		// if (position === 'left-start') {
		// 	let bodyWidth = document.body.clientWidth;
		// 	let right = bodyWidth - boxRect.x;
		// 	setCoords({
		// 		right: right,
		// 		top: boxRect.y,
		// 	});
		// }

		// if (position === 'left') {
		// 	let bodyWidth = document.body.clientWidth;
		// 	let right = bodyWidth - boxRect.x;
		// 	let top = boxRect.y + boxRect.height * 0.5 - popoverRect.height * 0.5;
		// 	setCoords({
		// 		right: right,
		// 		top: top,
		// 	});
		// }

		// if (position === 'left-end') {
		// 	let bodyWidth = document.body.clientWidth;
		// 	let right = bodyWidth - boxRect.x;
		// 	let bodyHeight = document.body.clientHeight;
		// 	let bottom = bodyHeight - boxRect.y - boxRect.height;
		// 	setCoords({
		// 		right: right,
		// 		bottom: bottom,
		// 	});
		// }

		// if (position === 'right-start') {
		// 	let left = boxRect.x + boxRect.width;
		// 	setCoords({
		// 		left: left,
		// 		top: boxRect.y,
		// 	});
		// }

		// if (position === 'right') {
		// 	let left = boxRect.x + boxRect.width;
		// 	// let topStart = boxRect.y + boxRect.height / 2 - popoverRect.height / 2;
		// 	// topStart = topStart < 0 ? 0 : topStart;
		// 	let top = boxRect.y + boxRect.height * 0.5 - popoverRect.height * 0.5;
		// 	setCoords({
		// 		left: left,
		// 		top: top,
		// 	});
		// }

		// if (position === 'right-end') {
		// 	let leftStart = boxRect.x + boxRect.width;
		// 	let bodyHeight = document.body.clientHeight;
		// 	let bottom = bodyHeight - boxRect.y - boxRect.height;
		// 	setCoords({
		// 		left: leftStart,
		// 		bottom: bottom,
		// 	});
		// }
	}, [show]);

	// const getCoord = (rect: DOMRect) => {
	// 	console.log(popoverRef.current?.getBoundingClientRect());
	// 	if (position === 'bottom-start') {
	// 		return {
	// 			left: rect.x,
	// 			top: rect.height + rect.y,
	// 		};
	// 	}

	// 	if (position === 'bottom') {
	// 		return {
	// 			left: rect.x,
	// 			top: rect.height + rect.y,
	// 		};
	// 	}
	// 	return {
	// 		left: 0,
	// 		top: 0,
	// 	};
	// };

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
				// onMouseLeave={showPopover}
			>
				<Children
					key={`${key}_${popController}_chld`}
					pageDefinition={pageDefinition}
					children={{ [popController.key]: true }}
					context={{ ...context, isReadonly }}
					locationHistory={locationHistory}
				/>
				{show ? (
					<Portal coords={coords}>
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
	stylePseudoStates: ['before'],
};

export default component;
