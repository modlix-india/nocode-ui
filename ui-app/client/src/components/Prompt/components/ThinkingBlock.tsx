import React, { useEffect, useRef, useState } from 'react';

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
	summary: string;
	success?: boolean;
	isRunning: boolean;
}

interface ThinkingBlockProps {
	isActive: boolean;
	toolCalls: ToolCallInfo[];
	toolRunningIcon?: string;
	toolSuccessIcon?: string;
	toolErrorIcon?: string;
	expandIcon?: string;
	collapseIcon?: string;
}

export function ThinkingBlock({
	isActive,
	toolCalls,
	toolRunningIcon = 'fa fa-circle-notch fa-spin',
	toolSuccessIcon = 'fa fa-check',
	toolErrorIcon = 'fa fa-xmark',
	expandIcon = 'fa fa-chevron-down',
	collapseIcon = 'fa fa-chevron-up',
}: Readonly<ThinkingBlockProps>) {
	const [expanded, setExpanded] = useState(isActive);
	const [thinkingMsg, setThinkingMsg] = useState(
		() => THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)],
	);
	const startTimeRef = useRef(Date.now());

	// Auto-expand when active
	useEffect(() => {
		if (isActive) {
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

	// Don't render if not active and no tool calls
	if (!isActive && !toolCalls.length) return null;

	const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

	const toolIcon = (tc: ToolCallInfo) =>
		tc.isRunning ? toolRunningIcon : tc.success ? toolSuccessIcon : tc.success === false ? toolErrorIcon : toolSuccessIcon;

	const toolStatusClass = (tc: ToolCallInfo) =>
		tc.isRunning ? '_running' : tc.success ? '_success' : tc.success === false ? '_error' : '_success';

	const headerLabel = isActive
		? `${thinkingMsg}...`
		: toolCalls.length
			? `Used ${toolCalls.length} tool${toolCalls.length !== 1 ? 's' : ''}`
			: `Thought for ${elapsed}s`;

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
				{isActive && toolCalls.length > 0 && (
					<i className={`_thinkingChevron ${expanded ? collapseIcon : expandIcon}`} />
				)}
			</button>

			{expanded && toolCalls.length > 0 && (
				<div className="_thinkingBody">
					{toolCalls.map(tc => (
						<div key={tc.id} className={`_thinkingToolRow ${toolStatusClass(tc)}`}>
							<span className={`_thinkingToolIcon ${toolIcon(tc)}`} />
							<span className="_thinkingToolName">{tc.toolName}</span>
							{tc.summary && (
								<span className="_thinkingToolSummary">
									{tc.summary.length > 80
										? tc.summary.slice(0, 80) + '...'
										: tc.summary}
								</span>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
