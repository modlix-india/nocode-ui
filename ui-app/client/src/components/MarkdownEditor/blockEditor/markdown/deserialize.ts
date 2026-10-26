// ============================================================
// Markdown deserializer: converts markdown string → Block[].
// Line-by-line parser with inline mark detection.
// ============================================================

import type { Block, TextSpan, Mark, BlockType, BlockProps } from '../core/types';
import { generateId } from '../core/types';
import { migrateLegacyList } from '../core/migrate';
import {
	detectCustomComponentMarker,
	isCustomComponentEndMarker,
	deserializeCustomComponent,
} from '../blocks/component-registry';

/** `<details>` or `<details open>` alone on a line. */
function isDetailsOpen(line: string): boolean {
	return /^<details(\s[^>]*)?>$/i.test(line);
}

/** An opening code fence: ``` (or more) whose info string has no backticks.
 *  "``` code ``` text" on one line is inline code, not a fence. */
function isFenceOpen(line: string): boolean {
	return /^\s{0,3}`{3,}[^`]*$/.test(line);
}

/** Extract reference link definitions: [ref]: url "title" (excludes footnote ^refs) */
function extractRefLinks(lines: string[]): Map<string, string> {
	const refs = new Map<string, string>();
	for (const line of lines) {
		const m = line.match(/^\[([^\]]+)\]:\s+(\S+)(?:\s+"[^"]*")?(?:\s+'[^']*')?\s*$/);
		if (m && !m[1].startsWith('^')) refs.set(m[1].toLowerCase(), m[2]);
	}
	return refs;
}

/** Module-level ref links map, set during parsing */
let _refLinks: Map<string, string> = new Map();

/**
 * Convert a markdown string (without frontmatter) into an array of Blocks.
 */
