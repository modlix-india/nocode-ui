/**
 * A reply drawn in the order it happened. The stream keeps one text string and
 * one thinking string per reply, so each sub-agent card records where both
 * stood when it started (a CardMark). The reply then splits at those marks:
 *
 *   part 1: thinking, tool rows and text before the first card, then that card
 *   part 2: what came after it, up to the next card, then that card
 *   ...
 *   last:   what came after the last card (the answer, its chips)
 *
 * Cards that start with no new text or thinking between them (parallel or
 * nested sub-agents) share one part. A reply with no cards is one part.
 */

export interface CardMark {
	spanKey: string;
	contentLength: number;
	thinkingLength: number;
}

export interface ReplyPart<T, S> {
	thinking: string;
	content: string;
	toolCalls: T[];
	/** Cards drawn after this part's text. */
	spans: S[];
}

interface Boundary {
	contentLength: number;
	thinkingLength: number;
	startedAt: number;
	spanKeys: Set<string>;
}

export function replyParts<
	T extends { startedAt?: number },
	S extends { key: string; startedAt: number },
>(
	content: string,
	thinking: string,
	toolCalls: T[],
	spans: S[],
	marks: CardMark[],
): ReplyPart<T, S>[] {
	const spanByKey = new Map(spans.map(sp => [sp.key, sp]));
	const boundaries: Boundary[] = [];
	const marked = new Set<string>();
	for (const mark of marks) {
		const span = spanByKey.get(mark.spanKey);
		if (!span || marked.has(mark.spanKey)) continue;
		marked.add(mark.spanKey);
		const last = boundaries.at(-1);
		if (
			last &&
			last.contentLength === mark.contentLength &&
			last.thinkingLength === mark.thinkingLength
		) {
			last.spanKeys.add(mark.spanKey);
			continue;
		}
		boundaries.push({
			contentLength: mark.contentLength,
			thinkingLength: mark.thinkingLength,
			startedAt: span.startedAt,
			spanKeys: new Set([mark.spanKey]),
		});
	}

	const parts: ReplyPart<T, S>[] = [];
	let from = { content: 0, thinking: 0, startedAt: -Infinity };
	const placed = new Set<string>();
	for (const b of boundaries) {
		parts.push({
			thinking: thinking.slice(from.thinking, b.thinkingLength),
			content: content.slice(from.content, b.contentLength),
			toolCalls: toolCalls.filter(
				tc => startedAt(tc) >= from.startedAt && startedAt(tc) < b.startedAt,
			),
			spans: spans.filter(sp => b.spanKeys.has(sp.key)),
		});
		b.spanKeys.forEach(k => placed.add(k));
		from = { content: b.contentLength, thinking: b.thinkingLength, startedAt: b.startedAt };
	}
	parts.push({
		thinking: thinking.slice(from.thinking),
		content: content.slice(from.content),
		toolCalls: toolCalls.filter(tc => startedAt(tc) >= from.startedAt),
		// A card with no mark (never expected) still shows, in the last part.
		spans: spans.filter(sp => !placed.has(sp.key)),
	});
	return parts;
}

// A tool with no start time belongs to the last part.
function startedAt(tc: { startedAt?: number }): number {
	return tc.startedAt ?? Infinity;
}
