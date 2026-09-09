import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ToolCallInfo {
	id: string;
	toolName: string;
	displayName?: string;
	summary: string;
	success?: boolean;
	isRunning: boolean;
	startedAt?: number;
	endedAt?: number;
	updates?: string[];
}

export interface AgentSpanInfo {
	agentId: string;
	label: string;
	parentId: string;
	parentToolUseId?: string;
	status: 'running' | 'success' | 'error';
	startedAt: number;
	endedAt?: number;
	durationMs?: number;
	tokensIn?: number;
	tokensOut?: number;
	stepCount?: number;
	summary?: string;
	toolCalls: ToolCallInfo[];
	thinking?: string;
	statusText?: string;
}

interface AgentGroupProps {
	spans: AgentSpanInfo[];
	expandIcon?: string;
	collapseIcon?: string;
}

function elapsedSeconds(span: AgentSpanInfo, now: number): number {
	if (span.durationMs != null) return Math.round(span.durationMs / 1000);
	const end = span.endedAt ?? now;
	return Math.round((end - span.startedAt) / 1000);
}

function statusDotClass(s: AgentSpanInfo['status']): string {
	if (s === 'running') return '_running';
	if (s === 'error') return '_error';
	return '_success';
}

// One tool's lifecycle: appears on tool_start, its line swaps in place on each
// tool_update (history kept), settles on tool_result. Click a settled row to
// unfold the full update history.
function ToolRow({
	tc,
	open,
	onToggle,
	expandIcon,
	collapseIcon,
}: {
	tc: ToolCallInfo;
	open: boolean;
	onToggle: () => void;
	expandIcon: string;
	collapseIcon: string;
}) {
	const label = tc.displayName || tc.toolName;
	const updates = tc.updates ?? [];
	const latest = updates.length ? updates[updates.length - 1] : '';
	const liveText = tc.isRunning ? latest : tc.summary || latest;
	const canExpand =
		!tc.isRunning &&
		(updates.length > 0 ||
			(!!tc.summary && (tc.summary.includes('\n') || tc.summary.length > 80)));
	const duration =
		!tc.isRunning && tc.startedAt && tc.endedAt
			? Math.round((tc.endedAt - tc.startedAt) / 1000)
			: undefined;
	const dotClass = tc.isRunning ? '_running' : tc.success === false ? '_error' : '_success';

	const headerInner = (
		<>
			<span className={`_statusDot _sm ${dotClass}`} />
			<span className="_agentToolName">{label}</span>
			{!open && liveText && <span className="_agentToolLive">{liveText}</span>}
			{duration != null && duration > 0 && (
				<span className="_agentToolDur">{duration}s</span>
			)}
			{canExpand && (
				<i
					className={`_agentToolToggle ${open ? collapseIcon : expandIcon}`}
					aria-hidden="true"
				/>
			)}
		</>
	);

	return (
		<div className={`_agentTool ${tc.isRunning ? '_live' : '_settled'}`}>
			{canExpand ? (
				<button
					type="button"
					className="_agentToolHead _clickable"
					onClick={onToggle}
					aria-expanded={open}
				>
					{headerInner}
				</button>
			) : (
				<div className="_agentToolHead">{headerInner}</div>
			)}
			{canExpand && open && (
				<div className="_agentToolHist">
					{updates.map((u, i) => (
						<div key={i} className="_agentToolHistLine">
							{u}
						</div>
					))}
					{tc.summary && <div className="_agentToolHistFinal">{tc.summary}</div>}
				</div>
			)}
		</div>
	);
}

// A sub-agent's live thinking, streamed as a quiet quote: the tail stays
// visible while it streams; click to unfold the full thought.
function ThinkingQuote({ text }: { text: string }) {
	const [expanded, setExpanded] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	// Keep the tail in view while collapsed and streaming.
	useEffect(() => {
		if (!expanded && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
	}, [text, expanded]);

	return (
		<div
			ref={ref}
			className={`_agentThink ${expanded ? '_expanded' : ''}`}
			onClick={() => setExpanded(prev => !prev)}
			role="button"
			tabIndex={0}
			onKeyDown={e => {
				if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => !prev);
			}}
		>
			{text}
		</div>
	);
}

