/**
 * AI Spotlight Component
 *
 * A spotlight-style input overlay for AI-assisted component modifications.
 * Features an animated swirling border and support for visual feedback via screenshots.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PageDefinition } from '../../../types/common';
import { streamAIRequest, AIEvent, AIResponse } from '../util/aiService';
import { captureComponent, preloadHtml2Canvas } from '../util/captureComponent';

interface AISpotlightProps {
	/** Component key that was right-clicked */
	componentKey: string;
	/** Component type for display */
	componentType?: string;
	/** Current page definition */
	pageDefinition: PageDefinition;
	/** App code (sitezump or appbuilder) */
	appCode: string;
	/** Reference to the desktop preview iframe */
	desktopIframe: React.RefObject<HTMLIFrameElement>;
	/** Callback when AI applies changes to the page */
	onApply: (newPage: PageDefinition) => void;
	/** Callback to close the spotlight */
	onClose: () => void;
}

type SpotlightState = 'input' | 'generating' | 'refining' | 'error';

interface AgentProgress {
	name: string;
	status: 'pending' | 'working' | 'done' | 'error';
	message?: string;
}

export default function AISpotlight({
	componentKey,
	componentType,
	pageDefinition,
	appCode,
	desktopIframe,
	onApply,
	onClose,
}: Readonly<AISpotlightProps>) {
	const [state, setState] = useState<SpotlightState>('input');
	const [instruction, setInstruction] = useState('');
	const [statusMessage, setStatusMessage] = useState('');
	const [agentProgress, setAgentProgress] = useState<AgentProgress[]>([]);
	const [screenshot, setScreenshot] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [pendingResult, setPendingResult] = useState<PageDefinition | null>(null);

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Focus input on mount and preload html2canvas
	useEffect(() => {
		inputRef.current?.focus();
		preloadHtml2Canvas();

		return () => {
			// Cleanup: abort any pending request
			abortControllerRef.current?.abort();
		};
	}, []);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (state === 'generating') {
					abortControllerRef.current?.abort();
				}
				onClose();
			}
		};

		globalThis.addEventListener('keydown', handleKeyDown);
		return () => globalThis.removeEventListener('keydown', handleKeyDown);
	}, [state, onClose]);

	// Handle AI event updates
	const handleEvent = useCallback((event: AIEvent) => {
		console.log('[AI Event]', event.event, event.data); // Debug logging

		// Always update status message for any event with a message
		const msg = event.data.message || event.data.data?.message;

		switch (event.event) {
			case 'status':
				setStatusMessage(msg || 'Processing...');
				break;

			case 'phase':
				setStatusMessage(
					event.data.data?.phase
						? `Phase: ${event.data.data.phase}`
						: msg || 'Starting phase...',
				);
				break;

			case 'agent_start':
				setStatusMessage(msg || `Starting ${event.data.agent}...`);
				setAgentProgress(prev => {
					const existing = prev.find(a => a.name === event.data.agent);
					if (existing) {
						return prev.map(a =>
							a.name === event.data.agent
								? { ...a, status: 'working', message: msg }
								: a,
						);
					}
					return [
						...prev,
						{
							name: event.data.agent || 'Unknown',
							status: 'working',
							message: msg,
						},
					];
				});
				break;

			case 'agent_thinking':
				setStatusMessage(msg || `${event.data.agent} thinking...`);
				setAgentProgress(prev =>
					prev.map(a => (a.name === event.data.agent ? { ...a, message: msg } : a)),
				);
				break;

			case 'agent_complete':
				setStatusMessage(msg || `${event.data.agent} completed`);
				setAgentProgress(prev =>
					prev.map(a =>
						a.name === event.data.agent
							? {
									...a,
									status:
										(event.data.data?.success ?? event.data.success)
											? 'done'
											: 'error',
									message: msg,
								}
							: a,
					),
				);
				break;

			case 'merging':
				setStatusMessage(msg || 'Merging agent outputs...');
				break;

			case 'keepalive':
				// Update status to show we're still connected
				setStatusMessage(msg || 'Working...');
				break;

			default:
				// For any unhandled event, show its message if available
				if (msg) {
					setStatusMessage(msg);
				}
				break;
		}
	}, []);

	// Log changes between original and new page
	const logPageChanges = useCallback((original: PageDefinition, modified: PageDefinition) => {
		console.group('[AI Changes] Page modifications:');

		// Compare componentDefinition for style changes
		const origDef = original.componentDefinition || {};
		const modDef = modified.componentDefinition || {};

		const changedComponents: string[] = [];
		for (const key of Object.keys(modDef)) {
			const origComp = origDef[key];
			const modComp = modDef[key];

			if (!origComp) {
				console.log(`  + NEW component: ${key}`);
				changedComponents.push(key);
				continue;
			}

			// Check styleProperties changes
			const origStyles = JSON.stringify(origComp.styleProperties || {});
			const modStyles = JSON.stringify(modComp.styleProperties || {});
			if (origStyles !== modStyles) {
				console.log(`  ~ STYLES changed: ${key}`);
				console.log('    Before:', origComp.styleProperties);
				console.log('    After:', modComp.styleProperties);
				changedComponents.push(key);
			}

			// Check properties changes
			const origProps = JSON.stringify(origComp.properties || {});
			const modProps = JSON.stringify(modComp.properties || {});
			if (origProps !== modProps) {
				console.log(`  ~ PROPERTIES changed: ${key}`);
				changedComponents.push(key);
			}
		}

		// Check for removed components
		for (const key of Object.keys(origDef)) {
			if (!modDef[key]) {
				console.log(`  - REMOVED component: ${key}`);
				changedComponents.push(key);
			}
		}

		// Check eventFunctions changes
		const origEvents = Object.keys(original.eventFunctions || {});
		const modEvents = Object.keys(modified.eventFunctions || {});
		const newEvents = modEvents.filter(e => !origEvents.includes(e));
		const removedEvents = origEvents.filter(e => !modEvents.includes(e));

		if (newEvents.length > 0) {
			console.log(`  + NEW events: ${newEvents.join(', ')}`);
		}
		if (removedEvents.length > 0) {
			console.log(`  - REMOVED events: ${removedEvents.join(', ')}`);
		}

		console.log(`Total: ${changedComponents.length} components modified`);
		console.groupEnd();

		return changedComponents;
	}, []);

	// Handle AI completion
	const handleComplete = useCallback(
		(response: AIResponse) => {
			console.log('[AI Complete]', response); // Debug logging
			if (response.success && response.page) {
				// Log what changed
				const changes = logPageChanges(pageDefinition, response.page);
				console.log('[AI Complete] Changed components:', changes);

				setPendingResult(response.page);
				setStatusMessage(`Ready to apply changes (${changes.length} components modified)`);
				setState('refining');
			} else {
				console.warn('[AI Complete] Missing page or failed:', response);
				setErrorMessage('AI generation failed - no page returned');
				setState('error');
			}
		},
		[logPageChanges, pageDefinition],
	);

	// Handle AI error
	const handleError = useCallback((error: string) => {
		console.error('[AI Error]', error); // Debug logging
		setErrorMessage(error);
		setState('error');
	}, []);

	// Submit instruction to AI
	const handleSubmit = useCallback(async () => {
		if (!instruction.trim()) return;

		setState('generating');
		setStatusMessage('Starting AI generation...');
		setAgentProgress([]);
		setErrorMessage('');

		abortControllerRef.current = new AbortController();

		await streamAIRequest(
			{
				instruction: instruction.trim(),
				page: pageDefinition,
				selectedComponentKey: componentKey,
				componentScreenshot: screenshot || undefined,
				options: { mode: 'modify' },
			},
			appCode,
			handleEvent,
			handleComplete,
			handleError,
			abortControllerRef.current.signal,
		);
	}, [
		instruction,
		pageDefinition,
		componentKey,
		screenshot,
		appCode,
		handleEvent,
		handleComplete,
		handleError,
	]);

	// Capture screenshot for visual feedback
	const handleCapture = useCallback(async () => {
		if (!desktopIframe.current) return;

		try {
			setStatusMessage('Capturing component...');
			const base64 = await captureComponent(desktopIframe.current, componentKey);
			setScreenshot(base64);
			setStatusMessage('Screenshot captured. Enter refinement instruction.');
			setState('refining');
		} catch (e: any) {
			console.error('Capture failed:', e);
			setErrorMessage(`Capture failed: ${e.message}`);
		}
	}, [desktopIframe, componentKey]);

	// Apply the AI result to the page
	const handleApply = useCallback(() => {
		if (pendingResult) {
			onApply(pendingResult);
			onClose();
		}
	}, [pendingResult, onApply, onClose]);

	// Refine with new instruction (clears prompt)
	const handleRefine = useCallback(() => {
		setInstruction('');
		setState('input');
		setErrorMessage('');
		setAgentProgress([]);
		inputRef.current?.focus();
	}, []);

	// Retry with same instruction
	const handleRetry = useCallback(() => {
		setErrorMessage('');
		setAgentProgress([]);
		setState('input');
		// Use setTimeout to let state update, then submit
		setTimeout(() => {
			handleSubmit();
		}, 0);
	}, [handleSubmit]);

	// Cancel and close
	const handleCancel = useCallback(() => {
		abortControllerRef.current?.abort();
		onClose();
	}, [onClose]);

	return (
		<div
			className="_aiSpotlightOverlay"
			onKeyDown={e => e.key === 'Escape' && handleCancel()}
			role="dialog"
			aria-modal="true"
			aria-label="AI Assist"
		>
			<div
				className="_aiSpotlightContainer"
				onClick={e => e.stopPropagation()}
				onKeyDown={e => e.stopPropagation()}
				role="document"
			>
				{/* Header with component info */}
				<div className="_aiSpotlightHeader">
					<span className="_aiSpotlightIcon _claudeLogo">
						{/* Claude AI Logo */}
						<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M4.71 11.17L10.44 3.6a1.88 1.88 0 0 1 3.12 0l5.73 7.57a1.88 1.88 0 0 1-1.56 2.95H6.27a1.88 1.88 0 0 1-1.56-2.95z"
								fill="#D97757"
							/>
							<path d="M8.5 14.12h7l-3.5 6.28-3.5-6.28z" fill="#D97757" />
						</svg>
					</span>
					<span className="_aiSpotlightTitle">
						AI Assist {componentType && `• ${componentType}`}
					</span>
					<button className="_aiSpotlightClose" onClick={handleCancel}>
						×
					</button>
				</div>

				{/* Screenshot preview */}
				{screenshot && (
					<div className="_aiScreenshotPreview">
						<img src={`data:image/png;base64,${screenshot}`} alt="Component preview" />
					</div>
				)}

				{/* Input area with swirling border */}
				<div className="_aiInputWrapper">
					<div className="_aiInputBorder" />
					<textarea
						ref={inputRef}
						className="_aiInput"
						placeholder={
							state === 'refining'
								? 'Describe refinements...'
								: 'What would you like to do with this component?'
						}
						value={instruction}
						onChange={e => setInstruction(e.target.value)}
						onKeyDown={e => {
							// Ctrl+Enter or Cmd+Enter to submit
							if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
								e.preventDefault();
								handleSubmit();
							}
						}}
						disabled={state === 'generating'}
						rows={3}
					/>
				</div>

				{/* Status and progress */}
				{(statusMessage || agentProgress.length > 0) && (
					<div className="_aiProgress">
						{statusMessage && <div className="_aiStatusMessage">{statusMessage}</div>}
						{agentProgress.length > 0 && (
							<div className="_aiAgentList">
								{agentProgress.map(agent => (
									<div
										key={agent.name}
										className={`_aiAgentItem _${agent.status}`}
									>
										<span className="_aiAgentStatus">
											{agent.status === 'working' && '⏳'}
											{agent.status === 'done' && '✓'}
											{agent.status === 'error' && '✗'}
											{agent.status === 'pending' && '○'}
										</span>
										<span className="_aiAgentName">{agent.name}</span>
										{agent.message && (
											<span className="_aiAgentMessage">{agent.message}</span>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Error message */}
				{errorMessage && <div className="_aiError">{errorMessage}</div>}

				{/* Actions */}
				<div className="_aiActions">
					{state === 'input' && (
						<>
							<button
								className="_aiActionSecondary"
								onClick={handleCapture}
								title="Capture screenshot for visual feedback"
							>
								📷 Capture
							</button>
							<button
								className="_aiActionPrimary"
								onClick={handleSubmit}
								disabled={!instruction.trim()}
							>
								Generate
							</button>
						</>
					)}

					{state === 'generating' && (
						<button className="_aiActionSecondary" onClick={handleCancel}>
							Cancel
						</button>
					)}

					{state === 'refining' && (
						<>
							<button
								className="_aiActionSecondary"
								onClick={handleCapture}
								title="Capture new screenshot"
							>
								📷 Recapture
							</button>
							<button className="_aiActionSecondary" onClick={handleRefine}>
								Refine
							</button>
							<button
								className="_aiActionPrimary"
								onClick={handleApply}
								disabled={!pendingResult}
							>
								Apply Changes
							</button>
						</>
					)}

					{state === 'error' && (
						<>
							<button className="_aiActionPrimary" onClick={handleRetry}>
								Try Again
							</button>
							<button className="_aiActionSecondary" onClick={handleRefine}>
								New Prompt
							</button>
							<button className="_aiActionSecondary" onClick={handleCancel}>
								Close
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
