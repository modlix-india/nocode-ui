import React, { KeyboardEvent, useRef, useState } from 'react';
import {
	addListener,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import {
	ComponentProperty,
	RenderContext,
	DataLocation,
	ComponentProps,
	ComponentPropertyDefinition,
} from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import PopupStyles from './PopupStyles';
import { propertiesDefinition, stylePropertiesDefinition } from './popupProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponent';
import { renderChildren } from '../util/renderChildren';
import { runEvent } from '../util/runEvent';

function Popup(props: ComponentProps) {
	const [isActive, setIsActive] = React.useState(false);
	const {
		definition: { bindingPath },
	} = props;

	React.useEffect(() => {
		if (bindingPath)
			addListener(
				(_, value) => {
					setIsActive(!!value);
				},
				pageExtractor,
				getPathFromLocation(bindingPath, props.locationHistory),
			);
	}, []);
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: {
			showClose,
			closeOnEscape,
			closeOnOutsideClick,
			eventOnOpen,
			eventOnClose,
			closeButtonPosition,
		} = {},

		styleProperties,
	} = useDefinition(props.definition, propertiesDefinition, props.locationHistory, pageExtractor);
	const openEvent = eventOnOpen ? props.pageDefinition.eventFunctions[eventOnOpen] : undefined;
	const closeEvent = eventOnClose ? props.pageDefinition.eventFunctions[eventOnClose] : undefined;

	const refObj = useRef({ first: true });

	React.useEffect(() => {
		if (openEvent && isActive) {
			async () => await runEvent(openEvent, eventOnOpen, props.context.pageName);
		}
		if (!isActive && closeEvent && !refObj.current.first) {
			async () => await runEvent(closeEvent, eventOnClose, props.context.pageName);
		}
		refObj.current.first = true;
	}, [isActive]);
	const handleCloseOnOutsideClick = () => {
		if (closeOnOutsideClick) {
			handleClose();
		}
	};

	const handleClose = React.useCallback(() => {
		setData(
			getPathFromLocation(bindingPath!, props.locationHistory),
			false,
			props.context?.pageName,
		);
	}, []);
	const handleBubbling = (e: any) => {
		e.stopPropagation();
	};

	React.useEffect(() => {
		const escapeHandler = (event: any) => {
			if (event.key === 'Escape') {
				handleClose();
			}
		};
		if (isActive && closeOnEscape) {
			document.body.addEventListener('keyup', escapeHandler);
		}
		return () => {
			document.body.removeEventListener('keyup', escapeHandler);
		};
	}, [isActive, handleClose]);

	if (!isActive) return null;

	return (
		<Portal>
			<div className="comp compPopup">
				<HelperComponent definition={props.definition} />
				<div className="backdrop" onClick={handleCloseOnOutsideClick}>
					<div className="modal" onClick={handleBubbling}>
						<div
							className={`${
								closeButtonPosition === 'RIGHT'
									? 'closeButtonPositionRight'
									: 'closeButtonPositionLeft'
							}`}
						>
							{showClose && (
								<i className="fa-solid fa-xmark" onClick={handleClose}></i>
							)}
						</div>
						{renderChildren(
							props.pageDefinition,
							props.definition.children,
							props.context,
							props.locationHistory,
						)}
					</div>
				</div>
			</div>
		</Portal>
	);
}

const component: Component = {
	name: 'Popup',
	displayName: 'Popup',
	description: 'Popup component',
	component: Popup,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PopupStyles,
};

export default component;
