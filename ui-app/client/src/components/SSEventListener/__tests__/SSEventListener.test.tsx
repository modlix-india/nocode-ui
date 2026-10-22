/**
 * SSEventListener delivering events to the page: the Arguments onEvent gets, one run per event
 * in arrival order under a burst, the optional binding path, and the old binding path behaviour
 * (raw strings appended) kept for pages that read the array.
 *
 * REAL: the listener component and its delivery queue. STUBBED: the store, useDefinition,
 * runEvent (deferred, so the test decides when each run finishes) and the stream itself.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import type { EventStreamOptions, StreamMessage } from '../authedEventStream';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).designMode = undefined;

const store = new Map<string, any>();
const writes: Array<[string, any]> = [];

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'page' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	getDataFromPath: (path: string) => store.get(path),
	setData: (path: string, value: any) => {
		writes.push([path, value]);
		store.set(path, value);
	},
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'sse', properties }),
}));

jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../../slaveFunctions', () => ({ messageToMaster: jest.fn() }));

type Run = { args: Map<string, any>; binding: any; finish: () => void };
const runs: Run[] = [];
jest.mock('../../util/runEvent', () => ({
	runEvent: jest.fn(
		(_fn: any, _key: string, _page: string, _lh: any, _pd: any, args: Map<string, any>) =>
			new Promise<void>(resolve => {
				const binding = store.get('Page.events');
				runs.push({ args, binding: binding ? [...binding] : undefined, finish: resolve });
			}),
	),
}));

let streamOptions: EventStreamOptions | undefined;
const closeStream = jest.fn();
const openEventStream = jest.fn((_url: string, options: EventStreamOptions) => {
	streamOptions = options;
	return closeStream;
});
jest.mock('../authedEventStream', () => ({
	openEventStream: (url: string, options: EventStreamOptions) => openEventStream(url, options),
}));

import SSEventListener from '../LazySSEventListener';

const PAGE_DEFINITION = { eventFunctions: { onEv: { name: 'onEv', steps: {} } } } as any;

let container: HTMLDivElement;
let root: Root;

function render(bindingPath?: any, pageDefinition = PAGE_DEFINITION) {
	act(() => {
		root.render(
			<SSEventListener
				definition={
					{
						key: 'sse',
						type: 'SSEventListener',
						name: 'SSEventListener',
						...(bindingPath ? { bindingPath } : {}),
					} as any
				}
				pageDefinition={pageDefinition}
				locationHistory={[]}
				context={{ pageName: 'page' } as any}
			/>,
		);
	});
}

function message(type: string, data: string, lastEventId = ''): StreamMessage {
	return { type, data, lastEventId };
}

/** Lets the queue's promise chain move on. */
async function settle() {
	await act(async () => {
		for (let i = 0; i < 5; i++) await Promise.resolve();
	});
}

beforeEach(() => {
	store.clear();
	writes.length = 0;
	runs.length = 0;
	streamOptions = undefined;
	openEventStream.mockClear();
	closeStream.mockClear();
	properties = { url: '/api/notification/subscribe?appCode=app', onEvent: 'onEv' };
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

describe('SSEventListener', () => {
	test('opens without a binding path and passes the Arguments', async () => {
		jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
		render();
		expect(openEventStream).toHaveBeenCalledTimes(1);
		expect(openEventStream.mock.calls[0][0]).toBe('/api/notification/subscribe?appCode=app');
		expect(streamOptions!.eventNames).toEqual([]);

		streamOptions!.onMessage(
			message('incomingCall', '{"event":"incomingCall","data":{"from":"+91"}}', 'e-7'),
		);
		await settle();

		expect(runs).toHaveLength(1);
		expect(Object.fromEntries(runs[0].args)).toEqual({
			eventName: 'incomingCall',
			data: { event: 'incomingCall', data: { from: '+91' } },
			id: 'e-7',
			receivedAt: 1_700_000_000_000,
		});
		// No binding path, so nothing is written to the store.
		expect(writes).toEqual([]);
		(Date.now as jest.Mock).mockRestore();
	});

	test('data that is not JSON arrives as the text', async () => {
		render();
		streamOptions!.onMessage(message('message', 'hello there'));
		await settle();
		expect(runs[0].args.get('data')).toBe('hello there');
		expect(runs[0].args.get('id')).toBe('');
	});

	test('a burst runs once per event, in order, each run finished before the next', async () => {
		render();
		streamOptions!.onMessage(message('a', '1'));
		streamOptions!.onMessage(message('b', '2'));
		streamOptions!.onMessage(message('c', '3'));
		await settle();

		// Only the first has started; the others wait for it.
		expect(runs.map(r => r.args.get('eventName'))).toEqual(['a']);

		runs[0].finish();
		await settle();
		expect(runs.map(r => r.args.get('eventName'))).toEqual(['a', 'b']);

		runs[1].finish();
		await settle();
		runs[2].finish();
		await settle();
		expect(runs.map(r => r.args.get('eventName'))).toEqual(['a', 'b', 'c']);
		expect(runs.map(r => r.args.get('data'))).toEqual([1, 2, 3]);
	});

	test('with a binding path the raw strings are appended, one per run, as before', async () => {
		render('Page.events');
		streamOptions!.onMessage(message('wa', '{"conversationId":7}'));
		streamOptions!.onMessage(message('wa', '{"conversationId":8}'));
		await settle();

		// The first run sees its own event as the last element, not the newest one.
		expect(runs[0].binding).toEqual(['{"conversationId":7}']);
		runs[0].finish();
		await settle();
		expect(runs[1].binding).toEqual(['{"conversationId":7}', '{"conversationId":8}']);
		runs[1].finish();
		await settle();

		expect(store.get('Page.events')).toEqual(['{"conversationId":7}', '{"conversationId":8}']);
		// The run still gets the parsed data in its Arguments.
		expect(runs[1].args.get('data')).toEqual({ conversationId: 8 });
	});

	test('eventName is passed to the stream as a list', () => {
		properties = { ...properties, eventName: ['incomingCall', 'taskChanged'] };
		render();
		expect(streamOptions!.eventNames).toEqual(['incomingCall', 'taskChanged']);
	});

	test('no stream without a url, an onEvent, or the event function', () => {
		properties = { onEvent: 'onEv' };
		render();
		properties = { url: '/s' };
		render();
		properties = { url: '/s', onEvent: 'missing' };
		render();
		expect(openEventStream).not.toHaveBeenCalled();
	});

	test('unmounting closes the stream and drops events not yet run', async () => {
		render();
		streamOptions!.onMessage(message('a', '1'));
		streamOptions!.onMessage(message('b', '2'));
		await settle();
		expect(runs).toHaveLength(1);

		act(() => root.render(<></>));
		expect(closeStream).toHaveBeenCalledTimes(1);

		runs[0].finish();
		await settle();
		expect(runs).toHaveLength(1);
	});
});
