import React from 'react';

const allowedTags = [
	'a',
	'b',
	'strong',
	'blockquote',
	'br',
	'code',
	'del',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'hr',
	'i',
	'img',
	'kbd',
	'li',
	'ol',
	'p',
	'pre',
	's',
	'sub',
	'sup',
	'ul',
];

const processList = (listItems: string[], isOrdered: boolean, level = 1) => {
	const finalList = [];
	const subList: Array<{ line: Array<string>; type: 'ordered' | 'unordered' }> = [];
	let currentIndex = 0;
	let prevType: 'ordered' | 'unordered' = isOrdered == true ? 'ordered' : 'unordered';
	console.log('picard', listItems, isOrdered, level);
	for (let i = 0; i < listItems.length; i++) {
		if (
			listItems[i + 1]?.startsWith('    '.repeat(level)) ||
			listItems[i + 1]?.startsWith('\t'.repeat(level))
		) {
			console.log('picard - kirk');
			let j = i + 1;
			while (listItems[j]?.startsWith('    ') || listItems[j]?.startsWith('\t')) {
				let k = '';
				if (listItems[j].startsWith('    '.repeat(level))) {
					k = listItems[j].slice('    '.repeat(level).length);
				}
				if (listItems[j].startsWith('\t'.repeat(level))) {
					k = listItems[j].slice('\t'.repeat(level).length);
				}

				if (
					k.startsWith('* ') ||
					k.startsWith('+ ') ||
					k.startsWith('- ') ||
					k.startsWith('_ ')
				) {
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: 'unordered' };
					if (prevType === 'unordered') {
						subList[currentIndex].line.push(k);
					} else {
						subList[currentIndex + 1] = { line: [k], type: 'unordered' };
						currentIndex += 1;
						prevType = 'unordered';
					}
				}

				if (k.match(/^\d+\.\s/)) {
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: 'ordered' };
					if (prevType === 'ordered') {
						subList[currentIndex].line.push(k);
					} else {
						subList[currentIndex + 1] = { line: [k], type: 'ordered' };
						currentIndex += 1;
						prevType = 'ordered';
					}
				}
				if (k.startsWith('    ') || k.startsWith('\t')) {
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: prevType };

					subList[currentIndex].line.push(listItems[j]);
				}
				j++;
			}
			finalList.push(
				<li key={listItems[i]}>
					{renderLine(listItems[i].slice(isOrdered ? 3 : 2))}
					{subList.map(e => processList(e.line, e.type === 'ordered', level + 1))}
				</li>,
			);
			i = j - 1;
		} else {
			let k = listItems[i];
			if (
				listItems[i]?.startsWith('    '.repeat(level)) ||
				listItems[i]?.startsWith('\t'.repeat(level))
			) {
				if (listItems[i].startsWith('    '.repeat(level))) {
					k = listItems[i].slice('    '.repeat(level).length);
				}
				if (listItems[i].startsWith('\t'.repeat(level))) {
					k = listItems[i].slice('\t'.repeat(level).length);
				}
			}
			finalList.push(<li key={k}>{renderLine(k.slice(isOrdered ? 3 : 2))}</li>);
		}
	}

	if (isOrdered) {
		return <ol key={listItems.join('_')}>{finalList}</ol>;
	} else return <ul key={listItems.join('_')}>{finalList}</ul>;
};

