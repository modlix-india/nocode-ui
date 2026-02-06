import React, { useRef } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps, ComponentPropertyDefinition } from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import PopupStyles from './PopupStyles';
import { propertiesDefinition, stylePropertiesDefinition } from './popupProperties';
import Portal from '../Portal';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getTranslations } from '../util/getTranslations';
import { styleProperties, styleDefaults } from './popupStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Popup(props: Readonly<ComponentProps>) {
	const [isActive, setIsActive] = React.useState(false);
	const {
		definition: { bindingPath },
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const bindingPathPath =
		bindingPath && getPathFromLocation(bindingPath, props.locationHistory, pageExtractor);
	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, value) => {
				setIsActive(!!value);
			},
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
			designType: popupDesign,
			showInDesign,
			modalPosition,
			background,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const openEvent = eventOnOpen ? props.pageDefinition.eventFunctions?.[eventOnOpen] : undefined;
	const closeEvent = eventOnClose
		? props.pageDefinition.eventFunctions?.[eventOnClose]
		: undefined;

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
		if (!bindingPathPath) return;

		setData(bindingPathPath, false, props.context?.pageName);
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
			style={resolvedStyles.closeButton ?? {}}
			className="mi material-icons-outlined demoicons mio-demoicon-close"
			onClick={handleClose}
		>
			<SubHelperComponent definition={props.definition} subComponentName="closeButton" />
		</i>
	);

	if (isActive || (globalThis.designMode == 'PAGE' && showInDesign === true)) {
		return (
			<Portal>
				<div className="comp compPopup">
					<div
						className={`backdrop ${modalPosition}`}
						onClick={handleCloseOnOutsideClick}
						style={resolvedStyles.comp ?? {}}
					>
						<HelperComponent context={props.context} definition={props.definition} />
						<div
							className={`modal ${popupDesign} ${background}`}
							style={resolvedStyles?.modal || {}}
							onClick={handleBubbling}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="modal"
							/>
							{popupDesign === '_design1' ? (
								<div
									className="TitleIconGrid"
									style={resolvedStyles?.titleGrid || {}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="titleGrid"
									/>
									{showClose && closeButtonPosition === 'LEFT' && (
										<div
											className="closeButtonPosition"
											style={resolvedStyles.closeButtonContainer ?? {}}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="closeButtonContainer"
											/>
											{closeIcon}
										</div>
									)}
									<div
										className="modelTitleStyle"
										style={resolvedStyles.modalTitle ?? {}}
									>
										<SubHelperComponent
											definition={props.definition}
											subComponentName="modalTitle"
										/>
										{modelTitle
											? getTranslations(
													modelTitle,
													props.pageDefinition.translations,
												)
											: ''}
									</div>
									{showClose && closeButtonPosition === 'RIGHT' && (
										<div
											className="closeButtonPosition"
											style={resolvedStyles.closeButtonContainer ?? {}}
										>
											<SubHelperComponent
												definition={props.definition}
												subComponentName="closeButtonContainer"
											/>
											{closeIcon}
										</div>
									)}
								</div>
							) : (
								<div
									className="design2CloseButton"
									style={resolvedStyles.closeButtonContainer ?? {}}
								>
									<SubHelperComponent
										definition={props.definition}
										subComponentName="closeButtonContainer"
									/>
									{showClose ? closeIcon : ''}
								</div>
							)}
							<Children
								pageDefinition={props.pageDefinition}
								renderableChildren={props.definition.children}
								context={props.context}
								locationHistory={props.locationHistory}
							/>
						</div>
					</div>
				</div>
			</Portal>
		);
	}
	return <></>;
}

const component: Component = {
	order: 20,
	name: 'Popup',
	displayName: 'Popup',
	description: 'Popup component',
	component: Popup,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: PopupStyles,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Toggle Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Popup',
		name: 'Popup',
	},
	needShowInDesginMode: true,
	sections: [{ name: 'Popup', pageName: 'popup' }],
		stylePropertiesForTheme: styleProperties,
};

export default component;
