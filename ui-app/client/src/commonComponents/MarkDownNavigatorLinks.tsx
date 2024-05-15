import React, { ReactNode } from 'react';
import MarkDownToComponents from './MarkDownToComponents';

const parseText = (text: string) => {
	// parsing line one character at a time
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
			// image line
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
		} else if (text[i] === '\\') {
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

	// fetching the custom id "custom id starts with {#custom_id}"
	const idIndex = line.indexOf('{#');
	let id = '';
	line = line.slice(i);
	// now create a heading tag according to the count of #
	const HeadingTag = `h${i}` as keyof JSX.IntrinsicElements;

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

	const newProps = {
		href: `#${id}`,
		key: id,
		style: {
			display: 'block',
			cursor: 'pointer',
		},
	};
	return React.createElement(
		'a',
		newProps,
		parseText(line).filter(e => !!e),
	);
};

export default function MarkDownNavigatorLinks({
	text,
	filterOnlyH1s,
	filterBothH1sAndH2s,
}: {
	text: string;
	filterOnlyH1s: boolean;
	filterBothH1sAndH2s: boolean;
}) {
	if (true) {
		// replace tabs with 4 spaces and then split every lines
		const lines = text?.replaceAll('\t', '    ').split('\n');
		let elements: React.ReactNode[] = [];

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (filterOnlyH1s && line.startsWith('#') && !line.startsWith('##')) {
				// Heading for H1
				elements.push(getHeaderComp(line));
			} else if (
				filterBothH1sAndH2s &&
				(line.startsWith('#') || line.startsWith('##')) &&
				!line.startsWith('###')
			) {
				// Heading for H2
				elements.push(getHeaderComp(line));
			}
		}
		return <div className="_markdown_link_container">{elements}</div>;
	}

	const elements: JSX.Element = MarkDownToComponents({ text: text ?? '' });

	// Accessing the children of the returned JSX element
	let children: React.ReactNode[] = elements.props.children;
	children = children
		.filter((element: ReactNode) => {
			const elem = element as React.ReactElement;
			return elem?.type == 'h1' || elem?.type == 'h2';
		})
		.map((element: ReactNode) => {
			const elem = element as React.ReactElement;
			const newProps = {
				href: `#${elem?.props?.id}`,
				key: elem?.props?.id,
				style: {
					display: 'block',
					cursor: 'pointer',
				},
			};
			return React.createElement('a', newProps, elem?.props.children);
		});

	return <div className="_markdown_link_container">{children}</div>;
}
