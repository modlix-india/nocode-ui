import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { cyrb53 } from '../../util/cyrb53';
import { parseTextLine } from './parseTextLine';

const DETAILS_OPEN_REGEX = /^<details(\s[^>]*)?\s*>/i;
const DETAILS_CLOSE_REGEX = /^<\/details\s*>/i;
const SUMMARY_SINGLE_LINE_REGEX = /^<summary[^>]*>([\s\S]*?)<\/summary\s*>/i;

export function parseHtmlBlock(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber } = params;
	const trimmed = lines[lineNumber].trim();

	if (DETAILS_OPEN_REGEX.test(trimmed)) {
		return parseDetailsBlock(params);
	}

	return { lineNumber, comp: undefined };
}

function parseDetailsBlock(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber, styles } = params;

	// Find matching </details>, tracking nesting
	let depth = 1;
	let endLine = -1;
	for (let i = lineNumber + 1; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (DETAILS_OPEN_REGEX.test(trimmed)) depth++;
		if (DETAILS_CLOSE_REGEX.test(trimmed)) {
			depth--;
			if (depth === 0) {
				endLine = i;
				break;
			}
		}
	}

	if (endLine === -1) {
		// No matching </details>, treat as regular text
		return { lineNumber, comp: undefined };
	}

	// Check for 'open' attribute on <details> tag
	const detailsLine = lines[lineNumber].trim();
	const openMatch = detailsLine.match(DETAILS_OPEN_REGEX);
	const isOpen = openMatch?.[1] ? /\bopen\b/i.test(openMatch[1]) : false;

	// Find <summary>...</summary> on a subsequent line
	let summaryHtml: string | undefined;
	let contentStart = lineNumber + 1;

	for (let i = lineNumber + 1; i < endLine; i++) {
		const trimmed = lines[i].trim();

		// Skip empty lines before summary
		if (trimmed === '') continue;

		// Check for single-line <summary>content</summary>
		const summaryMatch = trimmed.match(SUMMARY_SINGLE_LINE_REGEX);
		if (summaryMatch) {
			summaryHtml = summaryMatch[1];
			contentStart = i + 1;
		}
		break;
	}

	// Parse body content as markdown
	const bodyLines = lines.slice(contentStart, endLine);
	const bodyComps: React.JSX.Element[] = [];

	for (let j = 0; j < bodyLines.length; j++) {
		const { lineNumber: newJ, comp } = parseTextLine({
			...params,
			lines: bodyLines,
			lineNumber: j,
			line: undefined,
			indentationLength: undefined,
		});
		j = newJ;
		if (comp) {
			if (Array.isArray(comp)) bodyComps.push(...comp);
			else bodyComps.push(comp);
		}
	}

	// Build details element
	const key = cyrb53(`details-${lineNumber}-${endLine}`);
	const children: React.ReactNode[] = [];

	if (summaryHtml !== undefined) {
		children.push(
			React.createElement('summary', {
				key: `${key}-summary`,
				dangerouslySetInnerHTML: { __html: summaryHtml },
			}),
		);
	}
	children.push(...bodyComps);

	const comp = React.createElement(
		'details',
		{
			key,
			className: '_details',
			style: styles.details,
			...(isOpen ? { open: true } : {}),
		},
		...children,
	);

	return { lineNumber: endLine, comp };
}
