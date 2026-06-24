import React from 'react';
import { SmilAnimRef } from './common';
import { CommitInput } from './inspectorFields';

const TIMINGS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
const TRANSFORM_TYPES = ['rotate', 'scale', 'translate', 'skewX', 'skewY'];

interface CssParts {
	name: string;
	dur: string;
	timing: string;
	delay: string;
	iter: string;
	dir: string;
	fill: string;
}

function parseEntry(entry: string): CssParts {
	const t = entry.split(/\s+/);
	return {
		name: t[0] ?? '',
		dur: t[1] ?? '2s',
		timing: t[2] ?? 'linear',
		delay: t[3] ?? '0s',
		iter: t[4] ?? '1',
		dir: t[5] ?? 'normal',
		fill: t[6] ?? 'none',
	};
}

function serializeEntry(o: CssParts): string {
	return [o.name, o.dur, o.timing, o.delay, o.iter, o.dir, o.fill].join(' ');
}

function FieldRow({
	label,
	value,
	onCommit,
}: Readonly<{ label: string; value: string; onCommit: (v: string) => void }>) {
	return (
		<label className="_svgAnimField">
			<span>{label}</span>
			<CommitInput value={value} onCommit={onCommit} />
		</label>
	);
}

// Editable list of the selected element's existing animations (CSS + SMIL).
export function ExistingAnimations({
	animationValue,
	onSetAnimation,
	smil,
	onSetSmilAttr,
	onRemoveSmil,
}: Readonly<{
	animationValue: string;
	onSetAnimation: (value: string) => void;
	smil: SmilAnimRef[];
	onSetSmilAttr: (editId: string, attr: string, value: string) => void;
	onRemoveSmil: (editId: string) => void;
}>) {
	const entries = animationValue
		? animationValue
				.split(',')
				.map(s => s.trim())
				.filter(Boolean)
		: [];

	if (entries.length === 0 && smil.length === 0) return null;

	const setEntry = (index: number, parts: CssParts) => {
		const next = entries.map((e, i) => (i === index ? serializeEntry(parts) : e));
		onSetAnimation(next.join(', '));
	};
	const removeEntry = (index: number) =>
		onSetAnimation(entries.filter((_, i) => i !== index).join(', '));

	return (
		<div className="_svgAnimEditList">
			<div className="_svgSectionTitle">Added animations</div>

			{entries.map((entry, i) => {
				const p = parseEntry(entry);
				return (
					<div className="_svgAnimEdit" key={p.name || i}>
						<div className="_svgAnimEditHead">
							<span className="_chip">CSS · {p.name.replace('svgedit-', '')}</span>
							<button
								type="button"
								className="_svgIconButton"
								title="Remove"
								onClick={() => removeEntry(i)}
							>
								<i className="fa fa-solid fa-xmark" />
							</button>
						</div>
						<FieldRow
							label="Duration"
							value={p.dur}
							onCommit={v => setEntry(i, { ...p, dur: v })}
						/>
						<FieldRow
							label="Iterations"
							value={p.iter}
							onCommit={v => setEntry(i, { ...p, iter: v })}
						/>
						<label className="_svgAnimField">
							<span>Timing</span>
							<select
								className="_peInput"
								value={p.timing}
								onChange={e => setEntry(i, { ...p, timing: e.target.value })}
							>
								{TIMINGS.map(t => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</label>
					</div>
				);
			})}

			{smil.map(s => {
				const set = (attr: string) => (v: string) => onSetSmilAttr(s.editId, attr, v);
				return (
					<div className="_svgAnimEdit" key={s.editId}>
						<div className="_svgAnimEditHead">
							<span className="_chip">{s.tag}</span>
							<button
								type="button"
								className="_svgIconButton"
								title="Remove"
								onClick={() => onRemoveSmil(s.editId)}
							>
								<i className="fa fa-solid fa-xmark" />
							</button>
						</div>

						{s.tag === 'animate' && (
							<FieldRow
								label="Attribute"
								value={s.attrs.attributeName ?? ''}
								onCommit={set('attributeName')}
							/>
						)}
						{s.tag === 'animatetransform' && (
							<label className="_svgAnimField">
								<span>Type</span>
								<select
									className="_peInput"
									value={s.attrs.type ?? 'rotate'}
									onChange={e => onSetSmilAttr(s.editId, 'type', e.target.value)}
								>
									{TRANSFORM_TYPES.map(t => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</label>
						)}
						{s.tag === 'animatemotion' && (
							<>
								<FieldRow
									label="Path"
									value={s.attrs.path ?? ''}
									onCommit={set('path')}
								/>
								<FieldRow
									label="Rotate"
									value={s.attrs.rotate ?? ''}
									onCommit={set('rotate')}
								/>
							</>
						)}

						{s.tag !== 'animatemotion' && s.tag !== 'set' && (
							<>
								<FieldRow
									label="From"
									value={s.attrs.from ?? ''}
									onCommit={set('from')}
								/>
								<FieldRow
									label="To"
									value={s.attrs.to ?? ''}
									onCommit={set('to')}
								/>
								<FieldRow
									label="Values"
									value={s.attrs.values ?? ''}
									onCommit={set('values')}
								/>
							</>
						)}
						{s.tag === 'set' && (
							<FieldRow label="To" value={s.attrs.to ?? ''} onCommit={set('to')} />
						)}

						{s.tag !== 'set' && (
							<FieldRow
								label="Duration"
								value={s.attrs.dur ?? ''}
								onCommit={set('dur')}
							/>
						)}
						<FieldRow
							label="Repeat"
							value={s.attrs.repeatCount ?? ''}
							onCommit={set('repeatCount')}
						/>
						<FieldRow
							label="Begin"
							value={s.attrs.begin ?? ''}
							onCommit={set('begin')}
						/>
					</div>
				);
			})}
		</div>
	);
}
