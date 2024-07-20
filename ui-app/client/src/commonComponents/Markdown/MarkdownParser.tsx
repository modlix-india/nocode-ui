import React, { useMemo } from 'react';
import { MarkdownFootnoteRef, MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { cyrb53 } from '../../util/cyrb53';
import { line } from 'd3';

const HEADER_DASH_REGEX = /^-+$/;
const HEADER_EQUAL_REGEX = /^=+$/;
const HEADER_HASH_REGEX = /^#+\s/;
const HR_REGEX = /^[-*=_]{3,}$/;

export function MarkdownParser({
	text,
	styles,
	editable,
	onChange,
	className = '',
}: Readonly<{
	text: string;
	styles: any;
	editable?: boolean;
	onChange?: (text: string) => void;
	className?: string;
}>) {
	const parsedContent = useMemo(() => {
		const lines = text.split('\n');
		let comps: Array<React.JSX.Element | undefined> = [];

		const { footNoteRefs, urlRefs } = processRefsAndRemove(lines);

		for (let i = 0; i < lines.length; i++) {
			let { lineNumber, comp } = parseTextLine({
				lines,
				lineNumber: i,
				editable,
				styles,
				footNoteRefs,
				urlRefs,
			});
			i = lineNumber;
			comps.push(comp);
		}

		return comps;
	}, [text]);

	return (
		<div className={`_markdown ${className}`} style={styles.markdownContainer ?? {}}>
			{parsedContent}
		</div>
	);
}

function parseTextLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, editable, styles } = params;
	let lineNumber = i;
	let line = lines[i].trim();

	if (!line) return { lineNumber, comp: undefined };

	let comp = undefined;

	if (
		line.startsWith('#') ||
		line.startsWith('\\#') ||
		(i + 1 < lines.length && (lines[i + 1].startsWith('-') || lines[i + 1].startsWith('=')))
	) {
		({ lineNumber, comp } = parseHeaderLine(params));
	} else if (line.startsWith('```')) {
		({ lineNumber, comp } = parseCodeBlock(params));
	} else if (HR_REGEX.test(line)) {
		({ lineNumber, comp } = parseHrLine(params));
	}

	if (!comp) {
		({ lineNumber, comp } = parseLine(params));
	}

	return { lineNumber, comp };
}

function parseHeaderLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
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

function parseAttributes(line: string | undefined): { [key: string]: any } | undefined {
	if (!line?.startsWith('{')) return undefined;

	const result: { [key: string]: string } = {};
	let attrName = '';
	let attrValue = '';
	let inAttrName = true;
	for (let i = 1; i < line.length; i++) {
		if (inAttrName && line[i] === '=') {
			inAttrName = false;
		} else if (line[i] === ',') {
			attrName = attrName.trim();
			if (attrName) result[attrName] = processAttributeValue(attrName, attrValue.trim());
			attrName = '';
			attrValue = '';
			inAttrName = true;
		} else if (line[i] === '}') {
			if (attrName) result[attrName] = processAttributeValue(attrName, attrValue.trim());
			return result;
		} else if (inAttrName) {
			attrName += line[i];
		} else {
			attrValue += line[i];
		}
	}
	if (attrName) result[attrName] = processAttributeValue(attrName, attrValue.trim());
	return result;
}

function processAttributeValue(name: string, value: string): any {
	if (value.startsWith('"')) value = value.substring(1);
	if (value.endsWith('"')) value = value.substring(0, value.length - 1);

	if (name !== 'style') return value;

	const style: { [key: string]: string } = {};

	for (const styleDef of value.split(';')) {
		let [styleName = '', styleValue = ''] = styleDef.split(':');
		styleName = styleName.trim();
		let ind = -1;
		while ((ind = styleName.indexOf('-')) !== -1) {
			if (ind === styleName.length - 1) break;
			styleName =
				styleName.substring(0, ind) +
				styleName[ind + 1].toUpperCase() +
				styleName.substring(ind + 2);
		}
		style[styleName] = styleValue.trim();
	}
	return style;
}

const TYPE_MAP: { [key: string]: 's' | 'em' | 'b' | 'mark' | 'sup' | 'sub' } = {
	'~~': 's',
	'*': 'em',
	_: 'em',
	'**': 'b',
	__: 'b',
	'==': 'mark',
	'^': 'sup',
	'~': 'sub',
	'***': 'b',
};

