import React, { useEffect, useState } from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults, stylePropertiesForTheme } from './TextStyleProperties';
import { usedComponents } from '../../App/usedComponents';
import {
	findPropertyDefinitions,
	inflateAndSetStyleProps,
	applyPreloadedStyleProperties,
} from '../util/lazyStylePropertyUtil';
import { propertiesDefinition } from './textProperties';

const PREFIX = '.comp.compText';
const NAME = 'Text';
export default function LabelStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const [_, setReRender] = useState<number>(Date.now());

	if (globalThis.styleProperties[NAME] && !styleProperties.length && !styleDefaults.size)
		applyPreloadedStyleProperties(
			NAME,
			propertiesDefinition,
			styleProperties,
			stylePropertiesForTheme,
			styleDefaults,
		);

	useEffect(() => {
		const { textContainer, textColor } = findPropertyDefinitions(
			propertiesDefinition,
			'textContainer',
			'textColor',
		);

		const fn = () =>
			setTimeout(() => {
				inflateAndSetStyleProps(
					[textContainer, textColor],
					stylePropertiesForTheme,
					(props, _) => styleProperties.splice(0, 0, ...props),
					styleDefaults,
				);
				setReRender(Date.now());
			}, 100);

		if (usedComponents.used(NAME)) fn();
		usedComponents.register(NAME, fn);

		return () => usedComponents.deRegister(NAME);
	}, [setReRender]);

	const css =
		`
	/*
	 * The wrapper is a block, so its height comes from the line-box strut of the
	 * INHERITED font-size, not from the text inside it. A Text whose own font is
	 * smaller than its parent's therefore renders in a box a couple of pixels
	 * taller than the glyphs, and the text sits visibly high of centre inside
	 * flex rows (chips, segmented controls, toolbars). Laying the wrapper out as
	 * a flex column kills the strut, so the box is exactly the text's height and
	 * align-items: center on the parent lands where you expect.
	 */
	${PREFIX} {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	/* A person mentioned in markdown ([@Name](mde://user/<id>)): a tinted chip in the text colour. */
	${PREFIX} ._mention {
		display: inline;
		padding: 0 4px;
		border-radius: 4px;
		font-weight: 500;
		white-space: nowrap;
		background-color: color-mix(in srgb, currentColor 10%, transparent);
	}

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

	/* A picture never grows past the text box: a wide screenshot shrinks to fit (and its
	   height follows), so it cannot push the page sideways. */
	${PREFIX} ._markdown img,
	${PREFIX} ._markdown video {
		max-width: 100%;
		height: auto;
	}

	/*
	 * Markdown text stays inside its box: a long token (a path, a code span, words joined
	 * by no-break spaces) wraps (anywhere also lowers the min-content width, so a flex or
	 * grid parent cannot be pushed wider), and a table wider than the box scrolls sideways
	 * inside it instead of running over what sits beside it.
	 */
	${PREFIX} ._markdown {
		overflow-wrap: anywhere;
		min-width: 0;
		max-width: 100%;
		overflow-x: auto;
	}

	${PREFIX} ._markdown pre {
		overflow-x: auto;
		overflow-wrap: normal;
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
