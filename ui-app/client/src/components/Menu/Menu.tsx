import React, { MouseEvent, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { SubHelperComponent } from '../SubHelperComponent';
import { getHref } from '../util/getHref';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import MenuStyle from './MenuStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './menuProperties';
import Children from '../Children';
import { styleDefaults } from './menuStyleProperties';
import { IconHelper } from '../util/IconHelper';

function Menu(props: ComponentProps) {
	const location = useLocation();
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			linkPath,
			label,
			target,
			features,
			showButton,
			externalButtonTarget,
			externalButtonFeatures,
			caretIconClose,
			caretIconOpen,
			icon,
			isMenuOpen,
			onlyIconMenu,
			onMenuClose,
			onMenuOpen,
			onClick,
			pathsActiveFor,
			designType: menuDesignSelectionType,
			colorScheme: menuColorScheme,
			subMenuOrientation,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const resolvedLink = getHref(linkPath, location);
	const [isMenuOpenState, setIsMenuOpenState] = React.useState(isMenuOpen);
	const [isMenuActive, setIsMenuActive] = React.useState(false);
	const { pathname } = useLocation();
	const [containerHover, setContainerHover] = useState(false);

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

	const hoverStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const visitedStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: true },
		stylePropertiesWithPseudoStates,
	);

	const regularStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: false, hover: false },
		stylePropertiesWithPseudoStates,
	);

	const externalButton = showButton ? (
		<i
			className="_externalButton fa fa-solid fa-up-right-from-square"
			onClick={e => {
				e.stopPropagation();
				e.preventDefault();
				if (externalButtonTarget === '_self') {
					window.history.pushState(undefined, '', resolvedLink);
					window.history.back();
					setTimeout(() => window.history.forward(), 100);
				} else {
					window.open(
						resolvedLink,
						externalButtonTarget,
						externalButtonFeatures ?? features,
					);
				}
			}}
		>
			<SubHelperComponent definition={definition} subComponentName="externalIcon" />
		</i>
	) : (
		<></>
	);

	const leftIconButton = icon ? (
		<i className={`_icon ${icon}`}>
			<SubHelperComponent definition={definition} subComponentName="icon" />
		</i>
	) : (
		<></>
	);

	const menuToggle = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		e.preventDefault();
		const func =
			props.pageDefinition?.eventFunctions?.[isMenuOpenState ? onMenuClose : onMenuOpen];
		if (func) {
			(async () =>
				await runEvent(
					func,
					key,
					context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}
		setIsMenuOpenState(!isMenuOpenState);
	};

	const caretIcon = Object.entries(definition?.children ?? {}).filter(e => e[1]).length ? (
		<div className="_caretIconContainer">
			<i
				className={`_caretIcon ${isMenuOpenState ? caretIconOpen : caretIconClose}`}
				onClick={menuToggle}
			>
				<SubHelperComponent definition={definition} subComponentName="caretIcon" />
			</i>
		</div>
	) : (
		<></>
	);

	const styleKey = `${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	const styleComp = (
		<style key={`${styleKey}_style`}>
			{processStyleObjectToCSS(
				regularStyle?.comp,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.comp,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover, .comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}._isActive`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._externalButton, .comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}._isActive > ._externalButton`,
			)}

			{processStyleObjectToCSS(
				regularStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._icon`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._icon`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._icon, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._icon`,
			)}

			{processStyleObjectToCSS(
				regularStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._caretIcon`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._caretIcon`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._caretIcon, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._caretIcon`,
			)}
		</style>
	);

	const children =
		definition.children && isMenuOpenState ? (
			<div
				className={`${subMenuOrientation}`}
				style={(containerHover ? hoverStyle : regularStyle)?.subMenuContainer}
				onMouseOver={() => setContainerHover(true)}
				onMouseLeave={() => setContainerHover(false)}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="subMenuContainer"
				/>
				<Children
					pageDefinition={props.pageDefinition}
					children={definition.children}
					context={{ ...context, menuLevel: (context.menuLevel ?? 0) + 1 }}
					locationHistory={locationHistory}
				/>
			</div>
		) : (
			<></>
		);

	return (
		<>
			{styleComp}
			<a
				className={`comp compMenu _${styleKey}menu_css ${menuDesignSelectionType} ${menuColorScheme} ${
					isMenuActive ? '_isActive' : ''
				} _level${context.menuLevel ?? 0}`}
				href={resolvedLink}
				target={target}
				onClick={e => {
					if ((!target || target === '_self') && linkPath) {
						e.stopPropagation();
						e.preventDefault();
						window.history.pushState(undefined, '', resolvedLink);
						window.history.back();
						setTimeout(() => window.history.forward(), 100);
					} else if (features && linkPath) {
						e.stopPropagation();
						e.preventDefault();
						window.open(resolvedLink, target, features);
					} else if (!onClick) {
						menuToggle(e);
					}

					const func = onClick
						? props.pageDefinition?.eventFunctions?.[onClick]
						: undefined;
					if (!func) return;
					(async () =>
						await runEvent(
							func,
							key,
							context.pageName,
							props.locationHistory,
							props.pageDefinition,
						))();
				}}
			>
				<HelperComponent definition={definition} />
				{leftIconButton}
				{onlyIconMenu ? '' : getTranslations(label, translations)}
				{externalButton}
				{caretIcon}
			</a>
			{children}
		</>
	);
}

const component: Component = {
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	styleComponent: MenuStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled', 'active', 'visited'],
	allowedChildrenType: new Map([
		['Menu', -1],
		['Grid', 1],
	]),
	defaultTemplate: {
		key: '',
		type: 'Menu',
		name: 'Menu',
		properties: {
			label: { value: 'Menu' },
			icon: { value: 'fa-solid fa-bars' },
		},
	},
	sections: [
		{ name: 'Horizontal Menu', pageName: 'horizontalMenu' },
		{ name: 'Vertical Menu', pageName: 'verticalMenu' },
	],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path d="M3 11H11V3H3.8C3.35817 3 3 3.35817 3 3.8V11Z" fill="currentColor" />
					<path
						d="M21 13L13 13L13 21H20.2C20.6418 21 21 20.6418 21 20.2V13Z"
						fill="currentColor"
					/>
					<path
						d="M3 13L11 13L11 21H3.8C3.35817 21 3 20.6418 3 20.2L3 13Z"
						fill="currentColor"
					/>
					<path
						d="M21 11L13 11L13 3L20.2 3C20.6418 3 21 3.35817 21 3.8V11Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'externalIcon',
			displayName: 'External Icon',
			description: 'External Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'caretIcon',
			displayName: 'Caret Icon',
			description: 'Caret Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'subMenuContainer',
			displayName: 'Sub Menu Container',
			description: 'Sub Menu Container',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
