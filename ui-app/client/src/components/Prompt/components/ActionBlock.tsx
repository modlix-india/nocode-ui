import React, { useCallback, useState } from 'react';

export interface ActionOption {
	label: string;
	value: string;
}

export interface ConfirmationAction {
	confirmationId: string;
	toolName: string;
	displayName: string;
	message: string;
	details: Record<string, any>;
	options: ActionOption[];
	toolUseId: string;
	// What the SERVER says happened, never what was clicked (LZ-828: the card read
	// "Approved: Link Items" while the step read "Expired: no answer" and nothing
	// was written). `approved` = the tool ran and succeeded, `failed` = it was
	// approved but the tool failed, `denied` / `expired` = nothing ran. Set from
	// the tool's result row, `confirmation_expired`, or a click refused as expired.
	status: 'pending' | 'approved' | 'denied' | 'timeout' | 'expired' | 'failed';
	selectedValue?: string;
	// A click is on its way to POST /confirm.
	sending?: boolean;
	// The server accepted the click; the outcome is still to come.
	sent?: boolean;
	// Why it expired: "timeout" (no answer in time), "cancelled" (the run was
	// stopped) or "late" (a click arrived after it expired).
	expiredReason?: string;
	// The tool's own words when an approved change failed.
	note?: string;
}

// One set of words for an approval's outcome, used by the card AND by the step
// row under the reply (nocode-ai app/core/agent.py writes the step row with the
// same words), so the two never tell different stories (LZ-828).
export const EXPIRED_LABEL = 'Expired';
export const EXPIRED_TEXT = 'Expired: no answer, nothing changed';
export const STOPPED_TEXT = 'Expired: the run was stopped, nothing changed';
export const LATE_TEXT = 'Expired: the change did not run';
export const ASK_AGAIN = 'Ask again if you still want it.';
export const DENIED_TEXT = 'Denied: nothing changed';
export const SENT_TEXT = 'Waiting for the result';

export function expiredText(reason?: string): string {
	if (reason === 'cancelled') return STOPPED_TEXT;
	if (reason === 'late') return LATE_TEXT;
	return EXPIRED_TEXT;
}

// The tool_use_id a card belongs to. The server names a card `confirm_<tool_use_id>`.
export function cardToolUseId(action: Pick<ConfirmationAction, 'confirmationId' | 'toolUseId'>) {
	if (action.toolUseId) return action.toolUseId;
	return action.confirmationId.startsWith('confirm_')
		? action.confirmationId.slice('confirm_'.length)
		: '';
}

// Has the server not yet said what became of this card?
export function isUndecided(a: ConfirmationAction): boolean {
	return a.status === 'pending';
}

// Is the card waiting on the person (buttons live)?
export function isAwaitingAnswer(a: ConfirmationAction): boolean {
	return a.status === 'pending' && !a.sending && !a.sent;
}

function patchCards<M extends { confirmationActions?: ConfirmationAction[] }>(
	messages: M[],
	match: (a: ConfirmationAction) => boolean,
	patch: (a: ConfirmationAction) => Partial<ConfirmationAction>,
): M[] {
	let changed = false;
	const next = messages.map(m => {
		if (!m.confirmationActions?.some(match)) return m;
		changed = true;
		return {
			...m,
			confirmationActions: m.confirmationActions.map(a =>
				match(a) ? { ...a, ...patch(a) } : a,
			),
		};
	});
	return changed ? next : messages;
}

// Mark one card expired wherever it is. Only a card the server has not decided
// can expire: one sent but never taken included (LZ-828: a click answered 200 by
// another worker that never reached the run). Returns the same array when
// nothing changed, so React skips the render.
export function markConfirmationExpired<M extends { confirmationActions?: ConfirmationAction[] }>(
	messages: M[],
	confirmationId: string,
	reason?: string,
): M[] {
	return patchCards(
		messages,
		a => a.confirmationId === confirmationId && isUndecided(a),
		() => ({ status: 'expired' as const, sending: false, sent: false, expiredReason: reason }),
	);
}

// The tool's result row decides the card: the run either did the change, failed
// it, or never ran it (denied or expired). This is the server's real outcome.
export function applyToolOutcome<M extends { confirmationActions?: ConfirmationAction[] }>(
	messages: M[],
	toolUseId: string,
	success: boolean | undefined,
	summary: string,
): M[] {
	if (!toolUseId) return messages;
	const text = (summary ?? '').trim();
	let patch: Partial<ConfirmationAction>;
	if (success) patch = { status: 'approved' };
	else if (/^expired\b/i.test(text))
		patch = {
			status: 'expired',
			expiredReason: /stopped/i.test(text) ? 'cancelled' : 'timeout',
		};
	else if (/^denied\b/i.test(text)) patch = { status: 'denied' };
	else patch = { status: 'failed', note: text };
	return patchCards(
		messages,
		a => cardToolUseId(a) === toolUseId && a.status !== 'expired',
		() => ({ ...patch, sending: false, sent: false }),
	);
}

interface ActionBlockProps {
	action: ConfirmationAction;
	onRespond: (confirmationId: string, approved: boolean, selectedValue: string) => void;
}

