import React, { ReactElement, ReactNode } from 'react';

const unorderedCondition = (text: string) =>
	text.startsWith('* ') || text.startsWith('+ ') || text.startsWith('_ ');

const taskListCondition = (text: string) =>
	text.startsWith('- [x] ') || text.startsWith('- [X] ') || text.startsWith('- [ ] ');

const findLevel = (text: string) => {
	let level = 1;
	if (!text.startsWith('    ')) return -1;
	while (text.startsWith('    ')) {
		level++;
		text = text.slice(4);
	}
	if (unorderedCondition(text) || taskListCondition(text) || text.match(/^\d+\.\s/)) {
		return level;
	} else return -1;
};

const processList = (listItems: string[], isOrdered: boolean, level = 1) => {
	const finalList = [];
	let subList: Array<{ line: Array<string>; type: 'ordered' | 'unordered' }> = [];
	let currentIndex = 0;
	let prevType: 'ordered' | 'unordered' = isOrdered == true ? 'ordered' : 'unordered';
	let start = isOrdered ? listItems[0]?.slice(0, 1) : '1';
	for (let i = 0; i < listItems.length; i++) {
		// looping throught list items
		if (listItems[i + 1]?.startsWith('    '.repeat(level))) {
			// if next has sublist

			let j = i + 1;
			while (listItems[j]?.startsWith('    ')) {
				// k holds the sliced string removing current levels indentation

				let k = '';
				k = listItems[j].slice('    '.repeat(level).length);

				if (unorderedCondition(k)) {
					// unordered list is next sublist
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: 'unordered' };
					if (prevType === 'unordered') {
						// if prev type is unordered we push to prev array
						subList[currentIndex].line.push(k);
					} else {
						// if prev type is ordered we create new sublist in next index
						subList[currentIndex + 1] = { line: [k], type: 'unordered' };
						currentIndex += 1;
						prevType = 'unordered';
					}
				} else if (k.match(/^\d+\.\s/)) {
					// ordered list is next sublist
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: 'ordered' };
					if (prevType === 'ordered') {
						// if prev type is ordered we push to prev array
						subList[currentIndex].line.push(k);
					} else {
						// if prev type is unordered we create new sublist in next index
						subList[currentIndex + 1] = { line: [k], type: 'ordered' };
						currentIndex += 1;
						prevType = 'ordered';
					}
				} else if (taskListCondition(k)) {
					// unordered list is next task sublist
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: 'unordered' };
					if (prevType === 'unordered') {
						// if prev type is unordered we push to prev array
						subList[currentIndex].line.push(k);
					} else {
						// if prev type is ordered we create new sublist in next index
						subList[currentIndex + 1] = { line: [k], type: 'unordered' };
						currentIndex += 1;
						prevType = 'unordered';
					}
				} else {
					// its sub sub level, so push to sublist and wait for next iteration
					subList[currentIndex] = subList[currentIndex]?.line
						? subList[currentIndex]
						: { line: [], type: prevType };

					subList[currentIndex].line.push(listItems[j]);
				}
				j++;
			}
			// render current item plus any sublists through recursion
			finalList.push(
				<li
					className={`${taskListCondition(listItems[i]) && 'taskList'}`}
					key={`${listItems[i]}_${subList.map(e => e.line).join('_')}`}
				>
					{!listItems[i].startsWith('- [x] ') &&
					!listItems[i].startsWith('- [X] ') &&
					!listItems[i].startsWith('- [ ] ')
						? renderLine(listItems[i].slice(isOrdered ? 3 : 2))
						: renderLine(listItems[i])}

					{subList.map(e => processList(e.line, e.type === 'ordered', level + 1))}
				</li>,
			);
			i = j - 1;
			// empty sublist so items dont repeat when we have multiple sublists
			subList = [];
		} else {
			// normal list rendering when next item does not have sub list
			let k = listItems[i];
			if (listItems[i]?.startsWith('    '.repeat(level))) {
				k = listItems[i].slice('    '.repeat(level).length);
			}
			finalList.push(
				<li className={`${taskListCondition(k) && 'taskList'}`} key={k}>
					{!k.startsWith('- [x] ') && !k.startsWith('- [X] ') && !k.startsWith('- [ ] ')
						? renderLine(k.slice(isOrdered ? 3 : 2))
						: renderLine(k)}
				</li>,
			);
		}
	}
	// final return
	if (isOrdered) {
		return (
			<ol start={isNaN(parseInt(start)) ? 1 : parseInt(start)} key={listItems.join('_')}>
				{finalList}
			</ol>
		);
	} else return <ul key={listItems.join('_')}>{finalList}</ul>;
};

