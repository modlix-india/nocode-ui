import { isNullValue } from '@fincity/kirun-js';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
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

	const lists: Array<React.JSX.Element> = [];
	const listTypes: Array<ListTypeDepth> = [];
	const inLines: Array<string> = [];
	let j = i;
	for (; j < lines.length; j++) {
		let type: 'ol' | 'ul' | undefined = undefined;

		if (ORDERED_LIST_REGEX.test(lines[j])) type = 'ol';
		else if (UNORDERED_LIST_REGEX.test(lines[j])) type = 'ul';

		if (type === undefined) break;

		const match = lines[j].match(MAP_LIST_REGEX[type]);
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
				lists.push(
					React.createElement(
						closeList.type === 'ol' ? 'ol' : 'ul',
						{
							key: cyrb53(inLines.join('') + `-${content}-${lineNumber}-${j}`),
							style: styles[`${closeList.type}`] ?? {},
						},
						lists.splice(closeList.startIndex),
					),
				);
			}
			j--;
			continue;
		}
		let listStyle = styles[`${type}li`];
		let attrs = undefined;

		while (
			j + 1 < lines.length &&
			lines[j + 1].trim() &&
			lines[j + 1].startsWith(indentation) &&
			MULTILINE_LIST_REGEX.test(lines[j + 1]) &&
			!UNORDERED_LIST_REGEX.test(lines[j + 1]) &&
			!ORDERED_LIST_REGEX.test(lines[j + 1])
		) {
			const currentLineContent = lines[j + 1].match(MULTILINE_LIST_REGEX)![2];
			if (currentLineContent[0] === '{') {
				const attrString = lines[j + 1].substring(indentation.length);
				attrs = parseAttributes(attrString);
				if (attrs) {
					inLines.push(lines[j + 1]);
					j++;
					if (attrs.style)
						listStyle = listStyle ? { ...listStyle, ...attrs.style } : attrs.style;
				} else break;
			} else {
				inLines.push(lines[j + 1]);
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

		let listItemChild;
		let isTaskListItem = false;
		if (content.startsWith('[ ]') || content.startsWith('[x]')) {
			isTaskListItem = true;
			listItemChild = [
				React.createElement('input', {
					key: cyrb53(content + `-checkbox-${lineNumber}-${j}`),
					className: '_tlcheckbox',
					type: 'checkbox',
					checked: content.startsWith('[x]'),
					onChange: () => {},
				}),
				parseInline({ ...params, line: content.substring(3).trim(), parseNewline: true }),
			];
		} else {
			listItemChild = parseInline({ ...params, line: content, parseNewline: true });
		}
		lists.push(
			React.createElement(
				'li',
				{
					key: cyrb53(content + `-${lineNumber}-${j}`),
					className: isTaskListItem ? '_tlli' : `_${type}li`,
					type: listType.listType,
					...(attrs ?? {}),
					style: listStyle,
					value: liNum,
				},
				listItemChild,
			),
		);
		inLines.push(content);
	}

	while (listTypes.length) {
		const closeList = listTypes.pop();
		if (closeList) {
			lists.push(
				React.createElement(
					closeList.type === 'ol' ? 'ol' : 'ul',
					{ key: cyrb53(inLines.join('') + `-${lineNumber}-${j}`) },
					lists.splice(closeList.startIndex),
				),
			);
		}
	}

	let comp = undefined;

	if (lists.length) {
		comp = React.createElement(React.Fragment, { key: cyrb53(inLines.join('')) }, lists);
		lineNumber = j - 1;
	}

	return { lineNumber, comp };
}
