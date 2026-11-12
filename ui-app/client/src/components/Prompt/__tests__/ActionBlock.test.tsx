/**
 * An approval card nothing waits on any more (LZT-1952). The server sends
 * `confirmation_expired` when a card gets no answer in time; the card must then
 * say it expired with its buttons off, and a click on it must never show
 * "Approved". LZ-828: the card reads "Approved" only from the tool's result row
 * (the change was made), in the same words as the step row.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
	ActionBlock,
	applyToolOutcome,
	ASK_AGAIN,
	ConfirmationAction,
	DENIED_TEXT,
	EXPIRED_LABEL,
	EXPIRED_TEXT,
	LATE_TEXT,
	markConfirmationExpired,
	SENT_TEXT,
	STOPPED_TEXT,
} from '../components/ActionBlock';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

function card(patch: Partial<ConfirmationAction> = {}): ConfirmationAction {
	return {
		confirmationId: 'confirm_u1',
		toolName: 'deal_create',
		displayName: 'Create Deal',
		message: "Create deal 'Priya Sharma' on product Primus",
		details: {},
		options: [
			{ label: 'Approve', value: 'approve' },
			{ label: 'Deny', value: 'deny' },
		],
		toolUseId: 'u1',
		status: 'pending',
		...patch,
	};
}

function render(action: ConfirmationAction, onRespond = jest.fn()) {
	act(() => {
		root.render(<ActionBlock action={action} onRespond={onRespond} />);
	});
	return onRespond;
}

function buttons(): HTMLButtonElement[] {
	return Array.from(container.querySelectorAll('button'));
}

test('a waiting card offers live buttons', () => {
	const onRespond = render(card());
	expect(buttons().map(b => b.disabled)).toEqual([false, false]);
	act(() => buttons()[1].click());
	expect(onRespond).toHaveBeenCalledWith('confirm_u1', true, 'approve');
});

test('an expired card says so, keeps its text, and its buttons do nothing', () => {
	const onRespond = render(card({ status: 'expired' }));
	expect(container.textContent).toContain(EXPIRED_LABEL);
	expect(container.textContent).toContain('Priya Sharma');
	expect(container.textContent).not.toContain('Approved');
	expect(buttons().map(b => b.disabled)).toEqual([true, true]);
	act(() => buttons().forEach(b => b.click()));
	expect(onRespond).not.toHaveBeenCalled();
});

test('a click on its way to the server disables the card, not "Approved" yet', () => {
	render(card({ sending: true, selectedValue: 'approve' }));
	expect(buttons().every(b => b.disabled)).toBe(true);
	expect(container.textContent).not.toContain('Approved');
});

test('a click the server took waits for the result, never "Approved"', () => {
	render(card({ sent: true, selectedValue: 'approve' }));
	expect(buttons().every(b => b.disabled)).toBe(true);
	expect(container.textContent).toContain(SENT_TEXT);
	expect(container.textContent).not.toContain('Approved');
});

test('an expired card says the step row words and to ask again', () => {
	render(card({ status: 'expired', expiredReason: 'timeout' }));
	expect(container.textContent).toContain(`${EXPIRED_TEXT}. ${ASK_AGAIN}`);
});

test('a click after expiry says the change did not run and to ask again', () => {
	render(card({ status: 'expired', expiredReason: 'late' }));
	expect(container.textContent).toContain(`${LATE_TEXT}. ${ASK_AGAIN}`);
	expect(container.textContent).not.toContain('Approved');
});

test('a denied card says nothing changed', () => {
	render(card({ status: 'denied' }));
	expect(container.textContent).toContain('Denied: Create Deal');
	expect(container.textContent).toContain(DENIED_TEXT);
});

test('an approved change that failed is not shown as approved', () => {
	render(card({ status: 'failed', note: 'Could not create the deal' }));
	expect(container.textContent).toContain('Not done: Create Deal');
	expect(container.textContent).toContain('Could not create the deal');
	expect(container.textContent).not.toContain('Approved');
});

test('an approved card reads as approved', () => {
	render(card({ status: 'approved' }));
	expect(container.textContent).toContain('Approved: Create Deal');
	expect(buttons()).toHaveLength(0);
});

describe('markConfirmationExpired', () => {
	const msgs = () => [
		{ id: 'a', confirmationActions: [card(), card({ confirmationId: 'confirm_u2' })] },
		{ id: 'b' },
	];

	test('expires only the named waiting card', () => {
		const next = markConfirmationExpired(msgs(), 'confirm_u1');
		expect(next[0].confirmationActions!.map(a => a.status)).toEqual(['expired', 'pending']);
	});

	test('a card in flight is expired and released', () => {
		const next = markConfirmationExpired(
			[{ confirmationActions: [card({ sending: true })] }],
			'confirm_u1',
		);
		expect(next[0].confirmationActions![0]).toMatchObject({
			status: 'expired',
			sending: false,
		});
	});

	test('a card the server took but never ran is expired (LZ-828)', () => {
		const next = markConfirmationExpired(
			[{ confirmationActions: [card({ sent: true, selectedValue: 'approve' })] }],
			'confirm_u1',
			'timeout',
		);
		expect(next[0].confirmationActions![0]).toMatchObject({
			status: 'expired',
			sent: false,
			expiredReason: 'timeout',
		});
	});

	test('an answered card keeps its answer, and nothing changes for an unknown id', () => {
		const answered = [{ confirmationActions: [card({ status: 'approved' })] }];
		expect(markConfirmationExpired(answered, 'confirm_u1')).toBe(answered);
		const list = msgs();
		expect(markConfirmationExpired(list, 'confirm_zz')).toBe(list);
	});
});

describe('applyToolOutcome: the card follows the run, not the click (LZ-828)', () => {
	const sent = () => [{ confirmationActions: [card({ sent: true, selectedValue: 'approve' })] }];

	test('a successful tool run makes the card Approved', () => {
		const next = applyToolOutcome(sent(), 'u1', true, 'Linked');
		expect(next[0].confirmationActions![0]).toMatchObject({ status: 'approved', sent: false });
	});

	test('an expired step row makes the card Expired, never Approved', () => {
		for (const summary of ['Expired: no answer', EXPIRED_TEXT]) {
			const next = applyToolOutcome(sent(), 'u1', false, summary);
			expect(next[0].confirmationActions![0]).toMatchObject({
				status: 'expired',
				expiredReason: 'timeout',
			});
		}
		const stopped = applyToolOutcome(sent(), 'u1', false, STOPPED_TEXT);
		expect(stopped[0].confirmationActions![0].expiredReason).toBe('cancelled');
	});

	test('a denied step row makes the card Denied', () => {
		for (const summary of ['Denied: User denied the operation', DENIED_TEXT]) {
			const next = applyToolOutcome(sent(), 'u1', false, summary);
			expect(next[0].confirmationActions![0].status).toBe('denied');
		}
	});

	test('an approved run whose tool failed reads Not done with the reason', () => {
		const next = applyToolOutcome(sent(), 'u1', false, 'Could not link the items: 403');
		expect(next[0].confirmationActions![0]).toMatchObject({
			status: 'failed',
			note: 'Could not link the items: 403',
		});
	});

	test('finds the card by its confirm_ id when the request had no tool_use_id', () => {
		const list = [{ confirmationActions: [card({ toolUseId: '', sent: true })] }];
		expect(applyToolOutcome(list, 'u1', true, 'ok')[0].confirmationActions![0].status).toBe(
			'approved',
		);
	});

	test('another tool, or an already expired card, is left alone', () => {
		const list = sent();
		expect(applyToolOutcome(list, 'u9', true, 'ok')).toBe(list);
		const expired = [{ confirmationActions: [card({ status: 'expired' })] }];
		expect(applyToolOutcome(expired, 'u1', true, 'ok')).toBe(expired);
	});
});
