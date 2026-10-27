// ============================================================
// Shared helpers for canonical `[Label](mde://kind/id)` mention markdown.
// Used by MentionInput, table cells, and anywhere else that stores plain
// markdown strings but needs to render mention chips inline.
// ============================================================

import type { MentionItem } from './mention-types';

export interface MentionSegment {
	type: 'text' | 'mention';
	text: string;
	kind?: string;
	id?: string;
}

const MENTION_RE = /\[((?:\\.|[^\]\\])*)\]\(mde:\/\/([a-z]+)\/([^)]+)\)/gi;

/** Split a value into a sequence of plain text and mention segments. */
export function parseMentionSegments(value: string): MentionSegment[] {
	const out: MentionSegment[] = [];
	if (!value) return out;
	let last = 0;
	let m: RegExpExecArray | null;
	// Reset regex state to be safe (parseMentionSegments is called repeatedly).
	MENTION_RE.lastIndex = 0;
	while ((m = MENTION_RE.exec(value)) !== null) {
		if (m.index > last) out.push({ type: 'text', text: value.slice(last, m.index) });
		out.push({
			type: 'mention',
			text: m[1].replace(/\\(.)/g, '$1'),
			kind: m[2],
			id: decodeURIComponent(m[3]),
		});
		last = MENTION_RE.lastIndex;
	}
	if (last < value.length) out.push({ type: 'text', text: value.slice(last) });
	return out;
}

/** Canonical markdown form for one mention. */
export function serializeMention(label: string, kind: string, id: string): string {
	const escaped = label.replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]');
	return `[${escaped}](mde://${kind}/${encodeURIComponent(id)})`;
}

/**
 * Replace the visible-text range [from, to) with a mention pill. Used by
 * surfaces that store markdown strings (table cells, MentionInput) — the
 * offsets refer to the rendered plain text, not the raw markdown.
 */
export function spliceMentionInMarkdown(
	value: string,
	from: number,
	to: number,
	item: MentionItem,
): string {
	const segs = parseMentionSegments(value);
	const label =
		item.kind === 'user' && !item.label.startsWith('@') ? `@${item.label}` : item.label;
	const mentionRaw = serializeMention(label, item.kind, item.id);

	let before = '';
	let after = '';
	let pos = 0;
	for (const seg of segs) {
		const visLen = seg.text.length;
		const segStart = pos;
		const segEnd = pos + visLen;
		const segRaw =
			seg.type === 'mention'
				? serializeMention(seg.text, seg.kind ?? 'page', seg.id ?? '')
				: seg.text;
		if (segEnd <= from) {
			before += segRaw;
		} else if (segStart >= to) {
			after += segRaw;
		} else if (seg.type === 'text') {
			const leftKeep = Math.max(0, from - segStart);
			const rightKeep = Math.max(0, segEnd - to);
			before += seg.text.slice(0, leftKeep);
			if (rightKeep > 0) after += seg.text.slice(seg.text.length - rightKeep);
		}
		// Mention segments straddling the cut range get dropped entirely.
		pos = segEnd;
	}
	return before + mentionRaw + after;
}

/**
 * Walk a contentEditable cell that renders inline chip spans + plain text,
 * and produce the canonical markdown form. Chip elements must carry
 * `data-mention="true"`, `data-mention-kind`, `data-mention-id`,
 * `data-mention-label`.
 */
export function readMentionMarkdownFromDOM(root: HTMLElement): string {
	let out = '';
	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			// Strip zero-width-space pads we inject for caret placement after a
			// trailing chip — they're a render-time affordance, not data.
			out += (node.textContent ?? '').replaceAll('​', '');
			return;
		}
		if (node instanceof HTMLElement) {
			if (node.dataset.mention === 'true') {
				const kind = node.dataset.mentionKind ?? 'page';
				const id = node.dataset.mentionId ?? '';
				const label = node.dataset.mentionLabel ?? node.textContent ?? '';
				out += serializeMention(label, kind, id);
				return;
			}
			if (node.tagName === 'BR') return;
		}
		for (const child of Array.from(node.childNodes)) walk(child);
	};
	walk(root);
	return out;
}

/** Plain-text view of a markdown value: chip labels only. */
export function mentionValueToPlain(value: string | null | undefined): string {
	if (!value) return '';
	return parseMentionSegments(value)
		.map(s => s.text)
		.join('');
}
