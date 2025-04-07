import { isNullValue } from '@fincity/kirun-js';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue, MDDef } from './common';
import { parseInline } from './parseInline';
import { parseAttributes } from './utils';
import React from 'react';

interface ListTypeDepth {
	type: 'ol' | 'ul';
	indentation: string;
	currentNumber: number;
	startIndex: number;
	listType?: '1' | 'a' | 'A' | 'i' | 'I';
}

function getListType(type: 'ol' | 'ul', number: string): '1' | 'a' | 'A' | 'i' | 'I' | undefined {
	if (type === 'ol') {
		if (number === '#') return '1';
		if (number === 'a') return 'a';
		if (number === 'A') return 'A';
		if (number === 'i') return 'i';
		if (number === 'I') return 'I';
		return '1';
	}

	return undefined;
}

export const ORDERED_LIST_REGEX = /^(\s{0,}|\.{0,}|⋅{0,})(\d+|\#|a|A|i|I")\.\s(.*)/;
export const UNORDERED_LIST_REGEX = /^(\s{0,}|\.{0,}|⋅{0,})(\*|\-|\+)\s(.*)/;

const MULTILINE_LIST_REGEX = /^(\s{0,}|\.{0,}|⋅{0,})(.*)/;

const MAP_LIST_REGEX = {
	ol: ORDERED_LIST_REGEX,
	ul: UNORDERED_LIST_REGEX,
	m: MULTILINE_LIST_REGEX,
};

export function parseLists(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, styles } = params;
	let lineNumber = i;

	const lists: Array<MDDef> = [];
	const listTypes: Array<ListTypeDepth> = [];
	const inLines: Array<string> = [];
	let j = i;
	for (; j < lines.length; j++) {
		let type: 'ol' | 'ul' | undefined = undefined;

		let currentLine = lines[j].substring(params.indentationLength ?? 0);

		if (ORDERED_LIST_REGEX.test(currentLine)) type = 'ol';
		else if (UNORDERED_LIST_REGEX.test(currentLine)) type = 'ul';

		if (type === undefined) break;

		const match = currentLine.match(MAP_LIST_REGEX[type]);
		const indentation = match![1];
		const number = match![2];
		let content = match![3];

		let listType = listTypes[listTypes.length - 1];

		if (!listType || listType.indentation.length < indentation.length) {
			listTypes.push({
				type,
				indentation,
				currentNumber:
					type == 'ol' &&
						number != '#' &&
						number != 'a' &&
						number != 'A' &&
						number != 'i' &&
						number != 'I'
						? parseInt(number)
						: 1,
				startIndex: lists.length,
				listType: getListType(type, number),
			});
			listType = listTypes[listTypes.length - 1];
		} else if (listType.indentation.length > indentation.length || listType.type !== type) {
			const closeList = listTypes.pop();
			if (closeList) {
				lists.push({
					type: closeList.type === 'ol' ? 'ol' : 'ul',
					start: 0,
					end: 0,
					marker: '',
					attributes: { 'className': `_${closeList.type === 'ol' ? 'ol' : 'ul'}` },
					lineNumber: i,
					text: '',
					children: lists.splice(closeList.startIndex),
				});
			}
			j--;
			continue;
		}
		let listStyle = styles[`${type}li`];
		let attrs = undefined;

		while (j + 1 < lines.length) {
			const nextLine = lines[j + 1].substring(params.indentationLength ?? 0).trim();

			if (
				!nextLine.startsWith(indentation) ||
				MULTILINE_LIST_REGEX.test(nextLine) ||
				UNORDERED_LIST_REGEX.test(nextLine) ||
				ORDERED_LIST_REGEX.test(nextLine)
			)
				break;

			const currentLineContent = nextLine.match(MULTILINE_LIST_REGEX)![2];
			if (currentLineContent[0] === '{') {
				const attrString = nextLine.substring(indentation.length);
				attrs = parseAttributes(attrString);
				if (attrs) {
					inLines.push(nextLine);
					j++;
					if (attrs.style)
						listStyle = listStyle ? { ...listStyle, ...attrs.style } : attrs.style;
				} else break;
			} else {
				inLines.push(nextLine);
				j++;
				content += '\n' + currentLineContent;
			}
		}

		let liNum = undefined;

		if (listType.type === 'ol') {
			liNum = listType.currentNumber;
			if (attrs?.value) liNum = parseInt(attrs.value);
			if (isNullValue(liNum) || isNaN(liNum)) liNum = listType.currentNumber;

			listType.currentNumber = liNum + 1;
		}

		let listItemChild: Array<MDDef>;
		let isTaskListItem = false;
		if (content.startsWith('[ ]') || content.startsWith('[x]')) {
			isTaskListItem = true;
			listItemChild = [{
				type: 'input',
				start: 0,
				end: 0,
				text: '',
				marker: '',
				attributes: { className: '_tlcheckbox', type: 'checkbox', checked: content.startsWith('[x]').toString() },
				lineNumber: i,
				children: parseInline({ ...params, line: content.substring(3).trim(), parseNewline: true }),
			}];

		} else {
			listItemChild = parseInline({ ...params, line: content, parseNewline: true });
		}
		lists.push({
			type: 'li',
			start: 0,
			end: 0,
			marker: '',
			attributes: { className: isTaskListItem ? '_tlli' : `_${type}li`, type: listType.listType ?? '', ...(attrs ?? {}), style: listStyle, value: liNum?.toString() ?? '' },
			lineNumber: i,
			text: '',
			children: listItemChild,
		});
		inLines.push(content);
	}

	while (listTypes.length) {
		const closeList = listTypes.pop();
		if (closeList) {
			lists.push({
				type: closeList.type === 'ol' ? 'ol' : 'ul',
				start: 0,
				end: 0,
				marker: '',
				attributes: { className: `_${closeList.type === 'ol' ? 'ol' : 'ul'}` },
				lineNumber: i,
				text: '',
				children: lists.splice(closeList.startIndex),
			});
		}
	}

	let comp: Array<MDDef> = [];

	if (lists.length) {
		comp = [{
			type: 'fragment',
			start: 0,
			end: 0,
			marker: '',
			lineNumber: i,
			text: '',
			children: lists,
		}];
		lineNumber = j - 1;
	}

	return { lineNumber, comp };
}