export function markdownToBlocks(markdown: string): Block[] {
	const lines = markdown.split('\n');
	_refLinks = extractRefLinks(lines);
	const blocks: Block[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// --- Code block (fenced) ---
		if (isFenceOpen(line)) {
			const result = parseCodeBlock(lines, i);
			blocks.push(result.block);
			i = result.nextIndex;
			continue;
		}

		// --- Code block (indented: 4+ spaces or tab) ---
		if (/^( {4}|\t)/.test(line)) {
			const codeLines: string[] = [];
			let j = i;
			while (j < lines.length && (/^( {4}|\t)/.test(lines[j]) || lines[j].trim() === '')) {
				// Remove 4-space or tab prefix
				codeLines.push(lines[j].replace(/^( {4}|\t)/, ''));
				j++;
			}
			// Trim trailing empty lines
			while (codeLines.length > 0 && codeLines[codeLines.length - 1].trim() === '')
				codeLines.pop();
			if (codeLines.length > 0) {
				blocks.push(makeBlock('codeBlock', [{ text: codeLines.join('\n') }], {}));
				i = j;
				continue;
			}
		}

		// --- Table with optional metadata comment ---
		// Detect <!-- mde-table:{json} --> followed by a table
		const tableMeta = parseTableMetaComment(line);
		if (tableMeta !== null) {
			// Next non-empty line should be the table
			let nextLine = i + 1;
			while (nextLine < lines.length && lines[nextLine].trim() === '') nextLine++;
			if (nextLine < lines.length && lines[nextLine].trimStart().startsWith('|')) {
				const result = parseTable(lines, nextLine, tableMeta);
				blocks.push(result.block);
				i = result.nextIndex;
				continue;
			}
		}

		// --- Table of Contents: <!-- mde-toc:N[:variant] --> ---
		const tocMatch = line.trim().match(/^<!--\s*mde-toc:(\d+)(?::([a-z]+))?\s*-->$/);
		if (tocMatch) {
			const tocProps: { tocLevels: number; tocVariant?: BlockProps['tocVariant'] } = {
				tocLevels: parseInt(tocMatch[1]),
			};
			if (tocMatch[2]) tocProps.tocVariant = tocMatch[2] as BlockProps['tocVariant'];
			blocks.push(makeBlock('toc', [], tocProps));
			i++;
			continue;
		}

		// --- Table: lines starting with |, or a GFM table whose rows omit the
		// outer pipes (header row followed by a --- separator row) ---
		if (line.trimStart().startsWith('|') || isPipeTableStart(lines, i)) {
			const result = parseTable(lines, i);
			blocks.push(result.block);
			i = result.nextIndex;
			continue;
		}

		// --- Custom component (<!-- mde:name --> ... <!-- /mde:name -->) ---
		const componentName = detectCustomComponentMarker(line);
		if (componentName) {
			const contentLines: string[] = [];
			i++;
			while (i < lines.length && !isCustomComponentEndMarker(lines[i], componentName)) {
				contentLines.push(lines[i]);
				i++;
			}
			if (i < lines.length) i++; // skip end marker
			const props = deserializeCustomComponent(componentName, contentLines.join('\n'));
			blocks.push(makeBlock('customComponent', [], props));
			continue;
		}

		// --- Setext headings: text followed by === or --- on next line ---
		if (i + 1 < lines.length && line.trim().length > 0) {
			const nextLine = lines[i + 1].trim();
			if (/^={3,}$/.test(nextLine)) {
				blocks.push(makeBlock('heading1', parseInlineMarks(line.trim())));
				i += 2; // skip both lines
				continue;
			}
			if (
				/^-{3,}$/.test(nextLine) &&
				!line.trim().startsWith('>') &&
				!line.trim().startsWith('-') &&
				!line.trim().startsWith('*') &&
				!line.trim().startsWith('#')
			) {
				blocks.push(makeBlock('heading2', parseInlineMarks(line.trim())));
				i += 2;
				continue;
			}
		}

		// --- Divider ---
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim()) && line.trim().length >= 3) {
			blocks.push(makeBlock('divider', [], {}));
			i++;
			continue;
		}

		// --- Image(s): ![alt](src) or ![alt](src "title") or ![alt][ref] ---
		// Optionally followed by {width=N height=N cropX=N cropY=N cropW=N cropH=N}
		// Supports multiple images on the same line (rendered side-by-side). Only a
		// line made of images alone becomes image blocks; an image inside text
		// stays part of its paragraph so the surrounding words aren't dropped.
		const imageOnlyLine =
			line.includes('![') &&
			line.replace(/!\[[^\]]*\](\([^)]*\)|\[[^\]]*\])(\{[^}]*\})?/g, '').trim() === '';
		if (imageOnlyLine) {
			// Parse trailing {key=value ...} attributes if present
			// Accepts {width="300" height="200" layout="center"} (the quoted form
			// Modlix's markdown renderer reads) and the bare {width=300} form.
			const parseImageAttrs = (after: string): Record<string, number | string> => {
				const attrs: Record<string, number | string> = {};
				const attrMatch = /^\{([^}]+)\}/.exec(after);
				if (attrMatch) {
					for (const m of attrMatch[1].matchAll(
						/([a-zA-Z]+)\s*=\s*(?:"([^"]*)"|([^\s,"]+))/g,
					)) {
						const key = m[1];
						const value = m[2] ?? m[3] ?? '';
						if (key === 'layout') {
							if (['left', 'center', 'right', 'full'].includes(value))
								attrs.layout = value;
						} else if (value !== '' && !Number.isNaN(Number(value))) {
							attrs[key] = Number(value);
						}
					}
				}
				return attrs;
			};

			const imgRegex = /!\[([^\]]*)\]\(([^)]*)\)|!\[([^\]]*)\]\[([^\]]*)\]/g;
			let match: RegExpExecArray | null;
			const images: Block[] = [];
			while ((match = imgRegex.exec(line)) !== null) {
				if (match[1] !== undefined && match[2] !== undefined) {
					// Inline image: ![alt](src "title")
					let src = match[2].trim();
					let title: string | undefined;
					const titleM = src.match(/^(\S+)\s+"([^"]*)"$/);
					if (titleM) {
						src = titleM[1];
						title = titleM[2];
					}
					// Parse attributes from text after the image syntax
					const afterImg = line.slice(match.index + match[0].length);
					const attrs = parseImageAttrs(afterImg);
					images.push(
						makeBlock('image', [], {
							alt: match[1],
							src,
							...(title ? { title } : {}),
							...attrs,
						}),
					);
				} else if (match[3] !== undefined) {
					// Reference image: ![alt][ref]
					const alt = match[3];
					const refId = (match[4] || alt).toLowerCase();
					const src = _refLinks.get(refId);
					if (src) {
						const afterImg = line.slice(match.index + match[0].length);
						const attrs = parseImageAttrs(afterImg);
						images.push(makeBlock('image', [], { alt, src, ...attrs }));
					}
				}
			}
			if (images.length > 0) {
				// Mark consecutive images for side-by-side rendering
				if (images.length > 1) {
					images.forEach(img => {
						img.props.inline = true;
					});
				}
				blocks.push(...images);
				i++;
				continue;
			}
		}

		// --- Headings (h1-h6) ---
		const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
		if (headingMatch) {
			const level = headingMatch[1].length;
			const headingTypes: Record<number, BlockType> = {
				1: 'heading1',
				2: 'heading2',
				3: 'heading3',
				4: 'heading4',
				5: 'heading5',
				6: 'heading6',
			};
			const headingType = headingTypes[level] ?? 'heading6';
			blocks.push(makeBlock(headingType, parseInlineMarks(headingMatch[2])));
			i++;
			continue;
		}

		// (Checklist lines "- [ ]"/"- [x]" are handled inside parseListRun so they
		// become first-class todoItem blocks and can mix/nest with other items —
		// same shape the editor's typing shortcuts create.)

		// --- List with optional metadata comment: <!-- mde-list:{json} --> ---
		const listMeta = parseListMetaComment(line);
		if (listMeta !== null) {
			let nextLine = i + 1;
			while (nextLine < lines.length && lines[nextLine].trim() === '') nextLine++;
			const listResult = parseListRun(lines, nextLine, listMeta);
			if (listResult) {
				blocks.push(...listResult.blocks);
				i = listResult.nextIndex;
				continue;
			}
		}

		// --- List: bullet (- / * / +) or numbered (1.) items collected into a single list block ---
		{
			const listResult = parseListRun(lines, i);
			if (listResult) {
				blocks.push(...listResult.blocks);
				i = listResult.nextIndex;
				continue;
			}
		}

		// --- Callout: > [!callout emoji] ---
		const calloutMatch = line.match(/^>\s+\[!callout\s*(.*?)\]\s*$/);
		if (calloutMatch) {
			const emoji = calloutMatch[1].trim() || undefined;
			// Gather subsequent `> ` lines as the callout body
			const bodyLines: string[] = [];
			let j = i + 1;
			while (j < lines.length && lines[j].startsWith('> ')) {
				bodyLines.push(lines[j].slice(2));
				j++;
			}
			const bodyText = bodyLines.join('\n');
			blocks.push(makeBlock('callout', parseInlineMarks(bodyText), { emoji }));
			i = j;
			continue;
		}

		// --- Quote: > (with nested blockquote support) ---
		const quoteMatch = line.match(/^>\s?(.*)/);
		if (quoteMatch) {
			// Collect all consecutive > lines, stripping one level of >
			const innerLines: string[] = [quoteMatch[1]];
			let j = i + 1;
			while (j < lines.length) {
				const nextQuoteMatch = lines[j].match(/^>\s?(.*)/);
				if (nextQuoteMatch) {
					innerLines.push(nextQuoteMatch[1]);
					j++;
				} else {
					break;
				}
			}
			// Check if the inner content itself contains blockquotes (nested)
			const hasNestedQuotes = innerLines.some(l => l.startsWith('>'));
			if (hasNestedQuotes) {
				// Recursively parse inner content to get children blocks
				const innerMarkdown = innerLines.join('\n');
				const children = markdownToBlocks(innerMarkdown);
				// A leading paragraph becomes the quote's own text; a leading nested
				// quote (">> text") stays a child so the extra level is kept.
				const first = children[0];
				const ownText = first?.type === 'paragraph';
				const quoteBlock = makeBlock('quote', ownText ? first.content : [], {});
				quoteBlock.children = ownText ? children.slice(1) : children;
				blocks.push(quoteBlock);
			} else {
				const quoteText = innerLines.join('\n');
				blocks.push(makeBlock('quote', parseInlineMarks(quoteText)));
			}
			i = j;
			continue;
		}

		// --- HTML details/toggle ---
		if (isDetailsOpen(line.trim())) {
			const result = parseToggle(lines, i);
			blocks.push(result.block);
			i = result.nextIndex;
			continue;
		}

		// --- Embed: [embed](url) ---
		const embedMatch = line.match(/^\[embed\]\(([^)]*)\)\s*$/);
		if (embedMatch) {
			blocks.push(makeBlock('embed', [], { url: embedMatch[1] }));
			i++;
			continue;
		}

		// --- Empty line: skip ---
		if (line.trim() === '') {
			i++;
			continue;
		}

		// --- Reference link definition: [ref]: url — skip (already extracted in pre-pass).
		// Footnote definitions ([^1]: text) are content, so they stay as paragraphs.
		if (/^\[([^\]^][^\]]*)\]:\s+/.test(line.trim())) {
			i++;
			continue;
		}

		// --- Default: paragraph ---
		// Collect consecutive non-empty, non-special lines into a single paragraph
		const paraLines: string[] = [line];
		let j = i + 1;
		while (j < lines.length) {
			const nextLine = lines[j];
			if (
				nextLine.trim() === '' ||
				nextLine.match(/^#{1,3}\s/) ||
				nextLine.match(/^[-*]\s/) ||
				nextLine.match(/^\d+\.\s/) ||
				nextLine.match(/^>\s/) ||
				isFenceOpen(nextLine) ||
				/^(-{3,}|\*{3,})$/.test(nextLine.trim()) ||
				nextLine.match(/^!\[/) ||
				nextLine.match(/^\[embed\]/) ||
				isDetailsOpen(nextLine.trim()) ||
				nextLine.trimStart().startsWith('|')
			) {
				break;
			}
			paraLines.push(nextLine);
			j++;
		}

		const paraText = paraLines.join('\n');
		blocks.push(makeBlock('paragraph', parseInlineMarks(paraText)));
		i = j;
	}

	return blocks;
}

