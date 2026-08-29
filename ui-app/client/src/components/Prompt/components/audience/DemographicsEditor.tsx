import React from 'react';
import { incomeIndex } from './demographics';
import type { DemoOptions, DemoState } from './types';

const toggleIn = (list: string[], value: string) =>
	list.includes(value) ? list.filter(v => v !== value) : [...list, value];

export function DemographicsEditor({
	demo,
	setDemo,
	opts,
	rationales,
	busy,
	saving,
	onSave,
	onCancel,
}: Readonly<{
	demo: DemoState;
	setDemo: (d: DemoState) => void;
	opts: DemoOptions | undefined;
	rationales: Record<string, string> | undefined;
	busy: boolean;
	saving: boolean;
	onSave: () => void;
	onCancel: () => void;
}>) {
	return (
		<div className="_audDemoEditor">
			{opts?.dimensions.map(dim => {
				const field = dim.field;
				const why = rationales?.[field];
				const boxes =
					field === 'genders'
						? opts.genders
						: field === 'parental_statuses'
							? opts.parental_statuses
							: null;
				const picked = field === 'genders' ? demo.genders : demo.parental;
				const setPicked = (v: string[]) =>
					setDemo(
						field === 'genders' ? { ...demo, genders: v } : { ...demo, parental: v },
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
									<label key={value} className="_audUnknownBox">
										<input
											type="checkbox"
											checked={picked.includes(value)}
											onChange={() => {
												const next = toggleIn(picked, value);
												// Google keeps at least one
												// ticked; none would target
												// nobody.
												if (next.length) setPicked(next);
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
												minAge: e.target.value,
												// Google requires max > min.
												maxAge:
													Number(demo.maxAge) > Number(e.target.value)
														? demo.maxAge
														: '',
											})
										}
									>
										{opts.age_mins.map(a => (
											<option key={a} value={a}>
												{a}
											</option>
										))}
									</select>
									<span className="_audDemoDash">to</span>
									<select
										className="_kwMatchSelect"
										value={demo.maxAge}
										onChange={e =>
											setDemo({
												...demo,
												maxAge: e.target.value,
											})
										}
									>
										{opts.age_maxes
											.filter(a => a > Number(demo.minAge))
											.map(a => (
												<option key={a} value={a}>
													{a}
												</option>
											))}
										<option value="">65+</option>
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
												incomeFrom: e.target.value,
												// A "to" above the new "from"
												// is a gap.
												incomeTo:
													incomeIndex(opts, demo.incomeTo) >=
													incomeIndex(opts, e.target.value)
														? demo.incomeTo
														: e.target.value,
											})
										}
									>
										{opts.income_ranges.map(i => (
											<option key={i.value} value={i.value}>
												{i.label}
											</option>
										))}
									</select>
									<span className="_audDemoDash">to</span>
									<select
										className="_kwMatchSelect"
										value={demo.incomeTo}
										onChange={e =>
											setDemo({
												...demo,
												incomeTo: e.target.value,
											})
										}
									>
										{opts.income_ranges
											.filter(
												i =>
													incomeIndex(opts, i.value) >=
													incomeIndex(opts, demo.incomeFrom),
											)
											.map(i => (
												<option key={i.value} value={i.value}>
													{i.label}
												</option>
											))}
									</select>
								</>
							)}
							<label className="_audUnknownBox" title={dim.unknown_help}>
								<input
									type="checkbox"
									checked={demo.unknown[field] !== false}
									onChange={e =>
										setDemo({
											...demo,
											unknown: {
												...demo.unknown,
												[field]: e.target.checked,
											},
										})
									}
								/>
								Unknown
							</label>
						</div>
						{why && <span className="_audDemoWhy">{why}</span>}
					</div>
				);
			})}

			<div className="_audDemoActions">
				<button type="button" className="_kwAddBtn" disabled={busy} onClick={onSave}>
					{saving ? <i className="fa fa-solid fa-spinner fa-spin" /> : 'Save'}
				</button>
				<button type="button" className="_audTextBtn" disabled={busy} onClick={onCancel}>
					Cancel
				</button>
			</div>
		</div>
	);
}
