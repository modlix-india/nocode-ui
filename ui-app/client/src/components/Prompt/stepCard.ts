/**
 * Step card (ADZ-2065): a turn's tool calls drawn as the rows of ONE card, the way
 * the product study block draws its workers, instead of one "Used N tools" line
 * list with tool names and raw JSON.
 *
 * The words come from the server, never from the tool: a tool call may carry
 * `step: { name, live, done, failed, action, hidden }` (all optional), which the
 * AI service writes from its own table of plain names. Nothing here invents text
 * from a tool name, id or result; a step with no words from the server falls back
 * to the tool's display name, and a failure with no sentence says one plain thing.
 *
 * Pure functions, so the rules are tested without drawing anything.
 */

/** One optional button on a failed step: clicking it sends `message` as a chat message. */
export interface StepAction {
	label: string;
	message: string;
}

/** What the server says about one step, in plain words. */
export interface StepInfo {
	/** "Reading the product". */
	name?: string;
	/** The live line while it runs ("Checking your ad accounts"). */
	live?: string;
	/** The line once it is done. */
	done?: string;
	/** One sentence about what went wrong, when it failed. */
	failed?: string;
	/** One action offered on a failed step. */
	action?: StepAction;
	/** A tool that is not a step to the person (quick reply chips): draws no row. */
	hidden?: boolean;
}

export const GENERIC_FAILED_TEXT = 'This step did not finish.';

/** The parts of a tool call the card needs (LazyPrompt's ToolCall satisfies it). */
export interface StepToolCall {
	id: string;
	toolName: string;
	displayName?: string;
	success?: boolean;
	isRunning: boolean;
	startedAt?: number;
	endedAt?: number;
	/** Saved turns carry the tool's time, since their start and end are gone. */
	durationMs?: number;
	updates?: string[];
	step?: StepInfo;
}

/** The parts of a sub-agent span the card needs. */
export interface StepSpan {
	key: string;
	label: string;
	parentToolUseId?: string;
	status: 'running' | 'success' | 'error';
	startedAt: number;
	endedAt?: number;
	durationMs?: number;
	summary?: string;
	statusText?: string;
	toolCalls: Array<{ id: string }>;
}

export type StepStatus = 'running' | 'success' | 'error';

/** A helper that ran inside a step: drawn as its own indented row. */
export interface HelperRow {
	key: string;
	name: string;
	line?: string;
	status: StepStatus;
	startedAt?: number;
	endedAt?: number;
	durationMs?: number;
}

export interface StepRow {
	id: string;
	name: string;
	/** The live line while it runs, the done line after, empty when there is none. */
	line: string;
	/** One plain sentence, only for a failed step. */
	failed?: string;
	action?: StepAction;
	status: StepStatus;
	startedAt?: number;
	endedAt?: number;
	durationMs?: number;
	helpers: HelperRow[];
}

export interface StepRows {
	rows: StepRow[];
	/** Helpers with no step row to sit under: the caller still draws them as agent cards. */
	looseSpans: string[];
}

/** Accepts only a well-formed step from the wire or a saved turn, else undefined. */
export function parseStepInfo(raw: any): StepInfo | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const text = (v: any) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
	const action =
		raw.action &&
		typeof raw.action === 'object' &&
		text(raw.action.label) &&
		text(raw.action.message)
			? { label: text(raw.action.label)!, message: text(raw.action.message)! }
			: undefined;
	const info: StepInfo = {
		name: text(raw.name),
		live: text(raw.live),
		done: text(raw.done),
		failed: text(raw.failed),
		action,
		hidden: raw.hidden === true ? true : undefined,
	};
	return Object.values(info).some(v => v !== undefined) ? info : undefined;
}

/** Fold a later step message (the result's) over an earlier one (the start's). */
export function mergeStepInfo(
	before: StepInfo | undefined,
	after: StepInfo | undefined,
): StepInfo | undefined {
	if (!before) return after;
	if (!after) return before;
	const merged: StepInfo = { ...before };
	for (const [k, v] of Object.entries(after)) {
		if (v !== undefined) (merged as any)[k] = v;
	}
	return merged;
}