const parseText = (text: string, wholeText?: string) => {
	let tokens: Array<React.ReactNode> = [];
	let tokenCount = 0;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '*' || text[i] === '_') {
			let chaar = text[i];
			if (text[i + 1] === chaar) {
				if (text[i + 2] === chaar) {
					// Triple asterisks, treat as strong and emhasis
					let endIndex = text.indexOf(chaar + chaar + chaar, i + 3);
					if (endIndex === -1) {
						tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
						continue;
					} else if (text[endIndex - 1] === '\\') {
						tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
						tokens.push(
							React.createElement(
								'strong',
								{ key: text?.slice(i + 3, endIndex + 1) },
								parseText(text?.slice(i + 3, endIndex + 1)),
							),
						);
						tokenCount += 2;
						i = endIndex + 2;
						continue;
					} else {
						tokens.push(
							React.createElement(
								'em',
								{ key: `em_${text?.slice(i + 3, endIndex)}` },
								React.createElement(
									'strong',
									{ key: `strong_${text?.slice(i + 3, endIndex)}` },
									parseText(text?.slice(i + 3, endIndex)),
								),
							),
						);
						tokenCount += 2;
						i = endIndex + 2;
						continue;
					}
				} else {
					// Double asterisk, only treat as strong
					let endIndex = text.indexOf(chaar + chaar, i + 1);
					if (endIndex === -1) {
						tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
						continue;
					} else if (text[endIndex - 1] === '\\') {
						tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
						tokens.push(
							React.createElement(
								'em',
								{ key: text?.slice(i + 2, endIndex + 1) },
								parseText(text?.slice(i + 2, endIndex + 1)),
							),
						);
						tokenCount += 2;
						i = endIndex + 1;
						continue;
					} else {
						tokens.push(
							React.createElement(
								'strong',
								{ key: text?.slice(i, endIndex) },
								parseText(text?.slice(i + 2, endIndex)),
							),
						);
						tokenCount += 2;
						i = endIndex + 1;
						continue;
					}
				}
			} else {
				// Single asterisk, only treat as emphasis
				let endIndex = text.indexOf(chaar, i + 1);
				if (endIndex === -1) {
					tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
					continue;
				} else if (text[endIndex - 1] === '\\') {
					tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
					tokens = [...tokens, parseText(text?.slice(i + 1, endIndex + 1))];
					tokenCount = tokens.length;
					i = endIndex;
					continue;
				} else {
					tokens.push(
						React.createElement(
							'em',
							{ key: `em_${text?.slice(i + 1, endIndex)}` },
							parseText(text?.slice(i + 1, endIndex)),
						),
					);
					tokenCount += 2;
					i = endIndex;
					continue;
				}
			}
		} else if (text[i] === '!') {
			if (text[i + 1] !== '[') {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}
			const endIndex = text.indexOf(']', i + 1);
			if (endIndex === -1 || text[endIndex + 1] !== '(') {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}
			const altText = text.slice(i + 2, endIndex);
			const linkEndIndex = text.indexOf(')', endIndex);
			if (linkEndIndex === -1) {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}
			let linkSubStr: string | string[] = text.slice(endIndex + 2, linkEndIndex);
			const spaceIndex = linkSubStr.indexOf(' ');
			let title = '';
			if (
				spaceIndex !== -1 &&
				linkSubStr[spaceIndex + 1] === '"' &&
				linkSubStr[linkSubStr.length - 1] === '"'
			) {
				title = linkSubStr.slice(spaceIndex + 2, linkSubStr.length - 1);
			}
			const actualLink = linkSubStr.slice(0, spaceIndex !== 1 ? spaceIndex : undefined);
			tokens.push(
				React.createElement('img', {
					key: linkSubStr,
					title: title ?? '',
					src: actualLink,
					loading: 'lazy',
					alt: altText,
				}),
			);
			tokenCount += 2;
			i = linkEndIndex;
		} else if (text[i] === '[') {
			const endIndex = text.indexOf(']', i + 1);
			if (endIndex === -1 || text[endIndex + 1] !== '(') {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}
			const linkText = text.slice(i + 1, endIndex);
			const linkEndIndex = text.indexOf(')', endIndex);
			if (linkEndIndex === -1) {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}
			let linkSubStr: string | string[] = text.slice(endIndex + 2, linkEndIndex);
			const spaceIndex = linkSubStr.indexOf(' ');
			let title = '';
			if (
				spaceIndex !== -1 &&
				linkSubStr[spaceIndex + 1] === '"' &&
				linkSubStr[linkSubStr.length - 1] === '"'
			) {
				title = linkSubStr.slice(spaceIndex + 2, linkSubStr.length - 1);
			}
			const actualLink = linkSubStr.slice(0, spaceIndex !== 1 ? spaceIndex : undefined);
			tokens.push(
				React.createElement(
					'a',
					{ key: linkSubStr[0], title: title ?? '', href: actualLink },
					parseText(linkText),
				),
			);
			tokenCount += 2;
			i = linkEndIndex;
		} else if (text[i] === '\\') {
			tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i + 1];
			i = i + 1;
			continue;
		} else {
			tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
		}
	}

	return tokens;
};

