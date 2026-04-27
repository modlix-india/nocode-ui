import React, { useCallback, useState } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { MarkdownParser } from '../../../commonComponents/Markdown/MarkdownParser';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

interface ChatMessageProps {
	role: 'user' | 'assistant';
	content: string;
	componentKey: string;
	styles?: any;
	isStreaming?: boolean;
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
	children?: React.ReactNode;
}

export function ChatMessage({
	role,
	content,
	componentKey,
	styles,
	isStreaming,
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
}: Readonly<ChatMessageProps>) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(content).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [content]);

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
				className="_promptMessage _user"
				style={styles?.userMessage ?? {}}
			>
				<SubHelperComponent
					definition={definition}
					subComponentName="userMessage"
				/>
				<span>{content}</span>
			</div>
		);
	}

	return (
		<div
			className="_promptMessage _assistant"
			style={styles?.assistantMessage ?? {}}
		>
			<SubHelperComponent
				definition={definition}
				subComponentName="assistantMessage"
			/>
			<div className="_assistantContent">
				<MarkdownParser
					componentKey={componentKey}
					text={content}
					styles={styles ?? {}}
				/>
				{isStreaming && <span className="_streamingCursor" />}
				{children}
				{!isStreaming && content && (
					<div className="_messageActions">
						<button
							className="_actionButton"
							onClick={handleCopy}
							title="Copy"
						>
							<i
								className={
									copied ? copySuccessIcon : copyIcon
								}
							/>
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
		</div>
	);
}