// ---- Table parsing ----

/**
 * Parse a `<!-- mde-table:{json} -->` comment. Returns the parsed metadata
 * object, or null if the line is not a table meta comment.
 */
function parseTableMetaComment(line: string): Record<string, unknown> | null {
	const match = line.trim().match(/^<!--\s*mde-table:(.*?)\s*-->$/);
	if (!match) return null;
	try {
		return JSON.parse(match[1]);
	} catch {
		return null;
	}
}

const TABLE_SEPARATOR = /^\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

/** A header row with pipes followed by a separator row (`--- | ---`). */
function isPipeTableStart(lines: string[], i: number): boolean {
	const next = lines[i + 1];
	return (
		lines[i].includes('|') &&
		next !== undefined &&
		next.includes('-') &&
		next.includes('|') &&
		TABLE_SEPARATOR.test(next.trim())
	);
}

/** Split a table row on unescaped pipes (`\|` stays inside the cell). */
function splitTableRow(row: string): string[] {
	return row
		.replace(/^\|/, '')
		.replace(/(?<!\\)\|$/, '')
		.split(/(?<!\\)\|/)
		.map(c => c.trim());
}

function parseTable(
	lines: string[],
	startIndex: number,
	meta?: Record<string, unknown>,
): { block: Block; nextIndex: number } {
	const tableLines: string[] = [];
	let i = startIndex;
	const bare = !lines[startIndex].trimStart().startsWith('|');
	while (
		i < lines.length &&
		(bare
			? lines[i].trim() !== '' && lines[i].includes('|')
			: lines[i].trimStart().startsWith('|'))
	) {
		tableLines.push(lines[i]);
		i++;
	}

	// Parse rows, extracting alignment from the separator line
	const tableData: string[][] = [];
	let columnAlignments: string[] | undefined;
	for (const tl of tableLines) {
		const trimmed = tl.trim();
		// Check for separator lines like | --- | :---: | ---: |
		if (TABLE_SEPARATOR.test(trimmed) && trimmed.includes('-')) {
			// Extract alignment info
			const separatorCells = splitTableRow(trimmed);
			columnAlignments = separatorCells.map(cell => {
				const left = cell.startsWith(':');
				const right = cell.endsWith(':');
				if (left && right) return 'center';
				if (right) return 'right';
				return 'left';
			});
			continue;
		}
		// Cells keep their raw inline markdown (**bold**, `code`, links) so a
		// save never drops formatting; TableBlock renders it for display.
		const cells = splitTableRow(trimmed);
		tableData.push(cells);
	}

	const props: Record<string, unknown> = { tableData };
	if (columnAlignments && columnAlignments.some(a => a !== 'left')) {
		props.columnAlignments = columnAlignments;
	}

	// Merge table metadata from mde-table comment
	if (meta) {
		for (const key of ['cellMeta', 'showBorders', 'compact', 'colorTemplate']) {
			if (meta[key] !== undefined) props[key] = meta[key];
		}
	}

	return {
		block: makeBlock('table', [], props),
		nextIndex: i,
	};
}

// ---- Code block parsing ----

function parseCodeBlock(lines: string[], startIndex: number): { block: Block; nextIndex: number } {
	const openingLine = lines[startIndex].trimStart();
	const language = openingLine.slice(3).trim(); // After ```

	const codeLines: string[] = [];
	let i = startIndex + 1;
	while (i < lines.length) {
		if (lines[i].trimStart().startsWith('```')) {
			i++; // Skip closing ```
			break;
		}
		codeLines.push(lines[i]);
		i++;
	}

	const codeText = codeLines.join('\n');

	const props: BlockProps = {};
	if (language) {
		props.language = language;
	}

	return {
		block: makeBlock('codeBlock', [{ text: codeText }], props),
		nextIndex: i,
	};
}

