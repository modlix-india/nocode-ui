// ============================================================
// Markdown serializer: converts Block[] → markdown string.
// Handles all block types and inline marks (bold, italic, etc.)
// ============================================================

import type { Block, Mark, TextSpan } from '../core/types';
import { parseInlineMarks } from './deserialize';
import { serializeCustomComponent } from '../blocks/component-registry';

/**
 * Convert an array of blocks to a markdown string.
 */
export function blocksToMarkdown(blocks: Block[]): string {
	const parts: string[] = [];

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		const serialized = serializeBlock(block, i, blocks);
		parts.push(serialized);
	}

	// Join and clean up excessive newlines
	return (
		parts
			.join('')
			.replace(/\n{3,}/g, '\n\n')
			.trimEnd() + '\n'
	);
}

function isListItemType(type: string | undefined): boolean {
	return type === 'bulletItem' || type === 'numberItem' || type === 'todoItem';
}

const URL_RE = /(https?:\/\/[^\s<>)\]]+)/g;

/** True when `text` reads back as exactly itself with no formatting (a bare
 *  URL that reads back as a link to itself counts as plain). */
function readsBackPlain(text: string): boolean {
	const spans = parseInlineMarks(text);
	if (spans.map(sp => sp.text).join('') !== text) return false;
	return spans.every(sp => {
		const marks = sp.marks ?? [];
		if (marks.length === 0) return true;
		return marks.length === 1 && marks[0].type === 'link' && marks[0].attrs?.href === sp.text;
	});
}

/** Escape literal text so it isn't read back as formatting. Text that already
 *  reads back as itself is left untouched, and URLs are never escaped. */
