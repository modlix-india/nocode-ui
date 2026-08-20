import React, { useContext, useEffect, useRef, useState } from 'react';
import { CraftContext } from '../CraftRenderer';
import { MemberEditor } from './MemberEditor';
import type { AgeRange, AudSection, DemoOptions, DemoState, Segment } from './types';

// Reuses the _kwReview* skeleton (block / section / table / row / buttons) so the two review
// panels read as one surface. Only the segment picker and the demographics editor are new.

// "Real Estate > Residential Properties > Residential Properties (For Sale) > Apartments
// (For Sale)" wrapped to four lines and made every row tall. The nearest parents are what
// disambiguate a segment; the full path stays on hover.
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

// Seeded from what is already saved, never blank: set_demographics REPLACES the whole spec,
// so an editor that opened empty would wipe every filter the user did not re-enter.
function seedDemo(values: Record<string, any> | undefined, o: DemoOptions | undefined): DemoState {
	const ages: AgeRange[] = values?.age_ranges ?? [];
	const [first, ...extraAges] = ages;
	const incomes: string[] = values?.income_ranges ?? [];
	const allGenders = (o?.genders ?? []).map(g => g.value);
	const allParental = (o?.parental_statuses ?? []).map(p => p.value);
	const bands = o?.income_ranges ?? [];
	return {
		minAge: first ? String(first.min_age) : String(o?.age_mins?.[0] ?? 18),
		maxAge: first?.max_age ? String(first.max_age) : '',
		genders: values?.genders?.length ? values.genders : allGenders,
		incomeFrom: incomes[0] ?? bands[0]?.value ?? '',
		incomeTo: incomes.length
			? incomes[incomes.length - 1]
			: (bands[bands.length - 1]?.value ?? ''),
		parental: values?.parental_statuses?.length ? values.parental_statuses : allParental,
		unknown: values?.include_undetermined ?? {},
		extraAges,
	};
}

const incomeIndex = (o: DemoOptions, value: string) =>
	o.income_ranges.findIndex(i => i.value === value);

// The bands between the two ends, inclusive — what the backend stores and Google receives.
function incomeSpan(o: DemoOptions, from: string, to: string): string[] {
	if (!from) return [];
	const start = incomeIndex(o, from);
	const end = to ? incomeIndex(o, to) : start;
	return o.income_ranges.slice(start, end + 1).map(i => i.value);
}

export function AudienceReviewBlock({ sections = [] }: Readonly<{ sections: AudSection[] }>) {
	// Fallback rather than throw: a missing provider should not take the chat down with it.
	const context = useContext(CraftContext);
	if (!context) return <div className="_kwReviewError">Audience review is unavailable here.</div>;
	return <AudienceReviewInner sections={sections} context={context} />;
}

