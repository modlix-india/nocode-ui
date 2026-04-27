import React, { useCallback, useEffect, useRef, useState } from 'react';

const THINKING_MESSAGES = [
	'Thinking',
	'Pondering',
	'Deliberating',
	'Ruminating',
	'Contemplating',
	'Musing',
	'Mulling over',
	'Cogitating',
	'Reflecting',
	'Reasoning',
	'Analyzing',
	'Considering',
	'Processing',
	'Brainstorming',
	'Frolicking through thoughts',
	'Connecting the dots',
	'Chewing on it',
	'Noodling',
	'Percolating',
	'Honking thoughtfully',
];

function pickRandom(current: string): string {
	let next = current;
	while (next === current) {
		next = THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)];
	}
	return next;
}

interface ToolCallInfo {
	id: string;
	toolName: string;
	displayName?: string;
	summary: string;
	success?: boolean;
	isRunning: boolean;
	updates?: string[];
}

interface ThinkingBlockProps {
	isActive: boolean;
	toolCalls: ToolCallInfo[];
	reasoningContent?: string;
	toolRunningIcon?: string;
	toolSuccessIcon?: string;
	toolErrorIcon?: string;
	expandIcon?: string;
	collapseIcon?: string;
}

// Single tool row with Tool(name) label — used when exactly 1 tool, no wrapper.
function SingleToolRow({
	tc,
	expandIcon,
	collapseIcon,
}: {
	tc: ToolCallInfo;
	expandIcon: string;
	collapseIcon: string;
}) {
	const [expanded, setExpanded] = useState(false);
	const label = tc.displayName || tc.toolName;
	const hasSummary = !!tc.summary;

	return (
		<div className="_agentGroupSingle">
			<div className="_agentToolRow">
				{hasSummary ? (
					<button
						type="button"
						className="_agentToolHeader _clickable"
						onClick={() => setExpanded(prev => !prev)}
					>
						<span className="_statusDotStatic" />
						<span className="_agentToolLabel">
							Tool(<span className="_agentToolName">{label}</span>)
						</span>
						{!expanded && (
							<span className="_agentToolSummary">
								{tc.summary.length > 80
									? tc.summary.slice(0, 80) + '...'
									: tc.summary}
							</span>
						)}
						<i className={`_agentToolToggle ${expanded ? collapseIcon : expandIcon}`} />
					</button>
				) : (
					<div className="_agentToolHeader">
						<span className="_statusDotStatic" />
						<span className="_agentToolLabel">
							Tool(<span className="_agentToolName">{label}</span>)
						</span>
					</div>
				)}
				{expanded && (tc.updates?.length ? (
					<div className="_agentToolUpdates">
						{tc.updates.map((u, i) => (
							<div key={i} className="_agentToolUpdateLine">{u}</div>
						))}
					</div>
				) : hasSummary ? (
					<div className="_agentToolDetail">{tc.summary}</div>
				) : null)}
			</div>
		</div>
	);
}

export function ThinkingBlock({
	isActive,
	toolCalls,
	reasoningContent,
	toolRunningIcon,
	toolSuccessIcon,
	toolErrorIcon,
	expandIcon = 'fa fa-chevron-down',
	collapseIcon = 'fa fa-chevron-up',
}: Readonly<ThinkingBlockProps>) {
	const [expanded, setExpanded] = useState(isActive);
	const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
	const [thinkingMsg, setThinkingMsg] = useState(
		() => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)],
	);
	const startTimeRef = useRef(Date.now());
	const wasEverActiveRef = useRef(isActive);

	useEffect(() => {
		if (isActive) {
			wasEverActiveRef.current = true;
			setExpanded(true);
			startTimeRef.current = Date.now();
		}
	}, [isActive]);

	useEffect(() => {
		if (!isActive) return;
		const interval = setInterval(() => {
			setThinkingMsg(prev => pickRandom(prev));
		}, 3000);
		return () => clearInterval(interval);
	}, [isActive]);

	const toggleToolExpanded = useCallback((toolId: string) => {
		setExpandedTools(prev => {
			const next = new Set(prev);
			if (next.has(toolId)) next.delete(toolId);
			else next.add(toolId);
			return next;
		});
	}, []);

	if (!isActive && !wasEverActiveRef.current && !toolCalls.length && !reasoningContent) return null;

	const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

	const toolStatusClass = (tc: ToolCallInfo) =>
		tc.isRunning ? '_running' : tc.success ? '_success' : tc.success === false ? '_error' : '_success';

	const toolGlyph = (tc: ToolCallInfo) => (
		<span className={`_statusDot ${toolStatusClass(tc)}`} />
	);

	// Single tool, not active, no reasoning → render flat, no wrapper.
	if (!isActive && toolCalls.length === 1 && !reasoningContent) {
		return (
			<SingleToolRow
				tc={toolCalls[0]}
				expandIcon={expandIcon}
				collapseIcon={collapseIcon}
			/>
		);
	}

	const hasContent = toolCalls.length > 0 || !!reasoningContent;

	// Header label
	let headerLabel: string;
	if (isActive) {
		headerLabel = `${thinkingMsg}...`;
	} else if (toolCalls.length > 0) {
		headerLabel = `Used ${toolCalls.length} tools`;
	} else if (reasoningContent) {
		headerLabel = 'Reasoned through it';
	} else {
		headerLabel = `Thought for ${elapsed}s`;
	}

	return (
		<div className={`_thinkingBlock ${isActive ? '_active' : '_done'}`}>
			<button
				className={`_thinkingHeader ${isActive ? '_activeHeader' : '_doneHeader'}`}
				onClick={() => setExpanded(prev => !prev)}
			>
				{isActive ? (
					<span className="_statusDot _running" />
				) : (
					<i className={expanded ? collapseIcon : expandIcon} />
				)}
				<span className="_thinkingLabel">{headerLabel}</span>
				{isActive && hasContent && (
					<i className={`_thinkingChevron ${expanded ? collapseIcon : expandIcon}`} />
				)}
			</button>

			{expanded && hasContent && (
				<div className="_thinkingBody">
					{reasoningContent && (
						<div className="_thinkingReasoning">{reasoningContent}</div>
					)}
					{toolCalls.map(tc => {
						const isToolExpanded = expandedTools.has(tc.id);
						const label = tc.displayName || tc.toolName;
						const hasSummary = !!tc.summary;

						return (
							<div key={tc.id} className={`_thinkingToolEntry ${toolStatusClass(tc)}`}>
								{hasSummary ? (
									<button
										type="button"
										className="_thinkingToolRow _clickable"
										onClick={() => toggleToolExpanded(tc.id)}
									>
										{toolGlyph(tc)}
										<span className="_thinkingToolName">{label}</span>
										{!isToolExpanded && (
											<span className="_thinkingToolSummary">
												{tc.summary.length > 80
													? tc.summary.slice(0, 80) + '...'
													: tc.summary}
											</span>
										)}
										<i className={`_thinkingToolToggle ${isToolExpanded ? collapseIcon : expandIcon}`} />
									</button>
								) : (
									<div className="_thinkingToolRow">
										{toolGlyph(tc)}
										<span className="_thinkingToolName">{label}</span>
									</div>
								)}
								{isToolExpanded && (tc.updates?.length ? (
									<div className="_agentToolUpdates">
										{tc.updates.map((u, i) => (
											<div key={i} className="_agentToolUpdateLine">{u}</div>
										))}
									</div>
								) : hasSummary ? (
									<div className="_thinkingToolDetail">
										{tc.summary}
									</div>
								) : null)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
