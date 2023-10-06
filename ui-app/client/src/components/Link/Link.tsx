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
import { IconHelper } from '../util/IconHelper';

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
			{processStyleObjectToCSS(regularStyle?.comp, `.comp.compLink#_${styleKey}link_css`)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compLink._${styleKey}link_css:visited`,
			)}
			{processStyleObjectToCSS(hoverStyle?.comp, `.comp.compLink#_${styleKey}link_css:hover`)}
			{processStyleObjectToCSS(
				regularStyle?.externalIcon,
				`.comp.compLink#_${styleKey}link_css > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.externalIcon,
				`.comp.compLink#_${styleKey}link_css:visited > ._externalButton`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.externalIcon,
				`.comp.compLink#_${styleKey}link_css:hover > ._externalButton`,
			)}
		</style>
	);

	return (
		<>
			{styleComp}
			<a
				id={`_${styleKey}link_css`}
				className={`comp compLink ${designType} ${colorScheme} ${
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
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="4"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M14.125 6.4998C14.6373 6.4998 15.1516 6.4998 15.6639 6.4998C16.4816 6.4998 17.2972 6.4998 18.1148 6.4998C18.3013 6.4998 18.4877 6.4998 18.6742 6.4998C18.9365 6.4998 19.2132 6.3766 19.3996 6.1786C19.5779 5.9872 19.7111 5.6748 19.6988 5.3998C19.6865 5.116 19.6005 4.8212 19.3996 4.621C19.1988 4.423 18.9529 4.2998 18.6742 4.2998C18.1619 4.2998 17.6476 4.2998 17.1353 4.2998C16.3176 4.2998 15.5021 4.2998 14.6844 4.2998C14.498 4.2998 14.3115 4.2998 14.125 4.2998C13.8627 4.2998 13.5861 4.423 13.3996 4.621C13.2213 4.8124 13.0881 5.1248 13.1004 5.3998C13.1127 5.6836 13.1988 5.9784 13.3996 6.1786C13.6004 6.3744 13.8484 6.4998 14.125 6.4998Z"
						fill="currentColor"
					/>
					<path
						d="M19.7 9.87442C19.7 9.36212 19.7 8.84777 19.7 8.33547C19.7 7.51784 19.7 6.70226 19.7 5.88462C19.7 5.69815 19.7 5.51167 19.7 5.32519C19.7 5.06289 19.5768 4.78625 19.3788 4.59977C19.1874 4.42149 18.875 4.2883 18.6 4.30059C18.3162 4.31289 18.0214 4.39895 17.8212 4.59977C17.6232 4.8006 17.5 5.0465 17.5 5.32519C17.5 5.83749 17.5 6.35184 17.5 6.86414C17.5 7.68177 17.5 8.49735 17.5 9.31499C17.5 9.50146 17.5 9.68794 17.5 9.87442C17.5 10.1367 17.6232 10.4134 17.8212 10.5998C18.0126 10.7781 18.325 10.9113 18.6 10.899C18.8838 10.8867 19.1786 10.8007 19.3788 10.5998C19.5746 10.399 19.7 10.1511 19.7 9.87442Z"
						fill="currentColor"
					/>
					<path
						d="M11.5029 13.9081C11.766 13.645 12.0311 13.38 12.2942 13.1169C12.9221 12.4892 13.5519 11.8594 14.1797 11.2317C14.9391 10.4724 15.6985 9.71314 16.4599 8.95187C17.1196 8.29224 17.7774 7.6346 18.4371 6.97497C18.756 6.65611 19.0809 6.33925 19.3958 6.01641C19.3998 6.01243 19.4038 6.00844 19.4098 6.00246C19.5912 5.82111 19.7008 5.55407 19.7008 5.29699C19.7008 5.05187 19.5932 4.76092 19.4098 4.59153C19.2204 4.41815 18.9713 4.28861 18.7042 4.30057C18.4391 4.31253 18.19 4.40221 17.9986 4.59153C17.7355 4.85458 17.4704 5.11963 17.2073 5.38269C16.5795 6.01043 15.9497 6.64017 15.3218 7.26792C14.5624 8.02719 13.803 8.78647 13.0417 9.54774C12.3819 10.2074 11.7242 10.865 11.0644 11.5246C10.7455 11.8435 10.4207 12.1604 10.1057 12.4832C10.1017 12.4872 10.0978 12.4912 10.0918 12.4971C9.9104 12.6785 9.80078 12.9455 9.80078 13.2026C9.80078 13.4477 9.90841 13.7387 10.0918 13.9081C10.2811 14.0815 10.5303 14.211 10.7974 14.199C11.0624 14.1891 11.3116 14.0994 11.5029 13.9081Z"
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
	],
};

export default component;
