export default function formatText(
    text: string,
    command: string,
    selection: { start: number; end: number },
    value?: string | { url: string; text: string },
) {
    const selectedText = text.substring(selection.start, selection.end);
    const beforeText = text.substring(0, selection.start);
    const afterText = text.substring(selection.end);

    let newText = text;
    let newCursorPos = selection.end;


    const handleStyleFormat = (styleToAdd: string) => {
        const styleRegex = /\{style="([^"]+)"\}(.*?)\{style\}/g;
        const matches = Array.from(selectedText.matchAll(styleRegex));

        if (matches.length > 0) {
            const styleMap = new Map<string, string>();

            matches[0][1].split(',').forEach(style => {
                const [property, value] = style.trim().split(':').map(s => s.trim());
                if (property && value) {
                    styleMap.set(property, value);
                }
            });

            const [newProperty, newValue] = styleToAdd.split(':').map(s => s.trim());
            if (newProperty && newValue) {
                styleMap.set(newProperty, newValue);
            }

            const updatedStyles = Array.from(styleMap.entries())
                .map(([prop, val]) => `${prop}: ${val}`)
                .join(',');

            const content = selectedText.replace(styleRegex, '$2');

            newText = `${beforeText}{style="${updatedStyles}"}${content}{style}${afterText}`;
        } else {
            newText = `${beforeText}{style="${styleToAdd}"}${selectedText}{style}${afterText}`;
        }

        newCursorPos = selection.end;
    };

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

        case 'fontColor':
            if (typeof value === 'string') {
                handleStyleFormat(`color: ${value}`);
            }
            break;

        case 'backgroundColor':
            if (typeof value === 'string') {
                handleStyleFormat(`background-color: ${value}`);
            }
            break;

        default:
            if (command.startsWith('fontStyle-')) {
                const fontFamily = command.substring(10);
                handleStyleFormat(`font-family: ${fontFamily}`);
            } else if (command.startsWith('fontSize-')) {
                const fontSize = command.substring(9);
            }
            break;
    }

    return { newText, newCursorPos };
};


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
