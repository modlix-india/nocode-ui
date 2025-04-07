import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue, MDDef } from './common';
import { parseInline } from './parseInline';
import { cyrb53 } from '../../util/cyrb53';
import { parseAttributes } from './utils';
import { parseTextLine } from './parseTextLine';

export const BLOCK_QUOTE_MULTI_LEVEL_REGEX = /^>(\s{0,3}>){0,}\s/;

export function parseBlockQuote(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const quoteElementsStack: Array<Array<MDDef>> = [];
	const indentationStack: number[] = [];

	const { lines, lineNumber, styles } = params;

	let i = lineNumber;
	for (; i < lines.length; i++) {
		const line = lines[i];
		const match = line.match(BLOCK_QUOTE_MULTI_LEVEL_REGEX);

		if (!match) {
			break;
		}

		const indentation = match[0].replace(' ', '').length;
		const actualIndentationLength = match[0].length;
		if (
			indentationStack.length === 0 ||
			indentation > indentationStack[indentationStack.length - 1]
		) {
			indentationStack.push(indentation);
			quoteElementsStack.push([]);
			i = addToStack(params, line, actualIndentationLength, i, quoteElementsStack);
		} else if (indentation < indentationStack[indentationStack.length - 1]) {
			indentationStack.pop();
			const element = quoteElementsStack.pop();
			if (quoteElementsStack.length === 0) {
				return { lineNumber: i - 1, comp: element ?? [] };
			}

			let attributes;
			let style = styles.blockQuotes;
			if (i + 1 < lines.length && lines[i + 1].trim().startsWith('{')) {
				attributes = parseAttributes(lines[i + 1].trim());
				if (attributes) {
					i++;
					if (attributes.style) {
						style = style ? { ...style, ...attributes.style } : attributes.style;
					}
				}
			}
			quoteElementsStack[quoteElementsStack.length - 1].push(
				{
					type: 'blockquote',
					start: 0,
					end: 0,
					text: '',
					marker: '',
					attributes: attributes,
					children: element,
					lineNumber: i,
				},
			);

			quoteElementsStack[quoteElementsStack.length - 1].push(
				{
					type: 'br',
					start: 0,
					end: 0,
					text: '',
					marker: '',
					lineNumber: i,
				},
			);

			i = addToStack(params, line, actualIndentationLength, i, quoteElementsStack);
		} else {
			quoteElementsStack[quoteElementsStack.length - 1].push(
				{
					type: 'br',
					start: 0,
					end: 0,
					text: '',
					marker: '',
					lineNumber: i,
				},
			);

			i = addToStack(params, line, actualIndentationLength, i, quoteElementsStack);
		}
	}

	let attributes;
	let style = styles.blockQuotes;

	while (indentationStack.length > 0) {
		const poppedElement = quoteElementsStack.pop();
		attributes = undefined;
		if (i + 1 < lines.length && lines[i + 1].trim().startsWith('{')) {
			attributes = parseAttributes(lines[i + 1].trim());
			if (attributes) {
				i++;
				if (attributes.style) {
					style = style ? { ...style, ...attributes.style } : attributes.style;
				}
			}
		}

		const quote = {
			type: 'blockquote',
			start: 0,
			end: 0,
			text: '',
			marker: '',
			attributes: attributes,
			children: poppedElement!,
			lineNumber: i,
		};

		if (!quoteElementsStack.length) {
			return { lineNumber: i - 1, comp: [quote] };
		}

		quoteElementsStack[quoteElementsStack.length - 1].push(quote);
	}

	return { lineNumber: i, comp: [] };
}
function addToStack(
	params: MarkdownParserParameters,
	line: string,
	actualIndentationLength: number,
	i: number,
	quoteElementsStack: MDDef[][],
) {
	const { lineNumber, comp } = parseTextLine({
		...params,
		line,
		lineNumber: i,
		indentationLength: actualIndentationLength,
	});

	if (comp)
		quoteElementsStack[quoteElementsStack.length - 1].push(
			...(Array.isArray(comp) ? comp : [comp]),
		);

	return lineNumber;
}
