import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseInline } from './parseInline';
import { parseLine } from './parseLine';
import { makeId, parseAttributes } from './utils';

const HEADER_DASH_REGEX = /^-+$/;
const HEADER_EQUAL_REGEX = /^=+$/;
const HEADER_HASH_REGEX = /^#+\s/;

export function parseHeaderLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lineNumber: i, lines, line: actualLine } = params;
	let lineNumber = i;

	const line = (actualLine ?? lines[i]).substring(params.indentationLength ?? 0);

	if (line.startsWith('\\#')) {
		return parseLine({ ...params, line: line.substring(1), indentationLength: undefined });
	}

	let hNumber = 0,
		text = '';
	if (!line.startsWith('#')) {
		const nextLine = lines[i + 1]?.substring(params.indentationLength ?? 0);

		if (HEADER_EQUAL_REGEX.test(nextLine)) {
			hNumber = 1;
			text = line;
			lineNumber++;
		} else if (HEADER_DASH_REGEX.test(nextLine)) {
			hNumber = 2;
			text = line;
			lineNumber++;
		}
	} else {
		hNumber = (line.match(HEADER_HASH_REGEX)?.[0].length ?? 1) - 1;
		if (hNumber) {
			text = line.substring(hNumber + 1);
		}
	}

	if (hNumber === 0) return parseLine({ ...params, line: line, indentationLength: undefined });

	let style = params.styles[`h${hNumber}`];
	let key;
	const attrs = parseAttributes(lines[lineNumber + 1]?.substring(params.indentationLength ?? 0));
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
		key = `${cyrb53(line + '\n' + lines[lineNumber])}-${i}`;
	} else {
		key = `${cyrb53(line)}-${i}`;
	}

	const comp = React.createElement(
		`h${hNumber}`,
		{ key, className: `_h${hNumber}`, id: makeId(text), ...(attrs ?? {}), style },
		parseInline({ ...params, line: text, indentationLength: undefined }),
	);

	return { lineNumber, comp };
}
