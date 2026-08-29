import React, { useContext, useEffect, useRef, useState } from 'react';
import { CraftContext } from '../CraftRenderer';
import { incomeSpan, seedDemo } from './demographics';
import { DemographicsEditor } from './DemographicsEditor';
import { MemberEditor } from './MemberEditor';
import { SegmentPicker, type PickerKind } from './SegmentPicker';
import { SegmentRows } from './SegmentRows';
import type { AudSection, DemoState } from './types';

// The nearest parents are what disambiguate a segment; the full path stays on hover.
function shortPath(category: string): string {
	const parts = category.split(' > ');
	return parts.length > 2 ? `… > ${parts.slice(-2).join(' > ')}` : category;
}

const COL_LABELS: Record<string, string> = {
	segment: 'Segment',
	category: 'Sits under',
	rationale: 'Why',
	attribute: 'Filter',
	value: 'Setting',
};

export function AudienceReviewBlock({
	sections = [],
	kinds = [],
}: Readonly<{ sections: AudSection[]; kinds?: PickerKind[] }>) {
	// Fallback rather than throw: a missing provider should not take the chat down with it.
	const context = useContext(CraftContext);
	if (!context) return <div className="_kwReviewError">Audience review is unavailable here.</div>;
	return <AudienceReviewInner sections={sections} kinds={kinds} context={context} />;
}

