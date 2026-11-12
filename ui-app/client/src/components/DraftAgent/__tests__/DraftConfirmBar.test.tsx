/**
 * The Draft agent's floating Allow/Deny bar (AB-1065). Like the Prompt's
 * approval card (LZ-828), it says what the SERVER says happened: a click only
 * waits for the result, the tool's result decides Approved / Not done / Denied,
 * `confirmation_expired` turns the buttons off, and a late click answered 404
 * or 410 says the change did not run.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
	confirmationAtRunEnd,
	confirmationFromRequest,
	confirmationOutcome,
	DraftConfirmation,
	DraftConfirmBar,
	expireConfirmation,
	postConfirmation,
} from '../DraftConfirmBar';

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
	delete (globalThis as any).fetch;
});

function request(): DraftConfirmation {
	return confirmationFromRequest(
		{
			confirmation_id: 'confirm_u1',
			tool_name: 'deal_create',
			display_name: 'Create Deal',
			message: "Create deal 'Priya Sharma' on product Primus",
			session_id: 's1',
		},
		null,
	);
}

function render(c: DraftConfirmation, onAnswer = jest.fn(), onDismiss = jest.fn()) {
	act(() => {
		root.render(<DraftConfirmBar confirmation={c} onAnswer={onAnswer} onDismiss={onDismiss} />);
	});
	return onAnswer;
}

const confirmButtons = () =>
	Array.from(container.querySelectorAll<HTMLButtonElement>('button._mlxDAConfirmBtn'));
const text = () => container.textContent ?? '';

/** Run a click through POST /confirm, answered by `fetchMock`, and return the card after. */
async function click(c: DraftConfirmation, fetchMock: jest.Mock, approved = true) {
	(globalThis as any).fetch = fetchMock;
	let card = c;
	const seen: Partial<DraftConfirmation>[] = [];
	await postConfirmation({
		baseUrl: '/api/ai/appbuilder',
		headers: { 'Content-Type': 'application/json' },
		card: c,
		approved,
		patch: p => {
			seen.push(p);
			card = { ...card, ...p };
		},
	});
	return { card, seen };
}

const answered = (status: number, body: any = {}) =>
	jest.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });

test('a waiting bar offers live Allow and Deny', () => {
	const onAnswer = render(request());
	expect(text()).toContain('Priya Sharma');
	expect(confirmButtons().map(b => b.disabled)).toEqual([false, false]);
	act(() => confirmButtons()[0].click());
	expect(onAnswer).toHaveBeenCalledWith(true);
});

test('the card id names the tool when the request carries no tool_use_id', () => {
	expect(request().toolUseId).toBe('u1');
});

describe('normal Allow flow', () => {
	test('a taken click waits for the result, buttons off, never "Approved"', async () => {
		const fetchMock = answered(200, { status: 'ok' });
		const { card, seen } = await click(request(), fetchMock);
		expect(seen[0]).toMatchObject({ sending: true, selectedValue: 'approve' });
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('/api/ai/appbuilder/confirm');
		expect(JSON.parse(init.body)).toEqual({
			confirmation_id: 'confirm_u1',
			session_id: 's1',
			approved: true,
			selected: 'approve',
		});
		expect(card).toMatchObject({ status: 'pending', sending: false, sent: true });
		const onAnswer = render(card);
		expect(text()).toContain('Waiting for the result');
		expect(text()).not.toContain('Approved');
		expect(confirmButtons().every(b => b.disabled)).toBe(true);
		act(() => confirmButtons().forEach(b => b.click()));
		expect(onAnswer).not.toHaveBeenCalled();
	});

	test('a click still on its way also waits, buttons off', () => {
		render({ ...request(), sending: true, selectedValue: 'approve' });
		expect(text()).toContain('Waiting for the result');
		expect(confirmButtons().every(b => b.disabled)).toBe(true);
	});

	test('a network failure gives the buttons back', async () => {
		const { card } = await click(request(), jest.fn().mockRejectedValue(new TypeError('x')));
		expect(card).toMatchObject({ status: 'pending', sending: false });
		render(card);
		expect(confirmButtons().map(b => b.disabled)).toEqual([false, false]);
	});
});

