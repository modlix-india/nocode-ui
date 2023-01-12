import React, { useCallback, useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { propertiesDefinition, stylePropertiesDefinition } from './textProperties';
import { Component } from '../../types/common';
import TextStyle from './TextStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function Text(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { text, textContainer, textType } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
			definition,
			propertiesDefinition,
			stylePropertiesDefinition,
			locationHistory,
			pageExtractor,
		);
	const [hover, setHover] = useState(false);
	const styleProperties = processComponentStylePseudoClasses(
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const hoverTrue = useCallback(() => setHover(true), [stylePropertiesWithPseudoStates]);
	const hoverFalse = useCallback(() => setHover(false), [stylePropertiesWithPseudoStates]);

	let translatedText = getTranslations(text, translations);

	if (textType === 'MD') {
		return (
			<div className="comp compText" style={styleProperties.comp ?? {}}>
				<HelperComponent definition={definition} />
				<MarkDown text={translatedText ?? ''} />
			</div>
		);
	}

	const onMouseEnter = stylePropertiesWithPseudoStates?.hover ? hoverTrue : undefined;
	const onMouseLeave = stylePropertiesWithPseudoStates?.hover ? hoverFalse : undefined;

	let comp;
	switch (textContainer) {
		case 'H1':
			comp = (
				<h1
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</h1>
			);
			break;
		case 'H2':
			comp = (
				<h2
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</h2>
			);
			break;
		case 'H3':
			comp = (
				<h3
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</h3>
			);
			break;
		case 'H4':
			comp = (
				<h4
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</h4>
			);
			break;
		case 'H5':
			comp = (
				<h5
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</h5>
			);
			break;
		case 'H6':
			comp = (
				<h6
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</h6>
			);
			break;
		case 'I':
			comp = (
				<i
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</i>
			);
			break;
		case 'P':
			comp = (
				<p
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</p>
			);
			break;
		case 'PRE':
			comp = (
				<pre
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</pre>
			);
			break;
		default:
			comp = (
				<span
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={styleProperties.text ?? {}}
				>
					{translatedText}
				</span>
			);
	}

	return (
		<div className="comp compText" style={styleProperties.comp ?? {}}>
			<HelperComponent definition={definition} />
			{comp}
		</div>
	);
}

function MarkDown({ text }: { text: string }) {
	return <>{text}</>;
}

const component: Component = {
	name: 'Text',
	displayName: 'Text',
	description: 'Text component',
	component: Text,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextStyle,
	stylePseudoStates: ['hover'],
};

export default component;
