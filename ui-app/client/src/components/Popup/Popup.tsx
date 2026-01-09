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

	if (isActive || (isDesignMode && showInDesign === true)) {
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 26">
					<path
						d="M29.6971 0H27.9555C27.7873 0 27.6515 0.134272 27.6515 0.301832V19.7241H0.302883C0.135851 19.7241 0 19.8594 0 20.0259V21.6982C0 21.8646 0.135851 22 0.302883 22H29.6971C29.8641 22 30 21.8646 30 21.6982V0.301889C30 0.134329 29.8641 0 29.6971 0Z"
						fill="#EDEAEA"
					/>
					<rect width="26" height="18" rx="1" fill="#B35900" />
					<path
						d="M5.89245 4.03022H9.02365C9.18494 4.03022 9.31612 3.90939 9.31612 3.75985V2.26938C9.31612 2.11983 9.18494 2 9.02365 2H2.29247C2.13118 2 2 2.11983 2 2.26938V8.24026C2 8.3898 2.13118 8.50963 2.29247 8.50963H3.97636C4.13872 8.50963 4.2699 8.3898 4.2699 8.24026V5.45041L9.31505 9.92572C9.37204 9.97524 9.44516 10 9.51828 10C9.59139 10 9.66452 9.97524 9.72043 9.92572L10.9097 8.86901C10.9677 8.8185 11 8.74819 11 8.6749C11 8.60261 10.9677 8.5313 10.9097 8.4808L5.89245 4.03022Z"
						fill="white"
						className="_popupInner"
					/>
				</IconHelper>
			),
		},
		{
			name: 'modal',
			displayName: 'Modal',
			description: 'Modal',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'titleGrid',
			displayName: 'Title Grid',
			description: 'Title Grid',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeButton',
			displayName: 'Close Button',
			description: 'Close Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'modalTitle',
			displayName: 'Modal Title',
			description: 'Modal Title',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeButtonContainer',
			displayName: 'Close Button Container',
			description: 'Close Button Container',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
