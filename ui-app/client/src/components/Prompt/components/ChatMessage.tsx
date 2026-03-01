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
}: Readonly<ChatMessageProps>) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(content).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [content]);

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
					</div>
				)}
			</div>
		</div>
	);
}
