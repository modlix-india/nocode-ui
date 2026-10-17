import React, { useCallback, useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { MarkdownParser } from '../../../commonComponents/Markdown/MarkdownParser';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { useTypedText } from '../useTypedText';

interface ChatMessageProps {
	role: 'user' | 'assistant';
	content: string;
	componentKey: string;
	styles?: any;
	/** The reply is still running: its copy and feedback buttons wait. */
	isStreaming?: boolean;
	/** A tool or sub-agent is running: its row or card shows the work, so no typing cursor. */
	working?: boolean;
	/** False for a part of a reply drawn above a sub-agent card. */
	showActions?: boolean;
	/** What Copy copies, when it's more than this part (the whole reply). */
	copyText?: string;
	/** A steer on its way to a running turn: sent, not yet read by the agent. */
	pending?: boolean;
	definition: ComponentDefinition;
	copyIcon?: string;
	copySuccessIcon?: string;
	enableFeedback?: boolean;
	feedbackRating?: number;
	turnNumber?: number;
	messageId?: string;
	onFeedback?: (messageId: string, turnNumber: number, rating: number) => void;
	thumbsUpIcon?: string;
	thumbsDownIcon?: string;
	/** Shown as the reply arrives (a map, an upload request). */
	children?: React.ReactNode;
	/** Shown with the copy buttons once the reply has settled (its chips). */
	footer?: React.ReactNode;
}

export function ChatMessage({
	role,
	content,
	componentKey,
	styles,
	isStreaming,
	working,
	showActions = true,
	copyText,
	pending,
	definition,
	copyIcon = 'fa fa-clone',
	copySuccessIcon = 'fa fa-check',
	enableFeedback = false,
	feedbackRating,
	turnNumber,
	messageId,
	onFeedback,
	thumbsUpIcon = 'fa fa-thumbs-up',
	thumbsDownIcon = 'fa fa-thumbs-down',
	children,
	footer,
}: Readonly<ChatMessageProps>) {
	const [copied, setCopied] = useState(false);
	const copyValue = copyText ?? content;
	// Only a reply that was live here types out and fades in; an old chat shows at once.
	const [wasLive, setWasLive] = useState(!!isStreaming);
	if (isStreaming && !wasLive) setWasLive(true);
	const shown = useTypedText(content, wasLive);
	const catchingUp = shown.length < content.length;
	const showCursor = (isStreaming && !working && !!content) || catchingUp;
	// Chips and copy buttons arrive together, once, after the last word.
	const settled = !isStreaming && !catchingUp;
	const withActions = showActions && !!copyValue;

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(copyValue).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [copyValue]);

	const handleThumbsUp = useCallback(() => {
		if (!onFeedback || !messageId || turnNumber === undefined) return;
		const newRating = feedbackRating === 1 ? 0 : 1;
		onFeedback(messageId, turnNumber, newRating);
	}, [onFeedback, messageId, turnNumber, feedbackRating]);

	const handleThumbsDown = useCallback(() => {
		if (!onFeedback || !messageId || turnNumber === undefined) return;
		const newRating = feedbackRating === -1 ? 0 : -1;
		onFeedback(messageId, turnNumber, newRating);
	}, [onFeedback, messageId, turnNumber, feedbackRating]);

	if (role === 'user') {
		return (
			<div
				className={`_promptMessage _user${pending ? ' _pending' : ''}`}
				style={styles?.userMessage ?? {}}
				title={pending ? 'Sending to the agent...' : undefined}
			>
				<SubHelperComponent definition={definition} subComponentName="userMessage" />
				<span>{content}</span>
			</div>
		);
	}

	return (
		<div className="_promptMessage _assistant" style={styles?.assistantMessage ?? {}}>
			<SubHelperComponent definition={definition} subComponentName="assistantMessage" />
			<div className="_assistantContent">
				<MarkdownParser componentKey={componentKey} text={shown} styles={styles ?? {}} />
				{showCursor && <span className="_streamingCursor" />}
				{children}
				{settled && (footer || withActions) && (
					<div className={wasLive ? '_replySettled _entering' : '_replySettled'}>
						{footer}
						{withActions && (
							<div className="_messageActions">
								<button className="_actionButton" onClick={handleCopy} title="Copy">
									<i className={copied ? copySuccessIcon : copyIcon} />
								</button>
								{enableFeedback && turnNumber !== undefined && (
									<>
										<button
											className={`_actionButton _feedbackButton${feedbackRating === 1 ? ' _active' : ''}`}
											onClick={handleThumbsUp}
											title="Good response"
										>
											<i className={thumbsUpIcon} />
										</button>
										<button
											className={`_actionButton _feedbackButton${feedbackRating === -1 ? ' _active' : ''}`}
											onClick={handleThumbsDown}
											title="Bad response"
										>
											<i className={thumbsDownIcon} />
										</button>
									</>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
