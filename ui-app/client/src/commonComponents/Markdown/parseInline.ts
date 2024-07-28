import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdowFootnotes, MarkdownParserParameters, MarkdownURLRef } from './common';
import { makeURLnTitle, parseAttributes } from './utils';

const TYPE_MAP: { [key: string]: 's' | 'em' | 'b' | 'mark' | 'sup' | 'sub' | 'code' | 'span' } = {
	'~~': 's',
	'*': 'em',
	_: 'em',
	'**': 'b',
	__: 'b',
	'==': 'mark',
	'^': 'sup',
	'~': 'sub',
	'***': 'b',
	'`': 'code',
	'!!': 'span',
};

const URL_REGEX =
	/<?(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})>?/g;

const TEMP_SPAN = document.createElement('span');

export function parseInline(
	params: MarkdownParserParameters & { line?: string; parseNewline?: boolean },
): Array<React.JSX.Element> {
	const { lines, lineNumber, line, styles, parseNewline, footNotes } = params;
	const actualLine = line ?? lines[lineNumber];

	const lineParts: Array<React.JSX.Element> = [];

	let current = '';

	for (let i = 0; i < actualLine.length; i++) {
		let found = false;
		if (parseNewline && actualLine[i] === '\n') {
			current = processNewLineWithBR(current, lineParts, lineNumber, i, actualLine, styles);
		} else if (
			(actualLine[i] === '[' && i + 1 < actualLine.length && actualLine[i + 1] === '^') ||
			(actualLine[i] === '^' && i + 1 < actualLine.length && actualLine[i + 1] === '[')
		) {
			({ i, current, found } = processFootnotes(
				actualLine,
				i,
				footNotes,
				current,
				lineParts,
				lineNumber,
				styles,
			));
		} else if (
			actualLine[i] === '*' ||
			actualLine[i] === '_' ||
			actualLine[i] === '~' ||
			actualLine[i] === '=' ||
			actualLine[i] === '^' ||
			actualLine[i] === '`' ||
			(actualLine[i] === '!' && i + 1 < actualLine.length && actualLine[i + 1] === '!')
		) {
			({ i, current, found } = processInlineMarkup(
				actualLine,
				i,
				current,
				lineParts,
				lineNumber,
				styles,
				params,
			));
		} else if (actualLine[i] === '\\') {
			i++;
			if (i < actualLine.length) current += actualLine[i];
			found = true;
		} else if (actualLine[i] === '[') {
			({ i, current, found } = processLink(
				actualLine,
				i,
				lineParts,
				current,
				lineNumber,
				styles,
				params,
			));
		} else if (actualLine[i] === '!') {
			({ i, current, found } = processImageLink(
				actualLine,
				i,
				lineParts,
				current,
				lineNumber,
				styles,
				params,
			));
		}

		if (!found) current += actualLine[i];
	}

	if (current)
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}`) },
				processForURLs(current, styles),
			),
		);

	return lineParts;
}

function processFootnotes(
	actualLine: string,
	i: number,
	footNotes: MarkdowFootnotes,
	current: string,
	lineParts: React.JSX.Element[],
	lineNumber: number,
	styles: any,
) {
	const refEnd = actualLine.indexOf(']', i + 1);
	if (refEnd === -1) return { i, current, found: false };

	let ref = actualLine.substring(i + 1, refEnd);
	if (ref.startsWith('[')) ref = ref.substring(1);
	let footNote = footNotes.footNoteRefs.get(ref.toLowerCase());
	if (!footNote) {
		footNote = {
			ref: ref.toLowerCase(),
			text: ref,
			num: 0,
			refNum: 0,
		};
		footNotes.footNoteRefs.set(footNote.ref, footNote);
	}

	if (current) {
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}-${i}`) },
				processForURLs(current, styles),
			),
		);
		current = '';
	}
	if (!footNote.num) {
		footNotes.currentRefNumber++;
		footNote.num = footNotes.currentRefNumber;
	}
	footNote.refNum = (footNote.refNum ?? 0) + 1;
	lineParts.push(
		React.createElement(
			'a',
			{
				key: cyrb53(`fnref-${footNote.num}-${footNote.refNum}-${lineNumber}`),
				href: `#fn-${footNote.num}`,
				className: '_footNoteLink',
				id: `fnref-${footNote.num}-${footNote.refNum}`,
				style: styles.footnote ?? {},
			},
			`[${footNote.num}]`,
		),
	);

	return { i: refEnd, current, found: true };
}