const processLink = (text: string, i: number, isVideo: boolean) => {
	const endIndex = text.indexOf(']', i + 2);
	if (endIndex === -1 || text[endIndex + 1] !== '(') {
		return { token: text[i], index: i };
	}

	const linkEndIndex = text.indexOf(')', endIndex);
	if (linkEndIndex === -1) {
		return { token: text[i], index: i };
	}

	let linkSubStr: string | string[] = text.slice(endIndex + 2, linkEndIndex);
	const spaceIndex = linkSubStr.indexOf(' ');
	const actualLink = linkSubStr.slice(0, spaceIndex !== -1 ? spaceIndex : undefined);

	if (isVideo) {
		let controls = '';
		if (
			spaceIndex !== -1 &&
			linkSubStr[spaceIndex + 1] === '"' &&
			linkSubStr[linkSubStr.length - 1] === '"'
		) {
			controls = linkSubStr.slice(spaceIndex + 2, linkSubStr.length - 1);
		}
		return {
			token: React.createElement('video', {
				src: actualLink,
				controls: controls === 'controls',
				autoPlay: true,
				muted: true,
				loading: 'lazy',
			}),
			index: linkEndIndex,
		};
	} else {
		const altText = text.slice(i + 2, endIndex);
		let title = '';
		if (
			spaceIndex !== -1 &&
			linkSubStr[spaceIndex + 1] === '"' &&
			linkSubStr[linkSubStr.length - 1] === '"'
		) {
			title = linkSubStr.slice(spaceIndex + 2, linkSubStr.length - 1);
		}
		return {
			token: React.createElement('img', {
				key: linkSubStr,
				title: title ?? '',
				src: actualLink,
				loading: 'lazy',
				alt: altText,
			}),
			index: linkEndIndex,
		};
	}
};