// ---- Toggle parsing ----

function parseToggle(lines: string[], startIndex: number): { block: Block; nextIndex: number } {
	let i = startIndex + 1; // Skip <details>
	let summaryText = '';
	const open = /^<details\b[^>]*\bopen\b/i.test(lines[startIndex].trim());

	// Look for <summary>...</summary>
	if (i < lines.length) {
		const summaryMatch = lines[i].match(/<summary>(.*?)<\/summary>/);
		if (summaryMatch) {
			summaryText = summaryMatch[1];
			i++;
		}
	}

	// Collect lines until the matching </details> (nested toggles count)
	const innerLines: string[] = [];
	let depth = 1;
	while (i < lines.length) {
		const trimmed = lines[i].trim();
		if (isDetailsOpen(trimmed)) depth++;
		if (trimmed === '</details>') {
			depth--;
			if (depth === 0) {
				i++; // Skip </details>
				break;
			}
		}
		innerLines.push(lines[i]);
		i++;
	}

	// Parse inner content as child blocks
	const innerMarkdown = innerLines.join('\n').trim();
	const children = innerMarkdown ? markdownToBlocks(innerMarkdown) : [];

	const block: Block = {
		id: generateId(),
		type: 'toggle',
		content: parseInlineMarks(summaryText),
		children,
		props: open ? { open: true } : {},
	};

	return { block, nextIndex: i };
}

// ---- Inline mark parsing ----

/**
 * Token types produced by the inline tokenizer.
 */
interface InlineToken {
	type:
		| 'text'
		| 'bold'
		| 'italic'
		| 'bolditalic'
		| 'strikethrough'
		| 'code'
		| 'underline'
		| 'link'
		| 'superscript'
		| 'subscript'
		| 'inserted'
		| 'marked'
		| 'colored';
	/** highlight ("marked") / text color ("colored") CSS color from a styled tag */
	color?: string;
	text: string;
	href?: string;
	/** A bare URL in the text (autolink), as opposed to [text](href). */
	auto?: boolean;
	/** Link title from [text](href "title"). */
	title?: string;
}

/** Parse a styled inline tag at `i` given its exact opening prefix (up to the
 *  CSS value) and closing tag. Returns the CSS color, the inner text, and the
 *  index just past the closing tag — or null when the tag doesn't close. */
function parseStyledTag(
	text: string,
	i: number,
	prefix: string,
	closeTag: string,
): { color: string; inner: string; end: number } | null {
	const closeQuote = text.indexOf('">', i + prefix.length);
	if (closeQuote === -1) return null;
	const contentStart = closeQuote + 2;
	const end = text.indexOf(closeTag, contentStart);
	if (end === -1) return null;
	const color = text
		.slice(i + prefix.length, closeQuote)
		.replace(/;\s*$/, '')
		.trim();
	if (!color || color.includes('<')) return null;
	return { color, inner: text.slice(contentStart, end), end: end + closeTag.length };
}

/**
 * Detect mention pseudo-URLs (`mde://kind/id`) and pull out their
 * kind + id. Returns null for any non-mention href.
 */
function parseMentionHref(href: string): { kind: string; id: string } | null {
	const m = /^mde:\/\/([a-z]+)\/(.+)$/i.exec(href);
	if (!m) return null;
	const kind = m[1];
	const rawId = m[2];
	try {
		return { kind, id: decodeURIComponent(rawId) };
	} catch {
		return { kind, id: rawId };
	}
}

/**
 * Parse a markdown string for inline formatting marks and return TextSpan[].
 * Supports recursive nesting: bold can contain links, etc.
 */
export function parseInlineMarks(text: string): TextSpan[] {
	if (!text) return [];
	const tokens = tokenizeInline(text);
	return tokensToSpans(tokens);
}

/**
 * Convert tokens to spans, recursively parsing inner content of
 * bold/italic/strikethrough tokens for nested marks (like links).
 */
function tokensToSpans(tokens: InlineToken[]): TextSpan[] {
	const spans: TextSpan[] = [];
	for (const token of tokens) {
		switch (token.type) {
			case 'text':
				spans.push({ text: token.text });
				break;
			case 'code':
				spans.push({ text: token.text, marks: [{ type: 'code' }] });
				break;
			case 'link': {
				const href = token.href || '';
				const mention = parseMentionHref(href);
				if (mention) {
					// The TextSpan.text is the authoritative label and stays in sync
					// with the resolver via MentionPill. Don't duplicate it into
					// attrs.label — the snapshot was the root of date-chip drift and
					// page-rename staleness.
					spans.push({
						text: token.text,
						marks: [
							{
								type: 'mention',
								attrs: { kind: mention.kind, id: mention.id },
							},
						],
					});
				} else {
					// `auto` marks a bare URL so it is written back bare, not as [url](url).
					const attrs: Record<string, string> = token.auto
						? { href, auto: '1' }
						: { href };
					if (token.title) attrs.title = token.title;
					const linkMark: Mark = { type: 'link', attrs };
					if (token.auto) {
						spans.push({ text: token.text, marks: [linkMark] });
					} else {
						// The label can carry its own formatting ([**bold**](url)); a URL
						// inside the label is just label text, not a second link.
						for (const span of tokensToSpans(tokenizeInline(token.text))) {
							const inner = (span.marks ?? []).filter(
								m => m.type !== 'link' && m.type !== 'mention',
							);
							spans.push({ text: span.text, marks: [...inner, linkMark] });
						}
					}
				}
				break;
			}
			case 'superscript':
				spans.push({ text: token.text, marks: [{ type: 'superscript' }] });
				break;
			case 'subscript':
				spans.push({ text: token.text, marks: [{ type: 'subscript' }] });
				break;
			case 'inserted':
				spans.push({ text: token.text, marks: [{ type: 'underline' }] }); // render as underline
				break;
			case 'marked':
			case 'colored': {
				// Recurse so the serializer's nesting round-trips: a color/highlight
				// tag wraps OUTSIDE other marks (<span style=...>**bold**</span>).
				const innerSpans = tokensToSpans(tokenizeInline(token.text));
				const outer: Mark =
					token.type === 'marked'
						? { type: 'highlight', attrs: { color: token.color ?? '#fff3bf' } }
						: { type: 'color', attrs: { color: token.color ?? 'inherit' } };
				for (const span of innerSpans) {
					spans.push({ text: span.text, marks: [outer, ...(span.marks ?? [])] });
				}
				break;
			}
			case 'bold':
			case 'italic':
			case 'bolditalic':
			case 'strikethrough':
			case 'underline': {
				// Recursively parse inner content for nested marks (e.g. bold containing a link)
				const innerTokens = tokenizeInline(token.text);
				const innerSpans = tokensToSpans(innerTokens);
				// Determine which marks to add
				const outerMarks: Mark[] = [];
				if (token.type === 'bold') outerMarks.push({ type: 'bold' });
				else if (token.type === 'italic') outerMarks.push({ type: 'italic' });
				else if (token.type === 'bolditalic') {
					outerMarks.push({ type: 'bold' });
					outerMarks.push({ type: 'italic' });
				} else if (token.type === 'strikethrough')
					outerMarks.push({ type: 'strikethrough' });
				else if (token.type === 'underline') outerMarks.push({ type: 'underline' });
				// Merge outer marks into each inner span
				for (const span of innerSpans) {
					spans.push({
						text: span.text,
						marks: [...outerMarks, ...(span.marks ?? [])],
					});
				}
				break;
			}
		}
	}
	return spans;
}

