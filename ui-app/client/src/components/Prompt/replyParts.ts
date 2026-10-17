/**
 * A reply cut into the parts it is drawn as, so it reads in the order it happened.
 *
 * Split out of LazyPrompt because the cut has rules worth testing on their own.
 *
 * A message keeps all the orchestrator's text as one string and all its thinking
 * as another, however many sub-agents ran in between. Drawn as stored, the text
 * written before a sub-agent's card landed under it, and the text on either side
 * of the card ran together ("for you.Here are"). So each sub-agent records how
 * far the reply had got when it started (an AgentStart), and the reply is cut
 * there.
 */

/** How far a reply had got when one of its sub-agents started. */
export interface AgentStart {
	/** The started agent's `AgentSpan.key`. */
	spanKey: string;
	/** Length of the reply's text at that moment. */
	contentLength: number;
	/** Length of the reply's thinking at that moment. */
	thinkingLength: number;
}

/**
 * One part of a reply, drawn top to bottom: its thinking and tool rows, its
 * text, then the cards of the sub-agents that started after that text.
 *
 * The fields are named as on LazyPrompt's Message, so a whole reply is a part
 * too: the one `splitReply` starts from.
 */
export interface ReplyPart<Tool, Agent> {
	thinking: string;
	content: string;
	/** The orchestrator's own tool rows. A sub-agent's are drawn inside its card. */
	toolCalls: Tool[];
	/** Sub-agents in the order they started. */
	agentSpans: Agent[];
}

/**
 * Cut a reply at the points its sub-agents started.
 *
 * Every part but the last ends with the cards that started there; the last part
 * is the answer. Sub-agents that started with nothing written between them
 * (several at once, or one starting another) share a part, so their cards are
 * drawn as one group. A reply with no sub-agents comes back as one part.
 *
 * Tool rows are placed by time rather than position: a tool belongs to the part
 * that was being written when it started.
 */
export function splitReply<
	Tool extends { startedAt?: number },
	Agent extends { key: string; startedAt: number },
>(reply: ReplyPart<Tool, Agent>, starts: AgentStart[]): ReplyPart<Tool, Agent>[] {
	const parts: ReplyPart<Tool, Agent>[] = [];
	// A sub-agent with no recorded start is not expected, but its card still
	// shows, with the answer, rather than silently disappearing.
	const unplaced: Agent[] = [];
	// Where the part being cut begins.
	let contentFrom = 0;
	let thinkingFrom = 0;
	let timeFrom = -Infinity;

	for (const agent of reply.agentSpans) {
		const start = starts.find(s => s.spanKey === agent.key);
		if (!start) {
			unplaced.push(agent);
			continue;
		}

		const nothingWrittenSince =
			start.contentLength === contentFrom && start.thinkingLength === thinkingFrom;
		if (nothingWrittenSince && parts.length) {
			parts[parts.length - 1].agentSpans.push(agent);
			continue;
		}

		parts.push({
			thinking: reply.thinking.slice(thinkingFrom, start.thinkingLength),
			content: reply.content.slice(contentFrom, start.contentLength),
			toolCalls: reply.toolCalls.filter(
				tc => startTime(tc) >= timeFrom && startTime(tc) < agent.startedAt,
			),
			agentSpans: [agent],
		});
		contentFrom = start.contentLength;
		thinkingFrom = start.thinkingLength;
		timeFrom = agent.startedAt;
	}

	parts.push({
		thinking: reply.thinking.slice(thinkingFrom),
		content: reply.content.slice(contentFrom),
		toolCalls: reply.toolCalls.filter(tc => startTime(tc) >= timeFrom),
		agentSpans: unplaced,
	});
	return parts;
}

// A tool with no start time counts as the latest, so it lands in the last part.
const startTime = (tc: { startedAt?: number }) => tc.startedAt ?? Infinity;
