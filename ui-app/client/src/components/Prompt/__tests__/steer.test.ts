import { postSteer, SteerQueue } from '../steer';

describe('postSteer', () => {
	const call = (status: number | Error) => {
		(globalThis as any).fetch = jest.fn(async () => {
			if (status instanceof Error) throw status;
			return { ok: status < 400, status };
		});
		return postSteer({
			baseUrl: '/api/ai/blueprint',
			headers: {},
			sessionId: 's1',
			text: 'x',
			steerId: 'st1',
		});
	};

	it('posts to <agent>/steer with the session, text and id', async () => {
		expect(await call(200)).toBe('queued');
		const [url, init] = (globalThis as any).fetch.mock.calls[0];
		expect(url).toBe('/api/ai/blueprint/steer');
		expect(JSON.parse(init.body)).toEqual({ session_id: 's1', message: 'x', steer_id: 'st1' });
	});
	it('reads 404 as a run that already ended', async () => expect(await call(404)).toBe('missed'));
	it('reads anything else as failed', async () => {
		expect(await call(409)).toBe('failed');
		expect(await call(new TypeError('network error'))).toBe('failed');
	});
});

describe('SteerQueue', () => {
	it('settles its own steers and tells them from replayed ones', () => {
		const q = new SteerQueue();
		q.add('a', 'first');
		q.add('b', 'second');
		expect(q.settle({ id: 'a', text: 'first', applied: true })).toEqual({
			id: 'a',
			text: 'first',
			applied: true,
			ours: true,
		});
		expect(q.settle({ id: 'zz', text: 'other tab', applied: true }).ours).toBe(false);
		expect(q.settle({ id: 'b', applied: false })).toMatchObject({
			text: 'second',
			applied: false,
			ours: true,
		});
		expect(q.size).toBe(0);
	});
	it('hands back what was never read when the run ends', () => {
		const q = new SteerQueue();
		q.add('a', 'one');
		q.add('b', 'two');
		expect(q.orphans()).toEqual(['one', 'two']);
		expect(q.size).toBe(0);
	});
});
