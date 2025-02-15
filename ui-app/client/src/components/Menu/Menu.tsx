import React, { MouseEvent, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentProps } from '../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getHref } from '../util/getHref';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import MenuStyle from './MenuStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './menuProperties';
import Children from '../Children';
import { styleDefaults } from './menuStyleProperties';
import { IconHelper } from '../util/IconHelper';
import getSrcUrl from '../util/getSrcUrl';

function Menu(props: Readonly<ComponentProps>) {
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
			imageIcon,
			activeImageIcon,
			isMenuOpen,
			onlyIconMenu,
			onMenuClose,
			onMenuOpen,
			onClick,
			pathsActiveFor,
			designType: menuDesignSelectionType,
			colorScheme: menuColorScheme,
			subMenuOrientation,
			readOnly,
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
	const [isHovered, setIsHovered] = useState(false);

	React.useEffect(() => {
		if (!pathsActiveFor?.length) return;
		const paths = pathsActiveFor.split(',');
		let hasPath;
		if (pathname === '/') {
			hasPath = !!paths.find((e: string) => pathname === e);
		} else {
			const lowerPath = pathname.toLowerCase();
			hasPath = !!paths
				.filter((e: string) => e !== '/')
				.find((e: string) => lowerPath.indexOf('/' + e.toLowerCase()) >= 0);
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
			onClick={
				readOnly
					? undefined
					: e => {
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
						}
			}
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
	) : imageIcon && !activeImageIcon ? (
		<>
			<img className={`_imageIcon ${imageIcon}`} src={getSrcUrl(imageIcon)} alt="imageIcon" />
			<SubHelperComponent definition={definition} subComponentName="imageIcon" />
		</>
	) : !imageIcon && activeImageIcon ? (
		<>
			<img
				className={`_activeImageIcon ${activeImageIcon}`}
				src={getSrcUrl(activeImageIcon)}
				alt="activeImageIcon"
			/>
			<SubHelperComponent definition={definition} subComponentName="activeImageIcon" />
		</>
	) : imageIcon && activeImageIcon && (isHovered || isMenuActive) ? (
		<>
			<img
				className={`_activeImageIcon ${activeImageIcon}`}
				src={getSrcUrl(activeImageIcon)}
				alt="activeImageIcon"
			/>
			<SubHelperComponent definition={definition} subComponentName="activeImageIcon" />
		</>
	) : imageIcon && activeImageIcon && (!isHovered || !isMenuActive) ? (
		<>
			<img className={`_imageIcon ${imageIcon}`} src={getSrcUrl(imageIcon)} alt="imageIcon" />
			<SubHelperComponent definition={definition} subComponentName="imageIcon" />
		</>
	) : (
		<></>
	);

	const menuToggle = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (readOnly) return;
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
				regularStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._imageIcon`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._imageIcon`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._imageIcon, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._imageIcon`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._activeImageIcon`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._activeImageIcon`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._activeImageIcon, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._activeImageIcon`,
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
					renderableChildren={definition.children}
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
				} ${readOnly ? '_disabled' : ''} _level${context.menuLevel ?? 0}`}
				href={readOnly ? 'javascript:void(0)' : resolvedLink}
				target={target}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
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
				<HelperComponent context={props.context} definition={definition} />
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
	order: 22,
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	styleComponent: MenuStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (): Array<string> => [],
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
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M15 0.85C7.19505 0.85 0.85 7.19505 0.85 15C0.85 22.8049 7.19505 29.15 15 29.15C22.8049 29.15 29.15 22.8049 29.15 15C29.15 7.19505 22.8049 0.85 15 0.85Z"
						fill="#02B694"
						stroke="#02B694"
						strokeWidth="0.3"
					/>
					<path
						d="M20.3023 8.85H9.69767C9.44104 8.85 9.22511 8.99519 9.07931 9.20417C8.93365 9.41295 8.85 9.69401 8.85 10C8.85 10.306 8.93365 10.5871 9.07931 10.7958C9.22511 11.0048 9.44104 11.15 9.69767 11.15H20.3023C20.559 11.15 20.7749 11.0048 20.9207 10.7958C21.0663 10.5871 21.15 10.306 21.15 10C21.15 9.69401 21.0663 9.41295 20.9207 9.20417C20.7749 8.99519 20.559 8.85 20.3023 8.85Z"
						fill="white"
						stroke="white"
						strokeWidth="0.3"
						className="_menuInner1"
					/>
					<path
						d="M20.3023 13.85H9.69767C9.44104 13.85 9.22511 13.9952 9.07931 14.2042C8.93365 14.4129 8.85 14.694 8.85 15C8.85 15.306 8.93365 15.5871 9.07931 15.7958C9.22511 16.0048 9.44104 16.15 9.69767 16.15H20.3023C20.559 16.15 20.7749 16.0048 20.9207 15.7958C21.0663 15.5871 21.15 15.306 21.15 15C21.15 14.694 21.0663 14.4129 20.9207 14.2042C20.7749 13.9952 20.559 13.85 20.3023 13.85Z"
						fill="white"
						stroke="white"
						strokeWidth="0.3"
						className="_menuInner2"
					/>
					<path
						d="M20.3023 18.85H9.69767C9.44104 18.85 9.22511 18.9952 9.07931 19.2042C8.93365 19.4129 8.85 19.694 8.85 20C8.85 20.306 8.93365 20.5871 9.07931 20.7958C9.22511 21.0048 9.44104 21.15 9.69767 21.15H20.3023C20.559 21.15 20.7749 21.0048 20.9207 20.7958C21.0663 20.5871 21.15 20.306 21.15 20C21.15 19.694 21.0663 19.4129 20.9207 19.2042C20.7749 18.9952 20.559 18.85 20.3023 18.85Z"
						fill="white"
						stroke="white"
						strokeWidth="0.3"
						className="_menuInner3"
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
			name: 'imageIcon',
			displayName: 'ImageIcon',
			description: 'ImageIcon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'activeImageIcon',
			displayName: 'ActiveImageIcon',
			description: 'ActiveImageIcon',
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
