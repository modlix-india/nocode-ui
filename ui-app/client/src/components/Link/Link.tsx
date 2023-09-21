import React from 'react';
import { useLocation } from 'react-router-dom';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { getHref } from '../util/getHref';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './linkProperties';
import LinkStyle from './LinkStyle';
import { SubHelperComponent } from '../SubHelperComponent';
import { runEvent } from '../util/runEvent';
import { styleDefaults } from './linkStyleProperties';

function Link(props: ComponentProps) {
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
			externalButtonTarget = '_blank',
			externalButtonFeatures,
			onClick,
			designType,
			colorScheme,
			showLines,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const resolvedLink = getHref(linkPath, location);
	const hoverStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: true },
		stylePropertiesWithPseudoStates,
	);
	const handleClick = clickEvent
		? () => {
				(async () =>
					await runEvent(
						clickEvent,
						key,
						props.context.pageName,
						props.locationHistory,
						props.pageDefinition,
					))();
		  }
		: undefined;

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
				if (resolvedLink.startsWith('tel') || resolvedLink.startsWith('mailto')) {
					window.open(resolvedLink, target);
				} else if (externalButtonTarget === '_self') {
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

	const styleKey = `${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	const styleComp = (
		<style key={`${styleKey}_style`}>
			{processStyleObjectToCSS(regularStyle?.comp, `.comp.compLink._${styleKey}link_css`)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compLink._${styleKey}link_css:visited`,
			)}
			{processStyleObjectToCSS(hoverStyle?.comp, `.comp.compLink._${styleKey}link_css:hover`)}
			{processStyleObjectToCSS(
				regularStyle?.externalIcon,
				`.comp.compLink._${styleKey}link_css > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.externalIcon,
				`.comp.compLink._${styleKey}link_css:visited > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.externalIcon,
				`.comp.compLink._${styleKey}link_css:hover > ._externalButton`,
			)}
		</style>
	);

	return (
		<>
			{styleComp}
			<a
				className={`comp compLink _${styleKey}link_css ${designType} ${colorScheme} ${
					showLines ? '_showLines' : ''
				}`}
				href={resolvedLink}
				target={target}
				onClick={e => {
					if (resolvedLink.startsWith('tel') || resolvedLink.startsWith('mailto')) {
						window.open(resolvedLink, target);
					} else if (!target || target === '_self') {
						e.stopPropagation();
						e.preventDefault();
						window.history.pushState(undefined, '', resolvedLink);
						window.history.back();
						setTimeout(() => window.history.forward(), 100);
					} else if (features) {
						e.stopPropagation();
						e.preventDefault();
						window.open(resolvedLink, target, features);
					}
					handleClick?.();
				}}
			>
				<HelperComponent definition={definition} />
				{getTranslations(label, translations)}
				{externalButton}
			</a>
		</>
	);
}

const component: Component = {
	name: 'Link',
	displayName: 'Link',
	description: 'Link component',
	component: Link,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: LinkStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover', 'visited'],
	defaultTemplate: {
		key: '',
		type: 'Link',
		name: 'Link',
		properties: {
			label: { value: 'Link' },
		},
	},
	sections: [{ name: 'Links', pageName: 'link' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-link',
		},
		{
			name: 'externalIcon',
			displayName: 'External Icon',
			description: 'External Icon',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