export const parseText = (text: string) => {
	// parsing line one character at a time
	let tokens: Array<React.ReactNode> = [];
	let tokenCount = 0;
	for (let i = 0; i < text.length; i++) {
		// for strong and emhasis text
		if (text[i] === '*' || text[i] === '_') {
			let chaar = text[i];
			if (text[i + 1] === chaar) {
				if (text[i + 2] === chaar) {
					// Triple asterisks, treat as strong and emhasis
					// here we are checking if the text is wrapped with triple '***' or not. If not then then don't do anything just add it into the token.
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
					// Double asterisk, only treat as 'strong' tag
					// here we are checking if the text is wrapped with '**' or not. If not then then don't do anything just add it into the token.
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
				// Single asterisk, only treat as 'emphasis' tag
				// here we are checking if the text is wrapped with '*' or not. If not then then don't do anything just add it into the token.
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
		} else if (text[i] === '`') {
			// single code line
			let endIndex = -1;
			if (text[i + 1] === '`') {
				// using double `` to escape single backtick
				endIndex = text.indexOf('``', i + 2);
				if (endIndex === -1) {
					tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
					continue;
				}
				tokens.push(
					React.createElement(
						'code',
						{ key: `code_${text.slice(i + 2, endIndex)}` },
						text
							?.slice(i + 2, endIndex)
							.split('')
							.map((e, i) => {
								if (e === ' ') return <>&nbsp;</>;
								else return e;
							}),
					),
				);
				tokenCount += 2;
				i = endIndex + 1;
			} else {
				// single tick code line
				endIndex = text.indexOf('`', i + 1);
				if (endIndex === -1) {
					tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
					continue;
				}
				tokens.push(
					React.createElement(
						'code',
						{ key: text },
						text
							?.slice(i + 1, endIndex)
							.split('')
							.map((e, i) => {
								if (e === ' ') return <>&nbsp;</>;
								else return e;
							}),
					),
				);
				tokenCount += 2;
				i = endIndex;
			}
		} else if (text[i] === '!') {
			let result;
			if (text[i + 1] === '!') {
				//video line
				if (text[i + 2] !== '[') {
					tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
					continue;
				}
				result = processLink(text, i, true);
			} else {
				// image line
				if (text[i + 1] !== '[') {
					tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
					continue;
				}
				result = processLink(text, i, false);
			}
			tokens.push(result.token);
			tokenCount += 2;
			i = result.index;
		} else if (text[i] === '[') {
			// link line
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
		} else if (text[i] === '=') {
			// highlight text
			const endIndex = text.indexOf('=', i + 1);
			if (endIndex === -1) {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}
			const highlightText = text.slice(i + 1, endIndex);
			if (highlightText.trim() === '') {
				tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
				continue;
			}

			tokens.push(React.createElement('mark', {}, parseText(highlightText)));

			tokenCount += 2;
			i = endIndex;
		} else if (text[i] === '\\') {
			/**
			 * we are using double '\\' here because the first '\' will get skipped in this
			 * So, '\\' means '\'
			 */
			// escape escape
			tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i + 1];
			i = i + 1;
			continue;
		} else {
			// normal text
			tokens[tokenCount] = (tokens[tokenCount] ?? '') + text[i];
		}
	}

	return tokens;
};

// used to create the heading tags
const getHeaderComp = (line: string) => {
	let i = 0;

	// iterate till the last #
	while (line[i] === '#') {
		i++;
	}
	// if there are more than seven # then wrap the text into a <p> tag.
	if (i > 6 || line[i] !== ' ') {
		//	React.createElement(type, props, ...children)
		return React.createElement(
			'p',
			{ key: line },
			parseText(line).filter(e => !!e),
		);
	}
	// fetching the custom id "custom id starts with {#custom_id}"
	const idIndex = line.indexOf('{#');
	let id = '';
	line = line.slice(i);
	// now create a heading tag according to the count of #
	const HeadingTag = `h${i}` as keyof JSX.IntrinsicElements;

	if (i <= 2) {
		if (idIndex === -1) {
			// create new id
			id = line
				.replace(/[^\w\s]/gi, '')
				.replace(/\s+/g, '')
				.toLowerCase();
		} else if (idIndex != -1 && line.indexOf('}', idIndex) !== -1) {
			id = line.slice(idIndex + 2, line.indexOf('}', idIndex)).toLocaleLowerCase();
			line = line.slice(0, idIndex) + line.slice(line.indexOf('}', idIndex) + 1);
		}
		return React.createElement(
			HeadingTag,
			{ key: line, id: `${id}` },
			parseText(line).filter(e => !!e),
		);
	}

	// we don't need to use lastIndexOf because indexOf(str, startIndex) will give the greater index then '{#'
	if (idIndex != -1 && line.indexOf('}', idIndex) !== -1) {
		id = line.slice(idIndex + 2, line.indexOf('}', idIndex));
		// removing the custom_id code from the line.
		line = line.slice(0, idIndex) + line.slice(line.indexOf('}', idIndex) + 1);
	}

	return React.createElement(
		HeadingTag,
		{ key: line, id },
		parseText(line).filter(e => !!e),
	);
};

const renderLine = (line: string) => {
	line = line.trim();
	const elements: React.ReactNode[] = [];
	if (line.startsWith('#')) {
		elements.push(getHeaderComp(line));
	} else if (line.startsWith('>')) {
		// there can be multiple '>' so for that are we using recursion.
		elements.push(
			React.createElement('blockquote', { key: line.slice(1) }, renderLine(line.slice(1))),
		);
	} else if (line.startsWith('***') || line.startsWith('---') || line.startsWith('___')) {
		// we can't give 'hr' tag signs in the middle of some line they will be the only text sign in the
		elements.push(React.createElement('hr', { key: `hr${line}` }));
	} else if (taskListCondition(line)) {
		const checkbox = React.createElement('input', {
			type: 'checkbox',
			checked: line.startsWith('- [x] ') || line.startsWith('- [X] '),
			disabled: true,
			key: `tl_${line}`,
		});
		const label = React.createElement('label', null, line.slice(6));
		// Wrap the checkbox and label inside a Fragment
		const fragment = React.createElement(React.Fragment, null, checkbox, label);
		elements.push(fragment);
	} else if (line.trim() === '') {
		// creating line breaks on return or enter
		elements.push(
			React.createElement('br', { key: `br_${line}_${Math.random().toString(36)}` }),
		);
	} else {
		const paragraphTokens = parseText(line);
		elements.push(React.createElement('p', { key: line }, paragraphTokens));
	}

	return elements;
};

const getCols = (text: string) => {
	text = text.trim();
	const list = [];
	let prevIndex = 0;
	let i = 0;
	while (i < text.length) {
		if (text[i] === '|') {
			if (i === 0) {
				prevIndex = i + 1;
			} else {
				list.push(text.slice(prevIndex, i).trim());
				prevIndex = i + 1;
			}
		}
		i++;
	}

	// if the last char is '|' then it will add an empty string into the list. But this we don't want is case of headers. So I removed it for every line.
	if (text[text.length - 1] !== '|') {
		list.push(text.slice(prevIndex, i).trim());
	}
	return list;
};

const isTableSeparater = (text: string, colCount: number) => {
	// The seperater line can only have '|', '-', space and ':'.
	const regex = /[^|\-: ]/;

	if (regex.test(text)) {
		return false;
	}

	const headerColumns = text
		.trim()
		.split('|')
		.filter(Boolean)
		.map(str => str.trim());

	return colCount === headerColumns.length;
};

const renderTable = (validTableRows: string[][], line: string) => {
	const tableRows: ReactNode[] = [];
	let a = 0;
	for (a = 0; a < validTableRows.length; a++) {
		const rowColumns = [];
		let colNo = 0;
		for (const colText of validTableRows[a]) {
			if (colNo >= validTableRows[0].length) {
				break;
			}
			let ele;
			if (a === 0) {
				ele = React.createElement('th', { key: colText }, parseText(colText));
			} else {
				ele = React.createElement('td', { key: colText }, parseText(colText));
			}
			rowColumns.push(ele);
			colNo++;
		}

		tableRows.push(
			React.createElement(
				'tr',
				{
					key: `${a === 0 ? 'tableHeader' : 'tableRow'}${validTableRows[a].join()}`,
				},
				rowColumns,
			),
		);
	}

	let tableHead = null;
	if (tableRows.length > 0) {
		tableHead = React.createElement('thead', { key: 'thead' }, tableRows[0]);
	}

	let tableBody = null;
	if (tableRows.length > 1) {
		tableBody = React.createElement('tbody', { key: 'tbody' }, tableRows.slice(1));
	}

	const table = React.createElement('table', { key: `${line.split('|').join()}` }, [
		tableHead,
		tableBody,
	]);
	return table;
};

const isValidGridStart = (text: string) => {
	let cnt$ = 0;
	let cnt_ = 0;
	for (let i = 0; i < text.length; i++) {
		if (i % 2 == 0 && text[i] === '$') {
			cnt$++;
		} else if (i % 2 == 1 && text[i] === '_') {
			cnt_++;
		} else {
			return -1;
		}
	}
	return cnt$ === cnt_ ? cnt$ : -1;
};

const getGridColumnSize = (text: string) => {
	let cnt$ = 0;
	let cnt_ = 0;
	for (let i = 0; i < text.length; i++) {
		// column representation should start and end with '$'
		if ((i == 0 && text[i] !== '$') || (i === text.length - 1 && text[i] !== '$')) {
			return -1;
		} else if (text[i] === '$' || text[i] === '_') {
			text[i] === '$' ? cnt$++ : cnt_;
		} else {
			return -1;
		}
	}
	return cnt$ > cnt_ ? cnt$ : -1;
};

function MarkDownToComponents({ text }: { text: string }) {
	// replace tabs with 4 spaces and then split every lines
	const lines = text?.replaceAll('\t', '    ').split('\n');
	let elements: React.ReactNode[] = [];
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (line.startsWith('\\')) {
			// \ escape next character
			elements.push(parseText(line.slice(2)));
		} else if (line.startsWith('#')) {
			// Headings
			elements.push(getHeaderComp(line));
		} else if (line.startsWith('>')) {
			// Blockquote
			// j will iterate through all the line untill one line is empty
			let j = i + 1;
			// will store all the block lines in it.
			let blockLines = [];
			// removing blockqoute sign '>'
			blockLines.push(line.slice(1));
			// we will break the blockqoutes when there is an empty line.
			while (lines[j] && lines[j]?.trim() !== '') {
				// if the line starts with '>' then add the line into the blockLines array.
				if (lines[j].startsWith('>')) {
					blockLines.push(lines[j].slice(1));
				} else {
					// if the line don't start with '>' and it's not empty then add the line text into the last blockqoute line.
					blockLines[(blockLines.length ?? 1) - 1] += ' ' + lines[j];
				}
				j++;
			}
			elements.push(
				React.createElement(
					'blockquote',
					{ key: blockLines.join('_'), className: '_topLevel_blockquote' },
					blockLines.map(e => renderLine(e)),
				),
			);
			i = j;
		} else if (line.match(/^\d+\.\s/)) {
			// Ordered list
			let currentLevel = 1;
			const currentListType: string = 'ordered';
			const listItems: string[] = [];
			let j = i;
			while (
				j < lines.length &&
				(lines[j].match(/^\d+\.\s/) || lines[j].startsWith('    '))
			) {
				if (lines[j].match(/^\d+\.\s/)) listItems.push(lines[j]);

				if (lines[j].startsWith('    ')) {
					let level = findLevel(lines[j]);

					if (level === -1) {
						listItems[listItems.length - 1] += lines[j];
					} else if (level <= currentLevel + 1) {
						listItems.push(lines[j]);
						currentLevel = level;
					} else {
						listItems[listItems.length - 1] += lines[j];
					}
				}

				j++;
			}
			elements.push(processList(listItems, currentListType === 'ordered'));
			i = j - 1;
		} else if (unorderedCondition(line)) {
			// Unordered list
			let currentLevel = 1;
			const currentListType: string = 'unordered';
			const listItems: string[] = [];
			let j = i;
			while (
				j < lines.length &&
				(unorderedCondition(lines[j]) || lines[j]?.startsWith('    '))
			) {
				if (unorderedCondition(lines[j])) {
					listItems.push(lines[j]);
				} else if (lines[j].startsWith('    ')) {
					let level = findLevel(lines[j]);
					if (level === -1) {
						listItems[listItems.length - 1] += lines[j];
					} else if (level <= currentLevel + 1) {
						// new updated level can only be 1 greater than the current level.
						listItems.push(lines[j]);
						currentLevel = level;
					} else {
						// here our level and currentlevel difference is more than '1' So we are concatenating it in the previous line
						listItems[listItems.length - 1] += lines[j];
					}
				}
				j++;
			}
			elements.push(processList(listItems, currentListType === 'ordered'));
			i = j - 1;
		} else if (taskListCondition(line)) {
			// checkbox / tasks list
			// first create an unorder list and then create li and then checkbox with text.
			let currentLevel = 1;
			const currentListType: string = 'unordered';
			const listItems: string[] = [];
			let j = i;
			while (
				j < lines.length &&
				(taskListCondition(lines[j]) || lines[j]?.startsWith('    '))
			) {
				if (taskListCondition(lines[j])) {
					listItems.push(lines[j]);
				} else if (lines[j].startsWith('    ')) {
					let level = findLevel(lines[j]);

					if (level === -1) {
						listItems[listItems.length - 1] += lines[j];
					} else if (level <= currentLevel + 1) {
						listItems.push(lines[j]);
						currentLevel = level;
					} else {
						listItems[listItems.length - 1] += lines[j];
					}
				}
				j++;
			}
			elements.push(processList(listItems, currentListType === 'ordered'));
			i = j - 1;
		} else if (line.startsWith('```')) {
			// code blocks
			let endIndex = line.indexOf('```', 3);
			if (endIndex !== -1) {
				elements.push(
					React.createElement(
						'code',
						{ key: `code_${line.slice(3, endIndex)}` },
						line
							.slice(3, endIndex)
							.split('')
							.map((e, i) => {
								if (e === ' ') return <>&nbsp;</>;
								else return e;
							}),
					),
				);
				if (line.slice(endIndex + 3).trim() !== '') {
					elements.push(parseText(line.slice(endIndex + 3)));
				}
			} else {
				let code = line.slice(3);
				let j = i + 1;
				while (j < lines.length && !lines[j].startsWith('```')) {
					code += lines[j] + '\n';
					j++;
				}

				elements.push(
					React.createElement(
						'pre',
						{ key: `pre_${code}` },
						React.createElement('code', { key: `code_${code}` }, code),
					),
				);
				i = j;
			}
		} else if (line.startsWith('`')) {
			// single line code
			const tokens = parseText(line);
			elements.push(tokens);
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
			// there is some more text rather than just '***' so we parse the whole line along with '***'
			if (line.slice(3).trim() !== '') {
				elements.push(parseText(line));
			} else elements.push(React.createElement('hr', { key: `hr${i}${line}` }));
		} else if (line.startsWith('|') || line.includes('|')) {
			let rows = [];
			let j = i;
			while (j < lines.length && lines[j]?.trim() !== '') {
				rows.push(lines[j]);
				j++;
			}

			let validTableRows = [];
			let a = 0;
			for (a = 0; a < rows.length; a++) {
				let text = rows[a];
				if (a === 0) {
					const header = getCols(text);
					validTableRows.push(header);
					if (header.length === 0) {
						rows = [];
						break;
					}
				} else if (validTableRows.length > 0 && validTableRows[0].length > 0) {
					if (a === 1) {
						// if there is no seperater between table header and table rows then we can't even show the header also then just make both the rows and validTAbleRows empty array.
						if (!isTableSeparater(text, validTableRows[0].length)) {
							rows = [];
							validTableRows = [];
							break;
						}
					} else {
						let cols = getCols(text);
						if (validTableRows.length > 0 && cols.length > 0) {
							validTableRows.push(cols);
						}
					}
				} else {
					// header is empty then we can't go to next row
					rows = [];
				}
			}

			// not valid table so will just continue from here.
			if (validTableRows.length === 0) {
				const paragraphTokens = parseText(line);
				elements.push(React.createElement('p', { key: line }, paragraphTokens));
				continue;
			}

			let table = renderTable(validTableRows, line);

			elements.push(table);

			i = j;
		} else if (line.startsWith('$') || line.includes('$')) {
			const maxColCount = isValidGridStart(line);
			if (maxColCount === -1) {
				const paragraphTokens = parseText(line);
				elements.push(React.createElement('p', { key: line }, paragraphTokens));
				continue;
			}

			let stack = [];

			const grid: ReactElement[] = [];
			let currentGridRow: ReactElement[] = [];
			let j = i + 1;
			let currRow = 1;
			let curColStart = 1;
			let remainingColCount = maxColCount;
			while (j < lines.length && lines[j] !== line && lines[j]?.trim() !== '') {
				// it means where the current column is end.
				const currColEnd = getGridColumnSize(lines[j]?.trim());
				const currColSize = currColEnd - curColStart + 1;

				// if it's not valid column start (like: '$','$$','$_$$' etc) then just break here.
				if (currColEnd === -1) {
					const paragraphTokens = parseText(lines[j]);
					elements.push(React.createElement('p', { key: lines[j] }, paragraphTokens));
					break;
				} else if (currColSize > maxColCount) {
					// not a valid column beacause the column size is greater then the maxColCount so just break the loop and create row for already stored columns.
					grid.push(
						React.createElement(
							'div',
							{ key: `row${currRow}`, className: `row${currRow}` },
							currentGridRow,
						),
					);
					break;
				} else if (currColEnd < curColStart || currColSize > remainingColCount) {
					// means now I have to start new row and close the current row.
					currentGridRow.push(
						React.createElement('div', {
							key: `${currRow}${curColStart}-${currColEnd}`,
							style: {
								flex: 1,
							},
						}),
					);
					grid.push(
						React.createElement(
							'div',
							{
								key: `row${currRow}`,
								className: `row${currRow}`,
								style: { display: 'flex' },
							},
							currentGridRow,
						),
					);

					remainingColCount = maxColCount;
					currentGridRow = [];
					currRow++;
					curColStart = 1;
					continue;
				}

				// we can set the start index here because till now we already know that it is a valid column.
				let currColDataStartIndex = j;
				stack.push([lines[j].trim(), j]);
				let currentColumnText: string = '';
				let k = j + 1;
				let currColDataEndIndex = 0;
				while (k < lines.length && stack.length > 0) {
					if (
						lines[k].startsWith('$') &&
						(isValidGridStart(lines[k]) !== -1 || getGridColumnSize(lines[k]) !== -1)
					) {
						if (stack[stack.length - 1][0] === lines[k]) {
							if (stack[stack.length - 1][1] === currColDataStartIndex) {
								currColDataEndIndex = k;
								currColDataStartIndex++;
							}
							stack.pop();
						} else {
							stack.push([lines[k], k]);
						}
					}
					k++;
				}

				while (currColDataStartIndex < currColDataEndIndex) {
					if (currColDataStartIndex === currColDataEndIndex - 1) {
						currentColumnText += lines[currColDataStartIndex] ?? '';
					} else {
						currentColumnText += (lines[currColDataStartIndex] ?? '') + '\n';
					}

					currColDataStartIndex++;
				}
				let currColEle = MarkDownToComponents({ text: currentColumnText });
				currentColumnText = '';

				const children = currColEle.props.children;
				if (children) {
					currColEle = React.createElement(
						'div',
						{
							key: `row${currRow}col${curColStart}-${currColEnd}`,
							className: `row${currRow}col${currColEnd}`,
							style: {
								width: `${(currColSize * 100) / maxColCount}%`,
							},
						},
						children,
					);
					remainingColCount -= currColSize;
					curColStart = currColEnd + 1;
				}

				currentGridRow.push(currColEle);

				if (remainingColCount == 0) {
					grid.push(
						React.createElement(
							'div',
							{
								key: `row${currRow}`,
								className: `row${currRow}`,
								style: { display: 'flex' },
							},
							currentGridRow,
						),
					);
					remainingColCount = maxColCount;
					currentGridRow = [];
					currRow++;
					curColStart = 1;
				}

				j = k;
			}

			if (currentGridRow.length > 0) {
				currentGridRow.push(
					React.createElement('div', {
						key: `${currRow}${curColStart}-${maxColCount}`,
						style: {
							flex: 1,
						},
					}),
				);
				grid.push(
					React.createElement(
						'div',
						{
							key: `row${currRow}`,
							className: `row${currRow}`,
							style: { display: 'flex' },
						},
						currentGridRow,
					),
				);
			}

			elements.push(grid);
			i = j;
		} else if (line.trim() === '') {
			// creating line breaks on return or enter
			elements.push(React.createElement('br', { key: `br_${line}_${i}` }));
		} else if (line.startsWith('*')) {
			elements.push(parseText(line));
		} else {
			// Paragraph
			if (line === '') continue;
			const paragraphTokens = parseText(line);
			elements.push(React.createElement('p', { key: line }, paragraphTokens));
		}
	}
	return <div className="_markDownContent">{elements}</div>;
}

export default MarkDownToComponents;
