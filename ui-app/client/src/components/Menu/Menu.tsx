import React, { MouseEvent } from 'react';
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
			MenuDesignSelectionType,
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
			{processStyleObjectToCSS(regularStyle?.comp, `.comp.compMenu._${styleKey}menu_css`)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compMenu._${styleKey}menu_css:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.comp,
				`.comp.compMenu._${styleKey}menu_css:hover, .comp.compMenu._${styleKey}menu_css._isActive`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css:visited > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.externalIcon,
				`.comp.compMenu._${styleKey}menu_css:hover > ._externalButton, .comp.compMenu._${styleKey}menu_css._isActive > ._externalButton`,
			)}

			{processStyleObjectToCSS(
				regularStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css > ._icon`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css:visited > ._icon`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.icon,
				`.comp.compMenu._${styleKey}menu_css:hover > ._icon, .comp.compMenu._${styleKey}menu_css._isActive > ._icon`,
			)}

			{processStyleObjectToCSS(
				regularStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css > ._caretIcon`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css:visited > ._caretIcon`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.caretIcon,
				`.comp.compMenu._${styleKey}menu_css:hover > ._caretIcon, .comp.compMenu._${styleKey}menu_css._isActive > ._caretIcon`,
			)}
		</style>
	);

	const children =
		definition.children && isMenuOpenState ? (
			<Children
				pageDefinition={props.pageDefinition}
				children={definition.children}
				context={context}
				locationHistory={locationHistory}
			/>
		) : (
			<></>
		);

	return (
		<>
			{styleComp}
			<a
				className={`comp compMenu _${styleKey}menu_css ${MenuDesignSelectionType} ${
					isMenuActive ? '_isActive' : ''
				}`}
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
	icon: 'fa-solid fa-bars',
	name: 'Menu',
	displayName: 'Menu',
	description: 'Menu component',
	component: Menu,
	styleComponent: MenuStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled', 'active', 'visited'],
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
	sections: [
		{ name: 'Horizontal Menu', pageName: 'horizontalMenu' },
		{ name: 'Vertical Menu', pageName: 'verticalMenu' },
	],
};

export default component;
