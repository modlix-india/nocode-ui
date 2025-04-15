import { useLocation } from 'react-router-dom';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { getHref } from '../util/getHref';
import { getTranslations } from '../util/getTranslations';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './linkProperties';
import LinkStyle from './LinkStyle';
import { styleDefaults, stylePropertiesForTheme } from './linkStyleProperties';

function Link(props: Readonly<ComponentProps>) {
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
	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;
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
				if (resolvedLink?.startsWith('tel') || resolvedLink?.startsWith('mailto')) {
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
					if (resolvedLink?.startsWith('tel') || resolvedLink?.startsWith('mailto')) {
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
				<HelperComponent context={props.context} definition={definition} />
				{getTranslations(label, translations)}
				{externalButton}
			</a>
		</>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	order: 14,
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
				<IconHelper viewBox="0 0 30 30">
					<rect
						className="_linkbox"
						y="0.5"
						width="30"
						height="30"
						rx="4"
						fill="#09A0C2"
					/>
					<path
						className="_linkarrowleft"
						d="M17.8963 8C18.5949 8 19.2963 8 19.9949 8C21.1098 8 22.222 8 23.3369 8C23.5912 8 23.8455 8 24.0998 8C24.4575 8 24.8347 7.832 25.089 7.562C25.3321 7.301 25.5137 6.875 25.497 6.5C25.4802 6.113 25.3628 5.711 25.089 5.438C24.8151 5.168 24.4798 5 24.0998 5C23.4012 5 22.6998 5 22.0012 5C20.8863 5 19.7741 5 18.6592 5C18.4049 5 18.1506 5 17.8963 5C17.5386 5 17.1614 5.168 16.9071 5.438C16.664 5.699 16.4824 6.125 16.4991 6.5C16.5159 6.887 16.6332 7.289 16.9071 7.562C17.1809 7.829 17.5191 8 17.8963 8Z"
						fill="white"
					/>
					<path
						className="_linkarrowright"
						d="M25.498 12.6017C25.498 11.9032 25.498 11.2018 25.498 10.5032C25.498 9.38823 25.498 8.27607 25.498 7.16112C25.498 6.90683 25.498 6.65254 25.498 6.39826C25.498 6.04058 25.33 5.66334 25.06 5.40905C24.799 5.16594 24.373 4.98431 23.998 5.00107C23.611 5.01784 23.209 5.1352 22.936 5.40905C22.666 5.6829 22.498 6.01822 22.498 6.39826C22.498 7.09685 22.498 7.79823 22.498 8.49682C22.498 9.61177 22.498 10.7239 22.498 11.8389C22.498 12.0932 22.498 12.3475 22.498 12.6017C22.498 12.9594 22.666 13.3367 22.936 13.5909C23.197 13.8341 23.623 14.0157 23.998 13.9989C24.385 13.9822 24.787 13.8648 25.06 13.5909C25.327 13.3171 25.498 12.979 25.498 12.6017Z"
						fill="white"
					/>
					<path
						className="_linkarrowtail"
						d="M14.3211 18.1022C14.6799 17.7435 15.0414 17.3821 15.4001 17.0233C16.2563 16.1673 17.1152 15.3086 17.9713 14.4526C19.0068 13.4172 20.0424 12.3818 21.0806 11.3437C21.9803 10.4442 22.8772 9.54745 23.7768 8.64795C24.2117 8.21315 24.6547 7.78106 25.0842 7.34083C25.0896 7.33539 25.095 7.32996 25.1032 7.3218C25.3505 7.07451 25.5 6.71036 25.5 6.3598C25.5 6.02555 25.3532 5.62879 25.1032 5.3978C24.845 5.16138 24.5052 4.98474 24.141 5.00104C23.7795 5.01735 23.4398 5.13964 23.1789 5.3978C22.8201 5.75651 22.4586 6.11794 22.0999 6.47666C21.2437 7.33267 20.3848 8.19141 19.5287 9.04743C18.4932 10.0828 17.4576 11.1182 16.4194 12.1563C15.5197 13.0558 14.6228 13.9525 13.7232 14.852C13.2883 15.2868 12.8453 15.7189 12.4158 16.1592C12.4104 16.1646 12.405 16.17 12.3968 16.1782C12.1495 16.4255 12 16.7896 12 17.1402C12 17.4745 12.1468 17.8712 12.3968 18.1022C12.655 18.3386 12.9948 18.5153 13.359 18.499C13.7205 18.4854 14.0602 18.3631 14.3211 18.1022Z"
						fill="white"
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
	stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [designType, colorScheme],
};

export default component;
