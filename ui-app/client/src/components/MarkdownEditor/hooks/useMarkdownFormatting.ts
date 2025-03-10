export function useMarkdownFormatting() {
	const formatText = (
		text: string,
		command: string,
		selection: { start: number; end: number },
		value?: string | { url: string; text: string },
	) => {
		const selectedText = text.substring(selection.start, selection.end);
		const beforeText = text.substring(0, selection.start);
		const afterText = text.substring(selection.end);

		let newText = text;
		let newCursorPos = selection.end;

		const toggleFormat = (startMarker: string, endMarker: string = startMarker) => {
			const hasMarkers =
				selectedText.startsWith(startMarker) && selectedText.endsWith(endMarker);
			if (hasMarkers) {
				newText =
					beforeText +
					selectedText.slice(startMarker.length, -endMarker.length) +
					afterText;
				newCursorPos = selection.end - (startMarker.length + endMarker.length);
			} else {
				newText = `${beforeText}${startMarker}${selectedText}${endMarker}${afterText}`;
				newCursorPos = selection.end + startMarker.length + endMarker.length;
			}
		};

		switch (command) {
			case 'bold':
				toggleFormat('**');
				break;
			case 'italic':
				toggleFormat('*');
				break;
			case 'strikethrough':
				toggleFormat('~~');
				break;
			case 'inlineCode':
				toggleFormat('`');
				break;
			case 'highlight':
				toggleFormat('==');
				break;
			case 'superscript':
				toggleFormat('^');
				break;
			case 'subscript':
				toggleFormat('~');
				break;
			case 'alignLeft':
				toggleFormat('::: left\n', '\n:::');
				break;
			case 'alignCenter':
				toggleFormat('::: center\n', '\n:::');
				break;
			case 'alignRight':
				toggleFormat('::: right\n', '\n:::');
				break;
			case 'alignJustify':
				toggleFormat('::: justify\n', '\n:::');
				break;
			case 'rtl':
				toggleFormat('::: rtl\n', '\n:::');
				break;
			case 'ltr':
				toggleFormat('::: ltr\n', '\n:::');
				break;

			case 'heading1':
				toggleFormat('# ', '');
				break;

			case 'heading2':
				toggleFormat('## ', '');
				break;

			case 'heading3':
				toggleFormat('### ', '');
				break;

			case 'heading4':
				toggleFormat('#### ', '');
				break;

			case 'heading5':
				toggleFormat('##### ', '');
				break;

			case 'heading6':
				toggleFormat('###### ', '');
				break;

			case 'indent':
			case 'unindent':
				handleIndentation(command, selectedText, beforeText, afterText);
				break;
			case 'link':
				if (typeof value === 'object' && 'text' in value && 'url' in value) {
					newText = `${beforeText}[${value.text}](${value.url})${afterText}`;
					newCursorPos = selection.end + 2;
				}
				break;
			case 'footnote':
				const footnoteId = `fn${Date.now()}`;
				newText = `${beforeText}[^${footnoteId}]${afterText}\n\n[^${footnoteId}]: ${selectedText}`;
				newCursorPos = selection.end + footnoteId.length + 4;
				break;

			case 'unorderedList':
				if (selectedText) {
					const lines = selectedText.split('\n');
					const newLines = lines.map(line => `- ${line}`);
					newText = `${beforeText}${newLines.join('\n')}${afterText}`;
					newCursorPos = selection.end + lines.length * 2;
				} else {
					newText = `${beforeText}- ${afterText}`;
					newCursorPos = selection.start + 2;
				}
				break;

			case 'orderedList':
				if (selectedText) {
					const lines = selectedText.split('\n');
					const newLines = lines.map((line, index) => `${index + 1}. ${line}`);
					newText = `${beforeText}${newLines.join('\n')}${afterText}`;
					newCursorPos =
						selection.end + lines.reduce((acc, _, i) => acc + `${i + 1}. `.length, 0);
				} else {
					newText = `${beforeText}1. ${afterText}`;
					newCursorPos = selection.start + 3;
				}
				break;
		}

		return { newText, newCursorPos };
	};

	return { formatText };
}

function handleIndentation(
	command: string,
	selectedText: string,
	beforeText: string,
	afterText: string,
) {
	if (command === 'indent') {
		const hasIndent = selectedText.split('\n').every(line => line.startsWith('    '));
		if (hasIndent) {
			return {
				text: `${beforeText}${selectedText
					.split('\n')
					.map(line => line.slice(4))
					.join('\n')}${afterText}`,
				cursorOffset: -selectedText.split('\n').length * 4,
			};
		} else {
			const indentedLines = selectedText
				.split('\n')
				.map(line => '    ' + line)
				.join('\n');
			return {
				text: `${beforeText}${indentedLines}${afterText}`,
				cursorOffset: selectedText.split('\n').length * 4,
			};
		}
	} else {
		const unindentedLines = selectedText
			.split('\n')
			.map(line =>
				line.startsWith('    ')
					? line.slice(4)
					: line.startsWith('\t')
						? line.slice(1)
						: line,
			)
			.join('\n');
		return {
			text: `${beforeText}${unindentedLines}${afterText}`,
			cursorOffset: -selectedText
				.split('\n')
				.reduce(
					(acc, line) =>
						acc + (line.startsWith('    ') ? 4 : line.startsWith('\t') ? 1 : 0),
					0,
				),
		};
	}
}
