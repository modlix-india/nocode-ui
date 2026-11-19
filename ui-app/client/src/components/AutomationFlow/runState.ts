import { AutomationRun, CheckReport, RunLogEntry } from './automationTypes';

/**
 * What a run says about each card, read from its log.
 *
 * The log is a list of events per node (STARTED, DONE, WAITING, ...); a card
 * shows the last one. A node the log never mentions was skipped when the run
 * has finished, and is simply not reached yet while it is still going.
 */

export type CardRunState =
	| 'done'
	| 'running'
	| 'waiting'
	| 'failed'
	| 'timedOut'
	| 'heard'
	| 'cancelled'
	| 'skipped'
	| 'notYet';

export interface CardRun {
	state: CardRunState;
	at?: string | number;
	until?: string | number;
	error?: string;
	branch?: string;
}

const FINISHED = new Set(['DONE', 'FAILED', 'CANCELLED']);

function stateOf(e: RunLogEntry): CardRunState {
	switch (String(e.status).toUpperCase()) {
		case 'DONE':
			return 'done';
		case 'FAILED':
			return 'failed';
		case 'WAITING':
			return 'waiting';
		case 'TIMED_OUT':
			return 'timedOut';
		case 'HAPPENED':
			return 'heard';
		case 'CANCELLED':
			return 'cancelled';
		default:
			return 'running';
	}
}

export interface RunView {
	byNode: Record<string, CardRun>;
	/** The lane taken at each IF (its `branch`), from the log. */
	branches: Record<string, string>;
	/** When the run began: the first log time. */
	startedAt?: string | number;
	finished: boolean;
}

export function runView(run: AutomationRun | undefined): RunView | undefined {
	if (!run) return undefined;
	const byNode: Record<string, CardRun> = {};
	const branches: Record<string, string> = {};
	const log = Array.isArray(run.log) ? run.log : [];
	for (const e of log) {
		if (!e?.node) continue;
		const prev = byNode[e.node];
		const cur: CardRun = { state: stateOf(e), at: e.at ?? prev?.at };
		if (e.until !== undefined) cur.until = e.until;
		if (e.error) cur.error = e.error;
		if (e.branch) {
			cur.branch = e.branch;
			branches[e.node] = e.branch;
		} else if (prev?.branch) cur.branch = prev.branch;
		byNode[e.node] = cur;
	}
	for (const [node, w] of Object.entries(run.waits ?? {})) {
		const c = byNode[node];
		if (c?.state === 'waiting' && c.until === undefined && w?.until !== undefined)
			c.until = w.until;
		if (!c) byNode[node] = { state: 'waiting', until: w?.until };
	}
	return {
		byNode,
		branches,
		startedAt: log[0]?.at,
		finished: FINISHED.has(String(run.status ?? '').toUpperCase()),
	};
}

export function cardRun(view: RunView | undefined, key: string): CardRun | undefined {
	if (!view) return undefined;
	return view.byNode[key] ?? { state: view.finished ? 'skipped' : 'notYet' };
}

/** A date or time as short words: "19 Nov, 14:05". Text that is not a date passes through. */
export function shortTime(v: string | number | undefined): string {
	if (v === undefined || v === null || v === '') return '';
	const d = new Date(typeof v === 'number' && v < 1e12 ? v * 1000 : v);
	if (isNaN(d.getTime())) return String(v);
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getDate()} ${months[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The words a card shows for its run state. */
export function runWords(c: CardRun | undefined): string {
	if (!c) return '';
	switch (c.state) {
		case 'done':
			return c.at ? `Done ${shortTime(c.at)}` : 'Done';
		case 'running':
			return 'Running';
		case 'waiting':
			return c.until ? `Waiting until ${shortTime(c.until)}` : 'Waiting';
		case 'failed':
			return c.error ? `Failed: ${c.error}` : 'Failed';
		case 'timedOut':
			return c.at ? `Time ran out ${shortTime(c.at)}` : 'Time ran out';
		case 'heard':
			return c.at ? `Happened ${shortTime(c.at)}` : 'Happened';
		case 'cancelled':
			return 'Cancelled';
		case 'skipped':
			return 'Skipped';
		default:
			return 'Not yet';
	}
}

/** Check-report messages per node; whole-document ones under ''. */
export function issuesByNode(report: CheckReport | undefined): {
	errors: Record<string, string[]>;
	warnings: Record<string, string[]>;
} {
	const errors: Record<string, string[]> = {};
	const warnings: Record<string, string[]> = {};
	for (const e of report?.errors ?? []) (errors[e.node ?? ''] ??= []).push(e.message);
	for (const w of report?.warnings ?? []) (warnings[w.node ?? ''] ??= []).push(w.message);
	return { errors, warnings };
}
