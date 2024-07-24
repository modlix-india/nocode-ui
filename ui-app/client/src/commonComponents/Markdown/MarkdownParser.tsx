import React, { useMemo } from 'react';
import { MarkdownFootnoteRef, MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { cyrb53 } from '../../util/cyrb53';
import { parseLine } from './parseLine';
import { parseCodeBlock } from './parseCodeBlock';
import { parseHeaderLine } from './parseHeaderLine';
import { parseHrLine } from './parseHrLine';
import { makeRefsAndRemove, parseAttributes } from './utils';
import { parseInline } from './parseInline';
import { isNullValue } from '@fincity/kirun-js';
import { ORDERED_LIST_REGEX, UNORDERED_LIST_REGEX, parseLists } from './parseLists';
import { parseYoutubeEmbedding } from './parseYoutubeEmbedding';
import { parseFootNotesSection } from './parseFootNotesSection';
import { parseBlockQuote } from './parseBlockQuote';
import { parseTable } from './parseTable';

const HR_REGEX = /^[-*=_]{3,}$/;
const TABLE_REGEX = /^(\| )?(:)?-{3,}:?\s+(\|(:|\s+:?)-{3,}(:?\s*))*\|?$/;

export function MarkdownParser({
	text,
	styles,
	editable,
	onChange,
	className = '',
}: Readonly<{
	text: string;
	styles: any;
	editable?: boolean;
	onChange?: (text: string) => void;
	className?: string;
}>) {
	const parsedContent = useMemo(() => {
		const lines = text.split('\n');
		let comps: Array<React.JSX.Element | undefined> = [];

		const { footNoteRefs, urlRefs } = makeRefsAndRemove(lines);
		const footNotes = { currentRefNumber: 0, footNoteRefs };

		for (let i = 0; i < lines.length; i++) {
			let { lineNumber, comp } = parseTextLine({
				lines,
				lineNumber: i,
				editable,
				styles,
				footNotes,
				urlRefs,
			});
			i = lineNumber;
			if (Array.isArray(comp)) comps.push(...comp);
			else comps.push(comp);
		}

		comps.push(
			...parseFootNotesSection({
				lines: [],
				lineNumber: lines.length,
				editable,
				styles,
				footNotes,
				urlRefs,
			}),
		);

		return comps;
	}, [text]);

	return (
		<div className={`_markdown ${className}`} style={styles.markdownContainer ?? {}}>
			{parsedContent}
		</div>
	);
}

function parseTextLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, editable, styles } = params;
	let lineNumber = i;
	let line = lines[i].trim();

	if (!line) return { lineNumber, comp: undefined };

	let comp = undefined;

	if (/^https:\/\/((www\.)?youtube.com\/(watch|embed)|youtu.be\/)/i.test(line)) {
		({ lineNumber, comp } = parseYoutubeEmbedding(params));
	} else if (lineNumber + 1 < lines.length && TABLE_REGEX.test(lines[i + 1])) {
		({ lineNumber, comp } = parseTable(params));
	} else if (
		line.startsWith('#') ||
		line.startsWith('\\#') ||
		(i + 1 < lines.length && (lines[i + 1].startsWith('---') || lines[i + 1].startsWith('===')))
	) {
		({ lineNumber, comp } = parseHeaderLine(params));
	} else if (line.startsWith('```')) {
		({ lineNumber, comp } = parseCodeBlock(params));
	} else if (HR_REGEX.test(line)) {
		({ lineNumber, comp } = parseHrLine(params));
	} else if (ORDERED_LIST_REGEX.test(line) || UNORDERED_LIST_REGEX.test(line)) {
		({ lineNumber, comp } = parseLists(params));
	} else if (line.startsWith('>')) {
		({ lineNumber, comp } = parseBlockQuote(params));
	}

	if (!comp) {
		({ lineNumber, comp } = parseLine(params));
	}

	return { lineNumber, comp };
}
