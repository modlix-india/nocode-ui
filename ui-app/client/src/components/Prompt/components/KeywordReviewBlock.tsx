import React, { useContext, useEffect, useRef, useState } from 'react';
import { CraftContext } from './CraftRenderer';

interface KwSection {
	key: string;
	label: string;
	columns: string[];
	rows: Record<string, any>[];
	actions: string[];
}

interface KwTab {
	key: string;
	label: string;
	sections: KwSection[];
}

interface AddForm {
	keyword: string;
	matchType: string;
	extra: string; // intent for positives, reason for negatives
}

const EMPTY_ADD: AddForm = Object.freeze({ keyword: '', matchType: 'PHRASE', extra: '' });

interface EditState {
	// Row being edited is matched by keyword identity (unique per section), NOT row index —
	// so an add prepending a new row (or an SSE re-emit) can't shift the edit onto another row.
	keyword: string;
	matchType: string;
	extra: string; // intent for positives, reason for negatives
	originalKeyword: string;
	originalVolume: number;
}

const MATCH_TYPES = ['PHRASE', 'EXACT'];

const COL_LABELS: Record<string, string> = {
	keyword: 'Keyword',
	volume: 'Volume',
	match_type: 'Match',
	intent: 'Intent',
	reason: 'Reason',
};

function secKey(tabKey: string, sectionKey: string): string {
	return `${tabKey}.${sectionKey}`;
}

export function KeywordReviewBlock({ tabs = [] }: Readonly<{ tabs: KwTab[] }>) {
	// Fallback (not throw): a missing provider shouldn't crash the whole chat. The inner
	// component receives a non-null context so all its hooks run unconditionally.
	const context = useContext(CraftContext);
	if (!context)
		return <div className="_kwReviewError">Keyword review is unavailable here.</div>;
	return <KeywordReviewInner tabs={tabs} context={context} />;
}

