import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ToolCallInfo {
	id: string;
	toolName: string;
	displayName?: string;
	summary: string;
	success?: boolean;
	isRunning: boolean;
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
	const [expanded, setExpanded] = useState(isRunning);
	const [userToggled, setUserToggled] = useState(false);
	// Tool rows that have been clicked open to view the full summary. Running
	// rows are never in this set — progress is ephemeral and shouldn't expand.
	const [openSummaries, setOpenSummaries] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (userToggled) return;
		if (isRunning) setExpanded(true);
		else {
			const t = setTimeout(() => setExpanded(false), 300);
			return () => clearTimeout(t);
		}
	}, [isRunning, userToggled]);

	const toggle = useCallback(() => {
		setUserToggled(true);
		setExpanded(prev => !prev);
	}, []);

	const toggleSummary = useCallback((id: string) => {
		setOpenSummaries(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const elapsed = elapsedSeconds(sp, now);
	const hasBody = sp.toolCalls.length > 0 || !!sp.statusText;

	// Right-side meta: summary when done, statusText when processing, elapsed always.
	// Defensive cap (rightMeta-overflow fix · 2026-05-27): the backend contract is
	// "summary = a span outcome users can't derive elsewhere" (see SummaryAgent's
	// _emit_finished docstring), but a misbehaving caller can still ship a long
	// string. Truncate to 40 chars with ellipsis so the row layout can't break.
	const SUMMARY_CAP = 40;
	let rightMeta = `${elapsed}s`;
	if (sp.status !== 'running' && sp.summary) {
		const s = sp.summary.length > SUMMARY_CAP
			? sp.summary.slice(0, SUMMARY_CAP - 1) + '…'
			: sp.summary;
		rightMeta = `${s}  ${elapsed}s`;
	}

	return (
		<div className="_agentRow">
			<button
				type="button"
				className="_agentRowHeader"
				onClick={toggle}
			>
				<span className={`_statusDot ${statusDotClass(sp.status)}`} />
				<span className="_agentRowLabel">
					Agent(<span className="_agentRowName">{sp.label}</span>)
				</span>
				<span className="_agentRowRight">{rightMeta}</span>
				{hasBody && (
					<i className={`_agentRowToggle ${expanded ? collapseIcon : expandIcon}`} />
				)}
			</button>

			{expanded && hasBody && (
				<div className="_agentRowBody">
					{sp.toolCalls.map(tc => {
						const label = tc.displayName || tc.toolName;
						const updates = tc.updates ?? [];
						const latest = updates.length ? updates[updates.length - 1] : '';
						const inlineText = tc.isRunning ? latest : (tc.summary || latest);
						const canExpand =
							!tc.isRunning &&
							!!tc.summary &&
							(tc.summary.includes('\n') || tc.summary.length > 80);
						const isOpen = openSummaries.has(tc.id);
						const rowClasses = [
							'_agentToolRow',
							tc.isRunning && '_running',
							canExpand && '_expandable',
							isOpen && '_open',
						].filter(Boolean).join(' ');
						const headerInner = (
							<>
								{tc.isRunning && <span className="_agentToolDot" />}
								<span className="_agentToolLabel">
									Tool(<span className="_agentToolName">{label}</span>)
								</span>
								{/* Inline peek only when closed; expanded body lives below. */}
								{!isOpen && inlineText && (
									<span className="_agentToolSummary">{inlineText}</span>
								)}
								{canExpand && (
									<i
										className={`_agentToolToggle ${isOpen ? collapseIcon : expandIcon}`}
										aria-hidden="true"
									/>
								)}
							</>
						);
						return (
							<div key={tc.id} className={rowClasses}>
								{canExpand ? (
									<button
										type="button"
										className="_agentToolHeader _clickable"
										onClick={() => toggleSummary(tc.id)}
										aria-expanded={isOpen}
									>
										{headerInner}
									</button>
								) : (
									<div className="_agentToolHeader">{headerInner}</div>
								)}
								{canExpand && isOpen && (
									<div className="_agentToolBody">{inlineText}</div>
								)}
							</div>
						);
					})}
					{sp.statusText && sp.status === 'running' && (
						<div className="_agentStatusText">{sp.statusText}</div>
					)}
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

	// Auto-collapse 300ms after all done (unless user toggled).
	const prevAnyRunning = useRef(anyRunning);
	useEffect(() => {
		if (userToggledGroup) return;
		if (!anyRunning && prevAnyRunning.current) {
			const t = setTimeout(() => setGroupExpanded(false), 300);
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

	// Single agent: render directly, no wrapper group.
	if (spans.length === 1) {
		return (
			<div className="_agentGroupSingle">
				<AgentRow
					sp={spans[0]}
					now={now}
					expandIcon={expandIcon}
					collapseIcon={collapseIcon}
				/>
			</div>
		);
	}

	// Multiple agents: wrap in "Used N agents" group.
	const count = spans.length;
	const headerLabel = anyRunning
		? `Running ${count} agents…`
		: `Used ${count} agents`;

	return (
		<div className={`_thinkingBlock ${anyRunning ? '_active' : '_done'}`}>
			<button
				className={`_thinkingHeader ${anyRunning ? '_activeHeader' : '_doneHeader'}`}
				onClick={toggleGroup}
				type="button"
			>
				{anyRunning ? (
					<span className="_statusDot _running" />
				) : (
					<i className={groupExpanded ? collapseIcon : expandIcon} />
				)}
				<span className="_thinkingLabel">{headerLabel}</span>
			</button>

			{groupExpanded && (
				<div className="_thinkingBody">
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
