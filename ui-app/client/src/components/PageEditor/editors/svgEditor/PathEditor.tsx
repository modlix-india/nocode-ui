import React, { useEffect, useState } from 'react';
import { CommitInput } from './inspectorFields';
import { parsePath, PathSeg, pathPoints, serializePath } from './svgPath';

// Args grouped into labelled coordinate groups per command, so a cubic shows
// "ctrl 1 / ctrl 2 / end" rows instead of an unlabelled grid of numbers.
const ARG_GROUPS: Record<string, Array<{ label: string; idx: number[] }>> = {
	M: [{ label: 'point', idx: [0, 1] }],
	L: [{ label: 'point', idx: [0, 1] }],
	T: [{ label: 'point', idx: [0, 1] }],
	H: [{ label: 'x', idx: [0] }],
	V: [{ label: 'y', idx: [0] }],
	C: [
		{ label: 'ctrl 1', idx: [0, 1] },
		{ label: 'ctrl 2', idx: [2, 3] },
		{ label: 'end', idx: [4, 5] },
	],
	S: [
		{ label: 'ctrl 2', idx: [0, 1] },
		{ label: 'end', idx: [2, 3] },
	],
	Q: [
		{ label: 'ctrl 1', idx: [0, 1] },
		{ label: 'end', idx: [2, 3] },
	],
	A: [
		{ label: 'radii', idx: [0, 1] },
		{ label: 'rotation', idx: [2] },
		{ label: 'large-arc', idx: [3] },
		{ label: 'sweep', idx: [4] },
		{ label: 'end', idx: [5, 6] },
	],
	Z: [],
};

const APPENDABLE = ['L', 'C', 'Q', 'Z'];

function anchorOf(segs: PathSeg[], segIndex: number): [number, number] {
	const pt = pathPoints(segs).find(p => p.segIndex === segIndex && p.kind === 'anchor');
	return pt ? [pt.x, pt.y] : [0, 0];
}

function argsForCommand(cmd: string, x: number, y: number): number[] {
	switch (cmd) {
		case 'H':
			return [x];
		case 'V':
			return [y];
		case 'C':
			return [x, y, x, y, x, y];
		case 'S':
		case 'Q':
			return [x, y, x, y];
		case 'A':
			return [10, 10, 0, 0, 0, x, y];
		case 'Z':
			return [];
		default:
			return [x, y];
	}
}

export function PathEditor({
	d,
	onChange,
}: Readonly<{ d: string; onChange: (d: string) => void }>) {
	const segs = parsePath(d);
	const [raw, setRaw] = useState(d);
	useEffect(() => setRaw(d), [d]);

	const commit = (next: PathSeg[]) => onChange(serializePath(next));

	const setArg = (segIndex: number, argIndex: number, value: string) => {
		const next = segs.map((s, i) => (i === segIndex ? { cmd: s.cmd, args: [...s.args] } : s));
		next[segIndex].args[argIndex] = Number(value) || 0;
		commit(next);
	};

	const convert = (segIndex: number, cmd: string) => {
		const [x, y] = anchorOf(segs, segIndex);
		const next = segs.map((s, i) =>
			i === segIndex ? { cmd, args: argsForCommand(cmd, x, y) } : s,
		);
		commit(next);
	};

	const remove = (segIndex: number) => commit(segs.filter((_, i) => i !== segIndex));

	const append = (cmd: string) => {
		const [x, y] = segs.length ? anchorOf(segs, segs.length - 1) : [0, 0];
		commit([...segs, { cmd, args: argsForCommand(cmd, x + 10, y + 10) }]);
	};

	return (
		<div className="_svgPathEditor">
			{segs.map((s, i) => (
				<div className="_svgPathSeg" key={i}>
					<div className="_svgPathSegHead">
						<select
							className="_peInput _svgPathCmd"
							value={s.cmd}
							onChange={e => convert(i, e.target.value)}
						>
							{Object.keys(ARG_GROUPS).map(c => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
						<span className="_svgPathIndex">#{i + 1}</span>
						<button
							type="button"
							className="_svgIconButton"
							title="Delete segment"
							onClick={() => remove(i)}
						>
							<i className="fa fa-solid fa-xmark" />
						</button>
					</div>
					{(ARG_GROUPS[s.cmd] ?? []).map(g => (
						<div
							className={`_svgPathGroup ${g.label === 'end' || g.label === 'point' ? '_anchor' : ''}`}
							key={g.label}
						>
							<span className="_grpLabel">{g.label}</span>
							{g.idx.map(ix => (
								<CommitInput
									key={ix}
									type="number"
									value={String(s.args[ix] ?? 0)}
									onCommit={v => setArg(i, ix, v)}
								/>
							))}
						</div>
					))}
				</div>
			))}

			<div className="_svgPathAppend">
				{APPENDABLE.map(cmd => (
					<button
						key={cmd}
						type="button"
						className="_svgToolButton"
						title={`Append ${cmd}`}
						onClick={() => append(cmd)}
					>
						+{cmd}
					</button>
				))}
			</div>

			<label className="_svgField _svgFieldWide">
				<span>Raw path data</span>
				<textarea
					className="_peInput"
					rows={3}
					value={raw}
					onChange={e => setRaw(e.target.value)}
					onBlur={() => raw !== d && onChange(raw)}
				/>
			</label>
		</div>
	);
}
