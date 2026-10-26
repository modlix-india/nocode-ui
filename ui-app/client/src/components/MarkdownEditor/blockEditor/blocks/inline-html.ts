// ============================================================
// Inline markdown → HTML for plain-string surfaces (table cells).
// Cells store raw inline markdown; this renders it for display
// while the cell isn't being edited. All text is escaped, and
// link hrefs are limited to safe schemes.
// ============================================================

import type { TextSpan } from '../core/types';
import { parseInlineMarks } from '../markdown/deserialize';

const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

function escapeHtml(text: string): string {
	return text.replace(/[&<>"']/g, c => ESCAPES[c] ?? c);
}

function safeHref(href: string | undefined): string | null {
	if (!href) return null;
	const trimmed = href.trim();
	if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
	if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
	return null;
}

function safeColor(color: string | undefined): string | null {
	if (!color) return null;
	return /^[#a-z0-9(),.%\s-]+$/i.test(color) ? color : null;
}

function spanToHtml(span: TextSpan): string {
	let html = escapeHtml(span.text);
	for (const mark of span.marks ?? []) {
		switch (mark.type) {
			case 'bold':
				html = `<strong>${html}</strong>`;
				break;
			case 'italic':
				html = `<em>${html}</em>`;
				break;
			case 'underline':
				html = `<u>${html}</u>`;
				break;
			case 'strikethrough':
				html = `<s>${html}</s>`;
				break;
			case 'code':
				html = `<code>${html}</code>`;
				break;
			case 'superscript':
				html = `<sup>${html}</sup>`;
				break;
			case 'subscript':
				html = `<sub>${html}</sub>`;
				break;
			case 'link': {
				const href = safeHref(mark.attrs?.href);
				if (href)
					html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
				break;
			}
			case 'highlight': {
				const color = safeColor(mark.attrs?.color);
				html = color
					? `<mark style="background-color:${color}">${html}</mark>`
					: `<mark>${html}</mark>`;
				break;
			}
			case 'color': {
				const color = safeColor(mark.attrs?.color);
				if (color) html = `<span style="color:${color}">${html}</span>`;
				break;
			}
		}
	}
	return html;
}

/** True when `text` contains characters that inline markdown could format. */
export function hasInlineMarkup(text: string): boolean {
	return /[*_`~[\]<=^\\]/.test(text);
}

/** Render inline markdown to an escaped HTML string. */
export function inlineMarkdownToHtml(text: string): string {
	return parseInlineMarks(text).map(spanToHtml).join('');
}
