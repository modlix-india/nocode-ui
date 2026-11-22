import React from 'react';
import {
	applyBy,
	applyPeriod,
	applySegment,
	applyShow,
	byChoices,
	Choice,
	lowerFirst,
	PERIOD_CHOICES,
	periodField,
	showChoices,
	simpleState,
} from '../simpleForm';
import { Period, PERIOD_LABELS, ReportCatalog, ReportSpec } from '../reportTypes';

/**
 * The four plain questions of the simple builder: Show, By, Period, Which records. Each one
 * edits only its own part of the spec (simpleForm.ts); a value the lists do not hold (set in
 * More options) is shown as it is, so the form never changes what it cannot show.
 */
export function SimpleQuestions({
	spec,
	catalog,
	onChange,
}: Readonly<{
	spec: ReportSpec;
	catalog?: ReportCatalog;
	/** The next spec; `group` merges quick edits (dates typed) into one undo step. */
	onChange: (spec: ReportSpec, group?: string) => void;
}>) {
	const st = simpleState(spec, catalog);
	const source = catalog?.sources?.[spec.source];
	const segments = Object.entries(source?.segments ?? {});
	const pf = periodField(spec, catalog);
	const pfLabel = pf ? (source?.fields?.[pf]?.label ?? pf) : '';

	const withCurrent = (choices: Choice[], value: string, label: string) =>
		choices.some(c => c.value === value) ? choices : [...choices, { value, label }];
	const shows = withCurrent(showChoices(spec, catalog), st.show, 'As set in More options');
	const bys = withCurrent(byChoices(spec, catalog), st.by, 'As set in More options');

	return (
		<div className="_rpQuestions">
			<label className="_rpLabel">
				Show
				<select
					className="_rpSelect"
					name="show"
					value={st.show}
					onChange={e => onChange(applyShow(spec, e.target.value))}
				>
					{shows.map(c => (
						<option key={c.value} value={c.value}>
							{c.label}
						</option>
					))}
				</select>
			</label>
			<label className="_rpLabel">
				By
				<select
					className="_rpSelect"
					name="by"
					value={st.by}
					onChange={e => onChange(applyBy(spec, e.target.value))}
				>
					{bys.map(c => (
						<option key={c.value} value={c.value}>
							{c.label}
						</option>
					))}
				</select>
			</label>
			{pf ? (
				<label className="_rpLabel">
					Period{pfLabel ? ` (${lowerFirst(pfLabel)})` : ''}
					<select
						className="_rpSelect"
						name="period"
						value={st.period}
						onChange={e =>
							onChange(
								applyPeriod(
									spec,
									catalog,
									e.target.value as Period | '',
									st.from,
									st.to,
								),
							)
						}
					>
						<option value="">All time</option>
						{PERIOD_CHOICES.map(p => (
							<option key={p} value={p}>
								{PERIOD_LABELS[p]}
							</option>
						))}
						{st.period && !PERIOD_CHOICES.includes(st.period) ? (
							<option value={st.period}>{PERIOD_LABELS[st.period]}</option>
						) : null}
					</select>
				</label>
			) : null}
			{st.period === 'CUSTOM' ? (
				<div className="_rpLine">
					<label className="_rpLabel">
						From
						<input
							className="_rpInput"
							type="date"
							name="from"
							value={st.from ?? ''}
							onChange={e =>
								onChange(
									applyPeriod(spec, catalog, 'CUSTOM', e.target.value, st.to),
									'periodFrom',
								)
							}
						/>
					</label>
					<label className="_rpLabel">
						To
						<input
							className="_rpInput"
							type="date"
							name="to"
							value={st.to ?? ''}
							onChange={e =>
								onChange(
									applyPeriod(spec, catalog, 'CUSTOM', st.from, e.target.value),
									'periodTo',
								)
							}
						/>
					</label>
				</div>
			) : null}
			{segments.length ? (
				<label className="_rpLabel">
					Which records
					<select
						className="_rpSelect"
						name="segment"
						value={st.segment}
						onChange={e => onChange(applySegment(spec, e.target.value))}
					>
						<option value="">All {source?.label?.toLowerCase() ?? 'records'}</option>
						{segments.map(([k, sg]) => (
							<option key={k} value={k}>
								{sg.label ?? k}
							</option>
						))}
					</select>
				</label>
			) : null}
		</div>
	);
}