function processImageLink(
	actualLine: string,
	i: number,
	lineParts: React.JSX.Element[],
	current: string,
	lineNumber: number,
	styles: any,
	params: MarkdownParserParameters & { line?: string; parseNewline?: boolean },
) {
	if (actualLine[i + 1] !== '[') return { i, current, found: false };

	let ind = actualLine.indexOf(']', i + 2);
	if (ind == -1) return { i, current, found: false };

	const altText = actualLine.substring(i + 2, ind);
	let linkParts: MarkdownURLRef | undefined = undefined;
	if (actualLine[ind + 1] === '(') {
		const linkEnd = actualLine.indexOf(')', ind + 1);
		if (linkEnd !== -1) {
			linkParts = makeURLnTitle(actualLine.substring(ind + 2, linkEnd));
			i = linkEnd;
		}
	} else {
		const linkText = actualLine.substring(i + 2, ind);
		let ref = linkText;
		if (actualLine[ind + 1] === '[') {
			const refEnd = actualLine.indexOf(']', ind + 1);
			if (refEnd !== -1) {
				ref = actualLine.substring(ind + 2, refEnd);
				ind = refEnd;
			}
		}
		linkParts = params.urlRefs.get(ref.toLowerCase());
		i = ind;
	}

	if (!linkParts) return { i, current, found: false };

	let style = styles.images;
	let attrs = undefined;
	if (i < actualLine.length - 1 && actualLine[i + 1] === '{') {
		const attrEnd = actualLine.indexOf('}', i + 2);
		if (attrEnd !== -1) {
			attrs = parseAttributes(actualLine.substring(i + 1, attrEnd));
			if (attrs?.style) style = style ? { ...style, ...attrs.style } : attrs.style;
			i = attrEnd;
		}
	}

	if (current)
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}`) },
				processForURLs(current, styles),
			),
		);
	current = '';
	const lowerURL = linkParts.url.toLowerCase();
	const isVideo =
		lowerURL.endsWith('.mov') || lowerURL.endsWith('.mp4') || lowerURL.endsWith('.webm');
	lineParts.push(
		React.createElement(isVideo ? 'video' : 'img', {
			key: cyrb53(`${actualLine}-${lineNumber}-${i}`),
			src: linkParts.url,
			className: isVideo ? '_video' : '_images',
			alt: linkParts.title ?? altText,
			...(attrs ?? {}),
			style,
		}),
	);

	return { i, current, found: true };
}

function processLink(
	actualLine: string,
	i: number,
	lineParts: React.JSX.Element[],
	current: string,
	lineNumber: number,
	styles: any,
	params: MarkdownParserParameters & { line?: string; parseNewline?: boolean },
) {
	let ind = actualLine.indexOf(']', i + 1);
	if (ind == -1) return { i, current, found: false };

	const linkText = actualLine.substring(i + 1, ind);
	let linkParts: MarkdownURLRef | undefined = undefined;
	if (actualLine[ind + 1] === '(') {
		const linkEnd = actualLine.indexOf(')', ind + 1);
		if (linkEnd !== -1) {
			linkParts = makeURLnTitle(actualLine.substring(ind + 2, linkEnd));

			i = linkEnd;
		}
	} else {
		const linkText = actualLine.substring(i + 1, ind);
		let ref = linkText;
		if (actualLine[ind + 1] === '[') {
			const refEnd = actualLine.indexOf(']', ind + 1);
			if (refEnd !== -1) {
				ref = actualLine.substring(ind + 2, refEnd);
				ind = refEnd;
			}
		}
		linkParts = params.urlRefs.get(ref.toLowerCase());
		i = ind;
	}

	if (!linkParts) return { i, current, found: false };

	let style = styles.links;
	let attrs = undefined;
	if (i < actualLine.length - 1 && actualLine[i + 1] === '{') {
		const attrEnd = actualLine.indexOf('}', i + 2);
		if (attrEnd !== -1) {
			attrs = parseAttributes(actualLine.substring(i + 1, attrEnd));
			if (attrs?.style) style = style ? { ...style, ...attrs.style } : attrs.style;
			i = attrEnd;
		}
	}

	if (current)
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}`) },
				processForURLs(current, styles),
			),
		);
	current = '';
	lineParts.push(
		React.createElement(
			'a',
			{
				key: cyrb53(`${actualLine}-${lineNumber}-${i}`),
				href: linkParts.url,
				className: '_links',
				style,
				title: linkParts.title,
				...(attrs ?? {}),
			},
			linkText,
		),
	);

	return { i, current, found: true };
}

