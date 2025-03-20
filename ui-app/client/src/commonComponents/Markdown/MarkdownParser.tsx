import { deepEqual } from '@fincity/kirun-js';
import React, { useState } from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { shortUUID } from '../../util/shortUUID';
import { EditBox } from './EditBox';
import { parseFootNotesSection } from './parseFootNotesSection';
import { parseTextLine } from './parseTextLine';
import { makeRefsAndRemove } from './utils';

export function MarkdownParser({
	componentKey,
	text,
	styles,
	editable,
	onChange,
	className = '',
}: Readonly<{
	componentKey: string;
	text: string;
	styles: any;
	editable?: boolean;
	onChange?: (text: string) => void;
	className?: string;
}>) {
	const [_, setStyleState] = React.useState(styles);
	const [key, setKey] = React.useState(shortUUID());
	const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

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

	// Handle content change from an EditBox
	const handleContentChange = (newContent: string, lineIndex: number) => {
		if (!onChange) return;

		// Create a new array of lines with the updated content
		const updatedLines = [...lines];

		// Ensure we're updating the correct line
		if (lineIndex >= 0 && lineIndex < updatedLines.length) {
			updatedLines[lineIndex] = newContent;
		} else if (lineIndex >= updatedLines.length) {
			// Add new lines if needed
			while (updatedLines.length <= lineIndex) {
				updatedLines.push('');
			}
			updatedLines[lineIndex] = newContent;
		}

		// Call onChange with the updated text
		onChange(updatedLines.join('\n'));
	};

	// Handle adding a new component after a specific line
	const handleAddComponent = (afterLineIndex: number, componentType: string) => {
		if (!onChange) return;

		// Create the markdown content for the selected component type
		let componentContent = '';

		// Map component types to their markdown representation
		switch (componentType) {
			case 'heading1':
				componentContent = '# Heading 1';
				break;
			case 'heading2':
				componentContent = '## Heading 2';
				break;
			case 'heading3':
				componentContent = '### Heading 3';
				break;
			case 'bulletList':
				componentContent = '- List item';
				break;
			case 'numberedList':
				componentContent = '1. List item';
				break;
			case 'taskList':
				componentContent = '- [ ] Task item';
				break;
			case 'blockquote':
				componentContent = '> Blockquote';
				break;
			case 'codeBlock':
				componentContent = '```\nCode block\n```';
				break;
			case 'table':
				componentContent = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
				break;
			case 'image':
				componentContent = '![Image description](https://example.com/image.jpg)';
				break;
			case 'link':
				componentContent = '[Link text](https://example.com)';
				break;
			case 'horizontalRule':
				componentContent = '---';
				break;
			default:
				componentContent = componentType || '';
		}

		// Insert the component content after the specified index
		const updatedLines = [...lines];
		updatedLines.splice(afterLineIndex + 1, 0, componentContent);

		// Call onChange with the updated text
		onChange(updatedLines.join('\n'));
	};

	// Process each line
	for (let i = 0; i < lines.length; i++) {
		let { lineNumber, comp } = parseTextLine({
			componentKey,
			lines,
			lineNumber: i,
			editable: false, // We'll handle editability at this level instead
			styles,
			footNotes,
			urlRefs,
		});

		i = lineNumber;

		// If in editable mode, wrap each component in an EditBox
		if (editable && comp) {
			const originalContent = lines[i];
			const isEmpty = originalContent.trim() === '';

			comp = (
				<EditBox
					key={`editbox-${i}`}
					originalContent={originalContent}
					lineIndex={i}
					onContentChange={handleContentChange}
					onFocus={() => setEditingLineIndex(i)}
					onBlur={() => setEditingLineIndex(null)}
					onAddComponent={handleAddComponent}
					isEmpty={isEmpty}
				>
					{comp}
				</EditBox>
			);
		}

		if (Array.isArray(comp)) comps.push(...comp);
		else comps.push(comp);
	}

	// Add footnotes section
	const footnotesComps = parseFootNotesSection({
		componentKey,
		lines: [],
		lineNumber: lines.length,
		editable: false,
		styles,
		footNotes,
		urlRefs,
	});

	if (editable && footnotesComps.length > 0) {
		comps.push(
			<EditBox
				key={`editbox-footnotes-${cyrb53(text)}`}
				originalContent=""
				lineIndex={lines.length}
				onContentChange={handleContentChange}
				onAddComponent={handleAddComponent}
				isEmpty={true}
			>
				{footnotesComps}
			</EditBox>,
		);
	} else {
		comps.push(...footnotesComps);
	}

	// If there are no components and we're in editable mode, add an empty one
	if (editable && comps.length === 0) {
		comps.push(
			<EditBox
				key="editbox-empty"
				originalContent=""
				lineIndex={0}
				onContentChange={handleContentChange}
				onAddComponent={handleAddComponent}
				isEmpty={true}
			>
				<p></p>
			</EditBox>,
		);
	}

	return (
		<div
			key={`${key}-${cyrb53(text)}`}
			className={`_markdown ${className} ${editable ? '_editable' : ''}`}
			style={styles.markdownContainer ?? {}}
		>
			{comps}
		</div>
	);
}
