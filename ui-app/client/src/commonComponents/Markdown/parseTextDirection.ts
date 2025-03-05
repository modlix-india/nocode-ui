import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseTextLine } from './parseTextLine';
import { cyrb53 } from '../../util/cyrb53';

const TEXT_DIRECTION_REGEX = /^:::\s*(rtl|ltr)\s*$/i;

export function parseTextDirection(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber, styles } = params;
	let i = lineNumber;
	const directionMatch = lines[i].match(TEXT_DIRECTION_REGEX);

	if (!directionMatch) return { lineNumber: i, comp: undefined };

	const direction = directionMatch[1].toLowerCase();
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
		...styles.textDirection,
		direction: direction,
		textAlign: direction === 'rtl' ? 'right' : 'left',
		unicodeBidi: 'embed',
	};

	const comp = React.createElement(
		'div',
		{
			key: cyrb53(`direction-${lineNumber}-${direction}`),
			className: `_textDirection _${direction}`,
			style,
		},
		...contentLines,
	);

	return { lineNumber: i, comp };
}