function formatDetails(details: Record<string, any>): string[] {
	const lines: string[] = [];
	const objType = details.object_type;
	const name = details.name || details.page_name || details.id || '';

	if (objType) lines.push(`Type: ${objType}`);
	if (name) lines.push(`Name: ${name}`);

	if (details.operations) {
		const ops = details.operations;
		const summary = ops
			.slice(0, 4)
			.map((op: any) => `${op.op || '?'} ${op.component_key || op.parent_key || ''}`)
			.join(', ');
		lines.push(`Operations: ${summary}${ops.length > 4 ? ` +${ops.length - 4} more` : ''}`);
	}

	if (details.event_function) {
		lines.push(`Event: ${details.event_function.function_name || '?'}`);
	}

	if (details.definition) lines.push('Includes definition update');
	if (details.properties) lines.push(`Properties: ${Object.keys(details.properties).join(', ')}`);
	if (details.variables) lines.push('Includes theme variables');

	return lines;
}

export function ActionBlock({ action, onRespond }: Readonly<ActionBlockProps>) {
	const [selected, setSelected] = useState<string | null>(null);
	const isExpired = action.status === 'expired' || action.status === 'timeout';
	// Buttons work only while the server is waiting and no click is in flight.
	const isPending = isAwaitingAnswer(action);
	// Clicked and taken (or on its way): the result is still to come.
	const isWaitingResult = action.status === 'pending' && !isPending;
	const name = action.displayName || action.toolName;

	const isApproveOrDeny =
		action.options.length === 2 &&
		action.options.some(o => o.value === 'approve') &&
		action.options.some(o => o.value === 'deny');

	const handleOptionClick = useCallback(
		(value: string) => {
			if (!isPending) return;

			if (isApproveOrDeny) {
				const approved = value === 'approve';
				onRespond(action.confirmationId, approved, value);
			} else {
				setSelected(value);
			}
		},
		[isPending, isApproveOrDeny, action.confirmationId, onRespond],
	);

	const handleConfirmSelection = useCallback(() => {
		if (!isPending || !selected) return;
		onRespond(action.confirmationId, true, selected);
	}, [isPending, selected, action.confirmationId, onRespond]);

	const detailLines = formatDetails(action.details);

	// Decided by the server: show the compact result, in the step row's words.
	if (action.status === 'approved' || action.status === 'denied' || action.status === 'failed') {
		const isApproved = action.status === 'approved';
		const icon = isApproved ? 'fa fa-check-circle' : 'fa fa-times-circle';
		const label = isApproved
			? `Approved: ${name}`
			: action.status === 'denied'
				? `Denied: ${name}`
				: `Not done: ${name}`;
		const line =
			action.status === 'denied'
				? DENIED_TEXT
				: action.status === 'failed'
					? action.note || 'The change failed, so nothing was changed.'
					: '';
		const statusClass = isApproved ? '_approved' : '_denied';

		return (
			<div className={`_confirmationPrompt _resolved ${statusClass}`}>
				<div className="_confirmationHeader">
					<i className={`_confirmationIcon ${icon}`} />
					<span className="_confirmationTitle">{label}</span>
				</div>
				{line && <p className="_confirmationOutcome">{line}</p>}
			</div>
		);
	}

	// Pending (or expired: the same card, buttons disabled, saying so)
	return (
		<div className={`_confirmationPrompt${isExpired ? ' _expired' : ''}`}>
			<div className="_confirmationHeader">
				<i
					className={`_confirmationIcon fa ${isExpired ? 'fa-clock' : 'fa-shield-halved'}`}
				/>
				<span className="_confirmationTitle">{name}</span>
				{isExpired && <span className="_confirmationExpired">{EXPIRED_LABEL}</span>}
				{isWaitingResult && <span className="_confirmationWaiting">{SENT_TEXT}</span>}
			</div>

			<p className="_confirmationMessage">{action.message}</p>

			{detailLines.length > 0 && (
				<ul className="_confirmationDetails">
					{detailLines.map((line, i) => (
						<li key={i}>{line}</li>
					))}
				</ul>
			)}

			{isExpired && (
				<p className="_confirmationOutcome">
					{expiredText(action.expiredReason)}. {ASK_AGAIN}
				</p>
			)}

			<div className="_confirmationOptions">
				{isApproveOrDeny ? (
					<>
						<button
							type="button"
							className="_confirmationOption _deny"
							disabled={!isPending}
							onClick={() => handleOptionClick('deny')}
						>
							Deny
						</button>
						<button
							type="button"
							className="_confirmationOption _approve"
							disabled={!isPending}
							onClick={() => handleOptionClick('approve')}
						>
							Approve
						</button>
					</>
				) : (
					<>
						{action.options.map(opt => (
							<button
								key={opt.value}
								type="button"
								className={`_confirmationOption${selected === opt.value ? ' _selected' : ''}`}
								disabled={!isPending}
								onClick={() => handleOptionClick(opt.value)}
							>
								{opt.label}
							</button>
						))}
						{selected && (
							<button
								type="button"
								className="_confirmationOption _approve"
								disabled={!isPending}
								onClick={handleConfirmSelection}
							>
								Confirm
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}