function KeywordReviewInner({
	tabs,
	context,
}: Readonly<{ tabs: KwTab[]; context: NonNullable<React.ContextType<typeof CraftContext>> }>) {
	const { sessionId, agentEndpoint, onSend, getAuthHeaders } = context;

	const [activeTab, setActiveTab] = useState<string>(tabs[0]?.key ?? '');
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [addForms, setAddForms] = useState<Record<string, AddForm>>({});
	const [editStates, setEditStates] = useState<Record<string, EditState | null>>({});
	// Id of the single action in flight (e.g. "del:brand.positives:notion"), or null.
	// Scoped per-action so only the clicked button shows a spinner — not every button.
	const [busyId, setBusyId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	// Row armed for delete (`${sk}:${keyword}`) — a two-step confirm so a misclick on the
	// small icon can't delete a keyword outright.
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);
	// Guards post-await setState against a mid-flight unmount (SSE can re-emit the craft).
	const mountedRef = useRef(true);
	useEffect(() => () => { mountedRef.current = false; }, []);

	useEffect(() => {
		if (tabs.length && !tabs.find(t => t.key === activeTab)) {
			setActiveTab(tabs[0].key);
		}
	}, [tabs, activeTab]);

	const isExpanded = (sk: string) => expanded[sk] !== false;

	const toggleExpanded = (sk: string) =>
		setExpanded(prev => ({ ...prev, [sk]: !isExpanded(sk) }));

	const clearError = (sk: string) =>
		setErrors(prev => { const n = { ...prev }; delete n[sk]; return n; });

	const setError = (sk: string, msg: string) =>
		setErrors(prev => ({ ...prev, [sk]: msg }));

	const fetchVolume = async (keyword: string): Promise<number> => {
		if (!sessionId) return 0;
		try {
			const baseUrl = agentEndpoint.replace(/\/chat$/, '');
			const res = await fetch(`${baseUrl}/keyword/volume`, {
				method: 'POST',
				headers: getAuthHeaders(), // already sets Content-Type: application/json
				body: JSON.stringify({ session_id: sessionId, keywords: [keyword] }),
			});
			if (!res.ok) return 0;
			const data = await res.json();
			return (data?.results?.[0]?.volume as number) ?? 0;
		} catch {
			return 0;
		}
	};

	const sendAction = async (actionId: string, sk: string, payload: Record<string, any>, existingVolume?: number) => {
		clearError(sk);
		setBusyId(actionId);
		try {
			const volume = existingVolume !== undefined ? existingVolume : await fetchVolume(payload.keyword as string);
			const msg = JSON.stringify({ type: 'keyword_widget', ...payload, volume });
			await onSend(msg, undefined, `${payload.action} keyword: ${payload.keyword as string}`);
		} catch {
			if (mountedRef.current) setError(sk, 'Action failed — please try again.');
		} finally {
			if (mountedRef.current) setBusyId(null);
		}
	};

	const handleAdd = async (tabKey: string, sec: KwSection) => {
		const sk = secKey(tabKey, sec.key);
		const form = addForms[sk] ?? EMPTY_ADD;
		const kw = form.keyword.trim().toLowerCase();
		if (!kw) { setError(sk, 'Enter a keyword.'); return; }
		const extraField = sec.key === 'positives' ? 'intent' : 'reason';
		await sendAction(`add:${sk}`, sk, {
			action: 'add',
			keyword_type: tabKey,
			section: sec.key,
			keyword: kw,
			match_type: form.matchType,
			[extraField]: form.extra.trim(),
		});
		setAddForms(prev => ({ ...prev, [sk]: EMPTY_ADD }));
	};

	const handleDelete = async (tabKey: string, sec: KwSection, row: Record<string, any>) => {
		const sk = secKey(tabKey, sec.key);
		clearError(sk);
		setBusyId(`del:${sk}:${row.keyword}`);
		try {
			await onSend(
				JSON.stringify({ type: 'keyword_widget', action: 'delete', keyword_type: tabKey, section: sec.key, keyword: row.keyword, volume: 0 }),
				undefined,
				`Delete keyword: ${row.keyword}`,
			);
		} catch {
			if (mountedRef.current) setError(sk, 'Action failed — please try again.');
		} finally {
			if (mountedRef.current) setBusyId(null);
		}
	};

	const handleEditSave = async (tabKey: string, sec: KwSection, oldKeyword: string) => {
		const sk = secKey(tabKey, sec.key);
		const es = editStates[sk];
		if (!es) return;
		const kw = es.keyword.trim().toLowerCase();
		if (!kw) { setError(sk, 'Keyword cannot be empty.'); return; }
		const extraField = sec.key === 'positives' ? 'intent' : 'reason';
		// Skip the volume round-trip when only match_type or extra changed.
		const knownVolume = kw === es.originalKeyword.toLowerCase() ? es.originalVolume : undefined;
		await sendAction(`save:${sk}`, sk, {
			action: 'edit',
			keyword_type: tabKey,
			section: sec.key,
			old_keyword: oldKeyword,
			keyword: kw,
			match_type: es.matchType,
			[extraField]: es.extra,
		}, knownVolume);
		setEditStates(prev => ({ ...prev, [sk]: null }));
	};

	const currentTab = tabs.find(t => t.key === activeTab) ?? tabs[0];

	return (
		<div className="_kwReviewBlock">
			{tabs.length > 1 && (
				<div className="_kwReviewTabs">
					{tabs.map(tab => (
						<button
							key={tab.key}
							type="button"
							className={`_kwReviewTab${activeTab === tab.key ? ' _active' : ''}`}
							onClick={() => setActiveTab(tab.key)}
						>
							{tab.label}
						</button>
					))}
				</div>
			)}

			<div className="_kwReviewContent">
				{(currentTab?.sections ?? []).map(sec => {
					const sk = secKey(currentTab.key, sec.key);
					const open = isExpanded(sk);
					const es = editStates[sk] ?? null;
					const form = addForms[sk] ?? EMPTY_ADD;
					// A mutation is in flight anywhere → disable all controls (avoid racing the
					// session read-modify-write); only the acting button shows the spinner.
					const acting = busyId !== null;
					const loading = (id: string) => busyId === id;
					const err = errors[sk];

					return (
						<div key={sec.key} className="_kwReviewSection">
							<button
								type="button"
								className={`_kwReviewSectionHeader${open ? ' _open' : ''}`}
								onClick={() => toggleExpanded(sk)}
							>
								<span className="_kwReviewSectionLabel">{sec.label}</span>
								<span className={`_kwReviewSectionChevron${open ? ' _open' : ''}`} aria-hidden="true">›</span>
							</button>

							{open && (
								<div className="_kwReviewSectionBody">
									{err && (
										<div className="_kwReviewError" role="alert" onClick={() => clearError(sk)}>{err}</div>
									)}

									{sec.actions.includes('add') && (
										<div className="_kwAddRow">
											<input
												type="text"
												className="_kwAddInput"
												placeholder="Add keyword…"
												value={form.keyword}
												disabled={acting}
												onChange={e => setAddForms(prev => ({ ...prev, [sk]: { ...form, keyword: e.target.value } }))}
												onKeyDown={e => { if (e.key === 'Enter') handleAdd(currentTab.key, sec); }}
											/>
											<input
												type="text"
												className="_kwAddExtra"
												placeholder={sec.key === 'positives' ? 'Intent (optional)' : 'Reason (optional)'}
												value={form.extra}
												disabled={acting}
												onChange={e => setAddForms(prev => ({ ...prev, [sk]: { ...form, extra: e.target.value } }))}
												onKeyDown={e => { if (e.key === 'Enter') handleAdd(currentTab.key, sec); }}
											/>
											<select
												className="_kwMatchSelect"
												value={form.matchType}
												disabled={acting}
												onChange={e => setAddForms(prev => ({ ...prev, [sk]: { ...form, matchType: e.target.value } }))}
											>
												{MATCH_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
											</select>
											<button
												type="button"
												className="_kwAddBtn"
												disabled={acting || !form.keyword.trim()}
												onClick={() => handleAdd(currentTab.key, sec)}
											>
												{loading(`add:${sk}`) ? <i className="fa fa-solid fa-spinner fa-spin" /> : '+ Add'}
											</button>
										</div>
									)}
									<table className="_kwReviewTable">
										<thead>
											<tr>
												{sec.columns.map(col => (
													<th key={col} className="_kwReviewTh">{COL_LABELS[col] ?? col}</th>
												))}
												{sec.actions.length > 0 && <th className="_kwReviewTh _kwActionsHead" />}
											</tr>
										</thead>
										<tbody>
											{sec.rows.map((row, ri) => {
												const isEditing = es != null && es.originalKeyword === row.keyword;
												if (isEditing) {
													return (
														<tr key={`${row.keyword}_${ri}`} className="_kwReviewRow _editing">
															{sec.columns.map((col) => {
																if (col === 'keyword') return (
																	<td key={col} className="_kwReviewTd">
																		<input
																			className="_kwInlineInput"
																			value={es.keyword}
																			autoFocus
																			onChange={e => setEditStates(prev => ({ ...prev, [sk]: { ...es, keyword: e.target.value } }))}
																			onKeyDown={e => { if (e.key === 'Enter') handleEditSave(currentTab.key, sec, row.keyword); if (e.key === 'Escape') setEditStates(prev => ({ ...prev, [sk]: null })); }}
																		/>
																	</td>
																);
																if (col === 'volume') return <td key={col} className="_kwReviewTd _kwVol">—</td>;
																if (col === 'match_type') return (
																	<td key={col} className="_kwReviewTd">
																		<select
																			className="_kwMatchSelect _inline"
																			value={es.matchType}
																			onChange={e => setEditStates(prev => ({ ...prev, [sk]: { ...es, matchType: e.target.value } }))}
																		>
																			{MATCH_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
																		</select>
																	</td>
																);
																return (
																	<td key={col} className="_kwReviewTd">
																		<input
																			className="_kwInlineInput"
																			value={es.extra}
																			placeholder={col}
																			onChange={e => setEditStates(prev => ({ ...prev, [sk]: { ...es, extra: e.target.value } }))}
																		/>
																	</td>
																);
															})}
															<td className="_kwReviewTd _kwActionsCell">
																<button type="button" className="_kwSaveBtn" title="Save" aria-label="Save" disabled={acting} onClick={() => handleEditSave(currentTab.key, sec, row.keyword)}>
																	{loading(`save:${sk}`) ? <i className="fa fa-solid fa-spinner fa-spin" /> : <i className="fa fa-solid fa-check" />}
																</button>
																<button type="button" className="_kwCancelBtn" title="Cancel" aria-label="Cancel" onClick={() => setEditStates(prev => ({ ...prev, [sk]: null }))}>
																	<i className="fa fa-solid fa-xmark" />
																</button>
															</td>
														</tr>
													);
												}
												return (
													<tr key={`${row.keyword}_${ri}`} className="_kwReviewRow">
														{sec.columns.map(col => {
															if (col === 'keyword') return <td key={col} className="_kwReviewTd _kwKwText">{row.keyword}</td>;
															if (col === 'volume') return <td key={col} className="_kwReviewTd _kwVol">{(row.volume ?? 0).toLocaleString()}</td>;
															if (col === 'match_type') return (
																<td key={col} className="_kwReviewTd">
																	<span className={`_kwMatchBadge _${(row.match_type ?? 'PHRASE').toLowerCase()}`}>
																		{row.match_type ?? 'PHRASE'}
																	</span>
																</td>
															);
															return <td key={col} className="_kwReviewTd _kwExtra">{row[col] ?? ''}</td>;
														})}
														<td className="_kwReviewTd _kwActionsCell">
															{sec.actions.includes('edit') && (
																<button
																	type="button"
																	className="_kwEditBtn"
																	title="Edit"
																	aria-label="Edit"
																	disabled={acting}
																	onClick={() => setEditStates(prev => ({
																		...prev,
																		[sk]: { keyword: row.keyword, matchType: row.match_type ?? 'PHRASE', extra: row.intent ?? row.reason ?? '', originalKeyword: row.keyword, originalVolume: row.volume ?? 0 },
																	}))}
																>
																	<i className="fa fa-solid fa-pen" />
																</button>
															)}
															{sec.actions.includes('delete') && (
																pendingDelete === `${sk}:${row.keyword}` ? (
																	<>
																		<button
																			type="button"
																			className="_kwDeleteBtn"
																			title="Confirm delete"
																			aria-label="Confirm delete"
																			disabled={acting}
																			onClick={() => { setPendingDelete(null); handleDelete(currentTab.key, sec, row); }}
																		>
																			{loading(`del:${sk}:${row.keyword}`) ? <i className="fa fa-solid fa-spinner fa-spin" /> : <i className="fa fa-solid fa-check" />}
																		</button>
																		<button
																			type="button"
																			className="_kwCancelBtn"
																			title="Cancel"
																			aria-label="Cancel delete"
																			onClick={() => setPendingDelete(null)}
																		>
																			<i className="fa fa-solid fa-xmark" />
																		</button>
																	</>
																) : (
																	<button
																		type="button"
																		className="_kwDeleteBtn"
																		title="Delete"
																		aria-label="Delete"
																		disabled={acting}
																		onClick={() => setPendingDelete(`${sk}:${row.keyword}`)}
																	>
																		<i className="fa fa-solid fa-trash" />
																	</button>
																)
															)}
														</td>
													</tr>
												);
											})}
											{sec.rows.length === 0 && (
												<tr>
													<td colSpan={sec.columns.length + 1} className="_kwEmptyCell">No {sec.key} yet.</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
