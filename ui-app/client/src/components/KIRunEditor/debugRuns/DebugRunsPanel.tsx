import React, { useEffect, useState } from 'react';
import {
	DebugRunDay,
	DebugRunFunction,
	DebugRunPage,
	fetchDebugRun,
	fetchDebugRunDays,
	fetchDebugRuns,
	StoredRunView,
	toStoredRunView,
} from './debugRunsApi';

const PAGE_SIZE = 20;

const NO_ACCESS = 'You do not have access to the debug runs of this function.';
const EMPTY =
	'No stored runs yet. A run is stored when this function runs while debug mode is on, by someone who can edit functions. Runs are kept for 14 days.';

function fmtTime(v: string | number | undefined) {
	if (v === undefined || v === null || v === '') return '';
	// Core sends epoch seconds; accept milliseconds and ISO strings too.
	const d = new Date(typeof v === 'number' && v < 1e12 ? v * 1000 : v);
	return isNaN(d.getTime()) ? String(v) : d.toLocaleTimeString();
}

function fmtDuration(ms: number | undefined) {
	if (ms === undefined || ms === null) return '';
	return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

const S: Record<string, React.CSSProperties> = {
	panel: {
		position: 'absolute',
		top: 36,
		right: 8,
		zIndex: 20,
		width: 420,
		maxWidth: 'calc(100% - 16px)',
		maxHeight: 'calc(100% - 44px)',
		overflow: 'auto',
		background: 'var(--debugRunsBackground, #fff)',
		color: 'var(--debugRunsColor, #222)',
		border: '1px solid rgba(0,0,0,0.15)',
		borderRadius: 6,
		boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
		padding: 10,
		fontSize: 12,
	},
	row: {
		display: 'flex',
		gap: 8,
		alignItems: 'center',
		padding: '4px 6px',
		borderRadius: 4,
		cursor: 'pointer',
		border: 'none',
		background: 'transparent',
		width: '100%',
		textAlign: 'left',
		font: 'inherit',
		color: 'inherit',
	},
	err: { color: '#c0392b', fontWeight: 600 },
	muted: { opacity: 0.7 },
};

export interface DebugRunsPanelProps {
	fn: DebugRunFunction;
	onPick: (view: StoredRunView) => void;
	onClose: () => void;
}

export default function DebugRunsPanel({ fn, onPick, onClose }: Readonly<DebugRunsPanelProps>) {
	const [days, setDays] = useState<DebugRunDay[]>();
	const [day, setDay] = useState<string>();
	const [page, setPage] = useState(0);
	const [runs, setRuns] = useState<DebugRunPage>();
	const [message, setMessage] = useState<string>();
	const [busy, setBusy] = useState(false);

	const handleError = (e: any) =>
		setMessage(
			e?.kind === 'noAccess'
				? NO_ACCESS
				: e?.kind === 'unavailable'
					? 'This server does not store debug runs yet.'
					: 'Could not load the debug runs. Try again.',
		);

	useEffect(() => {
		let live = true;
		setMessage(undefined);
		fetchDebugRunDays(fn)
			.then(d => {
				if (!live) return;
				setDays(d);
				if (d.length) setDay(d[0].day);
			})
			.catch(e => live && handleError(e));
		return () => {
			live = false;
		};
	}, [fn.appCode, fn.namespace, fn.name, fn.clientCode]);

	useEffect(() => {
		if (!day) return;
		let live = true;
		setRuns(undefined);
		fetchDebugRuns(fn, day, page, PAGE_SIZE)
			.then(r => live && setRuns(r))
			.catch(e => live && handleError(e));
		return () => {
			live = false;
		};
	}, [day, page, fn.appCode, fn.namespace, fn.name, fn.clientCode]);

	const pick = (id: string) => {
		setBusy(true);
		fetchDebugRun(id)
			.then(r => onPick(toStoredRunView(r)))
			.catch(handleError)
			.finally(() => setBusy(false));
	};

	const showClient = !!runs?.content?.some(r => r.clientCode && r.clientCode !== fn.clientCode);
	const totalPages = runs
		? Math.max(1, Math.ceil(runs.totalElements / (runs.size || PAGE_SIZE)))
		: 1;

	let body: React.ReactNode;
	if (message) body = <div data-testid="debugRunsMessage">{message}</div>;
	else if (!days) body = <div style={S.muted}>Loading...</div>;
	else if (!days.length) body = <div data-testid="debugRunsEmpty">{EMPTY}</div>;
	else
		body = (
			<>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
					{days.map(d => (
						<button
							key={d.day}
							data-testid="debugRunsDay"
							onClick={() => {
								setDay(d.day);
								setPage(0);
							}}
							style={{
								...S.row,
								width: 'auto',
								border: '1px solid rgba(0,0,0,0.15)',
								fontWeight: d.day === day ? 700 : 400,
							}}
						>
							{d.day} ({d.runs} {d.runs === 1 ? 'run' : 'runs'}
							{d.errored ? <span style={S.err}>, {d.errored} failed</span> : null})
						</button>
					))}
				</div>
				{!runs ? (
					<div style={S.muted}>Loading...</div>
				) : !runs.content?.length ? (
					<div>No runs on this day.</div>
				) : (
					<>
						{runs.content.map(r => (
							<button
								key={r.id}
								data-testid="debugRunsRun"
								disabled={busy}
								onClick={() => pick(r.id)}
								style={S.row}
								title={`Debug id ${r.debugId}`}
							>
								<span style={{ minWidth: 70 }}>{fmtTime(r.startedAt)}</span>
								<span style={{ minWidth: 70 }}>
									{r.userName ??
										(r.userId !== undefined ? `User ${r.userId}` : '')}
								</span>
								<span style={{ minWidth: 60 }}>{fmtDuration(r.durationMs)}</span>
								{showClient ? <span>{r.clientCode}</span> : null}
								<span style={S.err}>{r.errored ? 'Failed' : ''}</span>
								{r.draft ? <span style={S.muted}>draft</span> : null}
								<span style={{ ...S.muted, marginLeft: 'auto' }}>{r.debugId}</span>
							</button>
						))}
						{totalPages > 1 ? (
							<div
								style={{
									display: 'flex',
									gap: 8,
									alignItems: 'center',
									marginTop: 6,
								}}
							>
								<button disabled={page <= 0} onClick={() => setPage(page - 1)}>
									Newer
								</button>
								<span>
									Page {page + 1} of {totalPages}
								</span>
								<button
									disabled={page + 1 >= totalPages}
									onClick={() => setPage(page + 1)}
								>
									Older
								</button>
							</div>
						) : null}
					</>
				)}
			</>
		);

	return (
		<div className="_debugRunsPanel" data-testid="debugRunsPanel" style={S.panel}>
			<div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
				<b>Debug runs</b>
				<span style={{ ...S.muted, marginLeft: 6 }}>(days in UTC)</span>
				<button style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="Close">
					Close
				</button>
			</div>
			{body}
		</div>
	);
}
