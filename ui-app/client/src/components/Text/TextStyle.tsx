import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './TextStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import { findPropertyDefinitions, inflateAndSetStyleProps } from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './textProperties';

const PREFIX = '.comp.compText';
const NAME = 'Text';
export default function LabelStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size) {
		styleProperties.splice(0, 0, ...globalThis.styleProperties[NAME]);
		styleProperties
			.filter((e: any) => !!e.dv)
			?.map(({ n: name, dv: defaultValue }: any) => styleDefaults.set(name, defaultValue));
	}

	useEffect(() => {
		const { textContainer, textColor } = findPropertyDefinitions(
			propertiesDefinition,
			'textContainer',
			'textColor',
		);

		const fn = () => {
			inflateAndSetStyleProps(
				[textContainer, textColor],
				stylePropertiesForTheme,
				(props, _) => styleProperties.splice(0, 0, ...props),
				styleDefaults,
			);
			setReRender(Date.now());
		};

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
	${PREFIX} ._textContainer {
		width: 100%;
		display: block;
		position: relative;
		font-family: inherit;
		font-Size: inherit;
		font-Weight: inherit;
		color: inherit;
		text-Align: inherit;
		font-Style: inherit;
		line-Height: inherit;
		letter-Spacing: inherit;
		text-Indent: inherit;
		text-Transform: inherit;
		text-Shadow: inherit;
		direction: inherit;
		text-Decoration: inherit;
		text-Orientation: inherit;
		word-Break: inherit;
		word-Spacing: inherit;
		word-Wrap: inherit;
		font-Feature-Settings: inherit;
		font-Kerning: inherit;
		font-Variant: inherit;
		font-Variant-Caps: inherit;
		text-Align-Last: inherit;
		text-Decoration-Color: inherit;
		text-Decoration-Line: inherit;
		text-Decoration-Style: inherit;
		text-Emphasis: inherit;
		text-Overflow: inherit;
		white-Space: inherit;
	}

	${PREFIX}._markdown img {
		max-width: 100%;
	}

	${PREFIX}._markdown pre, ._markDownContent pre {
		overflow: auto;
	}

	${PREFIX}._markdown pre code, ._markDownContent pre code {
		background-color: transparent;
		padding: 0;
		margin: 0;
		border: 0;
	}
	
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="TextCss">{css}</style>;
}
