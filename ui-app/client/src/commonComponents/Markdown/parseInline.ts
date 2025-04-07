import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdowFootnotes, MarkdownParserParameters, MarkdownURLRef, MDDef } from './common';
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
	'`': 'code',
	'***': 'b'
	// '!!': 'span',
};

//Moved span processing outside.

const URL_REGEX =
	/<?(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})>?/g;

const TEMP_SPAN = document.createElement('span');

export function parseInline(
	params: MarkdownParserParameters & { parseNewline?: boolean },
): Array<MDDef> {
	const { lines, lineNumber, line, styles, parseNewline, footNotes } = params;
	const actualLine = line ?? lines[lineNumber];

	let lineParts: Array<MDDef> = [];
	const spanParts: Array<{
		start: number;
		end: number;
		parts: Array<MDDef>;
	}> = [{ start: 0, end: actualLine.length - 1, parts: lineParts }];

	let current = '';

	for (let i = 0; i < actualLine.length; i++) {
		if (spanParts[0].end === i && spanParts.length > 1) {
			if (current) {
				lineParts.push({
					type: 'fragment', start: i - current.length, end: i - 1, text: current, marker: '', attributes: {}, lineNumber,
					children: processForURLs(current, lineNumber)
				});

				current = '';
			}
			const spanPart = spanParts.shift()!;
			const index = actualLine.indexOf('{', spanPart.end);
			const endIndex = actualLine.indexOf('}', index);
			const attrs = parseAttributes(actualLine.substring(index, endIndex));
			lineParts = spanParts[0].parts;
			if (attrs)
				lineParts.push({
					type: 'span', start: spanPart.start, end: spanPart.end, text: actualLine.substring(spanPart.start, spanPart.end + 1),
					marker: '!!', attributes: attrs, children: spanPart.parts, lineNumber
				});
			i = endIndex;
			continue;
		}
		let found = false;
		if (parseNewline && actualLine[i] === '\n') {
			current = processNewLineWithBR(current, lineParts, i, lineNumber);
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
			));
		} else if ((actualLine[i] === '!' && i + 1 < actualLine.length && actualLine[i + 1] === '!')) {
			let newI: number, endsAt: number, newFound: boolean;
			({ i: newI, endsAt, current, found: newFound } = processSpan(
				actualLine,
				i,
				current,
				lineParts,
				lineNumber,
			));
			if (newFound) {
				lineParts = [];
				spanParts.unshift({ start: newI, end: endsAt, parts: lineParts });
				i = newI;
			}
		} else if (
			actualLine[i] === '*' ||
			actualLine[i] === '_' ||
			actualLine[i] === '~' ||
			actualLine[i] === '=' ||
			actualLine[i] === '^' ||
			actualLine[i] === '`'
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
		lineParts.push({
			type: 'fragment',
			start: actualLine?.length - current.length,
			end: actualLine.length - 1,
			text: current,
			marker: '',
			attributes: {},
			children: processForURLs(current, lineNumber),
			lineNumber,
		});

	return lineParts;
}

function processSpan(
	actualLine: string,
	i: number,
	current: string,
	lineParts: Array<MDDef>,
	lineNumber: number
) {
	if (actualLine[i] !== '!' || (i > 0 && actualLine[i - 1] === '\\') || i >= actualLine.length || actualLine[i + 1] !== '!') return { i, endsAt: i, current, found: false };

	let index = i + 2;
	let found = 0;

	while ((index = actualLine.indexOf("!!", index)) != -1) {

		if (index + 2 >= actualLine.length) break;

		if (found == 0 && actualLine[index + 2] === '{') {
			if (current)
				lineParts.push({
					type: 'fragment',
					start: i - current.length,
					end: i - 1,
					text: current,
					marker: '',
					attributes: {},
					children: processForURLs(current, lineNumber),
					lineNumber,
				});
			current = '';
			return { i: i + 2, endsAt: index, current, found: true };
		} else if (actualLine[index + 2] === '{') {
			index++;
			found--;
		} else if (actualLine[index + 2] !== '{') {
			index += 2;
			found++;
		}
	}

	return { i, endsAt: i, current, found: found > 0 };
}

function processFootnotes(
	actualLine: string,
	i: number,
	footNotes: MarkdowFootnotes | undefined,
	current: string,
	lineParts: Array<MDDef>,
	lineNumber: number,
) {
	const refEnd = actualLine.indexOf(']', i + 1);
	if (refEnd === -1 || !footNotes) return { i, current, found: false };

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
		lineParts.push({
			type: 'fragment',
			start: i - current.length,
			end: i - 1,
			text: current,
			marker: '',
			attributes: {},
			children: processForURLs(current, lineNumber),
			lineNumber,
		});
		current = '';
	}
	if (!footNote.num) {
		footNotes.currentRefNumber++;
		footNote.num = footNotes.currentRefNumber;
	}
	footNote.refNum = (footNote.refNum ?? 0) + 1;
	lineParts.push({
		type: 'a',
		start: i,
		end: refEnd,
		text: `[${footNote.num}]`,
		marker: '[',
		attributes: { href: `#fn-${footNote.num}` },
		lineNumber,
	});
	return { i: refEnd, current, found: true };
}

