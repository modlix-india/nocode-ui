import React, { useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import {
	Component,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import { formatString } from '../../util/stringFormat';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { IconHelper } from '../util/IconHelper';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import TextStyle from './TextStyle';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './TextStyleProperties';
import { propertiesDefinition, stylePropertiesDefinition } from './textProperties';
import { MarkdownParser } from '../../commonComponents/Markdown/MarkdownParser';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

function Text(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		properties: {
			text: originalTextObj,
			textContainer,
			textType,
			processNewLine,
			stringFormat,
			textLength,
			minFractionDigits,
			maxFractionDigits,
			textColor,
			designType,
			removeToolTip,
			textSuffix,
			textPrefix,
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
	const [hover, setHover] = useState(false);
	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const hoverTrue = useCallback(() => setHover(true), [stylePropertiesWithPseudoStates]);
	const hoverFalse = useCallback(() => setHover(false), [stylePropertiesWithPseudoStates]);

	const textProp = definition.properties?.text as ComponentProperty<any>;

	const [changed, setChanged] = useState<number>(Date.now());
	useEffect(() => {
		if (
			typeof originalTextObj !== 'object' ||
			(!textProp?.location?.value && !textProp?.location?.expression)
		)
			return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			() => {
				setChanged(Date.now());
			},
			(textProp.location.value ?? textProp.location.expression)!,
		);
	}, [originalTextObj, textProp?.value, textProp?.location?.value]);

	const text =
		typeof originalTextObj === 'object'
			? JSON.stringify(originalTextObj, undefined, 2)
			: originalTextObj;

	let translatedText = getTranslations(text, translations);
	let originalText = translatedText;

	if (textType === 'MD') {
		return (
			<div
				className={`comp compText _textMarkdown  ${textColor}`}
				style={styleProperties.comp ?? {}}
			>
				<HelperComponent context={props.context} definition={definition} />
				<MarkdownParser
					componentKey={definition.key}
					text={translatedText ?? ''}
					styles={styleProperties}
				/>
			</div>
		);
	}

	let numberFormattingOptions: any = {};

	if (typeof minFractionDigits === 'number' || typeof maxFractionDigits === 'number') {
		let min = minFractionDigits ?? maxFractionDigits!;
		let max = maxFractionDigits ?? minFractionDigits!;
		if (min > max) min = max;
		numberFormattingOptions = {
			minimumFractionDigits: min,
			maximumFractionDigits: max,
		};
	}

	if (stringFormat !== 'STRING' && translatedText) {
		translatedText = formatString(translatedText, stringFormat, numberFormattingOptions);
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
			if (textPrefix) comps.unshift(textPrefix);
			if (textSuffix) comps.push(textSuffix);
		} else {
			if (textPrefix) translatedText = textPrefix + translatedText;
			if (textSuffix) translatedText = translatedText + textSuffix;
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
			className={`comp compText ${textContainer} ${textColor}`}
			style={styleProperties.comp ?? {}}
			title={removeToolTip ? undefined : originalText}
		>
			{comp}
			<HelperComponent context={props.context} definition={definition} />
		</div>
	);
}

const { textContainer, textColor } = findPropertyDefinitions(
	propertiesDefinition,
	'textContainer',
	'textColor',
);

const component: Component = {
	order: 2,
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
	tutorial: {
		demoVideo: 'api/files/static/file/SYSTEM/WhatsApp Media/just try/vid1.mp4',
		// demoVideo: 'https://www.youtube.com/watch?v=YSv3KNSUwWQ&ab_channel=FincityIndia',
		description:
			'The Text Component is used to display textual content within the webpage, like an html paragraph or heading tag. It supports formatting, color schemes, prefixes, suffixes, and SEO-friendly container types. ',
		youtubeLink: 'https://www.youtube.com/watch?v=YSv3KNSUwWQ&ab_channel=FincityIndia',
	},

		stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [textContainer, textColor],
};

export default component;
