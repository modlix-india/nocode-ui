import { StreamMessage } from './authedEventStream';

/**
 * How one server sent event reaches the page's onEvent function: the Arguments it gets, and a
 * queue that runs one function per event, in arrival order, each run finished before the next
 * starts. Before the queue a burst of events overlapped their runs, and a handler that read the
 * last element of the binding path array saw only the newest event, so the others were lost.
 */

/** `data` as JSON when it parses, else the text exactly as it arrived. */
export function parseEventData(text: string): any {
	if (typeof text !== 'string' || !text.trim()) return text;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

/**
 * The Arguments map for onEvent:
 * - `eventName`: the SSE event type (`message` when the server named none)
 * - `data`: the event data, JSON parsed when it parses, else the text
 * - `id`: the event id (the stream's last event id), empty when the server sent none
 * - `receivedAt`: when the browser received it, epoch milliseconds
 */
export function eventArguments(
	message: StreamMessage,
	receivedAt: number = Date.now(),
): Map<string, any> {
	return new Map<string, any>([
		['eventName', message.type],
		['data', parseEventData(message.data)],
		['id', message.lastEventId ?? ''],
		['receivedAt', receivedAt],
	]);
}

export interface SerialQueue {
	/** Adds a task; it starts after every task added before it has settled. */
	push(task: () => unknown): void;
	/** Drops the tasks not yet started. A task already running finishes. */
	close(): void;
	/** Settles when every task pushed so far has settled. For tests. */
	idle(): Promise<void>;
}

export function createSerialQueue(onError?: (error: unknown) => void): SerialQueue {
	let tail: Promise<void> = Promise.resolve();
	let closed = false;
	return {
		push(task) {
			if (closed) return;
			tail = tail.then(async () => {
				if (closed) return;
				try {
					await task();
				} catch (error) {
					onError?.(error);
				}
			});
		},
		close() {
			closed = true;
		},
		idle() {
			return tail;
		},
	};
}