/**
 * Tokenize inline markdown into a flat list of tokens.
 * Uses a single-pass scan with a priority order for patterns.
 */
function tokenizeInline(text: string): InlineToken[] {
	const tokens: InlineToken[] = [];
	let i = 0;
	let buffer = '';

	function flushBuffer(): void {
		if (buffer) {
			tokens.push({ type: 'text', text: buffer });
			buffer = '';
		}
	}

	while (i < text.length) {
		// --- Backslash escape: \X → literal X for markdown-special characters ---
		if (text[i] === '\\' && i + 1 < text.length && /[!-/:-@[-`{-~]/.test(text[i + 1])) {
			buffer += text[i + 1];
			i += 2;
			continue;
		}

		// --- Inline code: a run of N backticks closed by a run of exactly N ---
		if (text[i] === '`') {
			let n = 1;
			while (text[i + n] === '`') n++;
			let end = -1;
			for (let k = i + n; k < text.length;) {
				if (text[k] !== '`') {
					k++;
					continue;
				}
				let m = 0;
				while (text[k + m] === '`') m++;
				if (m === n) {
					end = k;
					break;
				}
				k += m;
			}
			if (end !== -1) {
				// Kept exactly as written, spaces included (Modlix's renderer shows them).
				const code = text.slice(i + n, end);
				flushBuffer();
				tokens.push({ type: 'code', text: code });
				i = end + n;
				continue;
			}
			buffer += '`'.repeat(n);
			i += n;
			continue;
		}

		// --- Bold+Italic: ***...*** ---
		// Delimiters follow CommonMark flanking: an opener is not followed by
		// whitespace and a closer is not preceded by it ("a * b * c" is literal).
		if (text.slice(i, i + 3) === '***' && !isSpace(text[i + 3])) {
			const end = findFlankingClose(text, i + 3, '***');
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'bolditalic', text: text.slice(i + 3, end) });
				i = end + 3;
				continue;
			}
		}

		// --- Bold: **...** ---
		if (text.slice(i, i + 2) === '**' && !isSpace(text[i + 2])) {
			const end = findFlankingClose(text, i + 2, '**');
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'bold', text: text.slice(i + 2, end) });
				i = end + 2;
				continue;
			}
		}

		// --- Bold+Italic: ___...___ (not inside a word, as in CommonMark) ---
		if (text.slice(i, i + 3) === '___' && !isWordChar(text[i - 1])) {
			const end = findUnderscoreClose(text, i + 3, '___');
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'bolditalic', text: text.slice(i + 3, end) });
				i = end + 3;
				continue;
			}
		}

		// --- Bold: __...__ (not inside a word) ---
		if (text.slice(i, i + 2) === '__' && !isWordChar(text[i - 1])) {
			const end = findUnderscoreClose(text, i + 2, '__');
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'bold', text: text.slice(i + 2, end) });
				i = end + 2;
				continue;
			}
		}

		// --- Strikethrough: ~~...~~ ---
		if (text.slice(i, i + 2) === '~~') {
			const end = text.indexOf('~~', i + 2);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'strikethrough', text: text.slice(i + 2, end) });
				i = end + 2;
				continue;
			}
		}

		// --- Italic: *...* (single, not followed by another * or whitespace) ---
		if (text[i] === '*' && text[i + 1] !== '*' && !isSpace(text[i + 1])) {
			const end = findSingleAsteriskClose(text, i + 1);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'italic', text: text.slice(i + 1, end) });
				i = end + 1;
				continue;
			}
		}

		// --- Italic: _..._ (single underscore, not followed by another _) ---
		// Underscores inside a word (snake_case) are literal, as in CommonMark.
		if (text[i] === '_' && text[i + 1] !== '_' && !/[\p{L}\p{N}]/u.test(text[i - 1] ?? '')) {
			// Find closing single underscore that isn't followed by a word character
			let end = -1;
			for (let j = i + 1; j < text.length; j++) {
				if (
					text[j] === '_' &&
					text[j + 1] !== '_' &&
					(j === i + 1 || text[j - 1] !== '_') &&
					!/[\p{L}\p{N}]/u.test(text[j + 1] ?? '')
				) {
					end = j;
					break;
				}
			}
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'italic', text: text.slice(i + 1, end) });
				i = end + 1;
				continue;
			}
		}

		// --- Underline: <u>...</u> ---
		if (text.slice(i, i + 3) === '<u>') {
			const end = text.indexOf('</u>', i + 3);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'underline', text: text.slice(i + 3, end) });
				i = end + 4; // "</u>".length === 4
				continue;
			}
		}

		// --- Inserted: ++...++ ---
		if (text.slice(i, i + 2) === '++') {
			const end = text.indexOf('++', i + 2);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'inserted', text: text.slice(i + 2, end) });
				i = end + 2;
				continue;
			}
		}

		// --- Marked: ==...== ---
		if (text.slice(i, i + 2) === '==') {
			const end = text.indexOf('==', i + 2);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'marked', text: text.slice(i + 2, end) });
				i = end + 2;
				continue;
			}
		}

		// --- Superscript: ^...^ ---
		if (text[i] === '^') {
			const end = text.indexOf('^', i + 1);
			if (end !== -1 && end - i < 30 && !text.slice(i + 1, end).includes(' ')) {
				flushBuffer();
				tokens.push({ type: 'superscript', text: text.slice(i + 1, end) });
				i = end + 1;
				continue;
			}
		}

		// --- Subscript: ~...~ (single tilde, not ~~) ---
		if (text[i] === '~' && text[i + 1] !== '~') {
			const end = text.indexOf('~', i + 1);
			if (end !== -1 && end - i < 30 && !text.slice(i + 1, end).includes(' ')) {
				flushBuffer();
				tokens.push({ type: 'subscript', text: text.slice(i + 1, end) });
				i = end + 1;
				continue;
			}
		}

		// --- HTML tags: <sup>, <sub>, <ins>, <mark> ---
		if (text.slice(i, i + 5) === '<sup>') {
			const end = text.indexOf('</sup>', i + 5);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'superscript', text: text.slice(i + 5, end) });
				i = end + 6;
				continue;
			}
		}
		if (text.slice(i, i + 5) === '<sub>') {
			const end = text.indexOf('</sub>', i + 5);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'subscript', text: text.slice(i + 5, end) });
				i = end + 6;
				continue;
			}
		}
		if (text.slice(i, i + 5) === '<ins>') {
			const end = text.indexOf('</ins>', i + 5);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'inserted', text: text.slice(i + 5, end) });
				i = end + 6;
				continue;
			}
		}
		if (text.slice(i, i + 6) === '<mark>') {
			const end = text.indexOf('</mark>', i + 6);
			if (end !== -1) {
				flushBuffer();
				tokens.push({ type: 'marked', text: text.slice(i + 6, end) });
				i = end + 7;
				continue;
			}
		}

		// --- Styled highlight / text color (the forms our own serializer emits):
		// <mark style="background-color:X">...</mark> and <span style="color:X">...</span>
		if (text.startsWith('<mark style="background-color:', i)) {
			const styled = parseStyledTag(text, i, '<mark style="background-color:', '</mark>');
			if (styled) {
				flushBuffer();
				tokens.push({ type: 'marked', color: styled.color, text: styled.inner });
				i = styled.end;
				continue;
			}
		}
		if (text.startsWith('<span style="color:', i)) {
			const styled = parseStyledTag(text, i, '<span style="color:', '</span>');
			if (styled) {
				flushBuffer();
				tokens.push({ type: 'colored', color: styled.color, text: styled.inner });
				i = styled.end;
				continue;
			}
		}

		// --- Link: [text](href) ---
		if (text[i] === '[') {
			const result = parseLink(text, i);
			if (result) {
				flushBuffer();
				tokens.push({
					type: 'link',
					text: result.text,
					href: result.href,
					title: result.title,
				});
				i = result.end;
				continue;
			}
		}

		// --- Autolink: bare URLs (https://... or http://...) ---
		if (text.slice(i, i + 8) === 'https://' || text.slice(i, i + 7) === 'http://') {
			const urlMatch = text.slice(i).match(/^(https?:\/\/[^\s<>)\]]+)/);
			if (urlMatch) {
				flushBuffer();
				const url = urlMatch[1];
				tokens.push({ type: 'link', text: url, href: url, auto: true });
				i += url.length;
				continue;
			}
		}

		// --- Plain text ---
		buffer += text[i];
		i++;
	}

	flushBuffer();
	return tokens;
}

