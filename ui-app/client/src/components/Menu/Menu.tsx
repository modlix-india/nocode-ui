import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import {
	ComponentProps,
	ComponentPropertyDefinition,
	ComponentProperty,
	DataLocation,
	RenderContext,
} from '../../types/common';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './menuProperties';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import MenuStyle from './MenuStyle';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { getHref } from '../util/getHref';
import Children from '../Children';

function Menu(props: ComponentProps) {
	const [isMenuActive, setIsMenuActive] = React.useState(false);
	const [hover, setHover] = React.useState(false);
	const location = useLocation();
	const { pathname } = location;

	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);

	const {
		definition: { children = {} },
		locationHistory,
		context,
		pageDefinition,
	} = props;

	const hasChildren = !!Object.keys(children).length;

	const {
		key,
		properties: {
			label,
			onClick,
			onMenuOpen,
			onMenuClose,
			onlyIconMenu,
			icon,
			isMenuOpen,
			linkPath,
			target,
			readOnly,
			pathsActiveFor,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
	);

	React.useEffect(() => {
		if (!pathsActiveFor?.length) return;
		const paths = pathsActiveFor.split(',');
		let hasPath = false;
		if (pathname === '/') {
			hasPath = !!paths.find((e: string) => pathname === e);
		} else {
			hasPath = !!paths
				.filter((e: string) => e !== '/')
				.find((e: string) => pathname.indexOf(e) >= 0);
		}
		setIsMenuActive(hasPath);
	}, [pathname, pathsActiveFor]);
	const [isMenuOpenState, setIsMenuOpenState] = React.useState(isMenuOpen ?? false);

	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);

	const clickEvent = onClick ? props.pageDefinition?.eventFunctions?.[onClick] : undefined;

	const menuCloseEvent = onMenuClose
		? props.pageDefinition?.eventFunctions?.[onMenuClose]
		: undefined;

	const menuOpenEvent = onMenuOpen
		? props.pageDefinition?.eventFunctions?.[onMenuOpen]
		: undefined;

	const refObj = useRef({ firstRender: true });

	React.useEffect(() => {
		if (menuCloseEvent && isMenuOpen && !refObj.current.firstRender) {
			async () =>
				await runEvent(
					menuCloseEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
		}
		if (menuOpenEvent && !isMenuOpen && !refObj.current.firstRender) {
			async () =>
				await runEvent(
					menuOpenEvent,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				);
		}
		refObj.current.firstRender = false;
	}, [isMenuOpen]);

	const handleClick = async () => {
		setIsMenuOpenState(!isMenuOpenState);
		clickEvent &&
			(await runEvent(
				clickEvent,
				key,
				context.pageName,
				props.locationHistory,
				props.pageDefinition,
			));
	};

	const menuDetails = (
		<>
			{icon ? (
				<i style={resolvedStyles.icon ?? {}} className={`${icon} icon`}></i>
			) : (
				<i
					className="icon fa-solid fa-user icon hide"
					style={resolvedStyles.icon ?? {}}
				></i>
			)}
			{!onlyIconMenu && (
				<span className="menuText">
					{getTranslations(label, props.pageDefinition.translations)}
				</span>
			)}
		</>
	);

	return (
		<div className="comp compMenu" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={props.definition} />
			<div className={`menuItemsContainer ${isMenuActive ? 'isActive' : ''}`}>
				<Link
					style={resolvedStyles.link ?? {}}
					className="link"
					target={target}
					to={getHref(linkPath, location)}
					title={
						onlyIconMenu
							? getTranslations(label, props.pageDefinition.translations)
							: ''
					}
				>
					<div
						onClick={!readOnly ? handleClick : undefined}
						className={`menu ${onlyIconMenu ? 'onlyIconMenu' : ''}`}
						onMouseEnter={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(true)
								: undefined
						}
						onMouseLeave={
							stylePropertiesWithPseudoStates?.hover
								? () => setHover(false)
								: undefined
						}
						style={resolvedStyles.menu ?? {}}
					>
						<div className="menuLink">{menuDetails}</div>
						{!onlyIconMenu && (
							<div className="menuCaretIcon">
								{hasChildren ? (
									!isMenuOpenState ? (
										<i
											style={resolvedStyles.caretIcon ?? {}}
											className="fa fa-solid fa-angle-down"
										></i>
									) : (
										<i
											style={resolvedStyles.caretIcon ?? {}}
											className="fa fa-solid fa-angle-up"
										></i>
									)
								) : null}
							</div>
						)}
					</div>
				</Link>
			</div>
			{hasChildren && isMenuOpenState ? (
				<Children
					pageDefinition={pageDefinition}
					children={children}
					context={context}
					locationHistory={locationHistory}
				/>
			) : null}
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-bars',
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	styleComponent: MenuStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
	allowedChildrenType: new Map([['Menu', -1]]),
	defaultTemplate: {
		key: '',
		type: 'Menu',
		name: 'Menu',
		properties: {
			label: { value: 'Menu' },
			icon: { value: 'fa-solid fa-bars' },
		},
	},
};

export default component;