function AudienceReviewInner({
	sections,
	kinds,
	context,
}: Readonly<{
	sections: AudSection[];
	kinds: PickerKind[];
	context: NonNullable<React.ContextType<typeof CraftContext>>;
}>) {
	const { sessionId, agentEndpoint, onSend, getAuthHeaders } = context;

	// What the demographics editor renders and saves with — craft.py's _demographic_options.
	const opts = sections.find(s => s.key === 'demographics')?.options;

	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [busyId, setBusyId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	// Two-step: a misclick must not drop a segment outright.
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);

	// A segment is a reference into Google's catalogue, so it is searched for, never typed.
	// One picker for the whole panel: the section a hit belongs to comes back on the result,
	// so nobody has to know which kind holds "new parents" before they can look for it.
	const [picking, setPicking] = useState(false);

	const [demo, setDemo] = useState<DemoState | null>(null);

	// Guards post-await setState against a mid-flight unmount (SSE can re-emit the craft).
	const mountedRef = useRef(true);
	useEffect(() => {
		// Set on mount, not only cleared on unmount - Fast Refresh re-runs the effect after
		// its cleanup, and a cleanup-only body would leave this false for good.
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const isExpanded = (k: string) => expanded[k] !== false;
	const toggleExpanded = (k: string) => setExpanded(prev => ({ ...prev, [k]: !isExpanded(k) }));
	const clearError = (k: string) =>
		setErrors(prev => {
			const n = { ...prev };
			delete n[k];
			return n;
		});
	const setError = (k: string, msg: string) => setErrors(prev => ({ ...prev, [k]: msg }));

	const send = async (id: string, key: string, payload: Record<string, any>, display: string) => {
		clearError(key);
		setBusyId(id);
		try {
			await onSend(
				JSON.stringify({ type: 'audience_widget', ...payload }),
				undefined,
				display,
			);
		} catch {
			if (mountedRef.current) setError(key, 'Action failed — please try again.');
		} finally {
			setBusyId(null);
		}
	};

	const saveDemographics = async () => {
		if (!demo || !opts) return;
		const payload: Record<string, any> = { action: 'set_demographics' };
		const keeps = (field: string) => demo.unknown[field] !== false;

		// Sent only when it narrows. Every box ticked with unknown OFF still narrows, and the
		// backend emits nothing for an empty list - so that case must send the full set.
		const fullAge = demo.minAge === String(opts.age_mins[0]) && !demo.maxAge;
		if (!fullAge || !keeps('age_ranges')) {
			payload.age_ranges = [
				demo.maxAge
					? { min_age: Number(demo.minAge), max_age: Number(demo.maxAge) }
					: { min_age: Number(demo.minAge) },
				...demo.extraAges,
			];
		}
		if (demo.genders.length < opts.genders.length || !keeps('genders')) {
			payload.genders = demo.genders;
		}
		if (demo.parental.length < opts.parental_statuses.length || !keeps('parental_statuses')) {
			payload.parental_statuses = demo.parental;
		}
		const bands = opts.income_ranges;
		const fullIncome =
			demo.incomeFrom === bands[0]?.value && demo.incomeTo === bands[bands.length - 1]?.value;
		if (!fullIncome || !keeps('income_ranges')) {
			payload.income_ranges = incomeSpan(opts, demo.incomeFrom, demo.incomeTo);
		}

		// Only the boxes actually unchecked - storing a default would record it as a choice.
		const unknown = Object.fromEntries(
			Object.entries(demo.unknown).filter(([, keep]) => keep === false),
		);
		if (Object.keys(unknown).length) payload.include_undetermined = unknown;
		await send('demo', 'demographics', payload, 'Update audience demographics');
		if (mountedRef.current) setDemo(null);
	};

	const acting = busyId !== null;
	const loading = (id: string) => busyId === id;

	// Order is deliberate: what adds reach, then what narrows it, then custom segments last -
	// their member editors are tall enough to push everything else off screen.
	const groups: { id: string; caption: string; secs: AudSection[] }[] = [
		{ id: 'reach', caption: 'Who this reaches', secs: [] },
		{ id: 'narrow', caption: 'Narrows the whole audience', secs: [] },
		{ id: 'custom', caption: 'Custom segments', secs: [] },
	];
	// Falls back by key for a panel talking to a backend that predates `group` - without it
	// every section lands in one group and the count below states a reach that is not real.
	const groupOf = (s: AudSection) =>
		s.group ?? (s.key === 'demographics' || s.key === 'excluded' ? 'narrow' : 'reach');
	for (const sec of sections) {
		(groups.find(g => g.id === groupOf(sec)) ?? groups[0]).secs.push(sec);
	}
	// Segments only. Demographic filters are not signals, so counting them here would claim
	// reach the campaign does not have.
	const selected = sections
		.filter(s => groupOf(s) !== 'narrow')
		.reduce((n, s) => n + (s.rows?.length ?? 0), 0);

	// An empty kind has no section to derive from, and is the likeliest one to browse.
	const addable = kinds.length
		? kinds
		: sections
				.filter(s => (s.actions ?? []).includes('add'))
				.map(s => ({ key: s.key, label: s.label.replace(/\s*\(\d+\)\s*$/, '') }));

	return (
		<div className="_kwReviewBlock">
			<div className="_kwReviewContent">
				{picking && (
					<SegmentPicker
						sessionId={sessionId ?? ''}
						agentEndpoint={agentEndpoint}
						getAuthHeaders={getAuthHeaders}
						kinds={addable}
						busy={acting}
						shortPath={shortPath}
						onClose={() => setPicking(false)}
						onAdd={seg => {
							setPicking(false);
							send(
								`add:${seg.ref}`,
								'add',
								{ action: 'add', ref: seg.ref },
								`Add audience: ${seg.label}`,
							);
						}}
					/>
				)}
				{!picking &&
					groups
						.filter(g => g.secs.length)
						.map(group => (
							<div key={group.id} className="_audGroup">
								<div className="_audGroupCaption">
									<span>{group.caption}</span>
									{group.id === 'reach' && (
										<span className="_audGroupCount">
											{selected} segment{selected === 1 ? '' : 's'}
										</span>
									)}
								</div>
								{group.secs.map(sec => {
									const open = isExpanded(sec.key);
									const err = errors[sec.key];
									const isDemographics = sec.key === 'demographics';
									const canDelete = (sec.actions ?? []).includes('delete');

									return (
										<div key={sec.key} className="_kwReviewSection">
											<button
												type="button"
												className={`_kwReviewSectionHeader${open ? ' _open' : ''}`}
												onClick={() => toggleExpanded(sec.key)}
											>
												<span className="_audSectionText">
													<span className="_kwReviewSectionLabel">
														{sec.label}
													</span>
													{sec.help && (
														<span className="_audSectionSub">
															{sec.help}
														</span>
													)}
												</span>
												<i
													className={`fa fa-solid fa-chevron-right _kwReviewSectionChevron${open ? ' _open' : ''}`}
													aria-hidden="true"
												/>
											</button>

											{open && (
												<div className="_kwReviewSectionBody">
													{sec.mix_help && (
														<p className="_audMixHelp">
															{sec.mix_help}
														</p>
													)}
													{err && (
														<div
															className="_kwReviewError"
															role="alert"
															onClick={() => clearError(sec.key)}
														>
															{err}
														</div>
													)}

													{isDemographics && !demo && (
														<button
															type="button"
															className="_audAddSignal _audEditFilters"
															disabled={acting}
															onClick={() =>
																setDemo(seedDemo(sec.values, opts))
															}
														>
															<i className="fa fa-solid fa-pen" />{' '}
															Edit filters
														</button>
													)}

													{isDemographics && demo ? (
														<DemographicsEditor
															demo={demo}
															setDemo={setDemo}
															opts={opts}
															rationales={sec.values?.rationales}
															busy={acting}
															saving={loading('demo')}
															onSave={saveDemographics}
															onCancel={() => setDemo(null)}
														/>
													) : sec.columns.includes('segment') ? (
														<SegmentRows
															rows={sec.rows}
															sectionKey={sec.key}
															canDelete={canDelete}
															acting={acting}
															pendingDelete={pendingDelete}
															setPendingDelete={setPendingDelete}
															loading={loading}
															shortPath={shortPath}
															onDelete={(delId, row) => {
																setPendingDelete(null);
																send(
																	`del:${delId}`,
																	sec.key,
																	{
																		action: 'delete',
																		ref: row.ref ?? row.segment,
																	},
																	`Remove audience: ${row.segment}`,
																);
															}}
														/>
													) : (
														<table className="_kwReviewTable">
															<thead>
																<tr>
																	{sec.columns.map(c => (
																		<th
																			key={c}
																			className="_kwReviewTh"
																		>
																			{COL_LABELS[c] ?? c}
																		</th>
																	))}
																	<th className="_kwReviewTh _kwActionsHead" />
																</tr>
															</thead>
															<tbody>
																{sec.rows.map((row, ri) => {
																	const rowKey =
																		row.segment ??
																		row.attribute ??
																		String(ri);
																	const delId = `${sec.key}:${rowKey}`;
																	return (
																		<tr
																			key={delId}
																			className="_kwReviewRow"
																		>
																			{sec.columns.map(
																				col => (
																					<td
																						key={col}
																						className={`_kwReviewTd${col === 'segment' ? ' _kwKwText' : ''}${col === 'rationale' || col === 'category' ? ' _kwExtra' : ''}`}
																						title={
																							col ===
																							'category'
																								? String(
																										row[
																											col
																										] ??
																											'',
																									)
																								: undefined
																						}
																					>
																						{col ===
																						'category'
																							? shortPath(
																									String(
																										row[
																											col
																										] ??
																											'',
																									),
																								)
																							: (row[
																									col
																								] ??
																								'')}
																					</td>
																				),
																			)}
																			<td className="_kwReviewTd _kwActionsCell">
																				{canDelete &&
																					(pendingDelete ===
																					delId ? (
																						<>
																							<button
																								type="button"
																								className="_kwDeleteBtn"
																								title="Confirm remove"
																								aria-label="Confirm remove"
																								disabled={
																									acting
																								}
																								onClick={() => {
																									setPendingDelete(
																										null,
																									);
																									send(
																										`del:${delId}`,
																										sec.key,
																										{
																											action: 'delete',
																											ref:
																												row.ref ??
																												row.segment,
																										},
																										`Remove audience: ${row.segment}`,
																									);
																								}}
																							>
																								{loading(
																									`del:${delId}`,
																								) ? (
																									<i className="fa fa-solid fa-spinner fa-spin" />
																								) : (
																									<i className="fa fa-solid fa-check" />
																								)}
																							</button>
																							<button
																								type="button"
																								className="_kwCancelBtn"
																								title="Cancel"
																								aria-label="Cancel remove"
																								onClick={() =>
																									setPendingDelete(
																										null,
																									)
																								}
																							>
																								<i className="fa fa-solid fa-xmark" />
																							</button>
																						</>
																					) : (
																						<button
																							type="button"
																							className="_kwDeleteBtn"
																							title="Remove"
																							aria-label="Remove"
																							disabled={
																								acting
																							}
																							onClick={() =>
																								setPendingDelete(
																									delId,
																								)
																							}
																						>
																							<i className="fa fa-solid fa-trash" />
																						</button>
																					))}
																			</td>
																		</tr>
																	);
																})}
																{sec.rows.length === 0 && (
																	<tr>
																		<td
																			colSpan={
																				sec.columns.length +
																				1
																			}
																			className="_kwEmptyCell"
																		>
																			{isDemographics
																				? 'No narrowing — the campaign reaches every age and gender.'
																				: 'Nothing here yet.'}
																		</td>
																	</tr>
																)}
															</tbody>
														</table>
													)}

													{isDemographics &&
														!demo &&
														sec.rows.length === 0 && (
															<div className="_audDemoActions">
																<button
																	type="button"
																	className="_audAddSignal _audEditFilters"
																	disabled={acting}
																	onClick={() =>
																		setDemo(
																			seedDemo(
																				sec.values,
																				opts,
																			),
																		)
																	}
																>
																	<i className="fa fa-solid fa-plus" />{' '}
																	Narrow the audience
																</button>
															</div>
														)}

													{/* Under the rows: the segment is named before what defines it. */}
													{(sec.members ?? []).map(group => (
														<MemberEditor
															key={group.ref}
															group={group}
															context={context}
															onChanged={() => clearError(sec.key)}
														/>
													))}
												</div>
											)}
										</div>
									);
								})}
								{group.id === 'reach' && errors.add && (
									<div
										className="_kwReviewError"
										role="alert"
										onClick={() => clearError('add')}
									>
										{errors.add}
									</div>
								)}
								{group.id === 'reach' && addable.length > 0 && (
									<button
										type="button"
										className="_audAddSignal"
										disabled={acting}
										onClick={() => setPicking(true)}
									>
										<i className="fa fa-solid fa-plus" /> Add audience signal
									</button>
								)}
							</div>
						))}
			</div>
		</div>
	);
}