function parseInline(params: MarkdownParserParameters & { line?: string }) {
	const { lines, lineNumber, line, styles } = params;
	const actualLine = line ?? lines[lineNumber];

	const lineParts: Array<React.JSX.Element> = [];

	let current = '';

	for (let i = 0; i < actualLine.length; i++) {
		let found = false;
		if (
			actualLine[i] === '*' ||
			actualLine[i] === '_' ||
			actualLine[i] === '~' ||
			actualLine[i] === '=' ||
			actualLine[i] === '^'
		) {
			let count = 1;
			const ch = actualLine[i];
			let j = i + 1;
			for (; j < actualLine.length && count < 3; j++) {
				if (actualLine[j] === ch) count++;
				else break;
			}

			if (j < actualLine.length && actualLine[j] !== ' ') {
				const searchString = ch.repeat(count);
				let ind = -1;

				while ((ind = actualLine.indexOf(searchString, j + 1)) != -1) {
					if (actualLine[ind - 1] !== '\\' && actualLine[ind - 1] !== ' ') break;
					j = ind + 1;
				}
				console.log(actualLine, searchString, ind, count, j);
				if (actualLine[ind - 1] === '\\' || actualLine[ind - 1] === ' ') ind = -1;
				console.log(actualLine, searchString, ind, count, j);

				if (ind != -1 && TYPE_MAP[searchString]) {
					if (current) {
						lineParts.push(<>{current}</>);
						current = '';
					}

					const text = actualLine.substring(i + count, ind);

					ind += count - 1;
					const attrStart = actualLine.indexOf('{', ind);

					let attrs: { [key: string]: any } | undefined = undefined;
					let style = styles[TYPE_MAP[searchString]];
					if (attrStart) {
						const attrEnd = actualLine.indexOf('}', attrStart);
						if (attrEnd !== -1) {
							attrs = parseAttributes(actualLine.substring(attrStart, attrEnd));
							if (attrs) {
								ind = attrEnd;
								if (attrs.style)
									style = style ? { ...style, ...attrs.style } : attrs.style;
								ind = attrEnd;
							}
						}
					}
					i = ind;
					found = true;

					const innerComp = React.createElement(
						TYPE_MAP[searchString] ?? 'span',
						{
							key: cyrb53(actualLine + '-' + text + '-' + lineNumber + '-' + i),
							className: `_${TYPE_MAP[searchString]}`,
							...(attrs ?? {}),
							style,
						},
						text ? parseInline({ ...params, line: text }) : undefined,
					);

					if (searchString != '***') lineParts.push(innerComp);
					else {
						lineParts.push(
							<em
								style={styles.em ?? {}}
								key={cyrb53(
									actualLine + '-' + text + '-' + lineNumber + '-' + i + '-em',
								)}
								className="_em"
							>
								{innerComp}
							</em>,
						);
					}
				}
			}
		} else if (actualLine[i] === '\\') {
			i++;
			if (i < actualLine.length) current += actualLine[i];
			found = true;
		}

		if (!found) current += actualLine[i];
	}

	if (current) lineParts.push(<>{current}</>);

	return lineParts;
}

function parseLine(
	params: MarkdownParserParameters & { line?: string },
): MarkdownParserReturnValue {
	const { lines, lineNumber: i, styles, line } = params;
	const key = `${cyrb53(line ?? lines[i])}-${i}`;
	let lineNumber = i;
	let style = styles.p;
	const attrs = parseAttributes(lines[lineNumber + 1]);
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}

	const comp = React.createElement(
		'p',
		{ key, className: '_p', ...(attrs ?? {}), style },
		parseInline({ ...params, line }),
	);
	return { lineNumber, comp };
}

function processRefsAndRemove(lines: string[]): {
	footNoteRefs: Map<string, MarkdownFootnoteRef>;
	urlRefs: Map<string, string>;
} {
	const footNoteRefs = new Map<string, MarkdownFootnoteRef>();
	const urlRefs = new Map<string, string>();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line.startsWith('[')) continue;

		const ending = line.indexOf(']:');
		if (ending === -1) continue;
		const ref = line.substring(1, ending);
		let url = line.substring(ending).trim();
		let count = 0;
		if (ref.startsWith('^')) {
			let j = i + 1;
			for (; j < lines.length; j++) {
				const inLine = lines[j].trim();
				if (inLine.startsWith('[') || !inLine.length) break;
				else url += '\n' + inLine;
			}
			count = j - i;
			footNoteRefs.set(ref, { text: url, ref, refKeys: new Array<string>(), num: 0 });
		} else {
			if (url.startsWith('<')) url = url.substring(1);
			if (url.endsWith('>')) url = url.substring(0, url.length - 1);
			urlRefs.set(ref, url);
			count = 1;
		}

		lines.splice(i, count);
		i--;
	}

	return { footNoteRefs, urlRefs };
}

function parseCodeBlock(params: MarkdownParserParameters): MarkdownParserReturnValue {
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

function parseHrLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lineNumber: i, styles } = params;
	const key = `${cyrb53('hr')}-${i}`;
	let lineNumber = i;

	let style = styles.hr;
	const attrs = parseAttributes(params.lines[i + 1]);
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}
	const comp = React.createElement('hr', { key, className: '_hr', style });

	return { lineNumber, comp };
}

function makeId(text: string) {
	return text
		.toLowerCase()
		.replace(/ /g, '-')
		.replace(/[^a-z0-9-]/g, '');
}
