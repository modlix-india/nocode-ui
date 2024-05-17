import React from 'react';
import { parseText } from './MarkDownToComponents';
import { SubHelperComponent } from '../components/HelperComponents/SubHelperComponent';
import { ComponentDefinition } from '../types/common';

// used to create the heading tags
const getHeaderComp = (line: string, definition: ComponentDefinition) => {
	let i = 0;

	// iterate till the last #
	while (line[i] === '#') {
		i++;
	}

	// fetching the custom id "custom id starts with {#custom_id}"
	const idIndex = line.indexOf('{#');
	let id = '';
	const subComponentName = line.startsWith('##') ? '_h2' : '_h1';
	const newProps = {
		href: id,
		key: id,
		className: subComponentName,
		style: {
			display: 'block',
			cursor: 'pointer',
			lineHeight: '100%',
		},
	};
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

	newProps.href = `#${id}`;
	newProps.key = id;

	return (
		<a {...newProps}>
			{parseText(line).filter(e => !!e)}{' '}
			<SubHelperComponent
				definition={definition}
				subComponentName={subComponentName}
			></SubHelperComponent>
		</a>
	);
};

export default function MarkDownNavigatorLinks({
	text,
	filterOnlyH1s,
	filterBothH1sAndH2s,
	definition,
}: {
	text: string;
	filterOnlyH1s: boolean;
	filterBothH1sAndH2s: boolean;
	definition: ComponentDefinition;
}) {
	if (true) {
		// replace tabs with 4 spaces and then split every lines
		const lines = text?.replaceAll('\t', '    ').split('\n');
		let elements: React.ReactNode[] = [];

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (filterOnlyH1s && line.startsWith('#') && !line.startsWith('##')) {
				// Links for H1
				elements.push(getHeaderComp(line, definition));
			} else if (
				filterBothH1sAndH2s &&
				(line.startsWith('#') || line.startsWith('##')) &&
				!line.startsWith('###')
			) {
				// Links for H2
				elements.push(getHeaderComp(line, definition));
			}
		}
		// return <div className="_markdown_link_container">{elements}</div>;
		return <>{elements}</>;
	}
}
