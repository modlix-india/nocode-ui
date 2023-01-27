import React, { useRef } from 'react';
import {
	addListener,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { ComponentProps, ComponentPropertyDefinition } from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import PopupStyles from './PopupStyles';
import { propertiesDefinition, stylePropertiesDefinition } from './popupProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';

function Popup(props: ComponentProps) {
	const [isActive, setIsActive] = React.useState(false);
	const {
		definition: { bindingPath },
	} = props;
	if (!bindingPath) throw new Error('Definition needs binding path');
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
			modelTitle,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	const openEvent = eventOnOpen ? props.pageDefinition.eventFunctions[eventOnOpen] : undefined;
	const closeEvent = eventOnClose ? props.pageDefinition.eventFunctions[eventOnClose] : undefined;

	const refObj = useRef({ first: true });

	React.useEffect(() => {
		if (openEvent && isActive) {
			(async () =>
				await runEvent(openEvent, key, props.context.pageName, props.locationHistory))();
		}
		if (!isActive && closeEvent && !refObj.current.first) {
			(async () =>
				await runEvent(closeEvent, key, props.context.pageName, props.locationHistory))();
		}
		refObj.current.first = false;
	}, [isActive]);

	const handleClose = React.useCallback(() => {
		setData(
			getPathFromLocation(bindingPath, props.locationHistory),
			false,
			props.context?.pageName,
		);
	}, []);

	const handleCloseOnOutsideClick = closeOnOutsideClick ? handleClose : undefined;

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

	const closeIcon = (
		<i
			style={resolvedStyles.icon ?? {}}
			className="fa-solid fa-xmark iconClass"
			onClick={handleClose}
		></i>
	);

	if (!isActive) return null;

	return (
		<Portal>
			<div className="comp compPopup">
				<HelperComponent definition={props.definition} />
				<div
					className="backdrop"
					onClick={handleCloseOnOutsideClick}
					style={resolvedStyles.backdrop ?? {}}
				>
					<div
						className="modal"
						style={
							{
								...(resolvedStyles?.modal || {}),
								...(resolvedStyles?.modalbg || {}),
							} ?? {}
						}
						onClick={handleBubbling}
					>
						<div
							className="TitleIconGrid"
							style={
								{
									...(resolvedStyles?.titleGrid || {}),
									...(resolvedStyles?.titleGridExtra || {}),
								} ?? {}
							}
						>
							<div className="closeButtonPosition">
								{showClose && closeButtonPosition === 'LEFT' ? closeIcon : ''}
							</div>
							<div className="modelTitleStyle">{modelTitle && modelTitle}</div>
							<div className="closeButtonPosition">
								{showClose && closeButtonPosition === 'RIGHT' ? closeIcon : ''}
							</div>
						</div>
						<Children
							pageDefinition={props.pageDefinition}
							children={props.definition.children}
							context={props.context}
							locationHistory={props.locationHistory}
						/>
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
