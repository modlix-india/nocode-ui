import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HelperRow, StepRow, cardSeconds, rowSeconds, stepProgress, stepTitle } from '../stepCard';
import { useBlockOpen } from '../thinkingShared';

// Long enough to see every row's final state before the card folds.
const FOLD_AFTER_FINISH_MS = 1200;

interface StepCardProps {
	rows: StepRow[];
	expandIcon?: string;
	collapseIcon?: string;
	/** A failed step's action: sends `message` as a chat message. */
	onAction?: (message: string) => void;
	/** A reply is being written: the action waits until it ends. */
	actionsDisabled?: boolean;
}

function dotClass(s: StepRow['status']): string {
	if (s === 'running') return '_running';
	if (s === 'error') return '_error';
	return '_success';
}

function secondsText(sec: number | undefined, running: boolean): string | undefined {
	if (sec === undefined) return undefined;
	if (!running && sec < 1) return '<1s';
	return `${sec}s`;
}

function HelperLine({ h, now }: { h: HelperRow; now: number }) {
	const running = h.status === 'running';
	const time = secondsText(rowSeconds(h, running, now), running);
	return (
		<div className={`_agentItem _helper ${dotClass(h.status)}`}>
			<div className="_agentItemHead">
				<span className={`_statusDot ${dotClass(h.status)}`} />
				<span className="_agentItemName">{h.name}</span>
				{time && <span className="_agentItemDur">{time}</span>}
			</div>
			{h.line && <div className="_agentDoing">{h.line}</div>}
		</div>
	);
}

function StepLine({
	row,
	now,
	onAction,
	actionsDisabled,
}: {
	row: StepRow;
	now: number;
	onAction?: (message: string) => void;
	actionsDisabled?: boolean;
}) {
	const running = row.status === 'running';
	const time = secondsText(rowSeconds(row, running, now), running);
	return (
		<>
			<div className={`_agentItem ${dotClass(row.status)}`}>
				<div className="_agentItemHead">
					<span className={`_statusDot ${dotClass(row.status)}`} />
					<span className="_agentItemName">{row.name}</span>
					{time && <span className="_agentItemDur">{time}</span>}
				</div>
				{row.line && (
					<div className="_agentDoing">
						{row.line}
						{running && <span className="_agentDoingCursor" />}
					</div>
				)}
				{row.failed && (
					<div className="_agentDoing _stepFailed" role="alert">
						{row.failed}
					</div>
				)}
				{row.failed && row.action && onAction && (
					<button
						type="button"
						className="_stepAction"
						disabled={actionsDisabled}
						onClick={() => onAction(row.action!.message)}
					>
						{row.action.label}
					</button>
				)}
			</div>
			{row.helpers.map(h => (
				<HelperLine key={h.key} h={h} now={now} />
			))}
		</>
	);
}

/**
 * One card per turn: "Working, 1 of 2 done", a thin progress bar, the elapsed time,
 * then one row per step with its plain name, live line and seconds (ADZ-2065).
 * A failed step is red with one sentence and, when the server offers one, one button.
 */
export function StepCard({
	rows,
	expandIcon = 'fa fa-chevron-down',
	collapseIcon = 'fa fa-chevron-up',
	onAction,
	actionsDisabled,
}: Readonly<StepCardProps>) {
	const progress = stepProgress(rows);
	const anyRunning =
		progress.running || rows.some(r => r.helpers.some(h => h.status === 'running'));
	const [localOpen, setLocalOpen] = useState(true);
	const [userToggled, setUserToggled] = useState(false);
	const { open, toggle } = useBlockOpen(localOpen, setLocalOpen);

	// Tick once a second so the seconds refresh while it runs.
	const [, setTick] = useState(0);
	useEffect(() => {
		if (!anyRunning) return;
		const t = setInterval(() => setTick(n => n + 1), 1000);
		return () => clearInterval(t);
	}, [anyRunning]);

	// Fold shortly after the last row finishes, unless the person has chosen.
	const prevRunning = useRef(anyRunning);
	useEffect(() => {
		if (userToggled) return;
		if (!anyRunning && prevRunning.current) {
			const t = setTimeout(() => setLocalOpen(false), FOLD_AFTER_FINISH_MS);
			return () => clearTimeout(t);
		}
		// More steps began after a pause: show them.
		if (anyRunning && !prevRunning.current) setLocalOpen(true);
		prevRunning.current = anyRunning;
	}, [anyRunning, userToggled]);

	const onToggle = useCallback(() => {
		setUserToggled(true);
		toggle();
	}, [toggle]);

	if (!rows.length) return null;

	const now = Date.now();
	const failed = progress.failed > 0 && !anyRunning;
	const pct = Math.max(progress.finished / progress.total, 0.06) * 100;

	return (
		<div
			className={`_agentCard _stepCard ${anyRunning ? '_running' : '_done'}${failed ? ' _failed' : ''}`}
		>
			<button
				type="button"
				className="_agentCardHead"
				onClick={onToggle}
				aria-expanded={open}
			>
				{anyRunning ? (
					<span className="_agentCardSpin" />
				) : (
					<span className={`_agentCardCheck${failed ? ' _failed' : ''}`}>
						{failed ? '!' : '✓'}
					</span>
				)}
				<span className="_agentCardTitle">{stepTitle(progress)}</span>
				<span className="_agentCardTime">{cardSeconds(rows, now)}s</span>
				<i
					className={`_agentCardChevron ${open ? collapseIcon : expandIcon}`}
					aria-hidden="true"
				/>
			</button>

			{anyRunning && (
				<div className="_agentCardProgress">
					<div style={{ width: `${pct}%` }} />
				</div>
			)}

			{open && (
				<div className="_agentCardBody">
					{rows.map(r => (
						<StepLine
							key={r.id}
							row={r}
							now={now}
							onAction={onAction}
							actionsDisabled={actionsDisabled}
						/>
					))}
				</div>
			)}
		</div>
	);
}
