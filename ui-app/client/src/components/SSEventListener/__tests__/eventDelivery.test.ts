import { createSerialQueue, eventArguments, parseEventData } from '../eventDelivery';

describe('parseEventData', () => {
	test('JSON parses, anything else stays text', () => {
		expect(parseEventData('{"a":[1,2]}')).toEqual({ a: [1, 2] });
		expect(parseEventData('42')).toBe(42);
		expect(parseEventData('connected')).toBe('connected');
		expect(parseEventData('{broken')).toBe('{broken');
		expect(parseEventData('')).toBe('');
		expect(parseEventData('  ')).toBe('  ');
	});
});

describe('eventArguments', () => {
	test('eventName, data, id and receivedAt', () => {
		const args = eventArguments({ type: 'x', data: '{"k":1}', lastEventId: '9' }, 123);
		expect(Object.fromEntries(args)).toEqual({
			eventName: 'x',
			data: { k: 1 },
			id: '9',
			receivedAt: 123,
		});
	});
});

describe('createSerialQueue', () => {
	test('tasks run one at a time in order, a failure does not stop the rest', async () => {
		const order: string[] = [];
		const errors: unknown[] = [];
		const q = createSerialQueue(e => errors.push(e));
		let release!: () => void;
		q.push(
			() =>
				new Promise<void>(r => {
					order.push('a:start');
					release = () => {
						order.push('a:end');
						r();
					};
				}),
		);
		q.push(() => {
			order.push('b');
			throw new Error('b failed');
		});
		q.push(() => order.push('c'));

		await Promise.resolve();
		await Promise.resolve();
		expect(order).toEqual(['a:start']);
		release();
		await q.idle();
		expect(order).toEqual(['a:start', 'a:end', 'b', 'c']);
		expect(errors).toHaveLength(1);
	});

	test('close drops tasks not yet started', async () => {
		const ran: string[] = [];
		const q = createSerialQueue();
		q.push(() => ran.push('a'));
		q.close();
		q.push(() => ran.push('b'));
		await q.idle();
		expect(ran).toEqual([]);
	});
});
