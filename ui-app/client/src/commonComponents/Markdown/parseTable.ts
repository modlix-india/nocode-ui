import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseInline } from './parseInline';
import { parseAttributes } from './utils';

export function parseTable(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber, styles } = params;
	let i = lineNumber;

	const colAlignments = processColoumnAlignments(lines[i + 1]);

	let line = lines[i];
	let attrLine = (i + 2 < lines.length ? lines[i + 2] : undefined) ?? '';
	i += 2;

	if (attrLine.startsWith('{')) i++;

	const rows = [
		processRowMakeTR('th', processRow(line), colAlignments, styles, attrLine, params),
	];

	({ i } = makeRows(i, lines, rows, colAlignments, styles, params));

	let style = styles.table;
	let attr;

	if (i + 1 < lines.length && lines[i + 1].trim() === '{') {
		attr = parseAttributes(lines[i + 1]);
		if (attr) i++;
		if (attr?.style) {
			style = style ? { ...style, ...attr.style } : attr.style;
		}
	}

	const comp = React.createElement(
		'table',
		{
			key: cyrb53(rows.map(row => row.key).join(',')),
			...attr,
			className: '_table',
			style: style,
		},
		...rows,
	);

	return { lineNumber: i - 1, comp };
}

function makeRows(
	i: number,
	lines: string[],
	rows: React.JSX.Element[],
	colAlignments: ('center' | 'left' | 'right')[],
	styles: any,
	params: MarkdownParserParameters,
) {
	let line;
	let attrLine;

	while (i < lines.length) {
		if (lines[i].trim() === '') break;

		line = lines[i];
		attrLine = (i + 1 < lines.length ? lines[i + 1] : undefined) ?? '';

		if (attrLine.startsWith('{')) i = i + 1;

		rows.push(
			processRowMakeTR('td', processRow(line), colAlignments, styles, attrLine, params),
		);
		i++;
	}
	return { i, line, attrLine };
}

function processRowMakeTR(
	type: 'th' | 'td',
	columns: string[],
	colAlignments: string[],
	styles: any,
	attrLine: string,
	params: MarkdownParserParameters,
): React.JSX.Element {
	const attr = parseAttributes(attrLine);
	let style = styles.tr;
	if (attr?.style) {
		style = style ? { ...style, ...attr.style } : attr.style;
	}

	return React.createElement(
		'tr',
		{
			key: cyrb53(columns.join(',')),
			...attr,
			className: '_tr',
			style: style,
		},
		columns.map((col, i) => {
			let style = styles[type];

			style = style
				? { ...style, textAlign: colAlignments[i] ?? 'left' }
				: { textAlign: colAlignments[i] ?? 'left' };

			return React.createElement(
				type,
				{
					key: cyrb53(col),
					style: style,
					className: `_${type}`,
				},
				parseInline({ ...params, lines: [col], lineNumber: 0 }),
			);
		}),
	);
}

function processRow(line: string): string[] {
	let pLine = line.trim();
	if (pLine.startsWith('|')) pLine = pLine.slice(1);
	if (pLine.endsWith('|')) pLine = pLine.slice(0, -1);

	return pLine.split(/(?<!\\)\|/);
}

function processColoumnAlignments(line: string) {
	return line
		.split('|')
		.map(col => col.trim())
		.filter(col => col.length > 0)
		.map(col => {
			if (col.startsWith(':') && col.endsWith(':')) {
				return 'center';
			} else if (col.startsWith(':')) {
				return 'left';
			} else if (col.endsWith(':')) {
				return 'right';
			} else {
				return 'left';
			}
		});
}
