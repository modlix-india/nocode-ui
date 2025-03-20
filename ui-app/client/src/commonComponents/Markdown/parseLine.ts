import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseInline } from './parseInline';
import { parseAttributes } from './utils';

export function parseLine(
	params: MarkdownParserParameters & { line?: string },
): MarkdownParserReturnValue {
	const { lines, lineNumber: i, styles, line, onChange, editable } = params;
	const key = `${cyrb53(line ?? lines[i])}-${i}`;
	let lineNumber = i;
	let style = styles.p;
	const attrs = parseAttributes(lines[lineNumber + 1]);
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}

	const currentLine = (line ?? lines[i]).substring(params.indentationLength ?? 0);

	const handleContentChange = (ev: React.FormEvent<HTMLParagraphElement>) => {
		if (!onChange) return;

		// Get the updated content
		const updatedContent = ev.currentTarget.textContent || '';

		// Create a new array of lines with the updated content
		const updatedLines = [...lines];
		updatedLines[i] = updatedContent;

		// Call onChange with the updated text
		onChange(updatedLines.join('\n'));
	};

	const comp = React.createElement(
		'p',
		{
			key,
			className: '_p',
			...(attrs ?? {}),
			style,
			...(editable
				? {
						contentEditable: true,
						suppressContentEditableWarning: true,
						onInput: handleContentChange,
						onKeyDown: ev => {
							// Handle special keys like Enter, Tab, etc.
							if (ev.key === 'Enter') {
								ev.preventDefault();

								if (!onChange) return;

								// Get the current selection
								if (window.getSelection) {
									let sel = window.getSelection();
									if (sel?.rangeCount) {
										let range = sel.getRangeAt(0);
										let caretPos = range.endOffset;

										// Split the line at caret position
										const beforeCaret = currentLine.substring(0, caretPos);
										const afterCaret = currentLine.substring(caretPos);

										// Create a new array of lines with the split line
										const updatedLines = [...lines];
										updatedLines[i] = beforeCaret;
										updatedLines.splice(i + 1, 0, afterCaret);

										// Call onChange with the updated text
										onChange(updatedLines.join('\n'));
									}
								}
							}
						},
					}
				: {}),
		},
		parseInline({
			...params,
			line: currentLine,
			indentationLength: undefined,
		}),
	);
	return { lineNumber, comp };
}
