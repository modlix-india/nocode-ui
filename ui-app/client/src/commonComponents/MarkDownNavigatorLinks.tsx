import React, { ReactNode } from 'react';
import { parseText } from './MarkDownToComponents';

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
}
