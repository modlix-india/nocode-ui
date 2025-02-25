export function scrollToCaret(textAreaRef: any, componentKey: string, lineNumber?: number) {
	const { selectionStart } = textAreaRef.current;
	let block = 'center';
	if (!lineNumber)
		lineNumber = (textAreaRef.current.value ?? '')
			.substring(0, selectionStart)
			.split('\n').length;
	else block = 'start';

	let element;
	while (lineNumber && lineNumber > 0) {
		element = document.getElementById(`${componentKey}-div-${lineNumber}`);
		if (!element) lineNumber--;
		else break;
	}

	if (!element) return;
	setTimeout(() => element.scrollIntoView({ block, inline: 'nearest', behavior: 'smooth' }), 10);
}

export function makeTextForImageSelection(
	text: string,
	s: number,
	e: number,
	file: string,
): string {
	if (s != e) {
		const selection = text.substring(s, e);
		if (selection.indexOf('![') != -1) file = `![](${file})`;
		return text.substring(0, s) + file + text.substring(e);
	}

	let newStart = text.lastIndexOf('(', s);
	let newLine = text.lastIndexOf('\n', s);
	let found = false;

	if (newStart == -1) newStart = s;
	else found = true;
	if (newLine > newStart) newStart = newLine;

	let newEnd = text.indexOf(')', e);
	let space = text.indexOf(' ', newStart);
	newLine = text.indexOf('\n', e);

	if (newEnd == -1) newEnd = e;
	if (newLine < newEnd && newLine != -1) newEnd = newLine;
	if (newEnd <= s) found = false;
	if (space < newEnd && space != -1) newEnd = space;

	if (found) {
		return text.substring(0, newStart + 1) + file + text.substring(newEnd);
	}

	file = `![](${file})`;
	return text.substring(0, s) + file + text.substring(e);
}
