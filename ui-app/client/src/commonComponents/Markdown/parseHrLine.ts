import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseAttributes } from './utils';

export function parseHrLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lineNumber: i, styles } = params;
	const key = `${cyrb53('hr')}-${i}`;
	let lineNumber = i;

	let style = styles.hr;
	const attrs = parseAttributes(params.lines[i + 1]?.substring(params.indentationLength ?? 0));
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}
	const comp = React.createElement('hr', { key, className: '_hr', ...(attrs ?? {}), style });

	return { lineNumber, comp };
}
