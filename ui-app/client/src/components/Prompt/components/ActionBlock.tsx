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
	status: 'pending' | 'approved' | 'denied' | 'timeout';
	selectedValue?: string;
}

interface ActionBlockProps {
	action: ConfirmationAction;
	onRespond: (
		confirmationId: string,
		approved: boolean,
		selectedValue: string,
	) => void;
}

function formatDetails(details: Record<string, any>): string[] {
	const lines: string[] = [];
	const objType = details.object_type;
	const name =
		details.name || details.page_name || details.id || '';

	if (objType) lines.push(`Type: ${objType}`);
	if (name) lines.push(`Name: ${name}`);

	if (details.operations) {
		const ops = details.operations;
		const summary = ops
			.slice(0, 4)
			.map(
				(op: any) =>
					`${op.op || '?'} ${op.component_key || op.parent_key || ''}`,
			)
			.join(', ');
		lines.push(
			`Operations: ${summary}${ops.length > 4 ? ` +${ops.length - 4} more` : ''}`,
		);
	}

	if (details.event_function) {
		lines.push(
			`Event: ${details.event_function.function_name || '?'}`,
		);
	}

	if (details.definition) lines.push('Includes definition update');
	if (details.properties)
		lines.push(
			`Properties: ${Object.keys(details.properties).join(', ')}`,
		);
	if (details.variables) lines.push('Includes theme variables');

	return lines;
}

export function ActionBlock({ action, onRespond }: Readonly<ActionBlockProps>) {
	const [selected, setSelected] = useState<string | null>(null);
	const isPending = action.status === 'pending';

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

	// Resolved state — show compact result
	if (!isPending) {
		const isApproved = action.status === 'approved';
		const icon = isApproved ? 'fa fa-check-circle' : 'fa fa-times-circle';
		const label = isApproved
			? `Approved: ${action.displayName || action.toolName}`
			: action.status === 'timeout'
				? `Timed out: ${action.displayName || action.toolName}`
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

	// Pending state — full interactive block
	return (
		<div className="_confirmationPrompt">
			<div className="_confirmationHeader">
				<i className="_confirmationIcon fa fa-shield-halved" />
				<span className="_confirmationTitle">
					{action.displayName || action.toolName}
				</span>
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
							onClick={() => handleOptionClick('deny')}
						>
							Deny
						</button>
						<button
							type="button"
							className="_confirmationOption _approve"
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
								onClick={() => handleOptionClick(opt.value)}
							>
								{opt.label}
							</button>
						))}
						{selected && (
							<button
								type="button"
								className="_confirmationOption _approve"
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