const getHeaderComp = (line: string) => {
	let i = 0;

	while (line[i] === '#') {
		i++;
	}
	if (i > 6) {
		return React.createElement(
			'p',
			{ key: line },
			parseText(line).filter(e => !!e),
		);
	}
	const HeaderComponent = `h${i}` as keyof JSX.IntrinsicElements;
	return React.createElement(
		HeaderComponent,
		{ key: line },
		parseText(line.slice(i)).filter(e => !!e),
	);
};

const renderLine = (line: string) => {
	line = line.trim();
	const elements: React.ReactNode[] = [];
	const headerMatch = line.match(/^(#+)\s(.+)$/);
	if (headerMatch) {
		elements.push(getHeaderComp(headerMatch, line));
	} else if (line.startsWith('>')) {
		elements.push(
			React.createElement('blockquote', { key: line.slice(1) }, renderLine(line.slice(1))),
		);
	} else if (line.startsWith('***') || line.startsWith('---') || line.startsWith('___')) {
		elements.push(React.createElement('hr', { key: `hr${line}` }));
	} else {
		const paragraphTokens = parseText(line);
		elements.push(React.createElement('p', { key: line }, paragraphTokens));
	}

	return elements;
};

function MarkDownToComponent({ text }: { text: string }) {
	const lines = text?.split('\n');
	let elements: React.ReactNode[] = [];
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (line.startsWith('\\')) {
			// \ escape next character
			const elements: React.ReactNode[] = [line[1]];
			elements.push(parseText(line.slice(2)));
		} else if (line.startsWith('#')) {
			// Headings
			elements.push(getHeaderComp(line));
		} else if (line.startsWith('>')) {
			// Blockquote
			let j = i + 1;
			let blockLines = [];
			blockLines.push(line.slice(1));
			while (lines[j] && lines[j].startsWith('>')) {
				blockLines.push(lines[j].slice(1));
				j++;
			}
			elements.push(
				React.createElement(
					'blockquote',
					{ key: blockLines.join('_') },
					blockLines.map(e => renderLine(e)),
				),
			);
			i = i + blockLines.length;
		} else if (line.match(/^\d+\.\s/)) {
			// Ordered list
			const currentListType: string = 'ordered';
			const listItems: string[] = [];
			let j = i;
			while (
				lines[j].match(/^\d+\.\s/) ||
				lines[j].startsWith('    ') ||
				lines[j].startsWith('\t')
			) {
				listItems.push(lines[j]);
				j++;
			}
			elements.push(processList(listItems, currentListType === 'ordered'));
			i = j - 1;
		} else if (
			line.startsWith('* ') ||
			line.startsWith('+ ') ||
			line.startsWith('- ') ||
			line.startsWith('_ ')
		) {
			// Unordered list
			const currentListType: string = 'unordered';
			const listItems: string[] = [];
			let j = i;
			while (
				lines[j]?.startsWith('* ') ||
				lines[j]?.startsWith('+ ') ||
				lines[j]?.startsWith('- ') ||
				lines[j]?.startsWith('_ ') ||
				lines[j]?.startsWith('    ') ||
				lines[j]?.startsWith('\t')
			) {
				listItems.push(lines[j]);
				j++;
			}
			elements.push(processList(listItems, currentListType === 'ordered'));
			i = j - 1;
		} else if (line.startsWith('!')) {
			// Image
			const tokens = parseText(line);
			elements.push(tokens);
		} else if (line.startsWith('[')) {
			// Link
			const tokens = parseText(line);
			elements.push(tokens);
		} else if (line.startsWith('***') || line.startsWith('---') || line.startsWith('___')) {
			// Horizontal line
			elements.push(React.createElement('hr', { key: `hr${i}${line}` }));
		} else {
			// Paragraph
			if (line === '') continue;
			const paragraphTokens = parseText(line);
			elements.push(React.createElement('p', { key: line }, paragraphTokens));
		}
	}
	return <div className="_markDownContent">{elements}</div>;
}

export default MarkDownToComponent;