function isWordChar(ch: string | undefined): boolean {
	return !!ch && /[\p{L}\p{N}]/u.test(ch);
}

/** Closing underscore run `delim` at or after `start` that ends a word: the
 *  run isn't followed by another underscore or a letter/digit. */
function findUnderscoreClose(text: string, start: number, delim: string): number {
	let at = text.indexOf(delim, start);
	while (at !== -1) {
		const after = text[at + delim.length];
		if (after !== '_' && !isWordChar(after) && at > start) return at;
		at = text.indexOf(delim, at + 1);
	}
	return -1;
}

/**
 * Find the closing single `*` that is not part of `**`.
 */
function findSingleAsteriskClose(text: string, start: number): number {
	for (let i = start; i < text.length; i++) {
		if (
			text[i] === '*' &&
			text[i + 1] !== '*' &&
			(i === start || text[i - 1] !== '*') &&
			!isSpace(text[i - 1])
		) {
			return i;
		}
	}
	return -1;
}

function isSpace(ch: string | undefined): boolean {
	return ch === undefined || /\s/.test(ch);
}

/** Next `delim` at or after `start` that can close: not preceded by whitespace. */
function findFlankingClose(text: string, start: number, delim: string): number {
	let at = text.indexOf(delim, start);
	while (at !== -1) {
		if (at > start && !isSpace(text[at - 1])) return at;
		at = text.indexOf(delim, at + 1);
	}
	return -1;
}

/**
 * Try to parse a markdown link starting at position `start`.
 * Returns null if not a valid link.
 */
