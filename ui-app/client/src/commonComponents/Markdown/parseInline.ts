import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters } from './common';
import { parseAttributes } from './utils';

const TYPE_MAP: { [key: string]: 's' | 'em' | 'b' | 'mark' | 'sup' | 'sub' | 'code' } = {
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
};

const URL_REGEX =
	/<?(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})>?/g;

const TEMP_SPAN = document.createElement('span');

function parseForURLs(text: string, styles: any): Array<React.JSX.Element> | string {
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
					style: styles.a ?? {},
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

export function parseInline(
	params: MarkdownParserParameters & { line?: string; parseNewline?: boolean },
): Array<React.JSX.Element> {
	const { lines, lineNumber, line, styles, parseNewline } = params;
	const actualLine = line ?? lines[lineNumber];

	const lineParts: Array<React.JSX.Element> = [];

	let current = '';

	for (let i = 0; i < actualLine.length; i++) {
		let found = false;
		if (parseNewline && actualLine[i] === '\n') {
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
		} else if (
			actualLine[i] === '*' ||
			actualLine[i] === '_' ||
			actualLine[i] === '~' ||
			actualLine[i] === '=' ||
			actualLine[i] === '^' ||
			actualLine[i] === '`'
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

				if (actualLine[ind - 1] === '\\' || actualLine[ind - 1] === ' ') ind = -1;

				if (ind != -1 && TYPE_MAP[searchString]) {
					if (current) {
						lineParts.push(
							React.createElement(
								React.Fragment,
								{ key: cyrb53(`${current}-${lineNumber}-${i}`) },
								parseForURLs(current, styles),
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
									key: cyrb53(
										actualLine +
											'-' +
											text +
											'-' +
											lineNumber +
											'-' +
											i +
											'-em',
									),
								},
								innerComp,
							),
						);
					}
				}
			}
		} else if (actualLine[i] === '\\') {
			i++;
			if (i < actualLine.length) current += actualLine[i];
			found = true;
		} else if (actualLine[i] === '<') {
		}

		if (!found) current += actualLine[i];
	}

	if (current)
		lineParts.push(
			React.createElement(
				React.Fragment,
				{ key: cyrb53(`${current}-${lineNumber}`) },
				parseForURLs(current, styles),
			),
		);

	return lineParts;
}
