import React from 'react';
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
		properties: { isReadonly, position = 'bottom' } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	const [show, setShow] = React.useState(false);
	const [coords, setCoords] = React.useState({ left: 0, top: 0 });
	const boxRef = React.createRef<HTMLDivElement>();
	const popoverRef = React.createRef<HTMLDivElement>();
	const [pageBox, setPageBox] = React.useState<DOMRect>();
	const popChildren = Object.keys(children ?? {})
		.map(e => pageDefinition.componentDefinition[e])
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
	if (!popChildren.length) throw new Error('Definition requires children');
	const popController = popChildren[0];
	const popover = popChildren[1];

	React.useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					setPageBox(value);
				},
				pageExtractor,
				'Page.boundingRect',
			),
		[],
	);

	React.useEffect(() => {
		if (!boxRef.current || !popoverRef.current || !show) return;
		const boxRect = boxRef.current?.getBoundingClientRect();
		const popoverRect = popoverRef.current?.getBoundingClientRect();
		console.log(boxRect, 'box', popoverRect);
		if (position === 'bottom-left') {
			setCoords({
				left: boxRect.x,
				top: boxRect.height + boxRect.y,
			});
		}

		if (position === 'bottom') {
			console.log(boxRect, 'box');
			let boxCenter = boxRect.x + boxRect.width / 2;
			let leftStart = boxCenter - popoverRect.width / 2;
			console.log(
				pageBox?.left,
				leftStart,
				(pageBox?.left ?? 0) > leftStart ? pageBox?.left ?? 0 : leftStart,
			);
			leftStart = (pageBox?.left ?? 0) > leftStart ? pageBox?.left ?? 0 : leftStart;
			console.log(pageBox, 'pagebox', leftStart);
			setCoords({
				left: leftStart,
				top: boxRect.height + boxRect.y,
			});
		}
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
			<div style={{ display: 'inline-flex' }} ref={boxRef} onClick={showPopover}>
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
								left: `${coords.left}px`,
								top: `${coords.top}px`,
							}}
						>
							<Children
								key={`${key}_${popover.key}_chld`}
								pageDefinition={pageDefinition}
								children={{ [popover.key]: true }}
								context={{ ...context, isReadonly }}
								locationHistory={locationHistory}
							/>
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
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PopoverStyle,
	stylePseudoStates: [],
};

export default component;