function parseLink(
	text: string,
	start: number,
): { text: string; href: string; title?: string; end: number } | null {
	// Expect [text](href) or [text][ref] or [text][]
	const closeBracket = text.indexOf(']', start + 1);
	if (closeBracket === -1) return null;

	const linkText = text.slice(start + 1, closeBracket);

	// Inline link: [text](href "optional title")
	if (text[closeBracket + 1] === '(') {
		const closeParen = text.indexOf(')', closeBracket + 2);
		if (closeParen === -1) return null;
		// Strip optional title: href may be `url "title"`
		let href = text.slice(closeBracket + 2, closeParen).trim();
		let title: string | undefined;
		const titleMatch = href.match(/^(\S+)\s+"([^"]*)"$/);
		if (titleMatch) {
			href = titleMatch[1];
			title = titleMatch[2];
		}
		return { text: linkText, href, title, end: closeParen + 1 };
	}

	// Reference link: [text][ref] or [text][]
	if (text[closeBracket + 1] === '[') {
		const closeRef = text.indexOf(']', closeBracket + 2);
		if (closeRef === -1) return null;
		const refId =
			text.slice(closeBracket + 2, closeRef).toLowerCase() || linkText.toLowerCase();
		const href = _refLinks.get(refId);
		if (href) return { text: linkText, href, end: closeRef + 1 };
	}

	// Shortcut reference link: [text] where text matches a ref
	const shortcutHref = _refLinks.get(linkText.toLowerCase());
	if (shortcutHref) {
		return { text: linkText, href: shortcutHref, end: closeBracket + 1 };
	}

	return null;
}

// tokenToSpan removed — replaced by tokensToSpans with recursive nesting

// ---- Helpers ----

/**
 * Create a Block with a generated ID.
 */
function makeBlock(type: BlockType, content: TextSpan[], props: BlockProps = {}): Block {
	return {
		id: generateId(),
		type,
		content,
		children: [],
		props,
	};
}

// ---- List parser: collects consecutive bullet/numbered lines into a single list block ----

interface ListParseResult {
	/** First-class list-item blocks (bulletItem/numberItem/todoItem) nested via
	 *  children. A run may yield multiple roots. */
	blocks: Block[];
	nextIndex: number;
}

/** Parse a `<!-- mde-list:{json} -->` comment. Returns parsed meta or null. */
function parseListMetaComment(line: string): Record<string, unknown> | null {
	const match = line.trim().match(/^<!--\s*mde-list:(.*?)\s*-->$/);
	if (!match) return null;
	try {
		return JSON.parse(match[1]);
	} catch {
		return null;
	}
}

/**
 * Try to parse a run of list items starting at line index `start`.
 * Handles mixed bullet/numbered items and indented (nested) items.
 * Returns null if the line at `start` is not a list item.
 */
/** Remove up to `width` columns of leading whitespace. */
function dedent(line: string, width: number): string {
	let col = 0;
	let k = 0;
	while (k < line.length && col < width && (line[k] === ' ' || line[k] === '\t')) {
		col += line[k] === '\t' ? 4 - (col % 4) : 1;
		k++;
	}
	return line.slice(k);
}

/** Width of leading whitespace, with tabs advancing to the next multiple of 4. */
function leadingWidth(line: string): number {
	let n = 0;
	for (const ch of line) {
		if (ch === ' ') n++;
		else if (ch === '\t') n += 4 - (n % 4);
		else break;
	}
	return n;
}

/** A list marker at the start of `stripped`: bullet, todo or decimal number.
 *  `prefix` is the marker plus the spaces after it (the item's content offset). */
function matchListMarker(stripped: string): {
	kind: 'bullet' | 'number' | 'todo';
	prefix: number;
	text: string;
	checked?: boolean;
	number?: number;
} | null {
	const todo = stripped.match(/^([-*+]\s+)\[([ xX])\]\s+(.*)$/);
	if (todo)
		return {
			kind: 'todo',
			prefix: todo[1].length,
			text: todo[3],
			checked: todo[2].toLowerCase() === 'x',
		};
	const bullet = stripped.match(/^([-*+]\s+)(.*)$/);
	if (bullet) return { kind: 'bullet', prefix: bullet[1].length, text: bullet[2] };
	const num = stripped.match(/^((\d{1,9})\.\s+)(.*)$/);
	if (num) return { kind: 'number', prefix: num[1].length, text: num[3], number: Number(num[2]) };
	// An empty item: the marker alone on its line.
	if (/^[-*+]$/.test(stripped)) return { kind: 'bullet', prefix: 2, text: '' };
	const emptyNum = stripped.match(/^(\d{1,9})\.$/);
	if (emptyNum)
		return {
			kind: 'number',
			prefix: emptyNum[0].length + 1,
			text: '',
			number: Number(emptyNum[1]),
		};
	return null;
}

