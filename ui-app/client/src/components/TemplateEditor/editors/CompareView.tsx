import React, { useMemo, useState } from 'react';
import { compareSources, DiffHunk, DiffLine, splitChange } from '../util/lineDiff';

export interface CompareSection {
	label: string;
	before: string;
	after: string;
}

interface CompareViewProps {
	sections: CompareSection[];
	beforeLabel?: string;
	afterLabel?: string;
}

function Marked({
	line,
	other,
	side,
}: Readonly<{ line: DiffLine; other?: DiffLine; side: 'old' | 'new' }>) {
	if (!other || other.op === 'eq' || line.op === 'eq') return <>{line.text || ' '}</>;
	const parts = splitChange(
		side === 'old' ? line.text : other.text,
		side === 'old' ? other.text : line.text,
	);
	const [pre, mid, post] = side === 'old' ? parts.old : parts.new;
	if (!mid) return <>{line.text || ' '}</>;
	return (
		<>
			{pre}
			<mark className="_cmpMark">{mid}</mark>
			{post}
		</>
	);
}

function Split({ hunk }: Readonly<{ hunk: DiffHunk }>) {
	return (
		<table className="_cmpTable _cmpSplit">
			<tbody>
				{hunk.rows.map((r, i) => (
					<tr key={i}>
						<td className="_cmpNo">{r.left?.oldNo ?? ''}</td>
						<td
							className={`_cmpCode ${r.left && r.left.op === 'del' ? '_cmpDel' : ''} ${r.left ? '' : '_cmpEmpty'}`}
						>
							{r.left && <Marked line={r.left} other={r.right} side="old" />}
						</td>
						<td className="_cmpNo">{r.right?.newNo ?? ''}</td>
						<td
							className={`_cmpCode ${r.right && r.right.op === 'add' ? '_cmpAdd' : ''} ${r.right ? '' : '_cmpEmpty'}`}
						>
							{r.right && <Marked line={r.right} other={r.left} side="new" />}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

function Unified({ hunk }: Readonly<{ hunk: DiffHunk }>) {
	return (
		<table className="_cmpTable">
			<tbody>
				{hunk.lines.map((l, i) => (
					<tr key={i}>
						<td className="_cmpNo">{l.oldNo ?? ''}</td>
						<td className="_cmpNo">{l.newNo ?? ''}</td>
						<td
							className={`_cmpCode ${l.op === 'del' ? '_cmpDel' : l.op === 'add' ? '_cmpAdd' : ''}`}
						>
							<span className="_cmpSign">
								{l.op === 'del' ? '-' : l.op === 'add' ? '+' : ' '}
							</span>
							{l.text || ' '}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

// What changed since the template was opened, as a git diff: removed lines red, added lines green, a few
// unchanged lines around each change, and the words that differ marked inside a changed pair.
export default function CompareView({
	sections,
	beforeLabel = 'What was',
	afterLabel = 'What changed',
}: Readonly<CompareViewProps>) {
	const [view, setView] = useState<'split' | 'unified'>('split');
	const results = useMemo(
		() => sections.map(s => ({ s, r: compareSources(s.before, s.after) })),
		[sections],
	);
	const added = results.reduce((n, x) => n + x.r.added, 0);
	const removed = results.reduce((n, x) => n + x.r.removed, 0);

	return (
		<div className="_cmpView">
			<div className="_cmpBar">
				<div className="_cmpTitle">
					{added + removed === 0 ? (
						'No changes yet'
					) : (
						<>
							<span className="_cmpPlus">+{added}</span>{' '}
							<span className="_cmpMinus">-{removed}</span> lines changed
						</>
					)}
					<span className="_cmpSub">
						{' '}
						Left: {beforeLabel.toLowerCase()}. Right: {afterLabel.toLowerCase()}.
					</span>
				</div>
				<div className="_cmpToggle">
					<button
						className={`_teTab ${view === 'split' ? '_active' : ''}`}
						onClick={() => setView('split')}
					>
						Side by side
					</button>
					<button
						className={`_teTab ${view === 'unified' ? '_active' : ''}`}
						onClick={() => setView('unified')}
					>
						One column
					</button>
				</div>
			</div>
			<div className="_cmpBody">
				{results.map(({ s, r }) => (
					<div className="_cmpFile" key={s.label}>
						<div className="_cmpFileHead">
							<b>{s.label}</b>
							{r.added + r.removed > 0 ? (
								<span>
									<span className="_cmpPlus">+{r.added}</span>{' '}
									<span className="_cmpMinus">-{r.removed}</span>
								</span>
							) : (
								<span className="_cmpSub">no changes</span>
							)}
						</div>
						{view === 'split' && r.hunks.length > 0 && (
							<div className="_cmpColHead">
								<span>{beforeLabel}</span>
								<span>{afterLabel}</span>
							</div>
						)}
						{r.hunks.map((h, i) => (
							<div className="_cmpHunk" key={i}>
								<div className="_cmpHunkHead">
									Was at line {h.oldStart}, now at line {h.newStart}
								</div>
								{view === 'split' ? <Split hunk={h} /> : <Unified hunk={h} />}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