function escapeInline(text: string): string {
	if (!text || readsBackPlain(text)) return text;
	return text
		.split(URL_RE)
		.map((part, i) => (i % 2 === 1 ? part : part.replace(/[\\`*_~[\]<=^+]/g, '\\$&')))
		.join('');
}

/** Escape a line start that would otherwise be read as a block marker
 *  (heading, list item, quote, fence, table row, rule or setext underline). */
function escapeLineStart(line: string): string {
	if (/^(\s*)(#{1,6}(\s|$)|[-*+]\s|>|```|\||[-*_]{3,}\s*$|=+\s*$)/.test(line)) {
		return line.replace(/^(\s*)(\S)/, '$1\\$2');
	}
	const numbered = line.match(/^(\s*\d{1,9})(\.\s)/);
	if (numbered) return numbered[1] + '\\' + line.slice(numbered[1].length);
	return line;
}

function escapeLineStarts(md: string): string {
	return md.split('\n').map(escapeLineStart).join('\n');
}

function hintOf(block: Block | undefined): number | undefined {
	const hint = block?.props.indexHint;
	return typeof hint === 'number' && Number.isFinite(hint) ? hint : undefined;
}

/** Number shown for the numberItem at `index`: a run starts at its first
 *  item's `indexHint` (default 1) and counts up; an `indexHint` mid-run jumps
 *  the counter, matching how EditorBlockTree numbers items on screen. */
function numberItemOrdinal(index: number, siblings: Block[]): number {
	let start = index;
	while (start > 0 && siblings[start - 1]?.type === 'numberItem') start--;
	let counter = 0;
	for (let i = start; i <= index; i++) {
		const hint = hintOf(siblings[i]);
		counter = hint ?? (i === start ? 1 : counter + 1);
	}
	return counter;
}

/** Serialize one first-class list item (+ its nested item children). `indent`
 *  is the leading whitespace; children are indented to this item's content
 *  column (2 spaces under "- ", 3 under "1. ") so they nest when re-read.
 *  `ordinal` is the number for numberItem; ignored for bullet/todo. */
function serializeListItem(block: Block, indent: string, ordinal: number): string {
	const marker = block.type === 'numberItem' ? `${ordinal}. ` : '- ';
	const childIndent = indent + ' '.repeat(marker.length);
	const checkbox = block.type === 'todoItem' ? (block.props.checked ? '[x] ' : '[ ] ') : '';
	// A soft line break inside the item continues on the item's content column.
	const text = escapeLineStarts(serializeSpans(block.content))
		.split('\n')
		.join('\n' + childIndent);
	let out = `${indent}${marker}${checkbox}${text}\n`;
	if (block.children.length > 0) {
		out += serializeListItemChildren(block.children, childIndent);
	}
	return out;
}

/** Serialize a list item's children: nested list items renumber per level;
 *  any non-list child falls back to its normal markdown, indented to align
 *  under the parent item. */
function serializeListItemChildren(children: Block[], indent: string): string {
	let out = '';
	children.forEach((child, idx) => {
		if (isListItemType(child.type)) {
			const ordinal = child.type === 'numberItem' ? numberItemOrdinal(idx, children) : 0;
			out += serializeListItem(child, indent, ordinal);
		} else {
			// A paragraph child is set off by a blank line so it re-reads as a
			// child block rather than as more of the item's own text.
			const childMd = blocksToMarkdown([child]).trimEnd();
			if (child.type === 'paragraph') out += '\n';
			out +=
				childMd
					.split('\n')
					.map(l => (l ? indent + l : l))
					.join('\n') + '\n';
		}
	});
	return out;
}

/**
 * Serialize a single block to its markdown representation.
 */
function serializeBlock(block: Block, index: number, siblings: Block[]): string {
	const text = serializeSpans(block.content);

	switch (block.type) {
		case 'paragraph':
			return escapeLineStarts(text) + '\n\n';

		case 'heading1':
			return `# ${text}\n\n`;

		case 'heading2':
			return `## ${text}\n\n`;

		case 'heading3':
			return `### ${text}\n\n`;

		case 'heading4':
			return `#### ${text}\n\n`;

		case 'heading5':
			return `##### ${text}\n\n`;

		case 'heading6':
			return `###### ${text}\n\n`;

		case 'todo': {
			const checkbox = block.props.checked ? '[x]' : '[ ]';
			return `- ${checkbox} ${text}\n`;
		}

		case 'bulletItem':
		case 'numberItem':
		case 'todoItem': {
			// First-class list items (the slash-menu + post-migration shape; also
			// what markdown shortcuts now create). A run of consecutive item blocks
			// forms one markdown list; nesting comes from each item's children. A
			// blank line is appended after the last item of a run so a following
			// paragraph isn't slurped into the list.
			const ordinal = block.type === 'numberItem' ? numberItemOrdinal(index, siblings) : 0;
			// A run also ends where bullets switch to numbers (or back), so the
			// blank line between the two lists survives a round trip.
			const next = siblings[index + 1]?.type;
			const lastInRun =
				!isListItemType(next) || (next === 'numberItem') !== (block.type === 'numberItem');
			return serializeListItem(block, '', ordinal) + (lastInRun ? '\n' : '');
		}

		case 'codeBlock': {
			const language = block.props.language || '';
			return `\`\`\`${language}\n${getPlainText(block.content)}\n\`\`\`\n\n`;
		}

		case 'quote':
			return serializeQuote(text, block);

		case 'callout': {
			const emoji = block.props.emoji || '';
			const label = emoji ? `!callout ${emoji}` : '!callout';
			const quotedBody = text
				.split('\n')
				.map(line => `> ${line}`)
				.join('\n');
			return `> [${label}]\n${quotedBody}\n\n`;
		}

		case 'toggle': {
			const childrenMd =
				block.children.length > 0
					? '\n' + blocksToMarkdown(block.children).trimEnd() + '\n\n'
					: '\n';
			const tag = block.props.open === true ? '<details open>' : '<details>';
			return `${tag}\n<summary>${text}</summary>\n${childrenMd}</details>\n\n`;
		}

		case 'divider':
			return '---\n\n';

		case 'image': {
			const alt = block.props.alt || '';
			const src = block.props.src || '';
			const title =
				typeof block.props.title === 'string' && block.props.title
					? ` "${block.props.title}"`
					: '';
			// Size, crop and layout ride in a trailing {key="value"} group — the
			// attribute form Modlix's markdown renderer applies to the <img>.
			const attrs: string[] = [];
			const num = (key: string) => {
				const v = Number(block.props[key]);
				if (v) attrs.push(`${key}="${v}"`);
			};
			['width', 'height', 'cropX', 'cropY', 'cropW', 'cropH'].forEach(num);
			const layout = block.props.layout;
			if (typeof layout === 'string' && layout !== 'center') attrs.push(`layout="${layout}"`);
			const attrStr = attrs.length ? `{${attrs.join(' ')}}` : '';
			// Side-by-side images were written on one line; keep them together.
			const nextInline =
				block.props.inline === true &&
				siblings[index + 1]?.type === 'image' &&
				siblings[index + 1]?.props.inline === true;
			return `![${alt}](${src}${title})${attrStr}` + (nextInline ? ' ' : '\n\n');
		}

		case 'embed': {
			const url = block.props.url || '';
			return `[embed](${url})\n\n`;
		}

		case 'table': {
			const tableData: string[][] | undefined = block.props.tableData;
			if (tableData && tableData.length > 0) {
				const aligns: string[] = (block.props.columnAlignments as string[]) ?? [];
				// A bare pipe inside a cell would split it on re-read; escape it.
				const cell = (c: string) => (c ?? '').replace(/(?<!\\)\|/g, '\\|');
				const headerRow = tableData[0];
				const headerLine = '| ' + headerRow.map(cell).join(' | ') + ' |';
				const separatorLine =
					'| ' +
					headerRow
						.map((_h, i) => {
							const a = aligns[i];
							if (a === 'center') return ':---:';
							if (a === 'right') return '---:';
							return '---';
						})
						.join(' | ') +
					' |';
				const bodyLines = tableData
					.slice(1)
					.map(row => '| ' + row.map(cell).join(' | ') + ' |');
				const tableLines = [headerLine, separatorLine, ...bodyLines].join('\n');

				// Serialize table metadata (colors, borders, compact, template) as HTML comment
				const meta = serializeTableMeta(block);
				if (meta) {
					return `<!-- mde-table:${meta} -->\n${tableLines}\n\n`;
				}
				return tableLines + '\n\n';
			}
			return text + '\n\n';
		}

		case 'toc': {
			const levels = block.props.tocLevels ?? 3;
			const variant = block.props.tocVariant;
			// Append the design only when it's a non-default variant, so plain TOCs
			// keep the original `mde-toc:N` form and stay backward-compatible.
			const suffix = variant && variant !== 'plain' ? `:${variant}` : '';
			return `<!-- mde-toc:${levels}${suffix} -->\n\n`;
		}

		case 'columns': {
			// Markdown has no native multi-column syntax. We flatten the row by
			// serializing each column's blocks in order, left-to-right.
			const parts: string[] = [];
			for (const column of block.children) {
				if (column.children.length === 0) continue;
				parts.push(blocksToMarkdown(column.children));
			}
			return parts.join('');
		}

		case 'column': {
			// Column blocks should always be rendered via their parent `columns`
			// block — but if one shows up at the top level (e.g. via a programmatic
			// insertion), serialize its children as a fallback.
			if (block.children.length === 0) return '';
			return blocksToMarkdown(block.children);
		}

		case 'customComponent': {
			return serializeCustomComponent(block.props) + '\n\n';
		}

		default:
			return text + '\n\n';
	}
}

/**
 * Serialize a quote block, prefixing each line with `> `.
 */
/** Prefix one line with a quote marker: ">" alone on an empty line, and
 *  ">>" (not "> >") in front of a nested quote. */
function quoteLine(line: string): string {
	if (line === '') return '>';
	return line.startsWith('>') ? `>${line}` : `> ${line}`;
}

function serializeQuote(text: string, block: Block): string {
	const lines = text.split('\n').map(quoteLine);
	// A quote that only wraps child blocks (a nested quote) has no text line.
	let result = text === '' && block.children.length > 0 ? '' : lines.join('\n') + '\n';

	if (block.children.length > 0) {
		const childMd = blocksToMarkdown(block.children).trimEnd();
		const quoted = childMd.split('\n').map(quoteLine).join('\n');
		result += quoted + '\n';
	}

	return result + '\n';
}

/**
 * Serialize inline content. Marks (links included) are opened and closed
 * across span boundaries, so "*You **can** combine them*" stays one italic
 * run and "**bold with [a link](url) inside**" stays one bold run.
 */
function serializeSpans(spans: TextSpan[]): string {
	if (!spans || spans.length === 0) {
		return '';
	}
	return serializeRun(spans);
}

/** The span's link mark, unless it is a bare URL written back bare (Modlix
 *  renders a bare YouTube URL on its own line as an embed). */
function explicitLink(span: TextSpan): Mark | undefined {
	const link = span.marks?.find(m => m.type === 'link');
	if (!link) return undefined;
	if (link.attrs?.auto === '1' && link.attrs.href === span.text && span.marks?.length === 1)
		return undefined;
	return link;
}

interface Delimiter {
	key: string;
	open: string;
	close: string;
}

/** Outer → inner nesting order for marks opened on the same span. */
const MARK_ORDER = [
	'link',
	'color',
	'highlight',
	'superscript',
	'subscript',
	'underline',
	'strikethrough',
	'bold',
	'italic',
];

function delimiterFor(mark: Mark): Delimiter | null {
	switch (mark.type) {
		case 'bold':
			return { key: 'bold', open: '**', close: '**' };
		case 'italic':
			return { key: 'italic', open: '*', close: '*' };
		case 'strikethrough':
			return { key: 'strikethrough', open: '~~', close: '~~' };
		case 'underline':
			return { key: 'underline', open: '<u>', close: '</u>' };
		case 'superscript':
			return { key: 'superscript', open: '<sup>', close: '</sup>' };
		case 'subscript':
			return { key: 'subscript', open: '<sub>', close: '</sub>' };
		case 'highlight': {
			const color = mark.attrs?.color;
			if (!color || color === 'transparent') return null;
			return {
				key: `highlight:${color}`,
				open: `<mark style="background-color:${color}">`,
				close: '</mark>',
			};
		}
		case 'color': {
			const color = mark.attrs?.color;
			if (!color || color === 'inherit') return null;
			return {
				key: `color:${color}`,
				open: `<span style="color:${color}">`,
				close: '</span>',
			};
		}
		default:
			return null;
	}
}

function delimitersOf(span: TextSpan): Delimiter[] {
	const link = explicitLink(span);
	const linkDelimiter: Delimiter[] = link
		? [
				{
					key: `link:${link.attrs?.href ?? ''}:${link.attrs?.title ?? ''}`,
					open: '[',
					close: `](${link.attrs?.href ?? ''}${link.attrs?.title ? ` "${link.attrs.title}"` : ''})`,
				},
			]
		: [];
	return (span.marks ?? [])
		.map(delimiterFor)
		.filter((d): d is Delimiter => d !== null)
		.concat(linkDelimiter)
		.sort(
			(a, b) =>
				MARK_ORDER.indexOf(a.key.split(':')[0]) - MARK_ORDER.indexOf(b.key.split(':')[0]),
		);
}

/** Mentions are atomic, written as a pseudo-URL link the parser re-hydrates. */
function mentionMarkdown(span: TextSpan, mention: Mark): string {
	const kind = mention.attrs?.kind || 'page';
	const id = mention.attrs?.id || '';
	const label = (span.text || mention.attrs?.label || '')
		.replaceAll('\\', '\\\\')
		.replaceAll('[', '\\[')
		.replaceAll(']', '\\]');
	return `[${label}](mde://${kind}/${encodeURIComponent(id)})`;
}

/** A code span whose fence is longer than any backtick run inside it. */
function codeSpan(text: string): string {
	const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map(run => run.length));
	const fence = '`'.repeat(longest + 1);
	const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
	return `${fence}${pad}${text}${pad}${fence}`;
}

/** Serialize spans that carry no explicit link. */
function serializeRun(spans: TextSpan[]): string {
	let out = '';
	const stack: Delimiter[] = [];
	// Whitespace at the end of a span is held back so a mark that closes there
	// closes before it ("**bold** next", not "**bold **next").
	let pendingSpace = '';
	for (const span of spans) {
		if (!span.text) continue;
		const wanted = delimitersOf(span);
		const wantedKeys = new Set(wanted.map(d => d.key));
		// Marks already open stay open (outermost first) as long as they are
		// still wanted; anything above the first unwanted one closes.
		let keep = 0;
		while (keep < stack.length && wantedKeys.has(stack[keep].key)) keep++;
		while (stack.length > keep) out += stack.pop()!.close;
		out += pendingSpace;

		const mention = span.marks?.find(m => m.type === 'mention');
		const isCode = span.marks?.some(m => m.type === 'code');
		let text = mention
			? mentionMarkdown(span, mention)
			: isCode
				? codeSpan(span.text)
				: escapeInline(span.text);

		const openKeys = new Set(stack.map(d => d.key));
		const opening = wanted.filter(d => !openKeys.has(d.key));
		if (opening.length > 0) {
			const lead = /^\s*/.exec(text)?.[0] ?? '';
			out += lead;
			text = text.slice(lead.length);
			if (text.trim() !== '') {
				for (const d of opening) {
					out += d.open;
					stack.push(d);
				}
			}
		}
		const trail = /\s*$/.exec(text)?.[0] ?? '';
		out += text.slice(0, text.length - trail.length);
		pendingSpace = trail;
	}
	while (stack.length > 0) out += stack.pop()!.close;
	return out + pendingSpace;
}

/**
 * Get plain text from content spans (no marks applied).
 * Used for code blocks where content should not have inline formatting.
 */
function getPlainText(content: TextSpan[]): string {
	return content.map(span => span.text).join('');
}

/**
 * Serialize table metadata (cellMeta, showBorders, compact, colorTemplate)
 * as a JSON string for embedding in an HTML comment.
 * Returns null if there's no metadata worth persisting.
 */
function serializeTableMeta(block: Block): string | null {
	const meta: Record<string, unknown> = {};

	const cellMeta = block.props.cellMeta;
	if (cellMeta && typeof cellMeta === 'object' && Object.keys(cellMeta).length > 0) {
		meta.cellMeta = cellMeta;
	}

	if (block.props.showBorders === false) {
		meta.showBorders = false;
	}

	if (block.props.compact === true) {
		meta.compact = true;
	}

	if (block.props.colorTemplate && block.props.colorTemplate !== '') {
		meta.colorTemplate = block.props.colorTemplate;
	}

	if (Object.keys(meta).length === 0) return null;
	return JSON.stringify(meta);
}
