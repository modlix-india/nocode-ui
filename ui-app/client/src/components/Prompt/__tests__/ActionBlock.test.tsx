/**
 * An approval card nothing waits on any more (LZT-1952). The server sends
 * `confirmation_expired` when a card gets no answer in time; the card must then
 * say "Expired, ask again" with its buttons off, and a click on it must never
 * show "Approved".
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
	ActionBlock,
	ConfirmationAction,
	EXPIRED_LABEL,
	markConfirmationExpired,
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

	test('an answered card keeps its answer, and nothing changes for an unknown id', () => {
		const answered = [{ confirmationActions: [card({ status: 'approved' })] }];
		expect(markConfirmationExpired(answered, 'confirm_u1')).toBe(answered);
		const list = msgs();
		expect(markConfirmationExpired(list, 'confirm_zz')).toBe(list);
	});
});
