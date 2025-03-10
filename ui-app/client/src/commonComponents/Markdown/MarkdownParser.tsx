import { deepEqual } from '@fincity/kirun-js';
import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { shortUUID } from '../../util/shortUUID';
import { parseFootNotesSection } from './parseFootNotesSection';
import { parseTextLine } from './parseTextLine';
import { makeRefsAndRemove } from './utils';

export function MarkdownParser({
	componentKey,
	text,
	styles,
	editable,
	writable,
	onChange,
	className = '',
}: Readonly<{
	componentKey: string;
	text: string;
	styles: any;
	editable?: boolean;
	writable?: boolean;
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

	const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
		if (!writable || !onChange) return;

		const content = event.currentTarget.innerText;
		onChange(content);
	};

	const lines = text.split('\n');
	let comps: Array<React.JSX.Element | undefined> = [];

	const { footNoteRefs, urlRefs } = makeRefsAndRemove(lines);
	const footNotes = { currentRefNumber: 0, footNoteRefs };

	for (let i = 0; i < lines.length; i++) {
		let { lineNumber, comp } = parseTextLine({
			componentKey,
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
			componentKey,
			lines: [],
			lineNumber: lines.length,
			editable,
			styles,
			footNotes,
			urlRefs,
		}),
	);

	const handleSelection = () => {
		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		const selectedText = selection.toString();

		if (selectedText) {
			const rect = range.getBoundingClientRect();
			const event = new CustomEvent('markdown-selection', {
				detail: {
					text: selectedText,
					position: {
						x: rect.left + rect.width / 2,
						y: rect.top,
					},
				},
			});
			window.dispatchEvent(event);
		} else {
			window.dispatchEvent(new CustomEvent('markdown-selection-clear'));
		}
	};

	return (
		<div
			key={`${key}-${cyrb53(text)}`}
			className={`_markdown ${className}`}
			style={styles.markdownContainer ?? {}}
			contentEditable={writable}
			onInput={handleInput}
			onMouseUp={handleSelection}
			onKeyUp={handleSelection}
			suppressContentEditableWarning={true}
			spellCheck={false}
		>
			{comps}
		</div>
	);
}
