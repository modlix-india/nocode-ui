/**
 * Cutting a reply into the parts it is drawn as.
 *
 * Before this, a reply was drawn as it is stored: everything the orchestrator
 * wrote landed under a running Product Analyst card, and the lead-in ran into
 * the answer as "for you.Here are" (live 2026-09-29). These pin where each piece
 * lands once the reply is cut at the points its sub-agents started.
 */

import { splitReply, AgentStart, ReplyPart } from '../replyParts';

const leadIn = 'Perfect, let me pull together a competitor list for you.';
const answer = 'Here are five competitors I found in your space.';
const firstThought = 'The user wants competitors.';
const secondThought = 'The analyst found five.';

const tool = (id: string, startedAt: number) => ({ id, startedAt });
const agent = (key: string, startedAt: number) => ({ key, startedAt });

// Where one sub-agent started: after the lead-in and the first thought.
const afterLeadIn = (spanKey: string): AgentStart => ({
	spanKey,
	contentLength: leadIn.length,
	thinkingLength: firstThought.length,
});

// Each part as the ids of what it holds, so a failure reads at a glance.
const summarise = (parts: ReplyPart<ReturnType<typeof tool>, ReturnType<typeof agent>>[]) =>
	parts.map(p => ({
		thinking: p.thinking,
		content: p.content,
		toolCalls: p.toolCalls.map(tc => tc.id),
		agentSpans: p.agentSpans.map(a => a.key),
	}));

describe('splitReply', () => {
	it('keeps a reply with no sub-agents as one part', () => {
		const parts = splitReply(
			{ thinking: firstThought, content: answer, toolCalls: [tool('t1', 5)], agentSpans: [] },
			[],
		);
		expect(summarise(parts)).toEqual([
			{ thinking: firstThought, content: answer, toolCalls: ['t1'], agentSpans: [] },
		]);
	});

	it('draws what came before a card above it, and the answer below', () => {
		const parts = splitReply(
			{
				thinking: firstThought + secondThought,
				content: leadIn + answer,
				toolCalls: [tool('before', 5), tool('after', 50)],
				agentSpans: [agent('analyst', 10)],
			},
			[afterLeadIn('analyst')],
		);
		expect(summarise(parts)).toEqual([
			{
				thinking: firstThought,
				content: leadIn,
				toolCalls: ['before'],
				agentSpans: ['analyst'],
			},
			{ thinking: secondThought, content: answer, toolCalls: ['after'], agentSpans: [] },
		]);
	});

	it('groups cards that started with nothing written between them', () => {
		const parts = splitReply(
			{
				thinking: firstThought,
				content: leadIn + answer,
				toolCalls: [],
				agentSpans: [agent('a', 10), agent('b', 11)],
			},
			[afterLeadIn('a'), afterLeadIn('b')],
		);
		expect(parts.map(p => p.agentSpans.map(a => a.key))).toEqual([['a', 'b'], []]);
	});

	it('still draws a card whose start was never recorded, with the answer', () => {
		const parts = splitReply(
			{ thinking: '', content: answer, toolCalls: [], agentSpans: [agent('a', 10)] },
			[],
		);
		expect(summarise(parts)).toEqual([
			{ thinking: '', content: answer, toolCalls: [], agentSpans: ['a'] },
		]);
	});
});
