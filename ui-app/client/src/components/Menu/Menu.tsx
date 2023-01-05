import React from 'react';
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
import { renderChildren } from '../util/renderChildren';
import { getTranslations } from '../util/getTranslations';
import MenuStyle from './MenuStyle';
import { runEvent } from '../util/runEvent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function Menu(props: ComponentProps) {
	const [isMenuActive, setIsMenuActive] = React.useState(false);
	const [hover, setHover] = React.useState(false);
	const { pathname } = useLocation();

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
			icon,
			isMenuOpen,
			linkPath,
			target,
			readOnly,
			pathsActiveFor = '',
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

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;

	const handleClick = async () => {
		setIsMenuOpenState(!isMenuOpenState);
		clickEvent && (await runEvent(clickEvent, key, context.pageName));
	};

	const menuDetails = (
		<>
			{icon ? (
				<i style={resolvedStyles.icon ?? {}} className={`${icon} icon`}></i>
			) : (
				<i className="icon fa-solid fa-user icon hide"></i>
			)}
			<span className="menuText">
				{getTranslations(label, props.pageDefinition.translations)}
			</span>
		</>
	);

	return (
		<div className="comp compMenu ">
			<HelperComponent definition={props.definition} />
			<div className="menuContainer" style={resolvedStyles.menuContainer ?? {}}>
				<div className={`menuItemsContainer ${isMenuActive ? 'isActive' : ''}`}>
					<div className="highLight"></div>
					<div
						onClick={!readOnly ? handleClick : undefined}
						className={`menu`}
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
						<div className="menuLink">
							{linkPath ? (
								<Link
									style={resolvedStyles.link ?? {}}
									className="link"
									target={target}
									to={linkPath}
								>
									{menuDetails}
								</Link>
							) : (
								menuDetails
							)}
						</div>
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
					</div>
				</div>
				{hasChildren && isMenuOpenState
					? renderChildren(pageDefinition, children, context, locationHistory)
					: null}
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	styleComponent: MenuStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
};

export default component;