function processImageLink(
	actualLine: string,
	i: number,
	lineParts: Array<MDDef>,
	current: string,
	lineNumber: number,
	styles: any,
	params: MarkdownParserParameters & { parseNewline?: boolean },
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
		linkParts = params.urlRefs?.get(ref.toLowerCase());
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
		lineParts.push({
			type: 'fragment',
			start: i - current.length,
			end: i - 1,
			text: current,
			marker: '',
			attributes: {},
			children: processForURLs(current, styles),
			lineNumber,
		});
	current = '';
	const lowerURL = linkParts.url.toLowerCase();
	const isVideo =
		lowerURL.endsWith('.mov') || lowerURL.endsWith('.mp4') || lowerURL.endsWith('.webm');
	lineParts.push({
		type: isVideo ? 'video' : 'img',
		start: i,
		end: ind,
		text: '',
		marker: '',
		attributes: { src: linkParts.url, alt: linkParts.title ?? altText, ...(attrs ?? {}), style },
		lineNumber,
	});

	return { i, current, found: true };
}

function processLink(
	actualLine: string,
	i: number,
	lineParts: Array<MDDef>,
	current: string,
	lineNumber: number,
	styles: any,
	params: MarkdownParserParameters & { parseNewline?: boolean },
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
		linkParts = params.urlRefs?.get(ref.toLowerCase());
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
		lineParts.push({
			type: 'fragment',
			start: i - current.length,
			end: i - 1,
			text: current,
			marker: '',
			attributes: {},
			children: processForURLs(current, lineNumber),
			lineNumber,
		});

	current = '';
	lineParts.push({
		type: 'a',
		start: i,
		end: ind,
		text: linkText,
		marker: '[',
		attributes: { href: linkParts.url, title: linkParts.title ?? '', style: style, ...(attrs ?? {}) },
		lineNumber,
	});

	return { i, current, found: true };
}

function processInlineMarkup(
	actualLine: string,
	i: number,
	current: string,
	lineParts: Array<MDDef>,
	lineNumber: number,
	styles: any,
	params: MarkdownParserParameters & { parseNewline?: boolean },
) {
	let count = 3;
	const ch = actualLine[i];
	let j = i + 1;
	for (; j < actualLine.length && count < 2; j++) {
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
		lineParts.push({
			type: 'fragment',
			start: i - current.length,
			end: i - 1,
			text: current,
			marker: '',
			attributes: {},
			children: processForURLs(current, styles),
			lineNumber,
		});
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

	let children: Array<MDDef> | undefined = undefined;

	if (text) {
		children = parseInline({ ...params, line: text });
	}

	const innerComp: MDDef = {
		type: TYPE_MAP[searchString] ?? 'span',
		start: i,
		end: ind,
		text: text,
		marker: searchString,
		attributes: attrs,
		lineNumber,
	};

	if (children?.length) {
		innerComp.children = children;
	}

	if (searchString != '***') lineParts.push(innerComp);
	else {
		lineParts.push({
			type: 'em',
			start: i,
			end: ind,
			text: '',
			marker: '*',
			attributes: attrs,
			lineNumber,
		});
	}

	return { i, current, found: true };
}

function processNewLineWithBR(
	current: string,
	lineParts: Array<MDDef>,
	i: number,
	lineNumber: number,
) {
	if (current)
		lineParts.push({ type: 'text', start: i - current.length, end: i - 1, text: current, marker: '', lineNumber })
	current = '';
	lineParts.push({ type: 'br', start: i, end: i, text: '', marker: '', lineNumber })
	return current;
}

function processForURLs(text: string, lineNumber: number): Array<MDDef> {
	const matches = text.matchAll(URL_REGEX);
	const parts: Array<MDDef> = [];
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
			const inText = TEMP_SPAN.innerText;
			parts.push({ type: 'text', start: lastIndex, end: index - 1, text: inText, marker: '', lineNumber });
		}

		parts.push({ type: 'link', start: index, end: index + actualLength - 1, text: url, marker: '<', attributes: { href: url }, lineNumber });


		lastIndex = index + actualLength;
	}

	if (lastIndex == 0) {
		TEMP_SPAN.innerHTML = text;
		const inText = TEMP_SPAN.innerText;
		return [{ type: 'text', start: 0, end: text.length - 1, text: inText, marker: '', lineNumber }];
	}

	if (lastIndex < text.length) {
		TEMP_SPAN.innerHTML = text.substring(lastIndex);
		parts.push({ type: 'text', start: lastIndex, end: text.length - 1, text: TEMP_SPAN.innerText, marker: '', lineNumber });
	}
	return parts;
}
