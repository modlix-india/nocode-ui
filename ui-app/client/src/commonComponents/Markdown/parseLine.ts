import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseInline } from './parseInline';
import { parseAttributes } from './utils';

export function parseLine(
	params: MarkdownParserParameters & { line?: string },
): MarkdownParserReturnValue {
	const { lines, lineNumber: i, styles, line } = params;
	const key = `${cyrb53(line ?? lines[i])}-${i}`;
	let lineNumber = i;
	let style = styles.p;
	const attrs = parseAttributes(lines[lineNumber + 1]);
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}

	return {
		lineNumber, comp: [{
			type: 'p',
			start: 0,
			end: 0,
			marker: '',
			attributes: { className: '_p', ...(attrs ?? {}), style },
			lineNumber: i,
			text: '',
			children: parseInline({
				...params,
				line: (line ?? lines[i]).substring(params.indentationLength ?? 0),
				indentationLength: undefined,
			}),
		}]
	};
}