function AgentRow({
	sp,
	now,
	expandIcon,
	collapseIcon,
}: {
	sp: AgentSpanInfo;
	now: number;
	expandIcon: string;
	collapseIcon: string;
}) {
	const isRunning = sp.status === 'running';
	// Tool rows clicked open to view their update history. Running rows are
	// never in this set — progress is ephemeral and shouldn't expand.
	const [openTools, setOpenTools] = useState<Set<string>>(new Set());

	const toggleTool = useCallback((id: string) => {
		setOpenTools(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const elapsed = elapsedSeconds(sp, now);
	// Doing-line: live progress while running; the outcome once done. Errors
	// with no summary keep their last statusText so the row stays informative.
	const doing = isRunning ? sp.statusText : sp.summary || sp.statusText;

	return (
		<div className={`_agentItem ${statusDotClass(sp.status)}`}>
			<div className="_agentItemHead">
				<span className={`_statusDot ${statusDotClass(sp.status)}`} />
				<span className="_agentItemName">{sp.label}</span>
				<span className="_agentItemDur">{elapsed}s</span>
			</div>
			{doing && (
				<div className="_agentDoing">
					{doing}
					{isRunning && <span className="_agentDoingCursor" />}
				</div>
			)}
			{sp.thinking && <ThinkingQuote text={sp.thinking} />}
			{sp.toolCalls.length > 0 && (
				<div className="_agentTools">
					{sp.toolCalls.map(tc => (
						<ToolRow
							key={tc.id}
							tc={tc}
							open={openTools.has(tc.id)}
							onToggle={() => toggleTool(tc.id)}
							expandIcon={expandIcon}
							collapseIcon={collapseIcon}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function AgentGroup({
	spans,
	expandIcon = 'fa fa-chevron-down',
	collapseIcon = 'fa fa-chevron-up',
}: Readonly<AgentGroupProps>) {
	const anyRunning = spans.some(s => s.status === 'running');
	const [groupExpanded, setGroupExpanded] = useState(true);
	const [userToggledGroup, setUserToggledGroup] = useState(false);

	// Tick once a second so elapsed seconds refresh while running.
	const [, setTick] = useState(0);
	useEffect(() => {
		if (!anyRunning) return;
		const t = setInterval(() => setTick(n => n + 1), 1000);
		return () => clearInterval(t);
	}, [anyRunning]);

	// Auto-fold shortly after all agents finish (unless the user toggled).
	const prevAnyRunning = useRef(anyRunning);
	useEffect(() => {
		if (userToggledGroup) return;
		if (!anyRunning && prevAnyRunning.current) {
			const t = setTimeout(() => setGroupExpanded(false), 1200);
			return () => clearTimeout(t);
		}
		prevAnyRunning.current = anyRunning;
	}, [anyRunning, userToggledGroup]);

	const toggleGroup = useCallback(() => {
		setUserToggledGroup(true);
		setGroupExpanded(prev => !prev);
	}, []);

	if (!spans.length) return null;

	const now = Date.now();
	const count = spans.length;

	// Card title: the agent's own name when alone, a count otherwise.
	const title =
		count === 1
			? spans[0].label
			: anyRunning
				? `Working — ${count} assistants`
				: `Finished — ${count} assistants`;

	// Group clock: first start to last end (or now while running).
	const groupStart = Math.min(...spans.map(s => s.startedAt));
	const groupEnd = anyRunning ? now : Math.max(...spans.map(s => s.endedAt ?? s.startedAt));
	const groupElapsed = Math.max(0, Math.round((groupEnd - groupStart) / 1000));

	return (
		<div className={`_agentCard ${anyRunning ? '_running' : '_done'}`}>
			<button type="button" className="_agentCardHead" onClick={toggleGroup}>
				{anyRunning ? (
					<span className="_agentCardSpin" />
				) : (
					<span className="_agentCardCheck">✓</span>
				)}
				<span className="_agentCardTitle">{title}</span>
				<span className="_agentCardTime">{groupElapsed}s</span>
				<i
					className={`_agentCardChevron ${groupExpanded ? collapseIcon : expandIcon}`}
					aria-hidden="true"
				/>
			</button>

			{groupExpanded && (
				<div className="_agentCardBody">
					{spans.map(sp => (
						<AgentRow
							key={sp.agentId + '_' + sp.startedAt}
							sp={sp}
							now={now}
							expandIcon={expandIcon}
							collapseIcon={collapseIcon}
						/>
					))}
				</div>
			)}
		</div>
	);
}
