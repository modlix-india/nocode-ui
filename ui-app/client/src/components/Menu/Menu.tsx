import React, { MouseEvent, useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
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
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './menuStyleProperties';
import { IconHelper } from '../util/IconHelper';
import getSrcUrl from '../util/getSrcUrl';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

function Menu(props: Readonly<ComponentProps>) {
	const location = useLocation();
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
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
			showOpenCloseButton,
			closeOnClickOutside,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const anchorRef = useRef<HTMLAnchorElement>(null);
	const submenuRef = useRef<HTMLDivElement>(null);
	const resolvedLink = getHref(linkPath, location);
	const [isMenuOpenState, setIsMenuOpenState] = React.useState(isMenuOpen);
	const [isMenuActive, setIsMenuActive] = React.useState(false);
	const { pathname } = useLocation();
	const [containerHover, setContainerHover] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [mouseIsInside, setMouseIsInside] = useState(false);

	// Synchronize the internal state with the 'isMenuOpen' property from the definition.
	React.useEffect(() => {
		setIsMenuOpenState(isMenuOpen);
	}, [isMenuOpen]);

	useLayoutEffect(() => {
		if (!isMenuOpenState || !anchorRef.current) return;

		const positionSubmenu = () => {
			if (!anchorRef.current || !submenuRef.current) return;

			const anchorRect = anchorRef.current.getBoundingClientRect();
			const submenuRect = submenuRef.current.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Gap between anchor and submenu
			const gap = 2;

			// Available space in each direction
			const spaceTop = anchorRect.top;
			const spaceBottom = viewportHeight - anchorRect.bottom;
			const spaceLeft = anchorRect.left;
			const spaceRight = viewportWidth - anchorRect.right;

			let orientation =
				subMenuOrientation === '_default_orientation' || !subMenuOrientation
					? '_bottom_orientation'
					: subMenuOrientation;

			let finalTop = 0;
			let finalLeft = 0;

			// Helper to check if orientation fits
			const fits = (orient: string) => {
				if (orient === '_bottom_orientation')
					return spaceBottom >= submenuRect.height + gap;
				if (orient === '_top_orientation') return spaceTop >= submenuRect.height + gap;
				if (orient === '_right_orientation') return spaceRight >= submenuRect.width + gap;
				if (orient === '_left_orientation') return spaceLeft >= submenuRect.width + gap;
				return false;
			};

			// Logic to determine best orientation if preferred doesn't fit
			if (!fits(orientation)) {
				if (
					(orientation === '_bottom_orientation' && spaceTop > spaceBottom) ||
					(orientation === '_top_orientation' && spaceBottom > spaceTop)
				) {
					orientation =
						orientation === '_bottom_orientation'
							? '_top_orientation'
							: '_bottom_orientation';
				} else if (
					(orientation === '_right_orientation' && spaceLeft > spaceRight) ||
					(orientation === '_left_orientation' && spaceRight > spaceLeft)
				) {
					orientation =
						orientation === '_right_orientation'
							? '_left_orientation'
							: '_right_orientation';
				}
			}

			// Calculate Final Position logic
			if (orientation === '_bottom_orientation') {
				finalTop = anchorRect.bottom + gap;
				finalLeft = anchorRect.left;
			} else if (orientation === '_top_orientation') {
				finalTop = anchorRect.top - submenuRect.height - gap;
				finalLeft = anchorRect.left;
			} else if (orientation === '_right_orientation') {
				finalTop = anchorRect.top;
				finalLeft = anchorRect.right + gap;
			} else {
				// _left_orientation
				finalTop = anchorRect.top;
				finalLeft = anchorRect.left - submenuRect.width - gap;
			}

			// Horizontal Overflow Check (Slide Logic)
			if (orientation === '_top_orientation' || orientation === '_bottom_orientation') {
				if (finalLeft + submenuRect.width > viewportWidth) {
					finalLeft = viewportWidth - submenuRect.width - 10;
				}
				if (finalLeft < 0) {
					finalLeft = 10;
				}
			}

			// Vertical Overflow Check (Slide Logic)
			if (orientation === '_left_orientation' || orientation === '_right_orientation') {
				if (finalTop + submenuRect.height > viewportHeight) {
					finalTop = viewportHeight - submenuRect.height - 10;
				}
				if (finalTop < 0) {
					finalTop = 10;
				}
			}

			// Apply Styles
			const style = submenuRef.current.style;
			style.setProperty('top', `${finalTop}px`, 'important');
			style.setProperty('left', `${finalLeft}px`, 'important');

			if (
				(orientation === '_top_orientation' || orientation === '_bottom_orientation') &&
				!regularStyle?.subMenuContainer?.width &&
				!regularStyle?.subMenuContainer?.minWidth
			) {
				style.setProperty('width', `${anchorRect.width}px`, 'important');
			} else {
				style.removeProperty('width');
			}
		};

		// 1. Initial trigger
		positionSubmenu();

		// 2. Use ResizeObserver to detect size changes in anchor or submenu (content loading)
		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(positionSubmenu);
		});
		if (anchorRef.current) resizeObserver.observe(anchorRef.current);

		// 3. Robust initial warm-up to catch layout shifts on reload
		const warmUpInterval = setInterval(positionSubmenu, 100);
		const warmUpTimeout = setTimeout(() => clearInterval(warmUpInterval), 2000);

		// 4. Standard listeners
		window.addEventListener('resize', positionSubmenu);
		window.addEventListener('scroll', positionSubmenu, true);

		// 5. Special check for submenuRef.current when it becomes available via Portal
		let rafId: number;
		const checkSubmenu = () => {
			if (submenuRef.current) {
				resizeObserver.observe(submenuRef.current);
				positionSubmenu();
			} else {
				rafId = requestAnimationFrame(checkSubmenu);
			}
		};
		rafId = requestAnimationFrame(checkSubmenu);

		return () => {
			resizeObserver.disconnect();
			clearInterval(warmUpInterval);
			clearTimeout(warmUpTimeout);
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', positionSubmenu);
			window.removeEventListener('scroll', positionSubmenu, true);
		};
	}, [isMenuOpenState, subMenuOrientation]);

	React.useEffect(() => {
		const allActivePaths = pathsActiveFor ? pathsActiveFor.split(',') : [];
		if (linkPath && resolvedLink && resolvedLink !== 'javascript:void(0)') {
			allActivePaths.push(resolvedLink);
		}

		const currentPathname = (pathname || '').toLowerCase().trim();
		const hasPath = allActivePaths.some((e: string) => {
			const cleanE = e.toLowerCase().trim();
			if (!cleanE || cleanE === 'javascript:void(0)') return false;

			if (cleanE === '/') return currentPathname === '/' || currentPathname === '';

			const normalizedPath = currentPathname.replace(/^\//, '').replace(/\/$/, '');
			const normalizedE = cleanE.replace(/^\//, '').replace(/\/$/, '');
			return normalizedPath === normalizedE || normalizedPath.startsWith(normalizedE + '/');
		});
		setIsMenuActive(hasPath);
	}, [pathname, pathsActiveFor, resolvedLink, linkPath]);

	const isFirstRun = useRef(true);
	// Close menu on navigation
	useEffect(() => {
		if (isFirstRun.current) {
			isFirstRun.current = false;
			return;
		}
		setIsMenuOpenState(false);
	}, [pathname]);

	useEffect(() => {
		if (!isMenuOpenState || !closeOnClickOutside) return;
		const closeFunction = () => {
			if (mouseIsInside) return;
			setIsMenuOpenState(false);
		};
		window.addEventListener('mousedown', closeFunction);
		return () => window.removeEventListener('mousedown', closeFunction);
	}, [mouseIsInside, isMenuOpenState, closeOnClickOutside]);

	const hoverStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);

	const activeStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ active: true },
		stylePropertiesWithPseudoStates,
	);

	const visitedStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: true },
		stylePropertiesWithPseudoStates,
	);

	const regularStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: false, hover: false, active: false },
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
		<span className="_imageIcon">
			<img src={getSrcUrl(imageIcon)} alt="imageIcon" />
			<SubHelperComponent definition={definition} subComponentName="imageIcon" />
		</span>
	) : !imageIcon && activeImageIcon ? (
		<span className="_activeImageIcon">
			<img src={getSrcUrl(activeImageIcon)} alt="activeImageIcon" />
			<SubHelperComponent definition={definition} subComponentName="activeImageIcon" />
		</span>
	) : imageIcon && activeImageIcon && (isHovered || isMenuActive || containerHover) ? (
		<span className="_activeImageIcon">
			<img src={getSrcUrl(activeImageIcon)} alt="activeImageIcon" />
			<SubHelperComponent definition={definition} subComponentName="activeImageIcon" />
		</span>
	) : imageIcon && activeImageIcon && !isHovered && !isMenuActive && !containerHover ? (
		<span className="_imageIcon">
			<img src={getSrcUrl(imageIcon)} alt="imageIcon" />
			<SubHelperComponent definition={definition} subComponentName="imageIcon" />
		</span>
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

	const caretIcon =
		showOpenCloseButton &&
		Object.entries(definition?.children ?? {}).filter(e => e[1]).length ? (
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
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.comp,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active, .comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}._isActive`,
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
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active > ._externalButton, .comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}._isActive > ._externalButton`,
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
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._icon`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active > ._icon, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._icon`,
			)}

			{processStyleObjectToCSS(
				regularStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._imageIcon img`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._imageIcon img`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._imageIcon img`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.imageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active > ._imageIcon img, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._imageIcon img`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme} > ._activeImageIcon img`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:visited > ._activeImageIcon img`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._activeImageIcon img`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.activeImageIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active > ._activeImageIcon img, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._activeImageIcon img`,
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
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover > ._caretIcon`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active > ._caretIcon, .comp.compMenu._${styleKey}menu_css._isActive.${menuDesignSelectionType}.${menuColorScheme} > ._caretIcon`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.subMenuContainer,
				`.comp.compMenuSubmenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.subMenuContainer,
				`.comp.compMenuSubmenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:hover`,
			)}
			{processStyleObjectToCSS(
				activeStyle?.subMenuContainer,
				`.comp.compMenuSubmenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}:active, .comp.compMenuSubmenu._${styleKey}menu_css.${menuDesignSelectionType}.${menuColorScheme}._isActive`,
			)}
		</style>
	);

	const children =
		definition.children && isMenuOpenState ? (
			//  using the react portal to render the submenu at the end of the body to
			// avoid any overflow:hidden or z-index issues from parent components
			createPortal(
				<div
					key={`${key}_submenu`}
					ref={submenuRef}
					className={`comp compMenuSubmenu _${styleKey}menu_css ${menuDesignSelectionType} ${menuColorScheme} ${subMenuOrientation}`}
					onMouseOver={() => {
						setContainerHover(true);
						setMouseIsInside(true);
					}}
					onMouseLeave={() => {
						setContainerHover(false);
						setMouseIsInside(false);
					}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="subMenuContainer"
					/>
					<Children
						pageDefinition={props.pageDefinition}
						renderableChildren={definition.children}
						context={{
							...context,
							menuLevel: (context.menuLevel ?? 0) + 1,
						}}
						locationHistory={locationHistory}
					/>
				</div>,
				document.body,
			)
		) : (
			<></>
		);

	return (
		<>
			{styleComp}
			<a
				ref={anchorRef}
				className={`comp compMenu _${styleKey}menu_css ${menuDesignSelectionType} ${menuColorScheme} ${
					isMenuActive ? '_isActive' : ''
				} ${isHovered || containerHover ? '_hover' : ''} ${
					readOnly ? '_disabled' : ''
				} _level${context.menuLevel ?? 0}`}
				href={readOnly || !linkPath ? 'javascript:void(0)' : resolvedLink}
				target={target}
				onMouseEnter={() => {
					setIsHovered(true);
					setMouseIsInside(true);
				}}
				onMouseLeave={() => {
					setIsHovered(false);
					setMouseIsInside(false);
				}}
				onClick={e => {
					if ((!target || target === '_self') && linkPath) {
						e.stopPropagation();
						e.preventDefault();
						window.history.pushState(undefined, '', resolvedLink);
						window.history.back();
						setTimeout(() => window.history.forward(), 100);
						setIsMenuOpenState(false);
					} else if (features && linkPath) {
						e.stopPropagation();
						e.preventDefault();
						window.open(resolvedLink, target, features);
						setIsMenuOpenState(false);
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

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

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
	propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
