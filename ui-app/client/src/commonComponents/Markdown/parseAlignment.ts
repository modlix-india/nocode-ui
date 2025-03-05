import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseTextLine } from './parseTextLine';
import { parseAttributes } from './utils';
import { cyrb53 } from '../../util/cyrb53';

const ALIGNMENT_REGEX = /^:::\s*(left|center|right|justify)\s*$/i;

export function parseAlignment(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber, styles } = params;
	let i = lineNumber;
	const alignmentMatch = lines[i].match(ALIGNMENT_REGEX);

	if (!alignmentMatch) return { lineNumber: i, comp: undefined };

	const alignment = alignmentMatch[1].toLowerCase();
	const contentLines: React.JSX.Element[] = [];
	i++;

	while (i < lines.length) {
		const line = lines[i];
		if (line.trim() === ':::') break;

		const { comp } = parseTextLine({
			...params,
			lineNumber: i,
			line,
		});

		if (comp) {
			if (Array.isArray(comp)) {
				contentLines.push(...comp);
			} else {
				contentLines.push(comp);
			}
		}
		i++;
	}

	const style = {
		...styles.alignment,
		textAlign: alignment,
	};

	const comp = React.createElement(
		'div',
		{
			key: cyrb53(`alignment-${lineNumber}-${alignment}`),
			className: `_alignment _${alignment}`,
			style,
		},
		...contentLines,
	);

	return { lineNumber: i, comp };
}
