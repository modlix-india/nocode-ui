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

function getHeaderLabel(
	isActive: boolean,
	thinkingMsg: string,
	toolCount: number,
	hasReasoning: boolean,
	elapsed: number,
): string {
	if (isActive) return `${thinkingMsg}...`;
	if (toolCount > 0) return `Used ${toolCount} tool${toolCount !== 1 ? 's' : ''}`;
	if (hasReasoning) return 'Reasoned through it';
	return `Thought for ${elapsed}s`;
}

interface ToolCallInfo {
	id: string;
	toolName: string;
	displayName?: string;
	summary: string;
	success?: boolean;
	isRunning: boolean;
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

export function ThinkingBlock({
	isActive,
	toolCalls,
	reasoningContent,
	toolRunningIcon = 'fa fa-circle-notch fa-spin',
	toolSuccessIcon = 'fa fa-check',
	toolErrorIcon = 'fa fa-xmark',
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

	// Auto-expand when active
	useEffect(() => {
		if (isActive) {
			wasEverActiveRef.current = true;
			setExpanded(true);
			startTimeRef.current = Date.now();
		}
	}, [isActive]);

	// Rotate thinking messages while active
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

	// Don't render if never been active and no tool calls and no reasoning (e.g. historical messages)
	if (!isActive && !wasEverActiveRef.current && !toolCalls.length && !reasoningContent) return null;

	const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

	const toolIcon = (tc: ToolCallInfo) =>
		tc.isRunning ? toolRunningIcon : tc.success ? toolSuccessIcon : tc.success === false ? toolErrorIcon : toolSuccessIcon;

	const toolStatusClass = (tc: ToolCallInfo) =>
		tc.isRunning ? '_running' : tc.success ? '_success' : tc.success === false ? '_error' : '_success';

	const hasContent = toolCalls.length > 0 || !!reasoningContent;
	const headerLabel = getHeaderLabel(isActive, thinkingMsg, toolCalls.length, !!reasoningContent, elapsed);

	return (
		<div className={`_thinkingBlock ${isActive ? '_active' : '_done'}`}>
			<button
				className={`_thinkingHeader ${isActive ? '_activeHeader' : '_doneHeader'}`}
				onClick={() => setExpanded(prev => !prev)}
			>
				{isActive ? (
					<div className="_thinkingDots">
						<span />
						<span />
						<span />
					</div>
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
										<span className={`_thinkingToolIcon ${toolIcon(tc)}`} />
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
										<span className={`_thinkingToolIcon ${toolIcon(tc)}`} />
										<span className="_thinkingToolName">{label}</span>
									</div>
								)}
								{isToolExpanded && hasSummary && (
									<div className="_thinkingToolDetail">
										{tc.summary}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
