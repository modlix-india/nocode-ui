import { EventStreamParser, openEventStream, StreamMessage } from '../authedEventStream';

const encoder = new TextEncoder();

function streamResponse(chunks: string[], status = 200) {
	let i = 0;
	return {
		ok: status >= 200 && status < 300,
		status,
		body: {
			getReader: () => ({
				read: async () =>
					i < chunks.length
						? { done: false, value: encoder.encode(chunks[i++]) }
						: { done: true, value: undefined },
			}),
		},
	} as unknown as Response;
}

function errorResponse(status: number) {
	return { ok: false, status, body: null } as unknown as Response;
}

const flush = async () => {
	for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0));
};

describe('EventStreamParser', () => {
	test('unnamed events are message events and data is the raw string', () => {
		const p = new EventStreamParser();
		expect(p.feed('data:{"conversationId":7}\n\n')).toEqual([
			{ type: 'message', data: '{"conversationId":7}', lastEventId: '' },
		]);
	});

	test('events split across chunks, CRLF split between chunks, multi-line data', () => {
		const p = new EventStreamParser();
		expect(p.feed('event: wa\r')).toEqual([]);
		expect(p.feed('\ndata: a\r\nda')).toEqual([]);
		expect(p.feed('ta: b\r\n\r\n')).toEqual([{ type: 'wa', data: 'a\nb', lastEventId: '' }]);
	});

	test('comments, id, retry, BOM and an empty event', () => {
		const p = new EventStreamParser();
		const out = p.feed('﻿: keep-alive\n\nid: 42\nretry: 1500\ndata\n\n');
		expect(out).toEqual([{ type: 'message', data: '', lastEventId: '42' }]);
		expect(p.retry).toBe(1500);
		expect(p.lastEventId).toBe('42');
	});

	test('an event type does not leak into the next event', () => {
		const p = new EventStreamParser();
		expect(p.feed('event: x\ndata: 1\n\ndata: 2\n\n').map(m => m.type)).toEqual([
			'x',
			'message',
		]);
	});
});

describe('openEventStream', () => {
	test('sends the token as the Authorization header and includes cookies', async () => {
		const fetchImpl = jest.fn().mockResolvedValue(streamResponse(['data: hi\n\n']));
		const got: StreamMessage[] = [];
		const close = openEventStream(
			'/api/message/events/whatsapp/stream?appCode=a&clientCode=B',
			{
				eventNames: ['message'],
				onMessage: m => got.push(m),
				fetchImpl,
				getToken: () => 'tok123',
				setTimer: () => 1,
				clearTimer: () => {},
			},
		);
		await flush();

		const [, init] = fetchImpl.mock.calls[0];
		expect(init.headers.Authorization).toBe('tok123');
		expect(init.headers.Accept).toBe('text/event-stream');
		expect(init.credentials).toBe('include');
		expect(got.map(m => m.data)).toEqual(['hi']);
		close();
	});

	test('delivers only the wanted event types', async () => {
		const fetchImpl = jest
			.fn()
			.mockResolvedValue(
				streamResponse(['event: a\ndata: 1\n\nevent: b\ndata: 2\n\ndata: 3\n\n']),
			);
		const got: string[] = [];
		const close = openEventStream('/s', {
			eventNames: ['b'],
			onMessage: m => got.push(m.data),
			fetchImpl,
			getToken: () => undefined,
			setTimer: () => 1,
			clearTimer: () => {},
		});
		await flush();
		expect(got).toEqual(['2']);
		close();
	});

	test('no token header for another origin', async () => {
		const fetchImpl = jest.fn().mockResolvedValue(streamResponse([]));
		const close = openEventStream('https://elsewhere.example.com/s', {
			eventNames: ['message'],
			onMessage: () => {},
			fetchImpl,
			getToken: () => 'tok123',
			setTimer: () => 1,
			clearTimer: () => {},
		});
		await flush();
		expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBeUndefined();
		close();
	});

	test('a 401 backs off, re-reads the token and recovers', async () => {
		const timers: Array<{ fn: () => void; ms: number }> = [];
		let token: string | undefined;
		const fetchImpl = jest
			.fn()
			.mockResolvedValueOnce(errorResponse(401))
			.mockResolvedValueOnce(errorResponse(401))
			.mockResolvedValueOnce(streamResponse(['id: 9\ndata: ok\n\n']))
			.mockResolvedValue(streamResponse([]));
		const errors: unknown[] = [];
		const got: string[] = [];

		const close = openEventStream('/s', {
			eventNames: ['message'],
			onMessage: m => got.push(m.data),
			onError: e => errors.push(e),
			fetchImpl,
			getToken: () => token,
			setTimer: (fn, ms) => {
				timers.push({ fn, ms });
				return timers.length;
			},
			clearTimer: () => {},
		});
		await flush();
		expect(errors).toHaveLength(1);
		expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBeUndefined();
		expect(timers[0].ms).toBe(3000);

		timers[0].fn();
		await flush();
		expect(timers[1].ms).toBe(6000);

		token = 'signed-in';
		timers[1].fn();
		await flush();
		expect(fetchImpl.mock.calls[2][1].headers.Authorization).toBe('signed-in');
		expect(got).toEqual(['ok']);
		// The stream ended normally, so the next attempt is at the plain retry delay and resumes.
		expect(timers[2].ms).toBe(3000);

		timers[2].fn();
		await flush();
		expect(fetchImpl.mock.calls[3][1].headers['Last-Event-ID']).toBe('9');
		close();
	});

	test('close aborts the request and cancels the pending retry', async () => {
		const cleared: unknown[] = [];
		const fetchImpl = jest.fn().mockResolvedValue(errorResponse(500));
		const close = openEventStream('/s', {
			eventNames: ['message'],
			onMessage: () => {},
			onError: () => {},
			fetchImpl,
			getToken: () => undefined,
			setTimer: () => 'timer-1',
			clearTimer: h => cleared.push(h),
		});
		await flush();
		const signal: AbortSignal = fetchImpl.mock.calls[0][1].signal;
		close();
		expect(signal.aborted).toBe(true);
		expect(cleared).toEqual(['timer-1']);
	});
});
