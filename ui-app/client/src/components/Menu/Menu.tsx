import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
	addListener,
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
	const [isMenuOpenState, setIsMenuOpenState] = React.useState(isMenuOpen ?? false);
	React.useEffect(() => {
		addListener(
			() => {
				const paths = pathsActiveFor.split(',');
				if (!paths.length) return;
				const hasPath = !!paths.find((e: string) => pathname.indexOf(e));
				setIsMenuActive(hasPath);
			},
			pageExtractor,
			'Store.urlDetails.pageName',
		);
	}, []);

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
			{icon ? <i style={resolvedStyles.icon ?? {}} className={icon}></i> : null}
			<span className="menuText">
				{getTranslations(label, props.pageDefinition.translations)}
			</span>
		</>
	);

	return (
		<div className="comp compMenu ">
			<HelperComponent definition={props.definition} />
			<div className="menuContainer" style={resolvedStyles.menuContainer ?? {}}>
				<div
					onClick={!readOnly ? handleClick : undefined}
					className={`menu ${isMenuActive ? 'isActive' : ''}`}
					onMouseEnter={() => setHover(true)}
					onMouseLeave={() => setHover(false)}
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
