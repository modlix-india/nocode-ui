import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseInline } from './parseInline';
import { parseAttributes } from './utils';

export function parseTable(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber, styles } = params;
	let i = lineNumber;

	const colAlignments = processColoumnAlignments(
		lines[i + 1]?.substring(params.indentationLength ?? 0) ?? '',
	);

	let line = lines[i]?.substring(params.indentationLength ?? 0) ?? '';
	let attrLine =
		(i + 2 < lines.length
			? lines[i + 2]?.substring(params.indentationLength ?? 0)
			: undefined) ?? '';
	i += 2;

	if (attrLine.startsWith('{')) i++;

	const head = React.createElement(
		'thead',
		{ key: cyrb53(line + '-' + lineNumber + ' - thead'), className: '_thead' },
		processRowMakeTR(0, 'th', processRow(line), colAlignments, styles, attrLine, params),
	);

	const rows: React.JSX.Element[] = [];

	({ i } = makeRows(i, lines, rows, colAlignments, styles, params));

	let style = styles.table;
	let attr;

	if (
		i + 1 < lines.length &&
		lines[i + 1].substring(params.indentationLength ?? 0).startsWith('{')
	) {
		attr = parseAttributes(lines[i + 1].substring(params.indentationLength ?? 0) ?? '');
		if (attr) i++;
		if (attr?.style) {
			style = style ? { ...style, ...attr.style } : attr.style;
		}
	}

	const body = React.createElement(
		'tbody',
		{ key: cyrb53(line + ' - ' + lineNumber + ' - tbody'), className: '_tbody' },
		...rows,
	);

	const comp = React.createElement(
		'table',
		{
			key: cyrb53(lines.slice(lineNumber, i).join(',')),
			...attr,
			className: '_table',
			style: style,
		},
		head,
		body,
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
		line = lines[i]?.substring(params.indentationLength ?? 0) ?? '';

		if (line.trim() === '') break;
		attrLine = (i + 1 < lines.length ? lines[i + 1] : undefined) ?? '';
		attrLine = attrLine.substring(params.indentationLength ?? 0);
		if (attrLine.startsWith('{')) i = i + 1;

		rows.push(
			processRowMakeTR(i, 'td', processRow(line), colAlignments, styles, attrLine, params),
		);
		i++;
	}
	return { i, line, attrLine };
}

function processRowMakeTR(
	rowNum: number,
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
			key: cyrb53(`${columns.join(',')}-${rowNum}`),
			...attr,
			className: '_tr',
			style: style,
		},
		...columns.map((col, i) => {
			let style = styles[type];

			style = style
				? { ...style, textAlign: colAlignments[i] ?? 'left' }
				: { textAlign: colAlignments[i] ?? 'left' };

			return React.createElement(
				type,
				{
					key: cyrb53(`${col}-${i}`),
					style: style,
					className: `_${type}`,
				},
				parseInline({
					...params,
					lines: [col],
					lineNumber: 0,
					line: undefined,
					indentationLength: undefined,
				}),
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
