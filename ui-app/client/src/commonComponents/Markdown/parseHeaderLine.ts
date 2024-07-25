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
	const { lineNumber: i, lines } = params;
	let lineNumber = i;

	if (lines[i].startsWith('\\#')) {
		return parseLine({ ...params, line: lines[i].substring(1) });
	}

	let hNumber = 0,
		text = '';
	if (!lines[i].startsWith('#')) {
		if (HEADER_EQUAL_REGEX.test(lines[i + 1])) {
			hNumber = 1;
			text = lines[i];
			lineNumber++;
		} else if (HEADER_DASH_REGEX.test(lines[i + 1])) {
			hNumber = 2;
			text = lines[i];
			lineNumber++;
		}
	} else {
		hNumber = (lines[i].match(HEADER_HASH_REGEX)?.[0].length ?? 1) - 1;
		if (hNumber) {
			text = lines[i].substring(hNumber + 1);
		}
	}

	if (hNumber === 0) return parseLine({ ...params, line: lines[i] });

	let style = params.styles[`h${hNumber}`];
	let key;
	const attrs = parseAttributes(lines[lineNumber + 1]);
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
		key = `${cyrb53(lines[i] + '\n' + lines[lineNumber])}-${i}`;
	} else {
		key = `${cyrb53(lines[i])}-${i}`;
	}

	const comp = React.createElement(
		`h${hNumber}`,
		{ key, className: '_h1', id: makeId(text), ...(attrs ?? {}), style },
		parseInline({ ...params, line: text }),
	);

	return { lineNumber, comp };
}
