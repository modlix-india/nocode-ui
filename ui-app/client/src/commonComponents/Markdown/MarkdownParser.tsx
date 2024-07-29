import { deepEqual } from '@fincity/kirun-js';
import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { shortUUID } from '../../util/shortUUID';
import { parseFootNotesSection } from './parseFootNotesSection';
import { parseTextLine } from './parseTextLine';
import { makeRefsAndRemove } from './utils';

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
