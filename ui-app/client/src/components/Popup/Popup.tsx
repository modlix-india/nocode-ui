import React, { useRef } from 'react';
import {
	addListenerAndCallImmediately,
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
		context,
	} = props;
	if (!bindingPath) throw new Error('Definition needs binding path');
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const bindingPathPath = getPathFromLocation(bindingPath, props.locationHistory, pageExtractor);
	React.useEffect(() => {
		if (bindingPath)
			addListenerAndCallImmediately(
				(_, value) => {
					setIsActive(!!value);
				},
				pageExtractor,
				bindingPathPath,
			);
	}, []);
	const {
		key,
		properties: {
			showClose,
			closeOnEscape,
			closeOnOutsideClick,
			eventOnOpen,
			eventOnClose,
			closeButtonPosition,
			modelTitle,
			popupDesign,
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
				await runEvent(
					openEvent,
					key,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}
		if (!isActive && closeEvent && !refObj.current.first) {
			(async () =>
				await runEvent(
					closeEvent,
					key,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
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
			<div className="comp compPopup" style={resolvedStyles.comp ?? {}}>
				<HelperComponent definition={props.definition} />
				<div
					className="backdrop"
					onClick={handleCloseOnOutsideClick}
					style={resolvedStyles.backdrop ?? {}}
				>
					<div
						className={`modal ${popupDesign === '_design2' ? 'design2' : ''} `}
						style={
							{
								...(resolvedStyles?.modal || {}),
								...(resolvedStyles?.modalbg || {}),
							} ?? {}
						}
						onClick={handleBubbling}
					>
						{popupDesign === '_design1' ? (
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
						) : (
							<div className="design2CloseButton">{showClose ? closeIcon : ''}</div>
						)}
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
	icon: 'fa-solid fa-window-restore',
	name: 'Popup',
	displayName: 'Popup',
	description: 'Popup component',
	component: Popup,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PopupStyles,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Toggle Binding' },
	},
};

export default component;
