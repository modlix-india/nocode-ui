import { followRun, StreamEvent } from '../draftAgentStream';

/** A fetch answer whose body yields these chunks, then optionally dies mid-read. */
function answer(status: number, chunks: string[], dies = false) {
	const enc = new TextEncoder();
	let i = 0;
	return {
		ok: status < 400,
		status,
		body: {
			getReader: () => ({
				read: async () => {
					if (i < chunks.length) return { done: false, value: enc.encode(chunks[i++]) };
					if (dies) throw new TypeError('network error');
					return { done: true, value: undefined };
				},
			}),
		},
	};
}

const sse = (type: string, data: any) => `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;

function run(fetchMock: jest.Mock, sid: string | null = 's1') {
	(globalThis as any).fetch = fetchMock;
	const events: StreamEvent[] = [];
	const reconnects: number[] = [];
	const result = followRun({
		endpoint: '/api/ai/leadzump/chat',
		baseUrl: '/api/ai/leadzump',
		headers: () => ({}),
		body: { message: 'hi' },
		signal: new AbortController().signal,
		onEvent: e => events.push(e),
		sessionId: () => sid,
		onReconnecting: a => reconnects.push(a),
		backoffMs: 0,
	});
	return { result, events, reconnects };
}

describe('followRun', () => {
	it('ends on the done event without rejoining', async () => {
		const f = jest
			.fn()
			.mockResolvedValueOnce(answer(200, [sse('text', { text: 'a' }), sse('done', {})]));
		const { result, reconnects } = run(f);
		expect(await result).toEqual({ status: 200, outcome: 'done' });
		expect(f).toHaveBeenCalledTimes(1);
		expect(reconnects).toEqual([]);
	});

	it('rejoins through /attach when the socket dies mid-run, instead of failing', async () => {
		const f = jest
			.fn()
			.mockResolvedValueOnce(answer(200, [sse('text', { text: 'a' })], true))
			.mockResolvedValueOnce(
				answer(200, [
					sse('replay_start', {}),
					sse('text', { text: 'ab' }),
					sse('done', {}),
				]),
			);
		const { result, events, reconnects } = run(f);
		expect(await result).toEqual({ status: 200, outcome: 'done' });
		expect(f.mock.calls[1][0]).toBe('/api/ai/leadzump/attach');
		expect(JSON.parse(f.mock.calls[1][1].body)).toEqual({ session_id: 's1' });
		expect(events.map(e => e.type)).toEqual(['text', 'replay_start', 'text', 'done']);
		expect(reconnects).toEqual([1]);
	});

	it('reads a 404 from /attach as a run that finished while we were away', async () => {
		const f = jest
			.fn()
			.mockResolvedValueOnce(answer(200, [], true))
			.mockResolvedValueOnce(answer(404, []));
		expect(await run(f).result).toEqual({ status: 200, outcome: 'over' });
	});

	it('treats a stream that closes without done as a drop too', async () => {
		const f = jest
			.fn()
			.mockResolvedValueOnce(answer(200, [sse('text', { text: 'a' })]))
			.mockResolvedValueOnce(answer(200, [sse('replay_end', { running: false })]));
		expect(await run(f).result).toEqual({ status: 200, outcome: 'done' });
	});

	it('gives up as lost, not as an error, after the attempts run out', async () => {
		const f = jest.fn().mockResolvedValue(answer(200, [], true));
		const { result, reconnects } = run(f);
		expect(await result).toEqual({ status: 200, outcome: 'lost' });
		expect(reconnects).toEqual([1, 2, 3]);
	});

	it('cannot rejoin a chat the server never named', async () => {
		const f = jest.fn().mockResolvedValueOnce(answer(200, [], true));
		expect(await run(f, null).result).toEqual({ status: 200, outcome: 'lost' });
		expect(f).toHaveBeenCalledTimes(1);
	});

	it('passes a refused POST straight back', async () => {
		const f = jest.fn().mockResolvedValueOnce(answer(409, []));
		expect(await run(f).result).toEqual({ status: 409, outcome: 'http' });
	});
});
