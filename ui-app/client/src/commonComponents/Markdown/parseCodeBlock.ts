import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseAttributes } from './utils';

export function parseCodeBlock(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lineNumber: i, lines, styles } = params;
	let lineNumber = i;
	const key = `${cyrb53(lines[i])}-${i}`;
	const codeLines: string[] = [];
	let j = i + 1;
	for (; j < lines.length; j++) {
		if (lines[j].startsWith('```')) break;
		codeLines.push(lines[j]);
	}
	lineNumber = j;

	let style = styles.codeBlock;
	const attrs = parseAttributes(lines[lineNumber + 1]);
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}

	const comp = React.createElement(
		'code',
		{ key, className: '_code', style },
		codeLines.join('\n'),
	);

	return { lineNumber, comp };
}