function parseListRun(
	lines: string[],
	start: number,
	meta?: Record<string, unknown> | null,
): ListParseResult | null {
	const items: Array<{
		id: string;
		content: TextSpan[];
		raw: string;
		childLines: string[];
		contentIndent: number;
		indent: number;
		kind?: 'bullet' | 'number' | 'todo';
		checked?: boolean;
		number?: number;
	}> = [];
	const kindByLevel = new Map<number, 'bullet' | 'number'>();
	const numberStyleByLevel = new Map<number, string>();
	// Open items from the root down to the current one. A marker indented to at
	// least an open item's content column nests under it (CommonMark rule), so
	// "1. one" followed by "   1. inner" nests while "- a" / " - b" are siblings.
	const stack: Array<{ contentIndent: number }> = [];
	// Set after a blank line inside an item: the next indented line starts a
	// child block rather than continuing the item's own text.
	let pendingChild = false;
	let i = start;

	while (i < lines.length) {
		const line = lines[i];

		if (line.trim() === '') {
			// A blank line ends the list unless the next non-blank line continues
			// it: another marker, or text indented into the current item.
			if (items.length === 0) break;
			let j = i + 1;
			while (j < lines.length && lines[j].trim() === '') j++;
			if (j >= lines.length) break;
			const next = lines[j];
			const nextStripped = next.trimStart();
			const nextIndent = leadingWidth(next);
			if (!nextStripped.startsWith('\\') && matchListMarker(nextStripped)) {
				i = j;
				continue;
			}
			const top = stack[stack.length - 1];
			if (top && nextIndent >= top.contentIndent && nextIndent > 0) {
				// An indented block after a blank line belongs to the item as a child.
				const last = items[items.length - 1];
				if (last.childLines.length > 0) last.childLines.push('');
				i = j;
				pendingChild = true;
				continue;
			}
			break;
		}

		const indent = leadingWidth(line);
		const stripped = line.trimStart();

		// Skip backslash-escaped markers (e.g. \* , \- , 1\.)
		if (stripped.startsWith('\\')) break;

		const marker = matchListMarker(stripped);
		if (marker) {
			while (stack.length > 0 && indent < stack[stack.length - 1].contentIndent) stack.pop();
			// The first item of a run is always top level, whatever its indent.
			const level = items.length === 0 ? 0 : stack.length;
			if (items.length === 0) stack.length = 0;
			stack.push({ contentIndent: indent + marker.prefix });
			if (marker.kind !== 'todo' && !kindByLevel.has(level))
				kindByLevel.set(level, marker.kind);
			if (marker.kind === 'number' && !numberStyleByLevel.has(level))
				numberStyleByLevel.set(level, 'decimal');
			pendingChild = false;
			items.push({
				id: generateId(),
				content: [],
				raw: marker.text,
				childLines: [],
				contentIndent: indent + marker.prefix,
				indent: level,
				kind: marker.kind,
				checked: marker.checked,
				number: marker.number,
			});
			i++;
			continue;
		}

		// Text indented into the current item continues it: a block construct
		// (quote, table, fence, heading, details) or anything after a blank line
		// becomes the item's child blocks; plain text continues its own line.
		const top = stack[stack.length - 1];
		if (items.length > 0 && top && indent >= top.contentIndent) {
			const last = items[items.length - 1];
			const startsBlock = /^(>|\||```|#{1,6}\s|<details)/.test(stripped);
			if (pendingChild || startsBlock || last.childLines.length > 0) {
				last.childLines.push(dedent(line, last.contentIndent));
			} else {
				last.raw += '\n' + stripped;
			}
			i++;
			continue;
		}

		// Not a list line — stop
		break;
	}

	for (const item of items) item.content = parseInlineMarks(item.raw);

	if (items.length === 0) return null;

	// Build levelStyles array from collected kinds
	const maxIndent = Math.max(...items.map(it => it.indent));
	const levelStyles: Array<Record<string, unknown>> = [];
	for (let lvl = 0; lvl <= maxIndent; lvl++) {
		const kind = kindByLevel.get(lvl) ?? 'bullet';
		const numberStyle = numberStyleByLevel.get(lvl);
		const base: Record<string, unknown> = kind === 'number' ? { kind, numberStyle } : { kind };
		levelStyles.push(base);
	}

	// Strip per-item kind when it matches the level style (only keep true overrides)
	for (const item of items) {
		const levelKind = levelStyles[item.indent]?.kind ?? 'bullet';
		if (item.kind === levelKind) {
			delete item.kind;
		}
	}

	// Merge saved metadata (colors, sizes, bulletStyle, etc.) from mde-list comment
	if (meta) {
		const savedStyles = meta.levelStyles as Array<Record<string, unknown>> | undefined;
		if (savedStyles) {
			for (let lvl = 0; lvl < savedStyles.length; lvl++) {
				const saved = savedStyles[lvl];
				if (!saved) continue;
				if (lvl < levelStyles.length) {
					// Merge saved properties over detected ones (saved has priority for visual props)
					for (const key of Object.keys(saved)) {
						if (key !== 'kind') {
							levelStyles[lvl][key] = saved[key];
						}
					}
				} else {
					levelStyles.push(saved);
				}
			}
		}

		// Restore per-item kind overrides
		const itemKinds = meta.itemKinds as Record<string, string> | undefined;
		if (itemKinds) {
			for (const [idxStr, kind] of Object.entries(itemKinds)) {
				const idx = Number(idxStr);
				if (idx < items.length && (kind === 'bullet' || kind === 'number')) {
					items[idx].kind = kind;
				}
			}
		}
	}

	// Build the legacy `list` shape in memory, then run it through the shared
	// read-time converter so pasted/imported markdown yields the same
	// first-class bulletItem/numberItem/todoItem tree as migrated documents.
	// The legacy `list` block is never emitted into the document.
	const legacy = makeBlock('list', [], {
		listItems: items,
		levelStyles,
	});

	const blocks = migrateLegacyList(legacy);

	// Attach each item's indented child blocks ahead of its nested items.
	const childBlocks = new Map(
		items
			.filter(it => it.childLines.length > 0)
			.map(it => [it.id, markdownToBlocks(it.childLines.join('\n'))]),
	);
	if (childBlocks.size > 0) {
		const attach = (siblings: Block[]) => {
			for (const b of siblings) {
				if (b.children.length > 0) attach(b.children);
				const extra = childBlocks.get(b.id);
				if (extra) b.children = [...extra, ...b.children];
			}
		};
		attach(blocks);
	}

	// Keep the start number of a numbered run that doesn't begin at 1
	// ("5. five" stays 5) — EditorBlockTree and the serializer both read it.
	const sourceNumbers = new Map(items.map(it => [it.id, it.number]));
	const applyStartNumbers = (siblings: Block[]) => {
		siblings.forEach((b, idx) => {
			if (b.type === 'numberItem' && siblings[idx - 1]?.type !== 'numberItem') {
				const n = sourceNumbers.get(b.id);
				if (n !== undefined && n !== 1) b.props = { ...b.props, indexHint: n };
			}
			if (b.children.length > 0) applyStartNumbers(b.children);
		});
	};
	applyStartNumbers(blocks);

	return { blocks, nextIndex: i };
}
