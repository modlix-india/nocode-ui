import React from 'react';
import {
	ASK_AGAIN,
	cardToolUseId,
	ConfirmationAction,
	decidedWords,
	expiredPatch,
	expiredText,
	isAwaitingAnswer,
	isUndecided,
	SENT_TEXT,
	toolOutcomePatch,
} from '../Prompt/components/ActionBlock';

// The floating bar's approval, kept in the same shape as the Prompt's approval
// card so it follows the same rules and says the same words (AB-1065, LZ-828):
// the server decides what it says, never the click alone.
export type DraftConfirmation = ConfirmationAction & { sessionId: string };

const APPROVE_DENY = [
	{ label: 'Approve', value: 'approve' },
	{ label: 'Deny', value: 'deny' },
];

// A `confirmation_request` event as the bar's card.
export function confirmationFromRequest(data: any, sid: string | null): DraftConfirmation {
	const card: DraftConfirmation = {
		confirmationId: data?.confirmation_id ?? '',
		toolName: data?.tool_name ?? '',
		displayName: data?.display_name ?? '',
		message: data?.message || data?.display_name || 'Allow this change?',
		details: data?.details ?? {},
		options: APPROVE_DENY,
		toolUseId: '',
		status: 'pending',
		sessionId: data?.session_id ?? sid ?? '',
	};
	card.toolUseId = data?.tool_use_id || cardToolUseId(card);
	return card;
}

// `confirmation_expired`: no answer in time, or the run was stopped. Only a card
// the server has not decided can expire.
export function expireConfirmation(
	c: DraftConfirmation | undefined,
	confirmationId: string,
	reason?: string,
): DraftConfirmation | undefined {
	if (!c || !confirmationId || c.confirmationId !== confirmationId || !isUndecided(c)) return c;
	return { ...c, ...expiredPatch(reason) };
}

// `tool_result` for the card's tool: what the run really did with it.
export function confirmationOutcome(
	c: DraftConfirmation | undefined,
	toolUseId: string,
	success: boolean | undefined,
	summary: string,
): DraftConfirmation | undefined {
	if (!c || !toolUseId || cardToolUseId(c) !== toolUseId || c.status === 'expired') return c;
	return { ...c, ...toolOutcomePatch(success, summary) };
}

// The run is over. A decided card stays so its outcome can be read; one still
// undecided expires as stopped when the person stopped the run, and otherwise
// goes, as before (nothing more will come for it on this line).
export function confirmationAtRunEnd(
	c: DraftConfirmation | undefined,
	stopped: boolean,
): DraftConfirmation | undefined {
	if (!c) return c;
	if (!isUndecided(c)) return c;
	if (stopped) return { ...c, ...expiredPatch('cancelled') };
	return undefined;
}

// POST /confirm for a click, reporting each change of the card through `patch`.
// The click never makes the card "Approved": a taken click waits for the tool's
// result, and a 404 or 410 means the card had already expired, so the change
// did not run (LZ-828: the same handling as the Prompt card).
export async function postConfirmation(opts: {
	baseUrl: string;
	headers: Record<string, string>;
	card: DraftConfirmation;
	approved: boolean;
	patch: (p: Partial<DraftConfirmation>) => void;
}): Promise<void> {
	const { card, approved, patch } = opts;
	const selectedValue = approved ? 'approve' : 'deny';
	patch({ sending: true, selectedValue });
	try {
		const response = await fetch(`${opts.baseUrl}/confirm`, {
			method: 'POST',
			headers: opts.headers,
			body: JSON.stringify({
				confirmation_id: card.confirmationId,
				session_id: card.sessionId,
				approved,
				selected: selectedValue,
			}),
		});
		if (response.status === 404 || response.status === 410) {
			patch({ sending: false, status: 'expired', expiredReason: 'late' });
			return;
		}
		if (!response.ok) {
			// Not taken: let them try again.
			patch({ sending: false });
			return;
		}
		patch({ sending: false, sent: true });
	} catch {
		// Network failure: let them try again. If it never arrives the server
		// expires the card and says so.
		patch({ sending: false });
	}
}

export function DraftConfirmBar({
	confirmation: c,
	onAnswer,
	onDismiss,
}: Readonly<{
	confirmation: DraftConfirmation;
	onAnswer: (approved: boolean) => void;
	onDismiss?: () => void;
}>) {
	if (c.status === 'approved' || c.status === 'denied' || c.status === 'failed') {
		const { label, line } = decidedWords(c);
		return (
			<div className="_mlxDAConfirm">
				<span>{label}</span>
				{line && <span>{line}</span>}
				{onDismiss && (
					<button className="_mlxDALink" onClick={onDismiss}>
						Dismiss
					</button>
				)}
			</div>
		);
	}

	const live = isAwaitingAnswer(c);
	const expired = c.status === 'expired' || c.status === 'timeout';
	let note = '';
	if (expired) note = `${expiredText(c.expiredReason)}. ${ASK_AGAIN}`;
	else if (!live) note = SENT_TEXT;
	return (
		<div className="_mlxDAConfirm">
			<span>{c.message}</span>
			{note && <span>{note}</span>}
			<button
				className="_mlxDAConfirmBtn _yes"
				disabled={!live}
				onClick={() => live && onAnswer(true)}
			>
				Allow
			</button>
			<button
				className="_mlxDAConfirmBtn"
				disabled={!live}
				onClick={() => live && onAnswer(false)}
			>
				Deny
			</button>
			{expired && onDismiss && (
				<button className="_mlxDALink" onClick={onDismiss}>
					Dismiss
				</button>
			)}
		</div>
	);
}