function statusOf(tc: StepToolCall): StepStatus {
	if (tc.isRunning) return 'running';
	return tc.success === false ? 'error' : 'success';
}

/**
 * The rows of a turn's card, in the order the tools started.
 *
 * `toolCalls` is the whole reply's tool list: a sub-agent's own tools are left out
 * (they are the helper's, drawn inside its row), and the tool that spawned a
 * helper stays as a row with the helper under it.
 */
export function buildStepRows(toolCalls: StepToolCall[], spans: StepSpan[]): StepRows {
	const inSpan = new Set<string>();
	for (const sp of spans) for (const tc of sp.toolCalls) inSpan.add(tc.id);

	const rows: StepRow[] = [];
	const placed = new Set<string>();
	for (const tc of toolCalls) {
		if (inSpan.has(tc.id) || tc.step?.hidden) continue;
		const status = statusOf(tc);
		const updates = tc.updates ?? [];
		const latest = updates.length ? updates[updates.length - 1] : '';
		const line =
			status === 'running'
				? latest || tc.step?.live || ''
				: status === 'success'
					? tc.step?.done || ''
					: '';
		const helpers: HelperRow[] = spans
			.filter(sp => sp.parentToolUseId && sp.parentToolUseId === tc.id)
			.map(sp => {
				placed.add(sp.key);
				return {
					key: sp.key,
					name: sp.label,
					line:
						sp.status === 'running'
							? sp.statusText || ''
							: sp.summary || sp.statusText || '',
					status: sp.status,
					startedAt: sp.startedAt,
					endedAt: sp.endedAt,
					durationMs: sp.durationMs,
				};
			});
		rows.push({
			id: tc.id,
			name: tc.step?.name || tc.displayName || tc.toolName,
			line,
			...(status === 'error'
				? { failed: tc.step?.failed || GENERIC_FAILED_TEXT, action: tc.step?.action }
				: {}),
			status,
			startedAt: tc.startedAt,
			endedAt: tc.endedAt,
			durationMs: tc.durationMs,
			helpers,
		});
	}
	const looseSpans = spans.filter(sp => !placed.has(sp.key)).map(sp => sp.key);
	return { rows, looseSpans };
}

export interface StepProgress {
	total: number;
	/** Steps that are no longer running, failed ones included. */
	finished: number;
	failed: number;
	running: boolean;
}

export function stepProgress(rows: StepRow[]): StepProgress {
	const running = rows.some(r => r.status === 'running');
	return {
		total: rows.length,
		finished: rows.filter(r => r.status !== 'running').length,
		failed: rows.filter(r => r.status === 'error').length,
		running,
	};
}

/** "Working, 1 of 2 done" while it runs; "Finished, 4 steps" after; "Stopped, 1 of 2 done" with a failure. */
export function stepTitle(p: StepProgress): string {
	if (p.running) return `Working, ${p.finished} of ${p.total} done`;
	if (p.failed > 0) return `Stopped, ${p.finished - p.failed} of ${p.total} done`;
	return `Finished, ${p.total} ${p.total === 1 ? 'step' : 'steps'}`;
}

/** Whole seconds a row took, or has been running; undefined when nothing says. */
export function rowSeconds(
	r: { startedAt?: number; endedAt?: number; durationMs?: number },
	running: boolean,
	now: number,
): number | undefined {
	if (!running && r.durationMs !== undefined) return Math.round(r.durationMs / 1000);
	if (r.startedAt === undefined) return undefined;
	const end = running ? now : (r.endedAt ?? r.startedAt);
	return Math.max(0, Math.round((end - r.startedAt) / 1000));
}

/** The card's clock: first start to last end (to now while running); the steps' own times when saved. */
export function cardSeconds(rows: StepRow[], now: number): number {
	const running = rows.some(r => r.status === 'running');
	const starts = rows.map(r => r.startedAt).filter((v): v is number => v !== undefined);
	if (starts.length === rows.length && rows.length > 0) {
		const first = Math.min(...starts);
		const last = running ? now : Math.max(...rows.map(r => r.endedAt ?? r.startedAt ?? first));
		return Math.max(0, Math.round((last - first) / 1000));
	}
	return Math.round(rows.reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / 1000);
}