function processInlineMarkup(
	actualLine: string,
	i: number,
	current: string,
	lineParts: React.JSX.Element[],
	lineNumber: number,
	styles: any,
	params: MarkdownParserParameters & { line?: string; parseNewline?: boolean },
) {
	let count = 1;
	const ch = actualLine[i];
	let j = i + 1;
	for (; j < actualLine.length && count < 3; j++) {
		if (actualLine[j] === ch) count++;
		else break;
	}

	if (j < actualLine.length && actualLine[j] === ' ') return { i, current, found: false };

	const searchString = ch.repeat(count);
	let ind = -1;

	while ((ind = actualLine.indexOf(searchString, j + 1)) != -1) {
		if (actualLine[ind - 1] !== '\\' && actualLine[ind - 1] !== ' ') break;
		j = ind + 1;
	}

	if (actualLine[ind - 1] === '\\' || actualLine[ind - 1] === ' ') ind = -1;

	if (ind === -1 || !TYPE_MAP[searchString]) return { i, current, found: false };

	if (current) {
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}-${i}`) },
				processForURLs(current, styles),
			),
		);
		current = '';
	}

	const text = actualLine.substring(i + count, ind);

	ind += count - 1;
	const attrStart = actualLine.indexOf('{', ind);

	let attrs: { [key: string]: any } | undefined = undefined;
	const subCompName = searchString == '`' ? 'icBlock' : TYPE_MAP[searchString];
	let style = styles[subCompName];
	if (attrStart) {
		const attrEnd = actualLine.indexOf('}', attrStart);
		if (attrEnd !== -1) {
			attrs = parseAttributes(actualLine.substring(attrStart, attrEnd));
			if (attrs) {
				ind = attrEnd;
				if (attrs.style) style = style ? { ...style, ...attrs.style } : attrs.style;
				ind = attrEnd;
			}
		}
	}
	i = ind;

	const innerComp = React.createElement(
		TYPE_MAP[searchString] ?? 'span',
		{
			key: cyrb53(actualLine + '-' + text + '-' + lineNumber + '-' + i),
			className: `_${subCompName}`,
			...(attrs ?? {}),
			style,
		},
		text ? parseInline({ ...params, line: text }) : undefined,
	);

	if (searchString != '***') lineParts.push(innerComp);
	else {
		lineParts.push(
			React.createElement(
				'em',
				{
					key: cyrb53(actualLine + '-' + text + '-' + lineNumber + '-' + i + '-em'),
				},
				innerComp,
			),
		);
	}

	return { i, current, found: true };
}

function processNewLineWithBR(
	current: string,
	lineParts: React.JSX.Element[],
	lineNumber: number,
	i: number,
	actualLine: string,
	styles: any,
) {
	if (current)
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}-${i}`) },
				current,
			),
		);
	current = '';
	lineParts.push(
		React.createElement('br', {
			key: cyrb53(actualLine + '-' + lineNumber + '-' + i),
			style: styles.br ?? {},
		}),
	);
	return current;
}

function processForURLs(text: string, styles: any): Array<React.JSX.Element> | string {
	const matches = text.matchAll(URL_REGEX);
	const parts: Array<React.JSX.Element> = [];
	let match;

	let lastIndex = 0;
	while ((match = matches.next())) {
		if (match.done) break;

		let url = match.value[0];
		const actualLength = url.length;
		if (url.startsWith('<')) {
			url = url.substring(1, url.length - (url.endsWith('>') ? 1 : 0));
		}

		const index = match.value.index;

		if (index > lastIndex) {
			TEMP_SPAN.innerHTML = text.substring(lastIndex, index);
			parts.push(
				React.createElement(
					React.Fragment,
					{ key: cyrb53(`${text}-${index}`) },
					TEMP_SPAN.innerText,
				),
			);
		}

		parts.push(
			React.createElement(
				'a',
				{
					key: cyrb53(`${text}-${index}-a`),
					href: url,
					className: '_links',
					style: styles.links ?? {},
				},
				url,
			),
		);

		lastIndex = index + actualLength;
	}

	if (lastIndex == 0) {
		TEMP_SPAN.innerHTML = text;
		return TEMP_SPAN.innerText;
	}

	if (lastIndex < text.length) {
		TEMP_SPAN.innerHTML = text.substring(lastIndex);
		parts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${text}-${lastIndex}`) },
				TEMP_SPAN.innerText,
			),
		);
	}
	return parts;
}