function AudienceReviewInner({
	sections,
	context,
}: Readonly<{
	sections: AudSection[];
	context: NonNullable<React.ContextType<typeof CraftContext>>;
}>) {
	const { sessionId, agentEndpoint, onSend, getAuthHeaders } = context;

	// What the demographics editor renders and saves with — craft.py's _demographic_options.
	const opts = sections.find(s => s.key === 'demographics')?.options;

	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [busyId, setBusyId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	// Two-step confirm, as in the keyword panel: a misclick on a small icon must not drop a
	// segment outright.
	const [pendingDelete, setPendingDelete] = useState<string | null>(null);

	// Segment picker. A segment is a reference into Google's catalogue, not free text, so
	// adding one means searching for it — typing a name would only invent an id.
	const [pickerFor, setPickerFor] = useState<string | null>(null);
	const [tab, setTab] = useState<'search' | 'browse'>('search');
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Segment[]>([]);
	const [searching, setSearching] = useState(false);
	// Browse: one section's whole catalogue, nested from each row's `path`. For a user who
	// does not know the word to search for — the case a thin vertical always hits.
	const [browse, setBrowse] = useState<Segment[]>([]);
	const [browsing, setBrowsing] = useState(false);
	const [expanded2, setExpanded2] = useState<Record<string, boolean>>({});

	const [demo, setDemo] = useState<DemoState | null>(null);

	// Guards post-await setState against a mid-flight unmount (SSE can re-emit the craft).
	const mountedRef = useRef(true);
	useEffect(() => {
		// Set on mount, not just cleared on unmount: Fast Refresh runs the cleanup and then
		// re-runs the effect, so a body that only returned a cleanup left this false for the
		// rest of the session - and every guarded setState below silently stopped working.
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

	// Debounced like the location typeahead in CraftRenderer — each call reloads the session
	// and scores the whole taxonomy, so a request per keystroke is real work. seq discards a
	// slow earlier reply, which would otherwise land after a newer one and leave the list
	// showing results for a query no longer in the box.
	const seqRef = useRef(0);
	useEffect(() => {
		const text = query.trim();
		if (!sessionId || text.length < 2) {
			setResults([]);
			setSearching(false);
			return;
		}
		const mine = ++seqRef.current;
		setSearching(true);
		const timer = setTimeout(async () => {
			let found: Segment[] = [];
			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				const res = await fetch(`${baseUrl}/audience/search`, {
					method: 'POST',
					headers: getAuthHeaders(), // already sets Content-Type: application/json
					body: JSON.stringify({ session_id: sessionId, query: text }),
				});
				if (res.ok) found = (await res.json())?.results ?? [];
			} catch {
				found = [];
			}
			if (!mountedRef.current || mine !== seqRef.current) return;
			setResults(found);
			setSearching(false);
		}, 300);
		return () => clearTimeout(timer);
	}, [query, sessionId, agentEndpoint, getAuthHeaders]);

	// Fetched once per section when Browse opens — the catalogue is server-cached, and the
	// tree is useless with an arbitrary slice cut out of it, so this is uncapped.
	useEffect(() => {
		if (!sessionId || !pickerFor || tab !== 'browse') return;
		let live = true;
		setBrowsing(true);
		(async () => {
			let rows: Segment[] = [];
			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				const res = await fetch(`${baseUrl}/audience/search`, {
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify({
						session_id: sessionId,
						kind: pickerFor.toUpperCase(),
					}),
				});
				if (res.ok) rows = (await res.json())?.results ?? [];
			} catch {
				rows = [];
			}
			if (!live || !mountedRef.current) return;
			setBrowse(rows);
			setBrowsing(false);
		})();
		return () => {
			live = false;
		};
	}, [pickerFor, tab, sessionId, agentEndpoint, getAuthHeaders]);

	// Click-outside closes it, like any dropdown. mousedown, not click: a click that starts
	// inside and drifts out would otherwise close the picker mid-interaction.
	const pickerRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (!pickerFor) return;
		const onDown = (e: MouseEvent) => {
			if (!pickerRef.current?.contains(e.target as Node)) closePicker();
		};
		document.addEventListener('mousedown', onDown);
		return () => document.removeEventListener('mousedown', onDown);
	}, [pickerFor]);

	const closePicker = () => {
		setPickerFor(null);
		setTab('search');
		setQuery('');
		setResults([]);
		setBrowse([]);
		setExpanded2({});
	};

	const addSegment = async (seg: Segment) => {
		closePicker();
		await send(
			`add:${seg.ref}`,
			'add',
			{ action: 'add', ref: seg.ref },
			`Add audience: ${seg.label}`,
		);
	};

	const saveDemographics = async () => {
		if (!demo || !opts) return;
		const payload: Record<string, any> = { action: 'set_demographics' };
		const keeps = (field: string) => demo.unknown[field] !== false;

		// A dimension is sent only when it actually narrows. Every box ticked AND unknown kept
		// is "everyone", which the model stores as an empty list. But every box ticked with
		// unknown OFF is a real narrowing, so the full set has to go explicitly - the backend
		// emits nothing for an empty list, and the flag would have had nothing to attach to.
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

		// Only the boxes actually unchecked — storing the defaults would freeze today's
		// default as a decision the user never made.
		const unknown = Object.fromEntries(
			Object.entries(demo.unknown).filter(([, keep]) => keep === false),
		);
		if (Object.keys(unknown).length) payload.include_undetermined = unknown;
		await send('demo', 'demographics', payload, 'Update audience demographics');
		if (mountedRef.current) setDemo(null);
	};

	const toggleIn = (list: string[], value: string) =>
		list.includes(value) ? list.filter(v => v !== value) : [...list, value];

	const acting = busyId !== null;
	const loading = (id: string) => busyId === id;

	return (
		<div className="_kwReviewBlock">
			<div className="_kwReviewContent">
				{sections.map(sec => {
					const open = isExpanded(sec.key);
					const err = errors[sec.key];
					const isDemographics = sec.key === 'demographics';
					const canAdd = (sec.actions ?? []).includes('add');
					const canDelete = (sec.actions ?? []).includes('delete');

					return (
						<div key={sec.key} className="_kwReviewSection">
							<button
								type="button"
								className={`_kwReviewSectionHeader${open ? ' _open' : ''}`}
								onClick={() => toggleExpanded(sec.key)}
							>
								<span className="_kwReviewSectionLabel">
									{sec.label}
									{sec.help && (
										<i
											className="fa fa-regular fa-circle-question _audHelp"
											title={sec.help}
											aria-label={sec.help}
											onClick={e => e.stopPropagation()}
										/>
									)}
								</span>
								<i
									className={`fa fa-solid fa-chevron-right _kwReviewSectionChevron${open ? ' _open' : ''}`}
									aria-hidden="true"
								/>
							</button>

							{open && (
								<div className="_kwReviewSectionBody">
									{sec.mix_help && <p className="_audMixHelp">{sec.mix_help}</p>}
									{(sec.members ?? []).map(group => (
										<MemberEditor
											key={group.ref}
											group={group}
											context={context}
											onChanged={() => clearError(sec.key)}
										/>
									))}
									{err && (
										<div
											className="_kwReviewError"
											role="alert"
											onClick={() => clearError(sec.key)}
										>
											{err}
										</div>
									)}
									{errors.add && canAdd && (
										<div
											className="_kwReviewError"
											role="alert"
											onClick={() => clearError('add')}
										>
											{errors.add}
										</div>
									)}

									{isDemographics && !demo && (
										<div className="_audDemoActions">
											<button
												type="button"
												className="_kwAddBtn"
												disabled={acting}
												onClick={() => setDemo(seedDemo(sec.values, opts))}
											>
												<i className="fa fa-solid fa-pen" /> Edit filters
											</button>
										</div>
									)}
									{canAdd && (
										<div
											className="_audPicker"
											// Every section renders one of these, so only the OPEN
											// one may hold the ref - otherwise the last section
											// wins it and click-outside fires on every click.
											ref={pickerFor === sec.key ? pickerRef : undefined}
										>
											{pickerFor === sec.key ? (
												<>
													<div className="_audTabs">
														<button
															type="button"
															className={`_audTab${tab === 'search' ? ' _on' : ''}`}
															onClick={() => setTab('search')}
														>
															Search
														</button>
														<button
															type="button"
															className={`_audTab${tab === 'browse' ? ' _on' : ''}`}
															onClick={() => setTab('browse')}
														>
															Browse
														</button>
														<button
															type="button"
															className="_kwCancelBtn"
															title="Close"
															aria-label="Close picker"
															onClick={closePicker}
														>
															<i className="fa fa-solid fa-xmark" />
														</button>
													</div>
													{tab === 'search' && (
														<input
															type="text"
															className="_kwAddInput"
															placeholder="Search Google's segments…"
															autoFocus
															value={query}
															disabled={acting}
															onChange={e => setQuery(e.target.value)}
														/>
													)}
													{tab === 'search' &&
														query.trim().length >= 2 && (
															<div className="_audResults">
																{searching && (
																	<div className="_audResultNote">
																		Searching…
																	</div>
																)}
																{!searching &&
																	results.length === 0 && (
																		<div className="_audResultNote">
																			Google has no segment
																			for that. Ask in chat to
																			build a custom segment
																			from what people search.
																		</div>
																	)}
																{results.map(seg => (
																	<button
																		key={seg.ref}
																		type="button"
																		className="_audResult"
																		disabled={acting}
																		onClick={() =>
																			addSegment(seg)
																		}
																	>
																		<span className="_audResultLabel">
																			{seg.label}
																		</span>
																		{seg.path.length > 1 && (
																			<span className="_audResultPath">
																				{seg.path
																					.slice(0, -1)
																					.map(
																						(
																							p,
																							i,
																							arr,
																						) => (
																							<React.Fragment
																								key={
																									i
																								}
																							>
																								{p}
																								{i <
																									arr.length -
																										1 && (
																									<i className="fa fa-solid fa-chevron-right _audPathSep" />
																								)}
																							</React.Fragment>
																						),
																					)}
																			</span>
																		)}
																	</button>
																))}
															</div>
														)}
													{tab === 'browse' && (
														<div className="_audResults _audBrowseList">
															{browsing && (
																<div className="_audResultNote">
																	Loading…
																</div>
															)}
															{!browsing && browse.length === 0 && (
																<div className="_audResultNote">
																	Nothing left to add here.
																</div>
															)}
															{browse.map(seg => {
																const depth = seg.path.length - 1;
																// A parent is hidden until its
																// ancestors are open, so the tree
																// starts collapsed to its roots.
																const hidden = seg.path
																	.slice(0, -1)
																	.some(
																		(_, i) =>
																			!expanded2[
																				seg.path
																					.slice(0, i + 1)
																					.join('>')
																			],
																	);
																if (hidden) return null;
																const key = seg.path.join('>');
																const hasKids = browse.some(
																	o =>
																		o.path.length ===
																			seg.path.length + 1 &&
																		o.path
																			.slice(0, -1)
																			.join('>') === key,
																);
																const toggle = () =>
																	setExpanded2(m => ({
																		...m,
																		[key]: !m[key],
																	}));
																return (
																	<div
																		key={seg.ref}
																		className={`_audBrowseRow${seg.targeted ? ' _added' : ''}`}
																	>
																		{/* The checkbox selects. The
																		    row only opens the branch —
																		    Google behaves the same, and
																		    it stops a stray click on the
																		    label adding a segment. */}
																		<input
																			type="checkbox"
																			className="_audBrowseCheck"
																			style={{
																				marginLeft: `${8 + depth * 18}px`,
																			}}
																			checked={!!seg.targeted}
																			disabled={acting}
																			title={
																				seg.targeted
																					? 'Already targeted'
																					: 'Add this segment'
																			}
																			onChange={() => {
																				if (!seg.targeted)
																					addSegment(seg);
																			}}
																		/>
																		<button
																			type="button"
																			className={`_audBrowsePick${hasKids ? '' : ' _leaf'}`}
																			onClick={
																				hasKids
																					? toggle
																					: undefined
																			}
																		>
																			<span className="_audBrowseLabel">
																				{seg.label}
																			</span>
																		</button>
																		{hasKids && (
																			<button
																				type="button"
																				className="_audBrowseTwisty"
																				aria-label={
																					expanded2[key]
																						? 'Collapse'
																						: 'Expand'
																				}
																				onClick={toggle}
																			>
																				<i
																					className={`fa fa-solid fa-chevron-down${expanded2[key] ? ' _open' : ''}`}
																				/>
																			</button>
																		)}
																	</div>
																);
															})}
														</div>
													)}
												</>
											) : (
												<button
													type="button"
													className="_kwAddBtn"
													disabled={acting}
													onClick={() => setPickerFor(sec.key)}
												>
													<i className="fa fa-solid fa-plus" /> Add
													segment
												</button>
											)}
										</div>
									)}

									{isDemographics && demo ? (
										<div className="_audDemoEditor">
											{opts?.dimensions.map(dim => {
												const field = dim.field;
												const why = sec.values?.rationales?.[field];
												const boxes =
													field === 'genders'
														? opts.genders
														: field === 'parental_statuses'
															? opts.parental_statuses
															: null;
												const picked =
													field === 'genders'
														? demo.genders
														: demo.parental;
												const setPicked = (v: string[]) =>
													setDemo(
														field === 'genders'
															? { ...demo, genders: v }
															: { ...demo, parental: v },
													);
												return (
													<div key={field} className="_audDemoRow">
														<span className="_audDemoLabel">
															{dim.label}
															<i
																className="fa fa-regular fa-circle-question _audHelp"
																title={dim.help}
																aria-label={dim.help}
															/>
														</span>
														<div className="_audDemoControls">
															{boxes ? (
																boxes.map(({ value, label }) => (
																	<label
																		key={value}
																		className="_audUnknownBox"
																	>
																		<input
																			type="checkbox"
																			checked={picked.includes(
																				value,
																			)}
																			onChange={() => {
																				const next =
																					toggleIn(
																						picked,
																						value,
																					);
																				// Google keeps at least one
																				// ticked; none would target
																				// nobody.
																				if (next.length)
																					setPicked(next);
																			}}
																		/>
																		{label}
																	</label>
																))
															) : field === 'age_ranges' ? (
																<>
																	<select
																		className="_kwMatchSelect"
																		value={demo.minAge}
																		onChange={e =>
																			setDemo({
																				...demo,
																				minAge: e.target
																					.value,
																				// Google requires max > min.
																				maxAge:
																					Number(
																						demo.maxAge,
																					) >
																					Number(
																						e.target
																							.value,
																					)
																						? demo.maxAge
																						: '',
																			})
																		}
																	>
																		{opts.age_mins.map(a => (
																			<option
																				key={a}
																				value={a}
																			>
																				{a}
																			</option>
																		))}
																	</select>
																	<span className="_audDemoDash">
																		to
																	</span>
																	<select
																		className="_kwMatchSelect"
																		value={demo.maxAge}
																		onChange={e =>
																			setDemo({
																				...demo,
																				maxAge: e.target
																					.value,
																			})
																		}
																	>
																		{opts.age_maxes
																			.filter(
																				a =>
																					a >
																					Number(
																						demo.minAge,
																					),
																			)
																			.map(a => (
																				<option
																					key={a}
																					value={a}
																				>
																					{a}
																				</option>
																			))}
																		<option value="">
																			65+
																		</option>
																	</select>
																</>
															) : (
																<>
																	<select
																		className="_kwMatchSelect"
																		value={demo.incomeFrom}
																		onChange={e =>
																			setDemo({
																				...demo,
																				incomeFrom:
																					e.target.value,
																				// A "to" above the new "from"
																				// is a gap.
																				incomeTo:
																					incomeIndex(
																						opts,
																						demo.incomeTo,
																					) >=
																					incomeIndex(
																						opts,
																						e.target
																							.value,
																					)
																						? demo.incomeTo
																						: e.target
																								.value,
																			})
																		}
																	>
																		{opts.income_ranges.map(
																			i => (
																				<option
																					key={i.value}
																					value={i.value}
																				>
																					{i.label}
																				</option>
																			),
																		)}
																	</select>
																	<span className="_audDemoDash">
																		to
																	</span>
																	<select
																		className="_kwMatchSelect"
																		value={demo.incomeTo}
																		onChange={e =>
																			setDemo({
																				...demo,
																				incomeTo:
																					e.target.value,
																			})
																		}
																	>
																		{opts.income_ranges
																			.filter(
																				i =>
																					incomeIndex(
																						opts,
																						i.value,
																					) >=
																					incomeIndex(
																						opts,
																						demo.incomeFrom,
																					),
																			)
																			.map(i => (
																				<option
																					key={i.value}
																					value={i.value}
																				>
																					{i.label}
																				</option>
																			))}
																	</select>
																</>
															)}
															<label
																className="_audUnknownBox"
																title={dim.unknown_help}
															>
																<input
																	type="checkbox"
																	checked={
																		demo.unknown[field] !==
																		false
																	}
																	onChange={e =>
																		setDemo({
																			...demo,
																			unknown: {
																				...demo.unknown,
																				[field]:
																					e.target
																						.checked,
																			},
																		})
																	}
																/>
																Unknown
															</label>
														</div>
														{why && (
															<span className="_audDemoWhy">
																{why}
															</span>
														)}
													</div>
												);
											})}

											<div className="_audDemoActions">
												<button
													type="button"
													className="_kwAddBtn"
													disabled={acting}
													onClick={saveDemographics}
												>
													{loading('demo') ? (
														<i className="fa fa-solid fa-spinner fa-spin" />
													) : (
														'Save'
													)}
												</button>
												<button
													type="button"
													className="_audTextBtn"
													disabled={acting}
													onClick={() => setDemo(null)}
												>
													Cancel
												</button>
											</div>
											<p className="_audDemoHint">
												Every filter shrinks reach — narrow only where the
												product truly does not apply.
											</p>
										</div>
									) : (
										<table className="_kwReviewTable">
											<thead>
												<tr>
													{sec.columns.map(c => (
														<th key={c} className="_kwReviewTh">
															{COL_LABELS[c] ?? c}
														</th>
													))}
													<th className="_kwReviewTh _kwActionsHead" />
												</tr>
											</thead>
											<tbody>
												{sec.rows.map((row, ri) => {
													const rowKey =
														row.segment ?? row.attribute ?? String(ri);
													const delId = `${sec.key}:${rowKey}`;
													return (
														<tr key={delId} className="_kwReviewRow">
															{sec.columns.map(col => (
																<td
																	key={col}
																	className={`_kwReviewTd${col === 'segment' ? ' _kwKwText' : ''}${col === 'rationale' || col === 'category' ? ' _kwExtra' : ''}`}
																	title={
																		col === 'category'
																			? String(row[col] ?? '')
																			: undefined
																	}
																>
																	{col === 'category'
																		? shortPath(
																				String(
																					row[col] ?? '',
																				),
																			)
																		: (row[col] ?? '')}
																</td>
															))}
															<td className="_kwReviewTd _kwActionsCell">
																{canDelete &&
																	(pendingDelete === delId ? (
																		<>
																			<button
																				type="button"
																				className="_kwDeleteBtn"
																				title="Confirm remove"
																				aria-label="Confirm remove"
																				disabled={acting}
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
																			disabled={acting}
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
															colSpan={sec.columns.length + 1}
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

									{isDemographics && !demo && sec.rows.length === 0 && (
										<div className="_audDemoActions">
											<button
												type="button"
												className="_kwAddBtn"
												disabled={acting}
												onClick={() => setDemo(seedDemo(sec.values, opts))}
											>
												<i className="fa fa-solid fa-plus" /> Narrow the
												audience
											</button>
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
