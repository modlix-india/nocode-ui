import React, { useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './markdownNavigatorProperties';
import { Component } from '../../types/common';
import MarkdownNavigatorStyle from './MarkdownNavigatorStyle';
import useDefinition from '../util/useDefinition';
import {
	processComponentStylePseudoClasses,
	processStyleObjectToCSS,
} from '../../util/styleProcessor';
import { styleDefaults } from './markdownNavigaotrStyleProperties';
import { IconHelper } from '../util/IconHelper';
import MarkDownNavigatorLinks from '../../commonComponents/MarkDownNavigatorLinks';

function MarkdownNavigator(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { text: markdownText, showLinksFor, designType, colorScheme } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const regularStyle = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ visited: false, hover: false },
		stylePropertiesWithPseudoStates,
	);

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

	const styleKey = `${key}_${
		locationHistory?.length ? locationHistory.map(e => e.index).join('_') : ''
	}`;

	const styleComp = (
		<style key={`${styleKey}_style`}>
			{processStyleObjectToCSS(
				regularStyle?.comp,
				`.comp.compMarkdownNav._markdown#_${styleKey}`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.comp,
				`.comp.compMarkdownNav._markdown#_${styleKey}`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.comp,
				`.comp.compMarkdownNav._markdown#_${styleKey}`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.h1,
				`.comp.compMarkdownNav._markdown#_${styleKey} a.h1`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.h1,
				`.comp.compMarkdownNav._markdown#_${styleKey} a.h1:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.h1,
				`.comp.compMarkdownNav._markdown#_${styleKey} a.h1:hover`,
			)}
			{processStyleObjectToCSS(
				regularStyle?.h2,
				`.comp.compMarkdownNav._markdown#_${styleKey} a.h2`,
			)}
			{processStyleObjectToCSS(
				visitedStyle?.h2,
				`.comp.compMarkdownNav._markdown#_${styleKey} a.h2:visited`,
			)}
			{processStyleObjectToCSS(
				hoverStyle?.h2,
				`.comp.compMarkdownNav._markdown#_${styleKey} a.h2:hover`,
			)}
		</style>
	);

	let translatedText = getTranslations(markdownText, translations);

	return (
		<>
			{styleComp}
			<div
				id={`_${styleKey}`}
				className={`comp compMarkdownNav _markdown ${designType} ${colorScheme}`}
				style={regularStyle.comp ?? {}}
			>
				<HelperComponent context={props.context} definition={definition} />
				<MarkDownNavigatorLinks
					text={translatedText ?? ''}
					filterOnlyH1s={showLinksFor === 'h1'}
					filterBothH1sAndH2s={showLinksFor !== 'h1'}
					definition={props.definition}
				/>
			</div>
		</>
	);
}

const component: Component = {
	name: 'MarkdownNavigator',
	displayName: 'Markdown Navigator',
	description: 'MarkdownNavigator Component',
	component: MarkdownNavigator,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: MarkdownNavigatorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'visited'],
	defaultTemplate: {
		key: '',
		type: 'MarkdownNavigator',
		name: 'markdownNavigator',
		properties: { text: { value: 'MarkdownNavigator' } },
	},
	sections: [{ name: 'MarkdownNavigator', pageName: 'markdownNavigator' }],
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
						fillOpacity="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.0938 6.40625V9.27344H16.8125C16.6458 8.61198 16.4609 8.13802 16.2578 7.85156C16.0547 7.5599 15.776 7.32812 15.4219 7.15625C15.224 7.0625 14.8776 7.01562 14.3828 7.01562H13.5938V15.1875C13.5938 15.7292 13.6224 16.0677 13.6797 16.2031C13.7422 16.3385 13.8594 16.4583 14.0312 16.5625C14.2083 16.6615 14.4479 16.7109 14.75 16.7109H15.1016V17H9.55469V16.7109H9.90625C10.2135 16.7109 10.4609 16.6562 10.6484 16.5469C10.7839 16.474 10.8906 16.349 10.9688 16.1719C11.026 16.0469 11.0547 15.7188 11.0547 15.1875V7.01562H10.2891C9.57552 7.01562 9.05729 7.16667 8.73438 7.46875C8.28125 7.89062 7.99479 8.49219 7.875 9.27344H7.57812V6.40625H17.0938Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'h1',
			displayName: 'H1 Links',
			description: 'H1 Links',
			icon: 'fa-solid fa-heading',
		},
		{
			name: 'h2',
			displayName: 'H2 Links',
			description: 'H2 Links',
			icon: '',
		},
	],
};

export default component;
