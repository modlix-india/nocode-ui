import React from 'react';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { cyrb53 } from '../../util/cyrb53';
import { parseAttributes } from './utils';
import { parseTextLine } from './parseTextLine';

export function parseBlockQuote(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber, styles } = params;

	// Step 1: Collect all lines belonging to this blockquote and strip outermost > prefix
	let i = lineNumber;
	const blockLines: string[] = [];

	for (; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (trimmed.startsWith('>')) {
			// Strip outermost > and optional single space after it
			let stripped = trimmed.substring(1);
			if (stripped.startsWith(' ')) stripped = stripped.substring(1);
			blockLines.push(stripped);
		} else if (
			trimmed === '' &&
			blockLines.length > 0 &&
			i + 1 < lines.length &&
			lines[i + 1].trim().startsWith('>')
		) {
			// Empty line between blockquote sections - continue the blockquote
			blockLines.push('');
		} else {
			break;
		}
	}

	if (blockLines.length === 0) {
		return { lineNumber, comp: undefined };
	}

	// Step 2: Parse the stripped content as a mini-document
	// Inner > lines will naturally trigger recursive parseBlockQuote calls
	const innerComps: React.JSX.Element[] = [];
	for (let j = 0; j < blockLines.length; j++) {
		const { lineNumber: newJ, comp } = parseTextLine({
			...params,
			lines: blockLines,
			lineNumber: j,
			line: undefined,
			indentationLength: undefined,
		});
		j = newJ;
		if (comp) {
			if (Array.isArray(comp)) innerComps.push(...comp);
			else innerComps.push(comp);
		}
	}

	// Step 3: Check for attributes after blockquote
	let attributes;
	let style = styles.blockQuotes;
	if (i < lines.length && lines[i]?.trim().startsWith('{')) {
		attributes = parseAttributes(lines[i].trim());
		if (attributes) {
			i++;
			if (attributes.style) {
				style = style ? { ...style, ...attributes.style } : attributes.style;
			}
		}
	}

	// Step 4: Wrap in blockquote
	const comp = React.createElement(
		'blockquote',
		{
			key: cyrb53(`blockQuote-${lineNumber}-${i}`),
			className: '_blockQuotes',
			...(attributes ?? {}),
			style,
		},
		...innerComps,
	);

	return { lineNumber: i - 1, comp };
}