describe("the tool's result decides", () => {
	const sent = (): DraftConfirmation => ({ ...request(), sent: true, selectedValue: 'approve' });

	test('a successful run reads Approved', () => {
		const card = confirmationOutcome(sent(), 'u1', true, 'Created deal')!;
		expect(card.status).toBe('approved');
		render(card);
		expect(text()).toContain('Approved: Create Deal');
		expect(confirmButtons()).toHaveLength(0);
	});

	test('a denied run reads Denied: nothing changed', () => {
		const card = confirmationOutcome(sent(), 'u1', false, 'Denied: nothing changed')!;
		expect(card.status).toBe('denied');
		render(card);
		expect(text()).toContain('Denied: Create Deal');
		expect(text()).toContain('Denied: nothing changed');
		expect(text()).not.toContain('Approved');
	});

	test('an approved change whose tool failed reads Not done with the reason', () => {
		const card = confirmationOutcome(sent(), 'u1', false, 'Could not create the deal: 403')!;
		render(card);
		expect(text()).toContain('Not done: Create Deal');
		expect(text()).toContain('Could not create the deal: 403');
		expect(text()).not.toContain('Approved');
	});

	test('another tool, or an expired card, is left alone', () => {
		const c = sent();
		expect(confirmationOutcome(c, 'u9', true, 'ok')).toBe(c);
		const expired = expireConfirmation(c, 'confirm_u1', 'timeout')!;
		expect(confirmationOutcome(expired, 'u1', true, 'ok')).toBe(expired);
	});
});

describe('confirmation_expired', () => {
	test('no answer in time: buttons off, says nothing changed', () => {
		const card = expireConfirmation(request(), 'confirm_u1', 'timeout')!;
		const onAnswer = render(card);
		expect(text()).toContain(
			'Expired: no answer, nothing changed. Ask again if you still want it.',
		);
		expect(text()).toContain('Priya Sharma');
		expect(confirmButtons().every(b => b.disabled)).toBe(true);
		act(() => confirmButtons().forEach(b => b.click()));
		expect(onAnswer).not.toHaveBeenCalled();
	});

	test('a click taken but never run expires too', () => {
		const card = expireConfirmation({ ...request(), sent: true }, 'confirm_u1', 'timeout')!;
		expect(card).toMatchObject({ status: 'expired', sent: false });
	});

	test('a stopped run says so', () => {
		render(expireConfirmation(request(), 'confirm_u1', 'cancelled')!);
		expect(text()).toContain('Expired: the run was stopped, nothing changed');
	});

	test('another id, or a decided card, is left alone', () => {
		const c = request();
		expect(expireConfirmation(c, 'confirm_u9', 'timeout')).toBe(c);
		const done = { ...c, status: 'approved' as const };
		expect(expireConfirmation(done, 'confirm_u1', 'timeout')).toBe(done);
	});
});

describe('a late click', () => {
	for (const status of [404, 410]) {
		test(`answered ${status} says the change did not run`, async () => {
			const { card } = await click(request(), answered(status, { status: 'expired' }));
			expect(card).toMatchObject({
				status: 'expired',
				expiredReason: 'late',
				sending: false,
			});
			render(card);
			expect(text()).toContain(
				'Expired: the change did not run. Ask again if you still want it.',
			);
			expect(text()).not.toContain('Approved');
			expect(confirmButtons().every(b => b.disabled)).toBe(true);
		});
	}
});

describe('when the run ends', () => {
	test('a run the person stopped expires an unanswered bar', () => {
		const card = confirmationAtRunEnd(request(), true)!;
		render(card);
		expect(text()).toContain('Expired: the run was stopped, nothing changed');
		expect(confirmButtons().every(b => b.disabled)).toBe(true);
	});

	test('a decided bar stays to be read; an undecided one goes, as before', () => {
		const done = confirmationOutcome(request(), 'u1', true, 'ok');
		expect(confirmationAtRunEnd(done, false)).toBe(done);
		expect(confirmationAtRunEnd(request(), false)).toBeUndefined();
		expect(confirmationAtRunEnd(undefined, true)).toBeUndefined();
	});
});
