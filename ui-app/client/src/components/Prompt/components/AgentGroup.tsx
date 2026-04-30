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
	// Accordion: only one tool expanded at a time. null = all collapsed.
	const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

	useEffect(() => {
		if (userToggled) return;
		if (isRunning) setExpanded(true);
		else {
			const t = setTimeout(() => setExpanded(false), 300);
			return () => clearTimeout(t);
		}
	}, [isRunning, userToggled]);

	// Auto-expand the latest running tool; close when next one starts.
	useEffect(() => {
		if (!isRunning) return;
		const lastRunning = [...sp.toolCalls].reverse().find(tc => tc.isRunning);
		if (lastRunning) setExpandedToolId(lastRunning.id);
	}, [isRunning, sp.toolCalls]);

	const toggle = useCallback(() => {
		setUserToggled(true);
		setExpanded(prev => !prev);
	}, []);

	const toggleTool = useCallback((toolId: string) => {
		setExpandedToolId(prev => prev === toolId ? null : toolId);
	}, []);

	const elapsed = elapsedSeconds(sp, now);
	const hasBody = sp.toolCalls.length > 0 || !!sp.statusText;

	// Right-side meta: summary when done, statusText when processing, elapsed always
	let rightMeta = `${elapsed}s`;
	if (sp.status !== 'running' && sp.summary) {
		rightMeta = `${sp.summary}  ${elapsed}s`;
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
						const isToolOpen = expandedToolId === tc.id;
						const label = tc.displayName || tc.toolName;
						const updateCount = tc.updates?.length ?? 0;
						// Collapsed text: final summary if done, else count/last-update while running
						let collapsedText = tc.summary || '';
						if (!collapsedText && updateCount > 1) {
							collapsedText = `${updateCount} operations`;
						} else if (!collapsedText && updateCount === 1) {
							collapsedText = tc.updates![0];
						}
						const hasDetail = !!collapsedText || updateCount > 0;
						return (
							<div key={tc.id} className="_agentToolRow">
								{hasDetail ? (
									<button
										type="button"
										className="_agentToolHeader _clickable"
										onClick={() => toggleTool(tc.id)}
									>
										<span className="_agentToolLabel">
											Tool(<span className="_agentToolName">{label}</span>)
										</span>
										{!isToolOpen && collapsedText && (
											<span className="_agentToolSummary">
												{collapsedText.length > 80
													? collapsedText.slice(0, 80) + '...'
													: collapsedText}
											</span>
										)}
										<i className={`_agentToolToggle ${isToolOpen ? collapseIcon : expandIcon}`} />
									</button>
								) : (
									<div className="_agentToolHeader">
										<span className="_agentToolLabel">
											Tool(<span className="_agentToolName">{label}</span>)
										</span>
									</div>
								)}
								{isToolOpen && (
									<div className="_agentToolExpanded">
										{tc.updates?.length ? (
											<div className="_agentToolUpdates">
												{tc.updates.map((u, i) => (
													<div key={i} className="_agentToolUpdateLine">{u}</div>
												))}
											</div>
										) : null}
										{tc.summary && tc.summary !== tc.updates?.[tc.updates.length - 1] && (
											<div className="_agentToolDetail">{tc.summary}</div>
										)}
									</div>
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
