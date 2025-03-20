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
import { parseAlignment } from './parseAlignment';
import { parseTextDirection } from './parseTextDirection';

const HR_REGEX = /^[-*=_]{3,}$/;
const TABLE_REGEX = /^(\| )?(:)?-{3,}:?\s+(\|(:|\s+:?)-{3,}(:?\s*))*\|?$/;

export function parseTextLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, editable, styles, line: actualLine, onChange } = params;
	let lineNumber = i;
	let line = (actualLine ?? lines[i].trim())?.substring(params.indentationLength ?? 0);
	let nextLine = lines[i + 1]?.trim()?.substring(params.indentationLength ?? 0) ?? '';

	let comp = undefined;

	// Add text direction check
	if (line.match(/^:::\s*(rtl|ltr)\s*$/i)) {
		({ lineNumber, comp } = parseTextDirection(params));
	} else if (line.match(/^:::\s*(left|center|right|justify)\s*$/i)) {
		({ lineNumber, comp } = parseAlignment(params));
	} else if (/^https:\/\/((www\.)?youtube.com\/(watch|embed)|youtu.be\/)/i.test(line)) {
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

	// If editable, wrap the component with a contentEditable div
	if (params.editable && comp) {
		return {
			lineNumber,
			comp: React.createElement(
				React.Fragment,
				{ key: `${params.componentKey}-frag-${i}` },
				React.createElement('div', {
					key: `${params.componentKey}-div-${i}`,
					id: `${params.componentKey}-div-${i}`,
					className: '_lineHook',
				}),
				React.createElement(
					'div',
					{
						key: `${params.componentKey}-editable-${i}`,
						contentEditable: true,
						suppressContentEditableWarning: true,
						className: '_editableContent',
						onKeyDown: (ev: React.KeyboardEvent<HTMLDivElement>) => {
							if (!onChange) return;

							// Get the current selection
							if (window.getSelection) {
								let sel = window.getSelection();
								if (sel?.rangeCount) {
									let range = sel.getRangeAt(0);
									if (
										range.commonAncestorContainer.parentNode ===
										ev.currentTarget
									) {
										let caretPos = range.endOffset;

										// Create updated line content
										const updatedLine =
											line.substring(0, caretPos) +
											ev.key +
											line.substring(caretPos);

										// Create a new array of lines with the updated line
										const updatedLines = [...lines];
										updatedLines[i] = updatedLine;

										// Call onChange with the updated text
										onChange(updatedLines.join('\n'));

										// Prevent default to handle the update manually
										ev.preventDefault();
										ev.stopPropagation();
									}
								}
							}
						},
						onInput: (ev: React.FormEvent<HTMLDivElement>) => {
							if (!onChange) return;

							// Get the updated content
							const updatedContent = ev.currentTarget.textContent || '';

							// Create a new array of lines with the updated content
							const updatedLines = [...lines];
							updatedLines[i] = updatedContent;

							// Call onChange with the updated text
							onChange(updatedLines.join('\n'));
						},
					},
					comp,
				),
			),
		};
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
