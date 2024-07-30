import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseBlockQuote } from './parseBlockQuote';
import { parseCodeBlock } from './parseCodeBlock';
import { parseHeaderLine } from './parseHeaderLine';
import { parseHrLine } from './parseHrLine';
import { parseLine } from './parseLine';
import { ORDERED_LIST_REGEX, UNORDERED_LIST_REGEX, parseLists } from './parseLists';
import { parseTable } from './parseTable';
import { parseYoutubeEmbedding } from './parseYoutubeEmbedding';

const HR_REGEX = /^[-*=_]{3,}$/;
const TABLE_REGEX = /^(\| )?(:)?-{3,}:?\s+(\|(:|\s+:?)-{3,}(:?\s*))*\|?$/;

export function parseTextLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, editable, styles, line: acutalLine } = params;
	let lineNumber = i;
	let line = (acutalLine ?? lines[i].trim())?.substring(params.indentationLength ?? 0);
	let nextLine = lines[i + 1]?.trim()?.substring(params.indentationLength ?? 0) ?? '';

	let comp = undefined;

	if (/^https:\/\/((www\.)?youtube.com\/(watch|embed)|youtu.be\/)/i.test(line)) {
		({ lineNumber, comp } = parseYoutubeEmbedding(params));
	} else if (lineNumber + 1 < lines.length && TABLE_REGEX.test(nextLine)) {
		({ lineNumber, comp } = parseTable(params));
	} else if (
		line.startsWith('#') ||
		line.startsWith('\\#') ||
		nextLine.startsWith('---') ||
		nextLine.startsWith('===')
	) {
		({ lineNumber, comp } = parseHeaderLine(params));
	} else if (line.startsWith('```')) {
		({ lineNumber, comp } = parseCodeBlock(params));
	} else if (HR_REGEX.test(line)) {
		({ lineNumber, comp } = parseHrLine(params));
	} else if (ORDERED_LIST_REGEX.test(line) || UNORDERED_LIST_REGEX.test(line)) {
		({ lineNumber, comp } = parseLists(params));
	} else if (line.startsWith('>')) {
		({ lineNumber, comp } = parseBlockQuote(params));
	}

	if (!comp) {
		({ lineNumber, comp } = parseLine(params));
	}

	return {
		lineNumber,
		comp: params.editable
			? React.createElement(
					React.Fragment,
					{ key: `${params.componentKey}-frag-${i}` },
					React.createElement('div', {
						key: `${params.componentKey}-div-${i}`,
						id: `${params.componentKey}-div-${i}`,
						className: '_lineHook',
					}),
					comp,
				)
			: comp,
	};
}
