import React, { useState } from 'react';
import { CraftContext } from '../CraftRenderer';
import { fetchKeywordVolume } from '../keywordVolume';
import type { MemberGroup } from './types';

// `field` names the widget action, `param` the key the value travels under.
const MEMBER_KINDS: { field: string; param: string; label: string; placeholder: string }[] = [
	{
		field: 'term',
		param: 'keyword',
		label: 'Search terms',
		placeholder: 'what people type into Google',
	},
	{ field: 'url', param: 'url', label: 'Websites', placeholder: 'https://www.modlix.com' },
	{ field: 'app', param: 'app', label: 'Android apps', placeholder: 'com.example.app' },
];

export function MemberEditor({
	group,
	context,
	onChanged,
}: Readonly<{
	group: MemberGroup;
	context: NonNullable<React.ContextType<typeof CraftContext>>;
	onChanged: () => void;
}>) {
	const { sessionId, agentEndpoint, onSend, getAuthHeaders } = context;
	const [adding, setAdding] = useState<string | null>(null);
	const [draft, setDraft] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [pending, setPending] = useState<string | null>(null);
	const [editing, setEditing] = useState<string | null>(null);

	const send = async (action: string, param: string, value: string, old?: string) => {
		setError('');
		setBusy(true);
		try {
			const payload: Record<string, unknown> = {
				type: 'custom_segment_widget',
				action,
				ref: group.ref,
				[param]: value,
			};
			if (old !== undefined) payload.old = old;
			if (action === 'add_term')
				payload.volume = await fetchKeywordVolume(
					value,
					sessionId,
					agentEndpoint,
					getAuthHeaders,
				);
			await onSend(JSON.stringify(payload), undefined, `${action}: ${value}`);
			setDraft('');
			setAdding(null);
			setPending(null);
			setEditing(null);
			onChanged();
		} catch {
			setError('Could not save that — please try again.');
		} finally {
			setBusy(false);
		}
	};

	// Highest demand first, so a newly added term lands by volume rather than at the bottom.
	const values = (field: string): string[] =>
		field === 'term'
			? [...group.terms].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).map(t => t.keyword)
			: field === 'url'
				? group.urls
				: group.apps;

	const reject = (field: string, value: string, ignore?: string): string => {
		const v = value.trim();
		if (!v) return 'Enter a value.';
		if (field === 'url' && !/^https?:\/\//i.test(v))
			return 'Include https:// — a bare domain is not a valid URL.';
		// Matches the backend's _is_same. Exact for apps - a package name is case-sensitive.
		const fold = (s: string) => (field === 'app' ? s : s.toLowerCase());
		if (values(field).some(x => x !== ignore && fold(x) === fold(v)))
			return 'That is already in this segment.';
		return '';
	};

	const submit = (field: string, param: string, value: string, old?: string) => {
		const why = reject(field, value, old);
		if (why) return setError(why);
		send(old ? `edit_${field}` : `add_${field}`, param, value.trim(), old);
	};

	return (
		<div className="_audMembers">
			{!group.editable && (
				<div className="_audMemberNote">
					Already created in the account — its members are fixed now.
				</div>
			)}
			{group.warning && <div className="_audMemberWarn">{group.warning}</div>}
			{error && (
				<div className="_kwReviewError" role="alert" onClick={() => setError('')}>
					{error}
				</div>
			)}
			{MEMBER_KINDS.map(({ field, param, label, placeholder }) => {
				const rows = values(field);
				const canEdit = field !== 'term'; // a term's volume follows its text
				return (
					<div key={field} className="_audMemberBlock">
						<div className="_audMemberHead">
							{label} ({rows.length})
							<i
								className="fa fa-regular fa-circle-question _audHelp"
								title={group.help[`${field}s`]}
								aria-label={group.help[`${field}s`]}
							/>
						</div>
						{!group.editable ? null : adding === field ? (
							<div className="_audMemberAdd">
								<input
									type="text"
									className="_kwAddInput"
									placeholder={placeholder}
									autoFocus
									value={draft}
									disabled={busy}
									onChange={e => setDraft(e.target.value)}
									onKeyDown={e => {
										if (e.key === 'Enter') submit(field, param, draft);
										if (e.key === 'Escape') setAdding(null);
									}}
								/>
								<button
									type="button"
									className="_audTextBtn"
									disabled={busy || !draft.trim()}
									onClick={() => submit(field, param, draft)}
								>
									{busy ? (
										<i className="fa fa-solid fa-spinner fa-spin" />
									) : (
										'Add'
									)}
								</button>
								<button
									type="button"
									className="_audTextBtn"
									disabled={busy}
									onClick={() => setAdding(null)}
								>
									Cancel
								</button>
							</div>
						) : (
							<button
								type="button"
								className="_audTextBtn _audMemberAddBtn"
								disabled={busy}
								onClick={() => {
									setAdding(field);
									setDraft('');
									setError('');
								}}
							>
								<i className="fa fa-solid fa-plus" /> Add
							</button>
						)}
						<table className="_kwReviewTable _audMemberTable">
							<tbody>
								{rows.map(v => {
									const key = `${field}:${v}`;
									return (
										<tr key={v} className="_kwReviewRow">
											{editing === key ? (
												<td className="_kwReviewTd" colSpan={3}>
													<input
														type="text"
														className="_kwAddInput"
														autoFocus
														value={draft}
														disabled={busy}
														onChange={e => setDraft(e.target.value)}
														onKeyDown={e => {
															if (e.key === 'Enter')
																submit(field, param, draft, v);
															if (e.key === 'Escape')
																setEditing(null);
														}}
													/>
													<button
														type="button"
														className="_audTextBtn"
														disabled={busy || !draft.trim()}
														onClick={() =>
															submit(field, param, draft, v)
														}
													>
														Save
													</button>
													<button
														type="button"
														className="_audTextBtn"
														disabled={busy}
														onClick={() => setEditing(null)}
													>
														Cancel
													</button>
												</td>
											) : (
												<>
													<td className="_kwReviewTd _kwKwText">{v}</td>
													<td className="_kwReviewTd _audMemberVol">
														{field === 'term'
															? (group.terms.find(
																	t => t.keyword === v,
																)?.volume ?? 0)
															: ''}
													</td>
													<td className="_kwReviewTd _kwActions">
														{group.editable && canEdit && (
															<button
																type="button"
																className="_kwEditBtn"
																title="Edit"
																aria-label={`Edit ${v}`}
																disabled={busy}
																onClick={() => {
																	setEditing(key);
																	setDraft(v);
																	setError('');
																}}
															>
																<i className="fa fa-solid fa-pen" />
															</button>
														)}
														{group.editable && (
															<button
																type="button"
																className="_kwDeleteBtn"
																aria-label={
																	pending === key
																		? `Confirm remove ${v}`
																		: `Remove ${v}`
																}
																title={
																	pending === key
																		? 'Click again to remove'
																		: 'Remove'
																}
																disabled={busy}
																onClick={() => {
																	if (pending === key)
																		send(
																			`delete_${field}`,
																			param,
																			v,
																		);
																	else setPending(key);
																}}
															>
																<i
																	className={`fa fa-solid ${
																		pending === key
																			? 'fa-check'
																			: 'fa-trash'
																	}`}
																/>
															</button>
														)}
													</td>
												</>
											)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				);
			})}
		</div>
	);
}
