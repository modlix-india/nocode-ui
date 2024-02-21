import React, { useCallback, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './textProperties';
import { Component } from '../../types/common';
import TextStyle from './TextStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { formatString } from '../../util/stringFormat';
import { styleDefaults } from './TextStyleProperties';
import { IconHelper } from '../util/IconHelper';
import MarkDownToComponent from '../../commonComponents/MarkDownToComponents';

function Text(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			text: originalTextObj,
			textContainer,
			textType,
			processNewLine,
			stringFormat,
			textLength,
			textColor,
			designType,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const [hover, setHover] = useState(false);
	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const hoverTrue = useCallback(() => setHover(true), [stylePropertiesWithPseudoStates]);
	const hoverFalse = useCallback(() => setHover(false), [stylePropertiesWithPseudoStates]);

	const text =
		typeof originalTextObj === 'object'
			? JSON.stringify(originalTextObj, undefined, 2)
			: originalTextObj;

	let translatedText = getTranslations(text, translations);
	let originalText = translatedText;

	if (textType === 'MD') {
		return (
			<div
				className={`comp compText _markdown ${designType}`}
				style={styleProperties.comp ?? {}}
			>
				<HelperComponent context={props.context} definition={definition} />
				return <MarkDownToComponent text={translatedText ?? ''} />;
			</div>
		);
	}

	if (stringFormat !== 'STRING' && translatedText) {
		translatedText = formatString(translatedText, stringFormat);
	}

	if (textLength && translatedText) {
		let finTextLength = textLength - 3;
		if (finTextLength < 3) finTextLength = 3;
		const ellipsis = finTextLength === 3 ? '' : '...';
		translatedText =
			translatedText.length > finTextLength
				? translatedText.substring(0, finTextLength) + ellipsis
				: translatedText;
	}

	let comps: React.ReactNode[] = [];
	const subcomp = <SubHelperComponent definition={props.definition} subComponentName="text" />;
	if (translatedText !== undefined) {
		if (processNewLine) {
			comps = translatedText
				?.split('\n')
				.flatMap((e, i, a) =>
					i + 1 === a.length ? [e] : [e, <br key={e + '_' + i}></br>],
				);
		} else {
			comps = [subcomp, translatedText];
		}
	}

	const onMouseEnter = stylePropertiesWithPseudoStates?.hover ? hoverTrue : undefined;
	const onMouseLeave = stylePropertiesWithPseudoStates?.hover ? hoverFalse : undefined;

	let comp = React.createElement(
		textContainer.toLowerCase(),
		{
			onMouseEnter,
			onMouseLeave,
			style: styleProperties.text ?? {},
			className: '_textContainer',
		},
		...comps,
	);
	return (
		<div
			className={`comp compText ${textContainer.toLowerCase()} ${textColor}`}
			style={styleProperties.comp ?? {}}
			title={originalText}
		>
			{comp}
			<HelperComponent context={props.context} definition={definition} />
		</div>
	);
}

const component: Component = {
	name: 'Text',
	displayName: 'Text',
	description: 'Text component',
	component: Text,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'Text',
		name: 'Text',
		properties: { text: { value: 'Text' } },
	},
	sections: [
		{ name: 'Main', pageName: 'text' },
		{ name: 'Decorative', pageName: 'textDecorative' },
		{ name: 'Paragraph', pageName: 'textParagraph' },
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
			name: 'text',
			displayName: 'Text',
			description: 'Text',
			icon: 'fa fa-solid fa-box',
		},
	],
};

export default component;
