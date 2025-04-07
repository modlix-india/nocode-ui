import { MDDef } from "../../../commonComponents/Markdown/common";
import { parseAttributes } from "../../../commonComponents/Markdown/utils";

const TYPE_MAP: { [key: string]: 's' | 'em' | 'b' | 'mark' | 'sup' | 'sub' | 'code' | 'span' } = {
    '~~': 's',
    '*': 'em',
    _: 'em',
    '**': 'b',
    __: 'b',
    '==': 'mark',
    '^': 'sup',
    '~': 'sub',
    '`': 'code',
    '!!': 'span',
};

export default function styleButtonsHighlight(
    text: string,
    selection?: { start: number, end: number }
): {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    highlight?: boolean;
    superScript?: boolean;
    subScript?: boolean;

    fontSize?: string | undefined;
    fontFamily?: string | undefined;
    color?: string | undefined;
    backgroundColor?: string | undefined;

    blockAlign?: string | undefined;
    blockHeading?: number;
    blockBullet?: string | undefined;
    blockIndentation?: number | undefined;

    link?: boolean;
    image?: boolean;

} {
    if (!selection) return {};

    let lineStartsAt = text.lastIndexOf('\n', selection.start) + 1;
    let lineEndsAt = text.indexOf('\n', selection.end);
    if (lineEndsAt === -1) lineEndsAt = text.length;

    const line = text.slice(lineStartsAt, lineEndsAt);

    const start = selection.start - lineStartsAt;
    const end = selection.end - lineStartsAt;

    const blockHeading = line.startsWith('#') ? line.substring(0, line.indexOf(' ')).split('#').length : 0;

    const nextLine = text.slice(lineEndsAt + 1, text.indexOf('\n', lineEndsAt + 1));
    const attributes = parseAttributes(nextLine);

    const blockAlign = attributes?.['text-align'];
    let blockIndentation: number | undefined = undefined;
    if (attributes?.['margin-left']) {
        try {
            blockIndentation = parseInt(attributes['margin-left']);
        } catch (e) {
            console.error(e);
        }
    }

    let spaceIndex = line.indexOf(' ');
    let blockBullet = undefined;

    if (spaceIndex != -1) {
        const bulletType = line.substring(0, spaceIndex).trim();
        if (bulletType === '*' || bulletType === '-' || bulletType === '+') { blockBullet = 'ul' }
        else if (bulletType.endsWith('.')) {
            let numbered = false;

            try {
                parseInt(bulletType);
                numbered = true;
            } catch (e) {
                console.error(e);
            }

            if (numbered) blockBullet = 'ol-numeric';
            else if (bulletType.length === 1) blockBullet = 'ol-' + bulletType[0];
        }
    }

    const beforeCodeBlockCount = text.slice(0, lineStartsAt).split("\n").filter(e => e.startsWith('```')).length;
    const afterCodeBlockCount = text.slice(lineEndsAt + 1).split("\n").filter(e => e.startsWith('```')).length;

    const code = ((beforeCodeBlockCount & 1) == 1) && ((afterCodeBlockCount & 1) == 1);


    let bold = false;
    let italic = false;
    let strikethrough = false;

    let lineParts: Array<MDDef> = [];
    const spanParts: Array<{
        start: number;
        end: number;
        parts: Array<MDDef>;
    }> = [{ start: 0, end: line.length - 1, parts: lineParts }];


    for (let i = 0; i < line.length; i++) {

        if (
            (line[i] === '[' && i + 1 < line.length && line[i + 1] === '^') ||
            (line[i] === '^' && i + 1 < line.length && line[i + 1] === '[')
        ) {
            //Ignoring foot notes here.
        } else if ((line[i] === '!' && i + 1 < line.length && line[i + 1] === '!')) {

        }
    }

    return { blockHeading, blockAlign, blockIndentation, blockBullet, code };
}