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
		></i>
	) : (
		<></>
	);

	const styleKey = `${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	const styleComp = (
		<style key={`${styleKey}_style`}>
			{`._${styleKey}link_css { ${processStyleObjectToCSS(regularStyle?.comp)} }`}
			{`._${styleKey}link_css:visited { ${processStyleObjectToCSS(visitedStyle?.comp)} }`}
			{`._${styleKey}link_css:hover { ${processStyleObjectToCSS(hoverStyle?.comp)} }`}

			{`._${styleKey}link_css > ._externalButton { ${processStyleObjectToCSS(
				regularStyle?.icon,
			)} }`}
			{`._${styleKey}link_css:visited > ._externalButton { ${processStyleObjectToCSS(
				visitedStyle?.icon,
			)} }`}
			{`._${styleKey}link_css:hover > ._externalButton { ${processStyleObjectToCSS(
				hoverStyle?.icon,
			)} }`}
		</style>
	);

	return (
		<>
			{styleComp}
			<a
				className={`comp compLink _${styleKey}link_css`}
				href={resolvedLink}
				target={target}
				onClick={e => {
					if (!target || target === '_self') {
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
	icon: 'fa-solid fa-link',
	name: 'Link',
	displayName: 'Link',
	description: 'Link component',
	component: Link,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: LinkStyle,
	stylePseudoStates: ['hover', 'visited'],
	defaultTemplate: {
		key: '',
		type: 'Link',
		name: 'Link',
		properties: {
			label: { value: 'Link' },
		},
	},
};

export default component;
