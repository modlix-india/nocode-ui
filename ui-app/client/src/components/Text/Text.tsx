import React, { useCallback, useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
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
			() => {
				setChanged(Date.now());
			},
			pageExtractor,
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path
						d="M0 2.72727C0 1.22104 1.22104 0 2.72727 0H27.2727C28.779 0 30 1.22104 30 2.72727V27.2727C30 28.779 28.779 30 27.2727 30H2.72727C1.22104 30 0 28.779 0 27.2727V2.72727Z"
						fill="#FF76CE"
					/>
					<path
						className="_updownAnimation"
						d="M22 8V11.7891H21.5862C21.341 10.9149 21.069 10.2886 20.7701 9.91003C20.4713 9.52458 20.0613 9.21829 19.5402 8.99115C19.249 8.86726 18.7395 8.80531 18.0115 8.80531H16.8506V19.6047C16.8506 20.3206 16.8927 20.7679 16.977 20.9469C17.069 21.1259 17.2414 21.2842 17.4943 21.4218C17.7548 21.5526 18.1073 21.618 18.5517 21.618H19.069V22H10.908V21.618H11.4253C11.8774 21.618 12.2414 21.5457 12.5172 21.4012C12.7165 21.3048 12.8736 21.1396 12.9885 20.9056C13.0728 20.7404 13.1149 20.3068 13.1149 19.6047V8.80531H11.9885C10.9387 8.80531 10.1762 9.00492 9.70115 9.40413C9.03448 9.96165 8.61303 10.7566 8.43678 11.7891H8V8H22Z"
						fill="white"
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
		{
			name: 'markdownContainer',
			displayName: 'Markdown Container',
			description: 'Markdown Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h1',
			displayName: 'H1',
			description: 'H1',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h2',
			displayName: 'H2',
			description: 'H2',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h3',
			displayName: 'H3',
			description: 'H3',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h4',
			displayName: 'H4',
			description: 'H4',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h5',
			displayName: 'H5',
			description: 'H5',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'h6',
			displayName: 'H6',
			description: 'H6',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'em',
			displayName: 'Emphasised Text',
			description: 'Emphasised Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'b',
			displayName: 'Bold Text',
			description: 'Bold Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'p',
			displayName: 'Paragraph',
			description: 'Paragraph',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'mark',
			displayName: 'High Light Text',
			description: 'High Light Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 's',
			displayName: 'Strike Through Text',
			description: 'Strike Through Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sup',
			displayName: 'Super Script',
			description: 'Super Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'sub',
			displayName: 'Sub Script',
			description: 'Sub Script',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'br',
			displayName: 'Line Break',
			description: 'Line Break',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ol',
			displayName: 'Ordered List',
			description: 'Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'oli',
			displayName: 'Ordered List Item',
			description: 'Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ul',
			displayName: 'Un Ordered List',
			description: 'Un Ordered List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'ulli',
			displayName: 'Un Ordered List Item',
			description: 'Un Ordered List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlli',
			displayName: 'Task List Item',
			description: 'Task List Item',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tlcheckbox',
			displayName: 'Task List Checkbox',
			description: 'Task List Checkbox',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'links',
			displayName: 'Links',
			description: 'Links',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'linksHover',
			displayName: 'Links Hover',
			description: 'Links Hover',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'images',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icBlock',
			displayName: 'Inline Code Block',
			description: 'Inline Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlock',
			displayName: 'Code Block',
			description: 'Code Block',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockKeywords',
			displayName: 'Code Block Keywords',
			description: 'Code Block Keywords',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'codeBlockVariables',
			displayName: 'Code Block Variables',
			description: 'Code Block Variables',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'table',
			displayName: 'Table',
			description: 'Table',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'th',
			displayName: 'Table Header Cell',
			description: 'Table Header Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'tr',
			displayName: 'Table Row',
			description: 'Table Row',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'td',
			displayName: 'Table Cell',
			description: 'Table Cell',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'blockQuotes',
			displayName: 'Block Quote',
			description: 'Block Quote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'hr',
			displayName: 'Horizontal Rule',
			description: 'Horizontal Rule',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'video',
			displayName: 'Video',
			description: 'Video',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNote',
			displayName: 'Footnote',
			description: 'Footnote',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'footNoteLink',
			displayName: 'Footnote Link',
			description: 'Footnote Link',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: stylePropertiesForTheme,
	propertiesForTheme: [textContainer, textColor],
};

export default component;
