import { replyParts, type CardMark } from '../replyParts';

/**
 * A reply is drawn in the order it happened: what the orchestrator thought and
 * wrote before a sub-agent card stays above that card (live 2026-09-29: the
 * lead-in and "Reasoned through it" rendered under a running Product Analyst,
 * and the lead-in ran into the answer as "for you.Here are").
 */

const lead = 'Perfect, let me pull together a competitor list for you.';
const answer = 'Here are five competitors I found in your space.';
const think1 = 'The user wants competitors.';
const think2 = 'The analyst found five.';

const span = (key: string, startedAt: number) => ({ key, startedAt });
const tool = (id: string, startedAt?: number) => ({ id, startedAt });
const mark = (spanKey: string, contentLength: number, thinkingLength: number): CardMark => ({
	spanKey,
	contentLength,
	thinkingLength,
});

const cases: Array<{
	label: string;
	content: string;
	thinking: string;
	tools: ReturnType<typeof tool>[];
	spans: ReturnType<typeof span>[];
	marks: CardMark[];
	want: Array<{ thinking: string; content: string; tools: string[]; spans: string[] }>;
}> = [
	{
		label: 'no cards: one part',
		content: answer,
		thinking: think1,
		tools: [tool('t1', 5)],
		spans: [],
		marks: [],
		want: [{ thinking: think1, content: answer, tools: ['t1'], spans: [] }],
	},
	{
		label: 'the live case: lead-in above the card, answer below',
		content: lead + answer,
		thinking: think1 + think2,
		tools: [tool('before', 5), tool('after', 50)],
		spans: [span('analyst', 10)],
		marks: [mark('analyst', lead.length, think1.length)],
		want: [
			{ thinking: think1, content: lead, tools: ['before'], spans: ['analyst'] },
			{ thinking: think2, content: answer, tools: ['after'], spans: [] },
		],
	},
	{
		label: 'cards started back to back share one part',
		content: lead + answer,
		thinking: '',
		tools: [],
		spans: [span('a', 10), span('b', 11)],
		marks: [mark('a', lead.length, 0), mark('b', lead.length, 0)],
		want: [
			{ thinking: '', content: lead, tools: [], spans: ['a', 'b'] },
			{ thinking: '', content: answer, tools: [], spans: [] },
		],
	},
	{
		label: 'a card marked twice is drawn once',
		content: lead + answer,
		thinking: '',
		tools: [],
		spans: [span('a', 10)],
		marks: [mark('a', lead.length, 0), mark('a', lead.length + answer.length, 0)],
		want: [
			{ thinking: '', content: lead, tools: [], spans: ['a'] },
			{ thinking: '', content: answer, tools: [], spans: [] },
		],
	},
	{
		label: 'a tool with no start time goes to the last part',
		content: lead + answer,
		thinking: '',
		tools: [tool('untimed')],
		spans: [span('a', 10)],
		marks: [mark('a', lead.length, 0)],
		want: [
			{ thinking: '', content: lead, tools: [], spans: ['a'] },
			{ thinking: '', content: answer, tools: ['untimed'], spans: [] },
		],
	},
];

test.each(cases)('$label', ({ content, thinking, tools, spans, marks, want }) => {
	const parts = replyParts(content, thinking, tools, spans, marks);
	expect(
		parts.map(p => ({
			thinking: p.thinking,
			content: p.content,
			tools: p.toolCalls.map(t => t.id),
			spans: p.spans.map(s => s.key),
		})),
	).toEqual(want);
});
