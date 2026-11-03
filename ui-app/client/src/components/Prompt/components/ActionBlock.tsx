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
	// `expired`: nothing is waiting on this card any more. The server said so
	// (`confirmation_expired`: no answer in time, or the run was stopped), or a
	// click was refused as expired. Shown with its buttons disabled (LZT-1952).
	status: 'pending' | 'approved' | 'denied' | 'timeout' | 'expired';
	selectedValue?: string;
	// A click is on its way to POST /confirm. The card only says "Approved" once
	// the server has taken it, so a click on a dead card never reads as done.
	sending?: boolean;
}

export const EXPIRED_LABEL = 'Expired, ask again';

// Mark one card expired wherever it is. A card already answered keeps its
// answer: an expiry can only reach a card that was still waiting. Returns the
// same array when nothing changed, so React skips the render.
export function markConfirmationExpired<M extends { confirmationActions?: ConfirmationAction[] }>(
	messages: M[],
	confirmationId: string,
): M[] {
	let changed = false;
	const next = messages.map(m => {
		if (
			!m.confirmationActions?.some(
				a => a.confirmationId === confirmationId && a.status === 'pending',
			)
		)
			return m;
		changed = true;
		return {
			...m,
			confirmationActions: m.confirmationActions.map(a =>
				a.confirmationId === confirmationId && a.status === 'pending'
					? { ...a, status: 'expired' as const, sending: false }
					: a,
			),
		};
	});
	return changed ? next : messages;
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
	const isPending = action.status === 'pending' && !action.sending;

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

	// Answered state — show compact result
	if (action.status === 'approved' || action.status === 'denied') {
		const isApproved = action.status === 'approved';
		const icon = isApproved ? 'fa fa-check-circle' : 'fa fa-times-circle';
		const label = isApproved
			? `Approved: ${action.displayName || action.toolName}`
			: `Denied: ${action.displayName || action.toolName}`;
		const statusClass = isApproved ? '_approved' : '_denied';

		return (
			<div className={`_confirmationPrompt _resolved ${statusClass}`}>
				<div className="_confirmationHeader">
					<i className={`_confirmationIcon ${icon}`} />
					<span className="_confirmationTitle">{label}</span>
				</div>
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
				<span className="_confirmationTitle">{action.displayName || action.toolName}</span>
				{isExpired && <span className="_confirmationExpired">{EXPIRED_LABEL}</span>}
			</div>

			<p className="_confirmationMessage">{action.message}</p>

			{detailLines.length > 0 && (
				<ul className="_confirmationDetails">
					{detailLines.map((line, i) => (
						<li key={i}>{line}</li>
					))}
				</ul>
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
