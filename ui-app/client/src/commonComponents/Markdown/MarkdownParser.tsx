import { deepEqual } from '@fincity/kirun-js';
import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { shortUUID } from '../../util/shortUUID';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseBlockQuote } from './parseBlockQuote';
import { parseCodeBlock } from './parseCodeBlock';
import { parseFootNotesSection } from './parseFootNotesSection';
import { parseHeaderLine } from './parseHeaderLine';
import { parseHrLine } from './parseHrLine';
import { parseLine } from './parseLine';
import { ORDERED_LIST_REGEX, UNORDERED_LIST_REGEX, parseLists } from './parseLists';
import { parseTable } from './parseTable';
import { parseYoutubeEmbedding } from './parseYoutubeEmbedding';
import { makeRefsAndRemove } from './utils';

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
	const [_, setStyleState] = React.useState(styles);
	const [key, setKey] = React.useState(shortUUID());

	React.useEffect(() => {
		setStyleState((existing: any) => {
			if (deepEqual(existing, styles)) return existing;
			setKey(shortUUID());
			return styles;
		});
	}, [styles, setKey]);

	const lines = text.split('\n');
	let comps: Array<React.JSX.Element | undefined> = [];

	const { footNoteRefs, urlRefs } = makeRefsAndRemove(lines);
	const footNotes = { currentRefNumber: 0, footNoteRefs };

	console.log(lines);

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

	return (
		<div
			key={`${key}-${cyrb53(text)}`}
			className={`_markdown ${className}`}
			style={styles.markdownContainer ?? {}}
		>
			{comps}
		</div>
	);
}

function parseTextLine(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lines, lineNumber: i, editable, styles } = params;
	let lineNumber = i;
	let line = lines[i].trim();

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
